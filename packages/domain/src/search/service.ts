import type {
  Job,
  JobSearchInput,
  ProviderType,
  SearchEngine,
  SearchResult,
} from "@job-agent/contracts";

import type { SearchConfiguration, SearchConfigurationInput } from "./configuration";
import { createSearchConfiguration } from "./configuration";
import { createProviderExecutionError } from "./errors";
import { SearchProviderRegistry } from "./registry";
import {
  SearchLifecycleStage,
  type SearchClock,
  type SearchExecutionResult,
  type SearchIdGenerator,
  type SearchLifecycleEvent,
  type SearchProvider,
  type SearchProviderExecution,
} from "./types";

export interface SearchServiceDependencies {
  registry?: SearchProviderRegistry;
  configuration?: SearchConfigurationInput;
  clock?: SearchClock;
  idGenerator?: SearchIdGenerator;
}

export class SearchService implements SearchEngine {
  private readonly registry: SearchProviderRegistry;
  private readonly configuration: SearchConfiguration;
  private readonly clock: SearchClock;
  private readonly idGenerator: SearchIdGenerator;

  constructor(dependencies: SearchServiceDependencies = {}) {
    this.registry = dependencies.registry ?? new SearchProviderRegistry();
    this.configuration = createSearchConfiguration(dependencies.configuration);
    this.clock = dependencies.clock ?? (() => new Date().toISOString());
    this.idGenerator =
      dependencies.idGenerator ??
      ((prefix) =>
        `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
  }

  async search(request: JobSearchInput): Promise<SearchResult> {
    const execution = await this.searchWithDiagnostics(request);
    return execution.result;
  }

  async searchWithDiagnostics(request: JobSearchInput): Promise<SearchExecutionResult> {
    const lifecycle: SearchLifecycleEvent[] = [];
    const addEvent = (stage: SearchLifecycleStage, message: string): void => {
      lifecycle.push({ stage, timestamp: this.clock(), message });
    };

    addEvent(SearchLifecycleStage.Created, "Search request accepted.");

    const providers = this.registry.select(request, this.configuration);
    addEvent(
      SearchLifecycleStage.ProviderSelection,
      `${providers.length.toString()} provider(s) selected.`,
    );

    addEvent(SearchLifecycleStage.ProviderExecution, "Provider execution started.");
    const providerExecutions = await Promise.all(
      providers.map((provider) => this.executeProvider(provider, request)),
    );

    addEvent(SearchLifecycleStage.ResultCollection, "Provider results collected.");
    const jobs = providerExecutions.flatMap((execution) => execution.jobs);
    const providerTypes = [...new Set(providers.map((provider) => provider.type))];
    const result = this.createResult(request, jobs, providerTypes);

    addEvent(SearchLifecycleStage.Completed, "Search response created.");

    return {
      result,
      providerExecutions,
      lifecycle,
    };
  }

  private async executeProvider(
    provider: SearchProvider,
    request: JobSearchInput,
  ): Promise<SearchProviderExecution> {
    const startedAt = Date.now();

    try {
      const response = await this.withTimeout(
        provider.search({ input: request, timeoutMs: this.configuration.timeoutMs }),
        this.configuration.timeoutMs,
      );

      return {
        providerId: provider.id,
        providerType: provider.type,
        status: "succeeded",
        jobs: response.jobs,
        durationMs: Date.now() - startedAt,
      };
    } catch (error) {
      const timedOut = error instanceof SearchProviderTimeoutException;

      return {
        providerId: provider.id,
        providerType: provider.type,
        status: timedOut ? "timed_out" : "failed",
        jobs: [],
        durationMs: Date.now() - startedAt,
        error: createProviderExecutionError(
          provider.id,
          error instanceof Error ? error.message : "Search provider execution failed.",
          timedOut ? "search_provider_timeout" : "search_provider_execution_failed",
        ),
      };
    }
  }

  private createResult(
    _request: JobSearchInput,
    jobs: Job[],
    providerTypes: ProviderType[],
  ): SearchResult {
    return {
      id: this.idGenerator("search-result"),
      requestId: this.idGenerator("search-request"),
      jobs,
      totalFound: jobs.length,
      providerTypes,
      createdAt: this.clock(),
    };
  }

  private async withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
    let timeout: NodeJS.Timeout | undefined;
    const timeoutOperation = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        reject(new SearchProviderTimeoutException(timeoutMs));
      }, timeoutMs);
    });

    try {
      return await Promise.race([operation, timeoutOperation]);
    } finally {
      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
    }
  }
}

class SearchProviderTimeoutException extends Error {
  constructor(timeoutMs: number) {
    super(`Search provider timed out after ${timeoutMs.toString()}ms.`);
    this.name = "SearchProviderTimeoutException";
  }
}

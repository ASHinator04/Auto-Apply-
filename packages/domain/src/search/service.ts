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
import { SearchLifecycleRecorder } from "./pipeline";
import {
  SearchResultProcessingPipeline,
  type RawProviderResultCollection,
  type UnifiedSearchResponse,
} from "./processing";
import { SearchProviderRegistry } from "./registry";
import {
  SearchLifecycleStage,
  type SearchClock,
  type SearchDurationClock,
  type SearchExecutionResult,
  type SearchIdGenerator,
  type SearchProvider,
  type SearchProviderExecution,
} from "./types";

export interface SearchServiceDependencies {
  registry?: SearchProviderRegistry;
  configuration?: SearchConfigurationInput;
  clock?: SearchClock;
  durationClock?: SearchDurationClock;
  idGenerator?: SearchIdGenerator;
}

export class SearchService implements SearchEngine {
  private readonly registry: SearchProviderRegistry;
  private readonly configuration: SearchConfiguration;
  private readonly clock: SearchClock;
  private readonly durationClock: SearchDurationClock;
  private readonly idGenerator: SearchIdGenerator;

  constructor(dependencies: SearchServiceDependencies = {}) {
    this.registry = dependencies.registry ?? new SearchProviderRegistry();
    this.configuration = createSearchConfiguration(dependencies.configuration);
    this.clock = dependencies.clock ?? (() => new Date().toISOString());
    this.durationClock = dependencies.durationClock ?? (() => Date.now());
    this.idGenerator =
      dependencies.idGenerator ??
      ((prefix) =>
        `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
  }

  async search(request: JobSearchInput): Promise<SearchResult> {
    const execution = await this.searchWithDiagnostics(request);
    return execution.result;
  }

  async searchUnified(request: JobSearchInput): Promise<UnifiedSearchResponse> {
    const execution = await this.searchWithDiagnostics(request);
    const processingPipeline = new SearchResultProcessingPipeline({
      clock: this.clock,
      durationClock: this.durationClock,
    });

    return processingPipeline.process({
      request,
      providerResults: execution.providerExecutions.map((providerExecution) =>
        this.createRawProviderResult(providerExecution),
      ),
    });
  }

  async searchWithDiagnostics(request: JobSearchInput): Promise<SearchExecutionResult> {
    const lifecycle = new SearchLifecycleRecorder(this.clock);
    const requestId = this.idGenerator("search-request");

    lifecycle.record(SearchLifecycleStage.Created, "Search request accepted.");

    const providers = this.registry.select(request, this.configuration);
    lifecycle.record(
      SearchLifecycleStage.ProviderSelection,
      `${providers.length.toString()} provider(s) selected.`,
    );

    lifecycle.record(SearchLifecycleStage.ProviderExecution, "Provider execution started.");
    const providerExecutions = await Promise.all(
      providers.map((provider) => this.executeProvider(provider, request)),
    );

    lifecycle.record(SearchLifecycleStage.ResultCollection, "Provider results collected.");
    const jobs = providerExecutions.flatMap((execution) => execution.jobs);
    const providerTypes = [...new Set(providers.map((provider) => provider.type))];
    const result = this.createResult(requestId, jobs, providerTypes);

    lifecycle.record(SearchLifecycleStage.Completed, "Search response created.");

    return {
      result,
      providerExecutions,
      lifecycle: lifecycle.events(),
    };
  }

  private async executeProvider(
    provider: SearchProvider,
    request: JobSearchInput,
  ): Promise<SearchProviderExecution> {
    const startedAt = this.durationClock();
    const timeoutMs = this.getProviderTimeoutMs(provider.id);

    try {
      const response = await this.withTimeout(
        provider.search({ input: request, timeoutMs }),
        timeoutMs,
      );

      return {
        providerId: provider.id,
        providerType: provider.type,
        providerName: provider.name,
        status: "succeeded",
        jobs: response.jobs,
        durationMs: this.getDurationSince(startedAt),
      };
    } catch (error) {
      const timedOut = error instanceof SearchProviderTimeoutException;

      return {
        providerId: provider.id,
        providerType: provider.type,
        providerName: provider.name,
        status: timedOut ? "timed_out" : "failed",
        jobs: [],
        durationMs: this.getDurationSince(startedAt),
        error: createProviderExecutionError(
          provider.id,
          error instanceof Error ? error.message : "Search provider execution failed.",
          timedOut ? "search_provider_timeout" : "search_provider_execution_failed",
        ),
      };
    }
  }

  private createResult(
    requestId: string,
    jobs: Job[],
    providerTypes: ProviderType[],
  ): SearchResult {
    return {
      id: this.idGenerator("search-result"),
      requestId,
      jobs,
      totalFound: jobs.length,
      providerTypes,
      createdAt: this.clock(),
    };
  }

  private createRawProviderResult(execution: SearchProviderExecution): RawProviderResultCollection {
    return {
      providerId: execution.providerId,
      providerType: execution.providerType,
      providerName: execution.providerName,
      providerPriority: this.configuration.providerPriorities[execution.providerId],
      status: execution.status,
      durationMs: execution.durationMs,
      totalFound: execution.jobs.length,
      jobs: execution.jobs,
    };
  }

  private getProviderTimeoutMs(providerId: string): number {
    return (
      this.configuration.providerConfigurations[providerId]?.timeoutMs ??
      this.configuration.timeoutMs
    );
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

  private getDurationSince(startedAt: number): number {
    return Math.max(0, this.durationClock() - startedAt);
  }
}

class SearchProviderTimeoutException extends Error {
  constructor(timeoutMs: number) {
    super(`Search provider timed out after ${timeoutMs.toString()}ms.`);
    this.name = "SearchProviderTimeoutException";
  }
}

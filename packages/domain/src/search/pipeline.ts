import type { EntityId } from "@job-agent/contracts";

import { SearchLifecycleStage, type SearchClock, type SearchLifecycleEvent } from "./types";

export interface SearchPipelineStageDefinition {
  stage: SearchLifecycleStage;
  description: string;
}

export const SEARCH_PIPELINE_STAGES: readonly SearchPipelineStageDefinition[] = [
  {
    stage: SearchLifecycleStage.Created,
    description: "Accept the search request and create execution context.",
  },
  {
    stage: SearchLifecycleStage.ProviderSelection,
    description: "Select registered providers from configuration and request filters.",
  },
  {
    stage: SearchLifecycleStage.ProviderExecution,
    description: "Execute selected providers independently.",
  },
  {
    stage: SearchLifecycleStage.ResultCollection,
    description: "Collect provider results into a unified response shape.",
  },
  {
    stage: SearchLifecycleStage.Completed,
    description: "Return the search response and diagnostics.",
  },
] as const;

export function getSearchPipelineStageOrder(): SearchLifecycleStage[] {
  return SEARCH_PIPELINE_STAGES.map((definition) => definition.stage);
}

export class SearchLifecycleRecorder {
  private readonly recordedEvents: SearchLifecycleEvent[] = [];

  constructor(private readonly clock: SearchClock) {}

  record(stage: SearchLifecycleStage, message: string, providerId?: EntityId): void {
    this.recordedEvents.push({
      stage,
      timestamp: this.clock(),
      message,
      ...(providerId !== undefined ? { providerId } : {}),
    });
  }

  events(): SearchLifecycleEvent[] {
    return [...this.recordedEvents];
  }
}

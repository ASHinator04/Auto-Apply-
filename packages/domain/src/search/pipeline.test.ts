import {
  getSearchPipelineStageOrder,
  SEARCH_PIPELINE_STAGES,
  SearchLifecycleRecorder,
} from "./pipeline";
import { SearchLifecycleStage } from "./types";

describe("search pipeline", () => {
  it("documents the linear Phase 3.1 stage order", () => {
    expect(getSearchPipelineStageOrder()).toEqual([
      SearchLifecycleStage.Created,
      SearchLifecycleStage.ProviderSelection,
      SearchLifecycleStage.ProviderExecution,
      SearchLifecycleStage.ResultCollection,
      SearchLifecycleStage.Completed,
    ]);
    expect(SEARCH_PIPELINE_STAGES.every((stage) => stage.description.length > 0)).toBe(true);
  });

  it("records lifecycle events without exposing mutable internal state", () => {
    const recorder = new SearchLifecycleRecorder(() => "2026-01-01T00:00:00.000Z");

    recorder.record(SearchLifecycleStage.Created, "Search request accepted.");
    const events = recorder.events();
    events.push({
      stage: SearchLifecycleStage.Completed,
      timestamp: "2026-01-01T00:00:00.000Z",
      message: "Mutated externally.",
    });

    expect(recorder.events()).toHaveLength(1);
  });
});

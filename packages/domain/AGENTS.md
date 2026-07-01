# packages/domain AGENTS

## Purpose

`packages/domain/` contains core product concepts and business rules.

## Responsibilities

Own domain workflow behavior that should be testable without UI, storage, or concrete providers.
Phase 3.1 adds the provider-independent search foundation: registry, configuration, lifecycle, and
search service orchestration. Phase 3.2 adds provider plugin metadata, discovery, validation,
configuration, lifecycle, and registry handoff. Phase 3.6 adds stateless search result processing:
aggregation, normalization, validation, deduplication, quality filtering, ranking, and unified
response creation. Phase 3.7 certifies `SearchService.searchUnified` as the end-to-end search
boundary future phases should consume.

## Constraints

Do not depend on external job platforms, browser automation, UI frameworks, concrete databases,
network calls, or provider-specific implementations. Search providers in this package must remain
interfaces, structural raw inputs, or test doubles. Processing code may understand provider raw
shapes structurally, but must not import concrete provider packages or execute provider network
logic.

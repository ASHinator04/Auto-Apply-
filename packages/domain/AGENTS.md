# packages/domain AGENTS

## Purpose

`packages/domain/` contains core product concepts and business rules.

## Responsibilities

Own domain workflow behavior that should be testable without UI, storage, or concrete providers.
Phase 3.1 adds the provider-independent search foundation: registry, configuration, lifecycle, and
search service orchestration. Phase 3.2 adds provider plugin metadata, discovery, validation,
configuration, lifecycle, and registry handoff.

## Constraints

Do not depend on external job platforms, browser automation, UI frameworks, concrete databases,
network calls, or provider-specific implementations. Search providers in this package must remain
interfaces or test doubles only until a later provider phase is approved. Plugin tests may use fake
plugins, but production code must not include concrete provider implementations before their phase.

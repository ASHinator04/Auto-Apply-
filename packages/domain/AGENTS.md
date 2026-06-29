# packages/domain AGENTS

## Purpose

`packages/domain/` contains core product concepts and business rules.

## Responsibilities

Own domain workflow behavior that should be testable without UI, storage, or concrete providers.
Phase 3.1 adds the provider-independent search foundation: registry, configuration, lifecycle, and
search service orchestration.

## Constraints

Do not depend on external job platforms, browser automation, UI frameworks, concrete databases,
network calls, or provider-specific implementations. Search providers in this package must remain
interfaces or test doubles only until a later provider phase is approved.

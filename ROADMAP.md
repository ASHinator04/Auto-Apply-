# Roadmap

## Phase 0A: Repository Constitution and Engineering Foundation

Goal: establish documentation, repository structure, engineering standards, and AI-agent context.

Deliverables: root documents, placeholder directory hierarchy, child `AGENTS.md` files, ADR log, and backlog.

Exit criteria: contributors can understand the planned product, architecture, workflow, and next work without reading implementation code; Phase 0A changes are committed and pushed.

Dependencies: none.

## Phase 0B: Technical Design and Stack Selection

Goal: select runtime, language, application framework, test strategy, and storage approach.

Deliverables: stack ADRs, updated engineering guide, initial project configuration plan, and risk assessment.

Exit criteria: implementation can begin with documented commands and tooling; Phase 0B changes are committed and pushed.

Dependencies: Phase 0A.

## Phase 1: Domain Model and Local Data Foundation

Goal: define core domain concepts and local persistence boundaries.

Deliverables: domain types, storage abstractions, tests, and documentation updates.

Exit criteria: core concepts can be tested without UI or external providers; Phase 1 changes are committed and pushed.

Dependencies: Phase 0B.

## Phase 2: Resume and Knowledge Base Foundation

Goal: support resume/profile ingestion and reusable answer storage.

Deliverables: ingestion workflow, answer model, tests, and verification docs.

Exit criteria: candidate context can be stored and retrieved reliably; Phase 2 changes are committed and pushed.

Dependencies: Phase 1.

## Phase 3: Job Discovery and Normalization

Goal: add provider adapters and normalized job records.

Deliverables: adapter contracts, first provider integration, normalization tests, and sample workflows.

Exit criteria: jobs can be discovered and compared in a consistent shape; Phase 3 changes are committed and pushed.

Dependencies: Phase 1.

## Phase 4: Approval, Automation, and Tracking

Goal: support approval-controlled applications and lifecycle tracking.

Deliverables: approval workflow, automation boundary, tracking records, tests, and safety checks.

Exit criteria: approved applications can be submitted and audited within defined constraints; Phase 4 changes are committed and pushed.

Dependencies: Phases 2 and 3.

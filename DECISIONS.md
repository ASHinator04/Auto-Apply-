# Architecture Decision Records

Future architectural decisions should be appended to this log. Do not rewrite historical decisions except to correct factual errors.

## ADR-0001: AI-First Development Workflow

Status: Accepted

Decision: The repository will be optimized for AI-assisted development through clear documentation, hierarchical `AGENTS.md` files, and explicit phase workflows.

Rationale: Future agents need reliable context and local instructions to make bounded, consistent changes.

## ADR-0002: Modular Architecture

Status: Accepted

Decision: Product behavior will be organized into modules with clear ownership boundaries.

Rationale: The product will grow across UI, domain logic, integrations, automation, and persistence. Modular boundaries reduce coupling.

## ADR-0003: Adapter-Based Integrations

Status: Accepted

Decision: External job platforms, browser automation, storage engines, and vendor APIs will be isolated behind adapters.

Rationale: Integrations are likely to change. Adapters preserve the core workflow.

## ADR-0004: Local-First Where Practical

Status: Accepted

Decision: Prefer local-first development and storage where it is practical and secure.

Rationale: Local-first choices reduce cost, improve developer feedback, and simplify early validation.

## ADR-0005: Low-Cost Open-Source First

Status: Accepted

Decision: Prefer low-cost and open-source tools unless a paid dependency is justified by clear product value.

Rationale: The MVP should minimize operational cost and avoid unnecessary platform lock-in.

## ADR-0006: Hierarchical AGENTS Documentation

Status: Accepted

Decision: The root and every major directory will use `AGENTS.md` files for local contributor and AI-agent guidance.

Rationale: Hierarchical guidance minimizes context size while keeping directory-specific rules discoverable.

## ADR-0007: Incremental Phased Development

Status: Accepted

Decision: Development will proceed in explicit phases with deliverables, exit criteria, and stop points.

Rationale: Phased delivery reduces risk and prevents premature implementation.

## ADR-0008: Git Commit and Push Required Per Phase

Status: Accepted

Decision: Every phase must end with scoped Git commits and a push to the configured remote.

Rationale: Phase history should be durable, reviewable, and recoverable before subsequent work begins.

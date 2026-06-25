# contracts AGENTS

## Purpose

`contracts/` contains stable interfaces shared across applications, services, packages, and automation.

## Responsibilities

Define API contracts, domain contracts, event contracts, and adapter contracts before implementation modules depend on them.

## Constraints

Contracts should be small, explicit, versionable, and free of runtime-specific assumptions. Do not place implementation code here.

## Extension Guidelines

Add or update contracts before changing modules that depend on them. Contract changes should include tests once a test framework exists.


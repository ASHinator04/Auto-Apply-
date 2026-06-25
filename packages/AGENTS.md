# packages AGENTS

## Purpose

`packages/` will contain reusable modules shared across applications and services.

## Responsibilities

Packages should hold domain logic, shared types, adapter contracts, validation, and utilities with clear ownership boundaries.

## Constraints

Packages must avoid hidden dependencies on UI frameworks, vendor APIs, browser automation, or storage engines unless the package is explicitly responsible for that integration boundary.

## Extension Guidelines

Create focused packages around durable concepts such as `jobs`, `resumes`, `applications`, `answers`, `providers`, and `shared`.

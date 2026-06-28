# Product Requirements Document

## Vision

Job Agent helps software engineers find, approve, apply to, and track job opportunities with less
repetitive manual work while preserving user control.

## Goals

- Support resume upload and reusable candidate profiles.
- Discover relevant software engineering jobs from supported platforms.
- Normalize jobs into a consistent review experience.
- Allow users to bulk approve jobs before application.
- Automate approved applications where safe and supported.
- Reuse known answers for repeated application questions.
- Track application lifecycle state.

## Non-Goals

- Fully autonomous applications without user approval.
- Scraping or automation that violates platform rules.
- Paid infrastructure requirements before they are justified.
- Production-grade scale before product workflows are validated.

## User Personas

- Active job seeker: wants to apply efficiently while maintaining quality.
- Passive candidate: wants curated opportunities and lightweight tracking.
- Power user: wants repeatable automation, review controls, and audit history.

## User Journeys

1. Upload resume and create profile context.
2. Search jobs from selected platforms.
3. Review normalized job listings.
4. Approve target jobs in bulk.
5. Reuse saved answers during application.
6. Track submitted applications and follow-ups.

## Functional Requirements

The product should manage resumes, job discovery, job normalization, approval, application answer
reuse, automation, and lifecycle tracking.

## Non-Functional Requirements

The system must be maintainable, testable, modular, low-cost to operate, secure with user data, and
clear enough for AI-assisted development.

## Future Roadmap

See `ROADMAP.md` for phased delivery.

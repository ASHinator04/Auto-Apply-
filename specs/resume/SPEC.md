# Resume Spec

## Status

Phase 1 implemented.

## Scope

Resume management supports PDF upload, metadata persistence, listing, renaming, replacement,
deletion, and primary resume selection.

## Requirements

- Accept PDF uploads only.
- Validate extension, MIME type, maximum size, and PDF signature.
- Store metadata: ID, display name, original filename, upload date, size, MIME type, version, and
  primary flag.
- Sort resumes newest first.
- Preserve resume identity when replacing a file and increment the version.
- Keep exactly one primary resume when at least one resume exists.
- Require another primary before deleting the current primary when multiple resumes exist.

## Non-Goals

- Resume parsing.
- OCR.
- AI extraction or optimization.
- Job search or application workflows.
- Cloud storage.

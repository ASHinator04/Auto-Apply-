# API Reference

## Resume Management

Base URL for local development: `http://localhost:8000`.

Resume responses use this shape:

```json
{
  "id": "resume_...",
  "displayName": "Backend Resume",
  "originalFilename": "backend.pdf",
  "uploadDate": "2026-06-29T00:00:00.000Z",
  "size": 1024,
  "mimeType": "application/pdf",
  "version": 1,
  "isPrimary": true
}
```

### `GET /resumes`

Returns uploaded resume metadata sorted newest first.

### `POST /resumes`

Uploads a PDF resume. Multipart fields:

- `file`: required PDF file.
- `displayName`: optional display name. Defaults to the PDF filename stem.

Validation covers `.pdf` extension, `application/pdf` MIME type, maximum size, non-empty content,
and PDF signature.

### `PATCH /resumes/{resume_id}`

Renames a resume.

```json
{ "displayName": "Backend Resume" }
```

### `PUT /resumes/{resume_id}/file`

Replaces the uploaded PDF metadata for an existing resume. The resume ID is preserved and `version`
increments.

### `PUT /resumes/{resume_id}/primary`

Marks one resume as primary and clears the previous primary.

### `DELETE /resumes/{resume_id}`

Deletes a resume. If the resume is primary and other resumes exist, choose another primary first.
The API also accepts `replacementPrimaryId` as a query parameter for callers that want to delete the
current primary and promote another resume atomically.

## Errors

Resume validation errors return `400` with a friendly `detail` message. Missing resumes return
`404`. Attempts to delete the only selected primary while other resumes exist return `409`.

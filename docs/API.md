# API Reference

## Resume Management

Base URL for local development: `http://localhost:8000`.

## Knowledge Base

Knowledge entry responses use this shape:

```json
{
  "id": "knowledge_...",
  "section": "behavioral_answers",
  "entryType": "long_form",
  "title": "Leadership example",
  "content": "I led a platform migration...",
  "companyName": null,
  "sortOrder": 0,
  "createdAt": "2026-06-29T00:00:00.000Z",
  "updatedAt": "2026-06-29T00:00:00.000Z"
}
```

Supported sections:

- `personal`
- `professional`
- `education`
- `experience`
- `links`
- `work_authorization`
- `behavioral_answers`
- `company_specific_answers`
- `miscellaneous`

Supported entry types:

- `scalar`: short answer or profile value.
- `long_form`: reusable long-form answer.

### `GET /knowledge`

Returns knowledge entries sorted by `sortOrder`, title, and creation time.

Optional query parameters:

- `query`: simple keyword search over title, content, company name, and section.
- `section`: limits results to one supported section.

### `POST /knowledge`

Creates a knowledge entry.

```json
{
  "section": "professional",
  "entryType": "scalar",
  "title": "Current Role",
  "content": "Software Engineer",
  "companyName": null,
  "sortOrder": 0
}
```

Company name is required when `section` is `company_specific_answers`.

### `PUT /knowledge/{entry_id}`

Replaces the editable fields for one knowledge entry. Use the same request shape as
`POST /knowledge`.

### `DELETE /knowledge/{entry_id}`

Deletes one knowledge entry.

## Resume Management

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
Knowledge validation errors return `400` with a friendly `detail` message. Missing knowledge entries
return `404`. FastAPI request-shape errors return `422`.

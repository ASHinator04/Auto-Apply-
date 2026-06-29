from pathlib import PurePath

from fastapi import UploadFile

from job_agent_api.resume_errors import ResumeValidationError
from job_agent_api.resume_repository import ResumeRecord, SQLiteResumeRepository

PDF_MIME_TYPE = "application/pdf"
PDF_SIGNATURE = b"%PDF"


class ResumeService:
    def __init__(self, repository: SQLiteResumeRepository, max_size_bytes: int) -> None:
        self._repository = repository
        self._max_size_bytes = max_size_bytes

    async def upload_resume(self, file: UploadFile, display_name: str | None) -> ResumeRecord:
        metadata = await self._validate_pdf(file)
        safe_display_name = self._normalize_display_name(display_name, metadata.original_filename)
        return self._repository.create_resume(
            display_name=safe_display_name,
            original_filename=metadata.original_filename,
            size=metadata.size,
            mime_type=metadata.mime_type,
        )

    async def replace_resume(self, resume_id: str, file: UploadFile) -> ResumeRecord:
        metadata = await self._validate_pdf(file)
        return self._repository.replace_resume(
            resume_id,
            original_filename=metadata.original_filename,
            size=metadata.size,
            mime_type=metadata.mime_type,
        )

    def list_resumes(self) -> list[ResumeRecord]:
        return self._repository.list_resumes()

    def rename_resume(self, resume_id: str, display_name: str) -> ResumeRecord:
        normalized = self._normalize_required_name(display_name)
        return self._repository.rename_resume(resume_id, normalized)

    def set_primary_resume(self, resume_id: str) -> ResumeRecord:
        return self._repository.set_primary_resume(resume_id)

    def delete_resume(self, resume_id: str, replacement_primary_id: str | None) -> None:
        self._repository.delete_resume(resume_id, replacement_primary_id)

    async def _validate_pdf(self, file: UploadFile) -> "_UploadedPdf":
        original_filename = PurePath(file.filename or "").name
        if not original_filename:
            raise ResumeValidationError("Choose a PDF file to upload.")

        if not original_filename.lower().endswith(".pdf"):
            raise ResumeValidationError("Only PDF files with a .pdf extension are supported.")

        if file.content_type != PDF_MIME_TYPE:
            raise ResumeValidationError(
                "Only files with the application/pdf MIME type are supported."
            )

        data = await file.read(self._max_size_bytes + 1)
        size = len(data)
        if size == 0:
            raise ResumeValidationError("The selected PDF file is empty.")
        if size > self._max_size_bytes:
            raise ResumeValidationError(
                f"PDF files must be {self._max_size_bytes // (1024 * 1024)} MB or smaller."
            )
        if not data.startswith(PDF_SIGNATURE):
            raise ResumeValidationError("The selected file does not look like a valid PDF.")

        return _UploadedPdf(
            original_filename=original_filename,
            size=size,
            mime_type=PDF_MIME_TYPE,
        )

    def _normalize_display_name(self, display_name: str | None, original_filename: str) -> str:
        if display_name is not None and display_name.strip():
            return self._normalize_required_name(display_name)

        fallback = original_filename[:-4]
        return self._normalize_required_name(fallback)

    @staticmethod
    def _normalize_required_name(display_name: str) -> str:
        normalized = " ".join(display_name.strip().split())
        if not normalized:
            raise ResumeValidationError("Resume name is required.")
        if len(normalized) > 120:
            raise ResumeValidationError("Resume name must be 120 characters or fewer.")
        return normalized


class _UploadedPdf:
    def __init__(self, *, original_filename: str, size: int, mime_type: str) -> None:
        self.original_filename = original_filename
        self.size = size
        self.mime_type = mime_type

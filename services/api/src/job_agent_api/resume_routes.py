from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, Query, Response, UploadFile

from job_agent_api.config import get_settings
from job_agent_api.resume_repository import ResumeRecord, SQLiteResumeRepository
from job_agent_api.resume_service import ResumeService
from job_agent_api.schema import ResumeListResponse, ResumeRenameRequest, ResumeResponse

router = APIRouter(prefix="/resumes", tags=["resumes"])


def get_resume_repository() -> SQLiteResumeRepository:
    settings = get_settings()
    return SQLiteResumeRepository(Path(settings.database_path))


def get_resume_service(
    repository: Annotated[SQLiteResumeRepository, Depends(get_resume_repository)],
) -> ResumeService:
    settings = get_settings()
    return ResumeService(repository, settings.max_resume_size_bytes)


@router.get("", response_model=ResumeListResponse)
def list_resumes(
    service: Annotated[ResumeService, Depends(get_resume_service)],
) -> ResumeListResponse:
    return ResumeListResponse(resumes=[_to_response(record) for record in service.list_resumes()])


@router.post("", response_model=ResumeResponse, status_code=201)
async def upload_resume(
    service: Annotated[ResumeService, Depends(get_resume_service)],
    file: Annotated[UploadFile, File()],
    display_name: Annotated[str | None, Form(alias="displayName")] = None,
) -> ResumeResponse:
    return _to_response(await service.upload_resume(file, display_name))


@router.patch("/{resume_id}", response_model=ResumeResponse)
def rename_resume(
    resume_id: str,
    request: ResumeRenameRequest,
    service: Annotated[ResumeService, Depends(get_resume_service)],
) -> ResumeResponse:
    return _to_response(service.rename_resume(resume_id, request.display_name))


@router.put("/{resume_id}/file", response_model=ResumeResponse)
async def replace_resume(
    resume_id: str,
    service: Annotated[ResumeService, Depends(get_resume_service)],
    file: Annotated[UploadFile, File()],
) -> ResumeResponse:
    return _to_response(await service.replace_resume(resume_id, file))


@router.put("/{resume_id}/primary", response_model=ResumeResponse)
def set_primary_resume(
    resume_id: str,
    service: Annotated[ResumeService, Depends(get_resume_service)],
) -> ResumeResponse:
    return _to_response(service.set_primary_resume(resume_id))


@router.delete("/{resume_id}", status_code=204)
def delete_resume(
    resume_id: str,
    service: Annotated[ResumeService, Depends(get_resume_service)],
    replacement_primary_id: Annotated[str | None, Query(alias="replacementPrimaryId")] = None,
) -> Response:
    service.delete_resume(resume_id, replacement_primary_id)
    return Response(status_code=204)


def _to_response(record: ResumeRecord) -> ResumeResponse:
    return ResumeResponse(
        id=record.id,
        displayName=record.display_name,
        originalFilename=record.original_filename,
        uploadDate=record.upload_date,
        size=record.size,
        mimeType=record.mime_type,
        version=record.version,
        isPrimary=record.is_primary,
    )

from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    service: str
    status: str
    version: str


class ResumeResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    display_name: str = Field(alias="displayName")
    original_filename: str = Field(alias="originalFilename")
    upload_date: str = Field(alias="uploadDate")
    size: int
    mime_type: str = Field(alias="mimeType")
    version: int
    is_primary: bool = Field(alias="isPrimary")


class ResumeListResponse(BaseModel):
    resumes: list[ResumeResponse]


class ResumeRenameRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    display_name: str = Field(alias="displayName", min_length=1, max_length=120)

from typing import Literal

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


KnowledgeSection = Literal[
    "personal",
    "professional",
    "education",
    "experience",
    "links",
    "work_authorization",
    "behavioral_answers",
    "company_specific_answers",
    "miscellaneous",
]
KnowledgeEntryType = Literal["scalar", "long_form"]


class KnowledgeEntryResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    section: KnowledgeSection
    entry_type: KnowledgeEntryType = Field(alias="entryType")
    title: str
    content: str
    company_name: str | None = Field(default=None, alias="companyName")
    sort_order: int = Field(alias="sortOrder")
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")


class KnowledgeEntryListResponse(BaseModel):
    entries: list[KnowledgeEntryResponse]


class KnowledgeEntryRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    section: KnowledgeSection
    entry_type: KnowledgeEntryType = Field(alias="entryType")
    title: str = Field(min_length=1, max_length=120)
    content: str = Field(min_length=1, max_length=20_000)
    company_name: str | None = Field(default=None, alias="companyName", max_length=120)
    sort_order: int = Field(default=0, alias="sortOrder", ge=0)

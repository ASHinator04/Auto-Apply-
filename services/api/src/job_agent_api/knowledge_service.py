from job_agent_api.knowledge_errors import KnowledgeValidationError
from job_agent_api.knowledge_repository import (
    KnowledgeEntryCreate,
    KnowledgeEntryRecord,
    KnowledgeEntryUpdate,
    SQLiteKnowledgeRepository,
)

KNOWLEDGE_SECTIONS = {
    "personal",
    "professional",
    "education",
    "experience",
    "links",
    "work_authorization",
    "behavioral_answers",
    "company_specific_answers",
    "miscellaneous",
}
KNOWLEDGE_ENTRY_TYPES = {"scalar", "long_form"}
COMPANY_SPECIFIC_SECTION = "company_specific_answers"
MAX_TITLE_LENGTH = 120
MAX_COMPANY_NAME_LENGTH = 120
MAX_CONTENT_LENGTH = 20_000


class KnowledgeService:
    def __init__(self, repository: SQLiteKnowledgeRepository) -> None:
        self._repository = repository

    def list_entries(
        self,
        *,
        query: str | None = None,
        section: str | None = None,
    ) -> list[KnowledgeEntryRecord]:
        normalized_query = self._normalize_optional_text(query, max_length=120)
        normalized_section = self._validate_optional_section(section)
        return self._repository.list_entries(query=normalized_query, section=normalized_section)

    def create_entry(
        self,
        *,
        section: str,
        entry_type: str,
        title: str,
        content: str,
        company_name: str | None,
        sort_order: int,
    ) -> KnowledgeEntryRecord:
        return self._repository.create_entry(
            KnowledgeEntryCreate(
                section=self._validate_section(section),
                entry_type=self._validate_entry_type(entry_type),
                title=self._normalize_required_text(title, "Title", MAX_TITLE_LENGTH),
                content=self._normalize_required_text(content, "Content", MAX_CONTENT_LENGTH),
                company_name=self._normalize_company_name(section, company_name),
                sort_order=self._validate_sort_order(sort_order),
            )
        )

    def update_entry(
        self,
        entry_id: str,
        *,
        section: str,
        entry_type: str,
        title: str,
        content: str,
        company_name: str | None,
        sort_order: int,
    ) -> KnowledgeEntryRecord:
        return self._repository.update_entry(
            entry_id,
            KnowledgeEntryUpdate(
                section=self._validate_section(section),
                entry_type=self._validate_entry_type(entry_type),
                title=self._normalize_required_text(title, "Title", MAX_TITLE_LENGTH),
                content=self._normalize_required_text(content, "Content", MAX_CONTENT_LENGTH),
                company_name=self._normalize_company_name(section, company_name),
                sort_order=self._validate_sort_order(sort_order),
            ),
        )

    def delete_entry(self, entry_id: str) -> None:
        self._repository.delete_entry(entry_id)

    def _validate_optional_section(self, section: str | None) -> str | None:
        if section is None:
            return None
        return self._validate_section(section)

    @staticmethod
    def _validate_section(section: str) -> str:
        if section not in KNOWLEDGE_SECTIONS:
            raise KnowledgeValidationError("Choose a supported knowledge section.")
        return section

    @staticmethod
    def _validate_entry_type(entry_type: str) -> str:
        if entry_type not in KNOWLEDGE_ENTRY_TYPES:
            raise KnowledgeValidationError("Choose short text or long-form text.")
        return entry_type

    @staticmethod
    def _normalize_required_text(value: str, label: str, max_length: int) -> str:
        normalized = " ".join(value.strip().split()) if label != "Content" else value.strip()
        if not normalized:
            raise KnowledgeValidationError(f"{label} is required.")
        if len(normalized) > max_length:
            raise KnowledgeValidationError(f"{label} must be {max_length} characters or fewer.")
        return normalized

    @staticmethod
    def _normalize_optional_text(value: str | None, *, max_length: int) -> str | None:
        if value is None:
            return None
        normalized = " ".join(value.strip().split())
        if not normalized:
            return None
        if len(normalized) > max_length:
            raise KnowledgeValidationError(f"Search must be {max_length} characters or fewer.")
        return normalized

    def _normalize_company_name(self, section: str, company_name: str | None) -> str | None:
        normalized = self._normalize_optional_company_name(company_name)
        if section == COMPANY_SPECIFIC_SECTION and normalized is None:
            raise KnowledgeValidationError("Company name is required for company-specific answers.")
        return normalized

    @staticmethod
    def _normalize_optional_company_name(company_name: str | None) -> str | None:
        if company_name is None:
            return None
        normalized = " ".join(company_name.strip().split())
        if not normalized:
            return None
        if len(normalized) > MAX_COMPANY_NAME_LENGTH:
            raise KnowledgeValidationError(
                f"Company name must be {MAX_COMPANY_NAME_LENGTH} characters or fewer."
            )
        return normalized

    @staticmethod
    def _validate_sort_order(sort_order: int) -> int:
        if sort_order < 0:
            raise KnowledgeValidationError("Sort order must be zero or greater.")
        return sort_order

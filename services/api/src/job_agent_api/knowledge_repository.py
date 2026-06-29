from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import cast
from uuid import uuid4

from job_agent_api.knowledge_errors import KnowledgeEntryNotFoundError


@dataclass(frozen=True)
class KnowledgeEntryRecord:
    id: str
    section: str
    entry_type: str
    title: str
    content: str
    company_name: str | None
    sort_order: int
    created_at: str
    updated_at: str


@dataclass(frozen=True)
class KnowledgeEntryCreate:
    section: str
    entry_type: str
    title: str
    content: str
    company_name: str | None
    sort_order: int


@dataclass(frozen=True)
class KnowledgeEntryUpdate:
    section: str
    entry_type: str
    title: str
    content: str
    company_name: str | None
    sort_order: int


class SQLiteKnowledgeRepository:
    def __init__(self, database_path: Path) -> None:
        self._database_path = database_path
        self._database_path.parent.mkdir(parents=True, exist_ok=True)
        self._ensure_schema()

    def list_entries(
        self, *, query: str | None = None, section: str | None = None
    ) -> list[KnowledgeEntryRecord]:
        clauses: list[str] = []
        parameters: list[str] = []
        if section:
            clauses.append("section = ?")
            parameters.append(section)
        if query:
            normalized_query = f"%{query.lower()}%"
            clauses.append(
                """
                (
                    lower(title) LIKE ?
                    OR lower(content) LIKE ?
                    OR lower(coalesce(company_name, '')) LIKE ?
                    OR lower(section) LIKE ?
                )
                """
            )
            parameters.extend(
                [normalized_query, normalized_query, normalized_query, normalized_query]
            )

        where_clause = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        with self._connect() as connection:
            rows = connection.execute(
                f"""
                SELECT id, section, entry_type, title, content, company_name, sort_order,
                       created_at, updated_at
                FROM knowledge_entries
                {where_clause}
                ORDER BY sort_order ASC, lower(title) ASC, created_at ASC
                """,
                parameters,
            ).fetchall()

        return [self._row_to_record(row) for row in rows]

    def create_entry(self, entry: KnowledgeEntryCreate) -> KnowledgeEntryRecord:
        entry_id = f"knowledge_{uuid4().hex}"
        now = self._now()
        with self._connect() as connection:
            self._begin_write(connection)
            connection.execute(
                """
                INSERT INTO knowledge_entries (
                    id, section, entry_type, title, content, company_name, sort_order,
                    created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    entry_id,
                    entry.section,
                    entry.entry_type,
                    entry.title,
                    entry.content,
                    entry.company_name,
                    entry.sort_order,
                    now,
                    now,
                ),
            )
            connection.commit()

        return self.get_entry(entry_id)

    def get_entry(self, entry_id: str) -> KnowledgeEntryRecord:
        record = self.find_entry(entry_id)
        if record is None:
            raise KnowledgeEntryNotFoundError("Knowledge entry not found.")
        return record

    def find_entry(self, entry_id: str) -> KnowledgeEntryRecord | None:
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT id, section, entry_type, title, content, company_name, sort_order,
                       created_at, updated_at
                FROM knowledge_entries
                WHERE id = ?
                """,
                (entry_id,),
            ).fetchone()

        if row is None:
            return None
        return self._row_to_record(row)

    def update_entry(self, entry_id: str, entry: KnowledgeEntryUpdate) -> KnowledgeEntryRecord:
        with self._connect() as connection:
            self._begin_write(connection)
            cursor = connection.execute(
                """
                UPDATE knowledge_entries
                SET section = ?, entry_type = ?, title = ?, content = ?, company_name = ?,
                    sort_order = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    entry.section,
                    entry.entry_type,
                    entry.title,
                    entry.content,
                    entry.company_name,
                    entry.sort_order,
                    self._now(),
                    entry_id,
                ),
            )
            if cursor.rowcount == 0:
                raise KnowledgeEntryNotFoundError("Knowledge entry not found.")
            connection.commit()

        return self.get_entry(entry_id)

    def delete_entry(self, entry_id: str) -> None:
        with self._connect() as connection:
            self._begin_write(connection)
            cursor = connection.execute("DELETE FROM knowledge_entries WHERE id = ?", (entry_id,))
            if cursor.rowcount == 0:
                raise KnowledgeEntryNotFoundError("Knowledge entry not found.")
            connection.commit()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(str(self._database_path))
        connection.row_factory = sqlite3.Row
        return connection

    def _ensure_schema(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS knowledge_entries (
                    id TEXT PRIMARY KEY,
                    section TEXT NOT NULL,
                    entry_type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    company_name TEXT,
                    sort_order INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_knowledge_entries_section
                ON knowledge_entries (section, sort_order, title)
                """
            )
            connection.commit()

    @staticmethod
    def _begin_write(connection: sqlite3.Connection) -> None:
        connection.execute("BEGIN IMMEDIATE")

    @staticmethod
    def _row_to_record(row: sqlite3.Row) -> KnowledgeEntryRecord:
        company_name = row["company_name"]
        return KnowledgeEntryRecord(
            id=cast(str, row["id"]),
            section=cast(str, row["section"]),
            entry_type=cast(str, row["entry_type"]),
            title=cast(str, row["title"]),
            content=cast(str, row["content"]),
            company_name=cast(str | None, company_name),
            sort_order=cast(int, row["sort_order"]),
            created_at=cast(str, row["created_at"]),
            updated_at=cast(str, row["updated_at"]),
        )

    @staticmethod
    def _now() -> str:
        return datetime.now(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")

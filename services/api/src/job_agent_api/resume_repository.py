from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import cast
from uuid import uuid4

from job_agent_api.resume_errors import PrimaryResumeRequiredError, ResumeNotFoundError


@dataclass(frozen=True)
class ResumeRecord:
    id: str
    display_name: str
    original_filename: str
    upload_date: str
    size: int
    mime_type: str
    version: int
    is_primary: bool


class SQLiteResumeRepository:
    def __init__(self, database_path: Path) -> None:
        self._database_path = database_path
        self._database_path.parent.mkdir(parents=True, exist_ok=True)
        self._ensure_schema()

    def list_resumes(self) -> list[ResumeRecord]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT id, display_name, original_filename, upload_date, size, mime_type, version,
                       is_primary
                FROM resumes
                ORDER BY upload_date DESC, id DESC
                """
            ).fetchall()

        return [self._row_to_record(row) for row in rows]

    def create_resume(
        self,
        *,
        display_name: str,
        original_filename: str,
        size: int,
        mime_type: str,
    ) -> ResumeRecord:
        resume_id = f"resume_{uuid4().hex}"
        upload_date = self._now()

        with self._connect() as connection:
            self._begin_write(connection)
            existing_count = self._count_resumes(connection)
            is_primary = existing_count == 0
            connection.execute(
                """
                INSERT INTO resumes (
                    id, display_name, original_filename, upload_date, size, mime_type, version,
                    is_primary
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    resume_id,
                    display_name,
                    original_filename,
                    upload_date,
                    size,
                    mime_type,
                    1,
                    int(is_primary),
                ),
            )
            connection.commit()

        return self.get_resume(resume_id)

    def get_resume(self, resume_id: str) -> ResumeRecord:
        record = self.find_resume(resume_id)
        if record is None:
            raise ResumeNotFoundError("Resume not found.")
        return record

    def find_resume(self, resume_id: str) -> ResumeRecord | None:
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT id, display_name, original_filename, upload_date, size, mime_type, version,
                       is_primary
                FROM resumes
                WHERE id = ?
                """,
                (resume_id,),
            ).fetchone()

        if row is None:
            return None
        return self._row_to_record(row)

    def rename_resume(self, resume_id: str, display_name: str) -> ResumeRecord:
        with self._connect() as connection:
            self._begin_write(connection)
            cursor = connection.execute(
                "UPDATE resumes SET display_name = ? WHERE id = ?",
                (display_name, resume_id),
            )
            if cursor.rowcount == 0:
                raise ResumeNotFoundError("Resume not found.")
            connection.commit()

        return self.get_resume(resume_id)

    def replace_resume(
        self,
        resume_id: str,
        *,
        original_filename: str,
        size: int,
        mime_type: str,
    ) -> ResumeRecord:
        current = self.get_resume(resume_id)
        with self._connect() as connection:
            self._begin_write(connection)
            connection.execute(
                """
                UPDATE resumes
                SET original_filename = ?, upload_date = ?, size = ?, mime_type = ?, version = ?
                WHERE id = ?
                """,
                (
                    original_filename,
                    self._now(),
                    size,
                    mime_type,
                    current.version + 1,
                    resume_id,
                ),
            )
            connection.commit()

        return self.get_resume(resume_id)

    def set_primary_resume(self, resume_id: str) -> ResumeRecord:
        self.get_resume(resume_id)
        with self._connect() as connection:
            self._begin_write(connection)
            connection.execute("UPDATE resumes SET is_primary = 0")
            connection.execute("UPDATE resumes SET is_primary = 1 WHERE id = ?", (resume_id,))
            connection.commit()

        return self.get_resume(resume_id)

    def delete_resume(self, resume_id: str, replacement_primary_id: str | None = None) -> None:
        target = self.get_resume(resume_id)

        with self._connect() as connection:
            self._begin_write(connection)
            existing_count = self._count_resumes(connection)
            if target.is_primary and existing_count > 1:
                if replacement_primary_id is None or replacement_primary_id == resume_id:
                    raise PrimaryResumeRequiredError(
                        "Choose another primary resume before deleting this one."
                    )
                replacement = self._find_resume(connection, replacement_primary_id)
                if replacement is None:
                    raise ResumeNotFoundError("Replacement primary resume not found.")

                connection.execute("UPDATE resumes SET is_primary = 0")
                connection.execute(
                    "UPDATE resumes SET is_primary = 1 WHERE id = ?",
                    (replacement_primary_id,),
                )

            connection.execute("DELETE FROM resumes WHERE id = ?", (resume_id,))
            connection.commit()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(str(self._database_path))
        connection.row_factory = sqlite3.Row
        return connection

    def _ensure_schema(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS resumes (
                    id TEXT PRIMARY KEY,
                    display_name TEXT NOT NULL,
                    original_filename TEXT NOT NULL,
                    upload_date TEXT NOT NULL,
                    size INTEGER NOT NULL,
                    mime_type TEXT NOT NULL,
                    version INTEGER NOT NULL,
                    is_primary INTEGER NOT NULL CHECK (is_primary IN (0, 1))
                )
                """
            )
            connection.execute(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS idx_resumes_single_primary
                ON resumes (is_primary)
                WHERE is_primary = 1
                """
            )
            connection.commit()

    @staticmethod
    def _begin_write(connection: sqlite3.Connection) -> None:
        connection.execute("BEGIN IMMEDIATE")

    def _find_resume(self, connection: sqlite3.Connection, resume_id: str) -> ResumeRecord | None:
        row = connection.execute(
            """
            SELECT id, display_name, original_filename, upload_date, size, mime_type, version,
                   is_primary
            FROM resumes
            WHERE id = ?
            """,
            (resume_id,),
        ).fetchone()

        if row is None:
            return None
        return self._row_to_record(row)

    @staticmethod
    def _count_resumes(connection: sqlite3.Connection) -> int:
        row = connection.execute("SELECT COUNT(*) AS count FROM resumes").fetchone()
        return int(cast(int, row["count"]))

    @staticmethod
    def _row_to_record(row: sqlite3.Row) -> ResumeRecord:
        return ResumeRecord(
            id=cast(str, row["id"]),
            display_name=cast(str, row["display_name"]),
            original_filename=cast(str, row["original_filename"]),
            upload_date=cast(str, row["upload_date"]),
            size=cast(int, row["size"]),
            mime_type=cast(str, row["mime_type"]),
            version=cast(int, row["version"]),
            is_primary=bool(cast(int, row["is_primary"])),
        )

    @staticmethod
    def _now() -> str:
        return datetime.now(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")

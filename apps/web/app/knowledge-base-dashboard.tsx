"use client";

import { Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  createKnowledgeEntry,
  deleteKnowledgeEntry,
  listKnowledgeEntries,
  updateKnowledgeEntry,
} from "./knowledge-api";
import { EmptyKnowledgeState } from "./knowledge-empty-state";
import { KnowledgeEntryCreateForm } from "./knowledge-entry-create-form";
import { KnowledgeEntryRow } from "./knowledge-entry-row";
import { recordActivity } from "./activity-log-store";
import type { KnowledgeEntry, KnowledgeEntryInput } from "./knowledge-types";
import {
  KNOWLEDGE_SECTIONS,
  emptyKnowledgeInput,
  groupKnowledgeEntries,
  validateKnowledgeInput,
} from "./knowledge-utils";

type DraftEntries = Record<string, KnowledgeEntryInput>;

export function KnowledgeBaseDashboard() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [drafts, setDrafts] = useState<DraftEntries>({});
  const [newEntry, setNewEntry] = useState<KnowledgeEntryInput>(emptyKnowledgeInput());
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refreshEntries(search);
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [search]);

  async function refreshEntries(nextSearch = search) {
    setIsLoading(true);
    try {
      const nextEntries = await listKnowledgeEntries(nextSearch);
      setEntries(nextEntries);
      setDrafts(Object.fromEntries(nextEntries.map((entry) => [entry.id, toInput(entry)])));
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateKnowledgeInput(newEntry);
    if (validationError) {
      recordActivity({
        area: "knowledge",
        level: "error",
        message: "Knowledge entry validation failed.",
        detail: validationError,
      });
      setError(validationError);
      setNotice(null);
      return;
    }

    recordActivity({
      area: "knowledge",
      level: "info",
      message: "Submitting knowledge entry.",
      detail: newEntry.title.trim() || "Untitled entry",
    });
    await runAction(async () => {
      await createKnowledgeEntry(newEntry);
      setNewEntry(emptyKnowledgeInput());
      setNotice("Knowledge entry saved.");
    });
  }

  async function handleUpdate(entry: KnowledgeEntry) {
    const draft = drafts[entry.id] ?? toInput(entry);
    const validationError = validateKnowledgeInput(draft);
    if (validationError) {
      recordActivity({
        area: "knowledge",
        level: "error",
        message: "Knowledge entry validation failed during edit.",
        detail: validationError,
      });
      setError(validationError);
      setNotice(null);
      return;
    }

    recordActivity({
      area: "knowledge",
      level: "info",
      message: "Saving knowledge entry changes.",
      detail: draft.title.trim() || entry.title,
    });
    await runAction(async () => {
      await updateKnowledgeEntry(entry.id, draft);
      setEditingId(null);
      setNotice("Knowledge entry updated.");
    });
  }

  async function handleDelete(entry: KnowledgeEntry) {
    const confirmed = window.confirm(`Delete ${entry.title}?`);
    if (!confirmed) {
      recordActivity({
        area: "knowledge",
        level: "info",
        message: "Knowledge entry deletion cancelled.",
        detail: entry.title,
      });
      return;
    }

    recordActivity({
      area: "knowledge",
      level: "info",
      message: "Deleting knowledge entry.",
      detail: entry.title,
    });
    await runAction(async () => {
      await deleteKnowledgeEntry(entry.id);
      setNotice("Knowledge entry deleted.");
    });
  }

  function cancelEdit(entry: KnowledgeEntry) {
    setDrafts((current) => ({ ...current, [entry.id]: toInput(entry) }));
    setEditingId(null);
    recordActivity({
      area: "knowledge",
      level: "info",
      message: "Discarded knowledge entry edits.",
      detail: entry.title,
    });
  }

  async function runAction(action: () => Promise<void>) {
    setIsBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      await refreshEntries();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setIsBusy(false);
    }
  }

  const groupedEntries = groupKnowledgeEntries(entries);
  const totalEntries = entries.length;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 border-b border-slate-200 pb-5">
        <p className="text-sm font-medium uppercase text-sky-700">Phase 2</p>
        <h1 className="text-3xl font-semibold">User Knowledge Base</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Store permanent profile details plus reusable application questions and answers without
          AI, semantic search, or automation.
        </p>
      </header>

      <KnowledgeEntryCreateForm
        entry={newEntry}
        isBusy={isBusy}
        onChange={setNewEntry}
        onSubmit={(event) => {
          void handleCreate(event);
        }}
      />

      <div className="grid gap-4 border border-slate-200 bg-white p-5 md:grid-cols-[1fr_auto]">
        <label className="flex items-center gap-2 border border-slate-300 px-3 py-2 text-sm text-slate-600">
          <span className="sr-only">Search knowledge entries</span>
          <Search aria-hidden="true" className="h-4 w-4" />
          <input
            className="min-w-0 flex-1 outline-none"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search question, answer, company, or section"
            type="search"
            value={search}
          />
        </label>
        <div className="self-center text-sm text-slate-600">
          {totalEntries} {totalEntries === 1 ? "entry" : "entries"}
        </div>
      </div>

      {error ? (
        <p
          aria-live="polite"
          className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}
      {notice ? (
        <p
          aria-live="polite"
          className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {notice}
        </p>
      ) : null}

      {isLoading ? (
        <section className="border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Loading knowledge entries...
        </section>
      ) : totalEntries === 0 ? (
        search.trim() ? (
          <section className="border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No knowledge entries match this search.
          </section>
        ) : (
          <EmptyKnowledgeState />
        )
      ) : (
        <div className="space-y-4">
          {KNOWLEDGE_SECTIONS.map((section) => {
            const sectionEntries = groupedEntries[section.id];
            return (
              <details
                className="border border-slate-200 bg-white"
                key={section.id}
                open={sectionEntries.length > 0}
              >
                <summary className="grid cursor-pointer gap-1 border-b border-slate-200 px-5 py-4 sm:grid-cols-[1fr_auto]">
                  <span>
                    <span className="block text-lg font-semibold">{section.label}</span>
                    <span className="block text-sm text-slate-600">{section.description}</span>
                  </span>
                  <span className="text-sm text-slate-600">
                    {sectionEntries.length} {sectionEntries.length === 1 ? "entry" : "entries"}
                  </span>
                </summary>
                <div className="divide-y divide-slate-200">
                  {sectionEntries.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-slate-500">No saved entries.</p>
                  ) : (
                    sectionEntries.map((entry) => (
                      <KnowledgeEntryRow
                        draft={drafts[entry.id] ?? toInput(entry)}
                        entry={entry}
                        isBusy={isBusy}
                        isEditing={editingId === entry.id}
                        key={entry.id}
                        onCancel={() => cancelEdit(entry)}
                        onChange={(draft) =>
                          setDrafts((current) => ({ ...current, [entry.id]: draft }))
                        }
                        onDelete={() => {
                          void handleDelete(entry);
                        }}
                        onEdit={() => setEditingId(entry.id)}
                        onSave={() => {
                          void handleUpdate(entry);
                        }}
                      />
                    ))
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}

function toInput(entry: KnowledgeEntry): KnowledgeEntryInput {
  return {
    section: entry.section,
    entryType: entry.entryType,
    title: entry.title,
    content: entry.content,
    companyName: entry.companyName,
    sortOrder: entry.sortOrder,
  };
}

function errorMessage(caught: unknown): string {
  if (caught instanceof Error) {
    return caught.message;
  }
  return "Knowledge Base operation failed.";
}

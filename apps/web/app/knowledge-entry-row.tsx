import { Edit3, Save, Trash2, X } from "lucide-react";

import { FieldLabel } from "./knowledge-form-fields";
import type { KnowledgeEntry, KnowledgeEntryInput, KnowledgeSection } from "./knowledge-types";
import { KNOWLEDGE_SECTIONS } from "./knowledge-utils";

export function KnowledgeEntryRow({
  draft,
  entry,
  isBusy,
  isEditing,
  onCancel,
  onChange,
  onDelete,
  onEdit,
  onSave,
}: {
  draft: KnowledgeEntryInput;
  entry: KnowledgeEntry;
  isBusy: boolean;
  isEditing: boolean;
  onCancel: () => void;
  onChange: (draft: KnowledgeEntryInput) => void;
  onDelete: () => void;
  onEdit: () => void;
  onSave: () => void;
}) {
  if (!isEditing) {
    return (
      <article
        className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto]"
        data-entry-id={entry.id}
        data-testid="knowledge-entry-row"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-base font-semibold">{entry.title}</h3>
            <span className="bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
              {entry.entryType === "long_form" ? "Long form" : "Short"}
            </span>
            {entry.companyName ? (
              <span className="bg-sky-100 px-2 py-1 text-xs font-medium text-sky-800">
                {entry.companyName}
              </span>
            ) : null}
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
            {entry.content}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Updated {new Date(entry.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-2 lg:justify-end">
          <button
            className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 text-sm font-medium"
            data-testid="knowledge-entry-edit"
            disabled={isBusy}
            onClick={onEdit}
            type="button"
          >
            <Edit3 aria-hidden="true" className="h-4 w-4" />
            Edit
          </button>
          <button
            className="inline-flex items-center gap-2 border border-red-200 px-3 py-2 text-sm font-medium text-red-700 disabled:text-red-300"
            data-testid="knowledge-entry-delete"
            disabled={isBusy}
            onClick={onDelete}
            type="button"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            Delete
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      className="grid gap-4 px-5 py-4"
      data-entry-id={entry.id}
      data-testid="knowledge-entry-row"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FieldLabel label="Section">
          <select
            className="border border-slate-300 bg-white px-3 py-2 text-sm"
            data-testid="knowledge-entry-section"
            onChange={(event) =>
              onChange({
                ...draft,
                section: event.target.value as KnowledgeSection,
                companyName:
                  event.target.value === "company_specific_answers" ? draft.companyName : null,
              })
            }
            value={draft.section}
          >
            {KNOWLEDGE_SECTIONS.map((section) => (
              <option key={section.id} value={section.id}>
                {section.label}
              </option>
            ))}
          </select>
        </FieldLabel>
        <FieldLabel label="Type">
          <select
            className="border border-slate-300 bg-white px-3 py-2 text-sm"
            data-testid="knowledge-entry-type"
            onChange={(event) =>
              onChange({
                ...draft,
                entryType: event.target.value === "long_form" ? "long_form" : "scalar",
              })
            }
            value={draft.entryType}
          >
            <option value="scalar">Short answer</option>
            <option value="long_form">Long-form answer</option>
          </select>
        </FieldLabel>
        <FieldLabel label="Question / Label">
          <input
            className="border border-slate-300 px-3 py-2 text-sm"
            data-testid="knowledge-entry-title"
            maxLength={120}
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
            type="text"
            value={draft.title}
          />
        </FieldLabel>
        <FieldLabel label="Company">
          <input
            className="border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
            data-testid="knowledge-entry-company"
            disabled={draft.section !== "company_specific_answers"}
            maxLength={120}
            onChange={(event) => onChange({ ...draft, companyName: event.target.value })}
            type="text"
            value={draft.companyName ?? ""}
          />
        </FieldLabel>
      </div>
      <FieldLabel label="Answer">
        <textarea
          className="min-h-40 border border-slate-300 px-3 py-2 text-sm leading-6"
          data-testid="knowledge-entry-content"
          maxLength={20_000}
          onChange={(event) => onChange({ ...draft, content: event.target.value })}
          value={draft.content}
        />
      </FieldLabel>
      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex items-center gap-2 bg-sky-700 px-3 py-2 text-sm font-semibold text-white disabled:bg-slate-300"
          data-testid="knowledge-entry-save"
          disabled={isBusy}
          onClick={onSave}
          type="button"
        >
          <Save aria-hidden="true" className="h-4 w-4" />
          Save
        </button>
        <button
          className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 text-sm font-medium"
          data-testid="knowledge-entry-cancel"
          disabled={isBusy}
          onClick={onCancel}
          type="button"
        >
          <X aria-hidden="true" className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </article>
  );
}

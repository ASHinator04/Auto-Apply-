import { Plus } from "lucide-react";
import type { FormEvent } from "react";

import { FieldLabel } from "./knowledge-form-fields";
import type { KnowledgeEntryInput, KnowledgeSection } from "./knowledge-types";
import { KNOWLEDGE_SECTIONS } from "./knowledge-utils";

export function KnowledgeEntryCreateForm({
  entry,
  isBusy,
  onChange,
  onSubmit,
}: {
  entry: KnowledgeEntryInput;
  isBusy: boolean;
  onChange: (entry: KnowledgeEntryInput) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="grid gap-4 border border-slate-200 bg-white p-5 lg:grid-cols-[1fr_1fr]"
      onSubmit={onSubmit}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FieldLabel label="Section">
          <select
            className="border border-slate-300 bg-white px-3 py-2 text-sm"
            onChange={(event) =>
              onChange({
                ...entry,
                section: event.target.value as KnowledgeSection,
                companyName:
                  event.target.value === "company_specific_answers" ? entry.companyName : null,
              })
            }
            value={entry.section}
          >
            {KNOWLEDGE_SECTIONS.map((section) => (
              <option key={section.id} value={section.id}>
                {section.label}
              </option>
            ))}
          </select>
        </FieldLabel>
        <FieldLabel label="Answer type">
          <select
            className="border border-slate-300 bg-white px-3 py-2 text-sm"
            onChange={(event) =>
              onChange({
                ...entry,
                entryType: event.target.value === "long_form" ? "long_form" : "scalar",
              })
            }
            value={entry.entryType}
          >
            <option value="scalar">Short answer</option>
            <option value="long_form">Long-form answer</option>
          </select>
        </FieldLabel>
        <FieldLabel label="Title">
          <input
            className="border border-slate-300 px-3 py-2 text-sm"
            maxLength={120}
            onChange={(event) => onChange({ ...entry, title: event.target.value })}
            placeholder="Current Role"
            type="text"
            value={entry.title}
          />
        </FieldLabel>
        <FieldLabel label="Company">
          <input
            className="border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
            disabled={entry.section !== "company_specific_answers"}
            maxLength={120}
            onChange={(event) => onChange({ ...entry, companyName: event.target.value })}
            placeholder="Required for company-specific answers"
            type="text"
            value={entry.companyName ?? ""}
          />
        </FieldLabel>
      </div>
      <FieldLabel label="Content">
        <textarea
          className="min-h-32 border border-slate-300 px-3 py-2 text-sm leading-6"
          maxLength={20_000}
          onChange={(event) => onChange({ ...entry, content: event.target.value })}
          placeholder="Store the exact answer or profile detail you want reused later."
          value={entry.content}
        />
      </FieldLabel>
      <button
        className="inline-flex h-10 items-center justify-center gap-2 bg-sky-700 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 md:w-fit"
        disabled={isBusy}
        type="submit"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
        Add Entry
      </button>
    </form>
  );
}

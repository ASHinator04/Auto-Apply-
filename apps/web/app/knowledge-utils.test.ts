import { describe, expect, it } from "vitest";

import {
  groupKnowledgeEntries,
  sectionLabel,
  sortKnowledgeEntries,
  validateKnowledgeInput,
} from "./knowledge-utils";
import type { KnowledgeEntry } from "./knowledge-types";

describe("knowledge utilities", () => {
  it("groups and sorts entries by section order, sort order, and title", () => {
    const entries = [
      entry("links", "Portfolio", 0),
      entry("personal", "Email", 2),
      entry("personal", "Name", 1),
    ];

    expect(sortKnowledgeEntries(entries).map((item) => item.title)).toEqual([
      "Name",
      "Email",
      "Portfolio",
    ]);
    expect(groupKnowledgeEntries(entries).personal.map((item) => item.title)).toEqual([
      "Name",
      "Email",
    ]);
  });

  it("validates required fields and company-specific answers", () => {
    expect(
      validateKnowledgeInput({
        section: "company_specific_answers",
        entryType: "long_form",
        title: "Why us",
        content: "Because the role fits.",
        companyName: null,
        sortOrder: 0,
      }),
    ).toBe("Company name is required for company-specific answers.");

    expect(sectionLabel("work_authorization")).toBe("Work Authorization");
  });
});

function entry(
  section: KnowledgeEntry["section"],
  title: string,
  sortOrder: number,
): KnowledgeEntry {
  return {
    id: title,
    section,
    entryType: "scalar",
    title,
    content: title,
    companyName: null,
    sortOrder,
    createdAt: "2026-06-29T00:00:00.000Z",
    updatedAt: "2026-06-29T00:00:00.000Z",
  };
}

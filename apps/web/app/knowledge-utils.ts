import type { KnowledgeEntry, KnowledgeEntryInput, KnowledgeSection } from "./knowledge-types";

export const KNOWLEDGE_SECTIONS: Array<{
  id: KnowledgeSection;
  label: string;
  description: string;
}> = [
  { id: "personal", label: "Personal", description: "Name, phone, email, location." },
  {
    id: "professional",
    label: "Professional",
    description: "Role, salary, notice period, preferences.",
  },
  { id: "education", label: "Education", description: "Schools, degrees, certifications." },
  { id: "experience", label: "Experience", description: "Roles, projects, achievements." },
  { id: "links", label: "Links", description: "LinkedIn, GitHub, portfolio, website." },
  {
    id: "work_authorization",
    label: "Work Authorization",
    description: "Citizenship, visa, sponsorship, relocation.",
  },
  {
    id: "behavioral_answers",
    label: "Behavioral Answers",
    description: "Reusable long-form application answers.",
  },
  {
    id: "company_specific_answers",
    label: "Company Specific Answers",
    description: "Answers saved for individual companies.",
  },
  { id: "miscellaneous", label: "Miscellaneous", description: "Anything that does not fit yet." },
];

export const SECTION_ORDER = new Map(
  KNOWLEDGE_SECTIONS.map((section, index) => [section.id, index]),
);

export function sectionLabel(sectionId: KnowledgeSection): string {
  return KNOWLEDGE_SECTIONS.find((section) => section.id === sectionId)?.label ?? sectionId;
}

export function groupKnowledgeEntries(
  entries: KnowledgeEntry[],
): Record<KnowledgeSection, KnowledgeEntry[]> {
  const grouped = KNOWLEDGE_SECTIONS.reduce(
    (current, section) => ({
      ...current,
      [section.id]: [],
    }),
    {} as Record<KnowledgeSection, KnowledgeEntry[]>,
  );

  for (const entry of sortKnowledgeEntries(entries)) {
    grouped[entry.section].push(entry);
  }

  return grouped;
}

export function sortKnowledgeEntries(entries: KnowledgeEntry[]): KnowledgeEntry[] {
  return [...entries].sort((left, right) => {
    const sectionDelta =
      (SECTION_ORDER.get(left.section) ?? 0) - (SECTION_ORDER.get(right.section) ?? 0);
    if (sectionDelta !== 0) {
      return sectionDelta;
    }
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }
    return left.title.localeCompare(right.title);
  });
}

export function emptyKnowledgeInput(): KnowledgeEntryInput {
  return {
    section: "personal",
    entryType: "scalar",
    title: "",
    content: "",
    companyName: null,
    sortOrder: 0,
  };
}

export function validateKnowledgeInput(input: KnowledgeEntryInput): string | null {
  if (!input.title.trim()) {
    return "Title is required.";
  }
  if (!input.content.trim()) {
    return "Content is required.";
  }
  if (input.section === "company_specific_answers" && !input.companyName?.trim()) {
    return "Company name is required for company-specific answers.";
  }
  return null;
}

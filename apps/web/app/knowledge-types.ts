export type KnowledgeSection =
  | "personal"
  | "professional"
  | "education"
  | "experience"
  | "links"
  | "work_authorization"
  | "behavioral_answers"
  | "company_specific_answers"
  | "miscellaneous";

export type KnowledgeEntryType = "scalar" | "long_form";

export interface KnowledgeEntry {
  id: string;
  section: KnowledgeSection;
  entryType: KnowledgeEntryType;
  title: string;
  content: string;
  companyName: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeEntryInput {
  section: KnowledgeSection;
  entryType: KnowledgeEntryType;
  title: string;
  content: string;
  companyName: string | null;
  sortOrder: number;
}

export interface KnowledgeEntryListResponse {
  entries: KnowledgeEntry[];
}

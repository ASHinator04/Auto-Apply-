import type {
  ApplicationApprovalInput,
  CreateKnowledgeEntryInput,
  CreateResumeInput,
  JobSearchInput,
  KnowledgeEntrySearchInput,
  UpdateKnowledgeEntryInput,
} from "./dto";
import type { Application, EntityId, Job, KnowledgeEntry, Resume, SearchResult } from "./models";

export interface JobProvider {
  searchJobs(request: JobSearchInput): Promise<Job[]>;
  getJobByExternalId(providerId: EntityId, externalId: string): Promise<Job | null>;
}

export interface ApplicationProvider {
  prepareApplication(input: ApplicationApprovalInput): Promise<Application>;
  getApplicationStatus(applicationId: EntityId): Promise<Application>;
}

export interface ResumeStorage {
  saveResume(input: CreateResumeInput): Promise<Resume>;
  getResumeById(resumeId: EntityId): Promise<Resume | null>;
  listResumesForUser(userId: EntityId): Promise<Resume[]>;
}

export interface KnowledgeRepository {
  saveEntry(input: CreateKnowledgeEntryInput): Promise<KnowledgeEntry>;
  updateEntry(entryId: EntityId, input: UpdateKnowledgeEntryInput): Promise<KnowledgeEntry>;
  deleteEntry(entryId: EntityId): Promise<void>;
  getEntryById(entryId: EntityId): Promise<KnowledgeEntry | null>;
  listEntriesForUser(input: KnowledgeEntrySearchInput): Promise<KnowledgeEntry[]>;
}

export interface ApplicationTracker {
  recordApplication(application: Application): Promise<Application>;
  updateApplicationStatus(application: Application): Promise<Application>;
  getApplicationById(applicationId: EntityId): Promise<Application | null>;
}

export interface SearchEngine {
  search(request: JobSearchInput): Promise<SearchResult>;
}

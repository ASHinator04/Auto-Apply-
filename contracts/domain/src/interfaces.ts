import type {
  ApplicationApprovalInput,
  CreateKnowledgeEntryInput,
  CreateResumeInput,
  JobSearchInput,
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
  getEntryById(entryId: EntityId): Promise<KnowledgeEntry | null>;
  listEntriesForUser(userId: EntityId): Promise<KnowledgeEntry[]>;
}

export interface ApplicationTracker {
  recordApplication(application: Application): Promise<Application>;
  updateApplicationStatus(application: Application): Promise<Application>;
  getApplicationById(applicationId: EntityId): Promise<Application | null>;
}

export interface SearchEngine {
  search(request: JobSearchInput): Promise<SearchResult>;
}

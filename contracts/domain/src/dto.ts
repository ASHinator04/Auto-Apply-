import { ApplicationStatus, KnowledgeEntryType, ProviderType, ResumeType, WorkMode } from "./enums";
import type {
  Application,
  EntityId,
  Job,
  KnowledgeEntry,
  Resume,
  SearchResult,
  User,
} from "./models";

export interface CreateResumeInput {
  userId: EntityId;
  type: ResumeType;
  label: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  checksum?: string;
}

export type ResumeOutput = Resume;

export interface CreateUserInput {
  displayName: string;
  email?: string;
}

export type UserOutput = User;

export interface JobSearchInput {
  userId: EntityId;
  query: string;
  providerTypes?: ProviderType[];
  locations?: string[];
  workModes?: WorkMode[];
}

export interface JobOutput {
  job: Job;
}

export interface SearchResultOutput {
  result: SearchResult;
}

export interface CreateKnowledgeEntryInput {
  userId: EntityId;
  type: KnowledgeEntryType;
  key: string;
  value: string;
  tags?: string[];
  source?: string;
}

export type KnowledgeEntryOutput = KnowledgeEntry;

export interface ApplicationApprovalInput {
  userId: EntityId;
  jobId: EntityId;
  resumeId?: EntityId;
}

export interface ApplicationStatusOutput {
  applicationId: EntityId;
  status: ApplicationStatus;
  statusReason?: string;
}

export type ApplicationOutput = Application;

export interface ProviderJobInput {
  providerId: EntityId;
  externalId: string;
  sourceUrl: string;
}

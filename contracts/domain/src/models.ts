import {
  ApplicationStatus,
  EmploymentType,
  JobType,
  KnowledgeEntryType,
  ProviderType,
  ResumeType,
  WorkMode,
} from "./enums";

export type EntityId = string;
export type ISODateTime = string;
export type UrlString = string;

export interface User {
  id: EntityId;
  displayName: string;
  email?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Resume {
  id: EntityId;
  userId: EntityId;
  type: ResumeType;
  label: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  version: number;
  isPrimary: boolean;
  checksum?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Provider {
  id: EntityId;
  type: ProviderType;
  name: string;
  baseUrl?: UrlString;
  supportsSearch: boolean;
  supportsApplication: boolean;
  enabled: boolean;
}

export interface JobLocation {
  city?: string;
  region?: string;
  country?: string;
  remote: boolean;
}

export interface JobCompensation {
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
  period?: "hour" | "month" | "year";
}

export interface Job {
  id: EntityId;
  providerId: EntityId;
  providerType: ProviderType;
  externalId: string;
  sourceUrl: UrlString;
  title: string;
  companyName: string;
  description?: string;
  location: JobLocation;
  jobType: JobType;
  employmentType: EmploymentType;
  workMode: WorkMode;
  compensation?: JobCompensation;
  postedAt?: ISODateTime;
  discoveredAt: ISODateTime;
  expiresAt?: ISODateTime;
}

export interface Application {
  id: EntityId;
  userId: EntityId;
  jobId: EntityId;
  resumeId?: EntityId;
  providerId: EntityId;
  status: ApplicationStatus;
  statusReason?: string;
  approvedAt?: ISODateTime;
  submittedAt?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface KnowledgeEntry {
  id: EntityId;
  userId: EntityId;
  type: KnowledgeEntryType;
  key: string;
  value: string;
  tags: string[];
  source?: string;
  embeddingReady: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface SearchRequest {
  id: EntityId;
  userId: EntityId;
  query: string;
  providerTypes: ProviderType[];
  locations: string[];
  workModes: WorkMode[];
  createdAt: ISODateTime;
}

export interface SearchResult {
  id: EntityId;
  requestId: EntityId;
  jobs: Job[];
  totalFound: number;
  providerTypes: ProviderType[];
  createdAt: ISODateTime;
}

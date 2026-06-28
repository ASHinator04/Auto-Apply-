export enum ApplicationStatus {
  Found = "found",
  Approved = "approved",
  Applying = "applying",
  Applied = "applied",
  Failed = "failed",
}

export enum ProviderType {
  Greenhouse = "greenhouse",
  Lever = "lever",
  Ashby = "ashby",
  Other = "other",
}

export enum KnowledgeEntryType {
  Scalar = "scalar",
  LongForm = "long_form",
  Semantic = "semantic",
}

export enum ResumeType {
  Primary = "primary",
  Targeted = "targeted",
  Archived = "archived",
}

export enum JobType {
  FullTime = "full_time",
  PartTime = "part_time",
  Contract = "contract",
  Internship = "internship",
  Temporary = "temporary",
  Unknown = "unknown",
}

export enum EmploymentType {
  Permanent = "permanent",
  Contract = "contract",
  Internship = "internship",
  Temporary = "temporary",
  Unknown = "unknown",
}

export enum WorkMode {
  Remote = "remote",
  Hybrid = "hybrid",
  Onsite = "onsite",
  Unknown = "unknown",
}

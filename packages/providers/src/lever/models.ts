export interface LeverJobCategories {
  location?: string;
  commitment?: string;
  team?: string;
  department?: string;
  allLocations: string[];
}

export interface LeverJobList {
  text?: string;
  content?: string;
}

export interface LeverSalaryRange {
  currency?: string;
  interval?: string;
  min?: number;
  max?: number;
}

export interface RawLeverJob {
  id?: string;
  title?: string;
  categories: LeverJobCategories;
  country?: string | null;
  workplaceType?: string;
  hostedUrl?: string;
  applyUrl?: string;
  opening?: string;
  openingPlain?: string;
  description?: string;
  descriptionPlain?: string;
  descriptionBody?: string;
  descriptionBodyPlain?: string;
  lists: LeverJobList[];
  additional?: string;
  additionalPlain?: string;
  salaryRange?: LeverSalaryRange;
  salaryDescription?: string;
  salaryDescriptionPlain?: string;
  providerMetadata: {
    provider: "lever";
    site: string;
  };
  raw: Record<string, unknown>;
}

export interface LeverSearchRequest {
  query?: string;
  locations?: readonly string[];
  remoteOnly?: boolean;
  teams?: readonly string[];
  departments?: readonly string[];
  commitments?: readonly string[];
}

export interface LeverSearchResult {
  provider: "lever";
  site: string;
  jobs: RawLeverJob[];
  totalFound: number;
  pagesFetched: number;
}

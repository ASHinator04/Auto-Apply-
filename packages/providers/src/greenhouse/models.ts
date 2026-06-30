export interface GreenhouseBoardReference {
  id?: number | string;
  name?: string;
}

export interface RawGreenhouseJob {
  id?: number | string;
  internalJobId?: number | string;
  title?: string;
  absoluteUrl?: string;
  location?: GreenhouseBoardReference;
  departments: GreenhouseBoardReference[];
  offices: GreenhouseBoardReference[];
  updatedAt?: string;
  requisitionId?: string;
  content?: string;
  metadata?: unknown;
  providerMetadata: {
    provider: "greenhouse";
    boardToken: string;
  };
  raw: Record<string, unknown>;
}

export interface GreenhouseSearchRequest {
  query?: string;
  locations?: readonly string[];
  remoteOnly?: boolean;
  departments?: readonly string[];
}

export interface GreenhouseSearchResult {
  provider: "greenhouse";
  boardToken: string;
  jobs: RawGreenhouseJob[];
  totalFound: number;
  pagesFetched: number;
}

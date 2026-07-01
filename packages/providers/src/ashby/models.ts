export interface AshbyPostalAddress {
  addressLocality?: string;
  addressRegion?: string;
  addressCountry?: string;
}

export interface AshbyJobAddress {
  postalAddress?: AshbyPostalAddress;
}

export interface AshbySecondaryLocation {
  location?: string;
  address?: AshbyPostalAddress;
}

export interface AshbyCompensationComponent {
  id?: string;
  summary?: string;
  compensationType?: string;
  interval?: string;
  currencyCode?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
}

export interface AshbyCompensationTier {
  id?: string;
  tierSummary?: string;
  title?: string;
  additionalInformation?: string | null;
  components: AshbyCompensationComponent[];
}

export interface AshbyCompensation {
  compensationTierSummary?: string;
  scrapeableCompensationSalarySummary?: string;
  compensationTiers: AshbyCompensationTier[];
  summaryComponents: AshbyCompensationComponent[];
}

export interface RawAshbyJob {
  title?: string;
  location?: string;
  secondaryLocations: AshbySecondaryLocation[];
  department?: string;
  team?: string;
  isListed?: boolean;
  isRemote?: boolean;
  workplaceType?: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
  publishedAt?: string;
  employmentType?: string;
  address?: AshbyJobAddress;
  jobUrl?: string;
  applyUrl?: string;
  compensation?: AshbyCompensation;
  providerMetadata: {
    provider: "ashby";
    jobBoardName: string;
  };
  raw: Record<string, unknown>;
}

export interface AshbySearchRequest {
  query?: string;
  locations?: readonly string[];
  remoteOnly?: boolean;
  teams?: readonly string[];
  departments?: readonly string[];
  employmentTypes?: readonly string[];
}

export interface AshbySearchResult {
  provider: "ashby";
  jobBoardName: string;
  jobs: RawAshbyJob[];
  totalFound: number;
  pagesFetched: number;
  includeCompensation: boolean;
}

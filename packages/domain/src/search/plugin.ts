import type { EntityId, ProviderType } from "@job-agent/contracts";

import type { ProviderPluginConfiguration } from "./configuration";
import type { SearchProvider } from "./types";

export interface ProviderPluginCapabilitySet {
  keywordSearch: boolean;
  pagination: boolean;
  locationFilters: boolean;
  remoteSearch: boolean;
  salary: boolean;
  future: Readonly<Record<string, boolean>>;
}

export interface ProviderPluginMetadata {
  id: EntityId;
  type: ProviderType;
  name: string;
  version: string;
  capabilities: ProviderPluginCapabilitySet;
}

export enum ProviderPluginLifecycleStatus {
  Validated = "validated",
  Disabled = "disabled",
  Ready = "ready",
  Shutdown = "shutdown",
}

export interface ProviderPluginContext {
  configuration: ProviderPluginConfiguration;
}

export interface ProviderPlugin {
  metadata: ProviderPluginMetadata;
  provider: SearchProvider;
  initialize?(context: ProviderPluginContext): Promise<void> | void;
  shutdown?(): Promise<void> | void;
}

export interface ProviderPluginRegistration {
  plugin: ProviderPlugin;
  configuration?: Partial<ProviderPluginConfiguration>;
}

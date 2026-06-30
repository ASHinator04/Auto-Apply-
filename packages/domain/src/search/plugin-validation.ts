import { SearchConfigurationException } from "./errors";
import type { ProviderPlugin, ProviderPluginCapabilitySet } from "./plugin";

const REQUIRED_CAPABILITIES: readonly (keyof Omit<ProviderPluginCapabilitySet, "future">)[] = [
  "keywordSearch",
  "pagination",
  "locationFilters",
  "remoteSearch",
  "salary",
];

export function validateProviderPlugin(plugin: ProviderPlugin): void {
  const { metadata } = plugin;

  if (!metadata.id.trim()) {
    throw new SearchConfigurationException("Provider plugin id is required.", "plugin.metadata.id");
  }

  if (!metadata.name.trim()) {
    throw new SearchConfigurationException(
      `Provider plugin '${metadata.id}' name is required.`,
      "plugin.metadata.name",
    );
  }

  if (!metadata.version.trim()) {
    throw new SearchConfigurationException(
      `Provider plugin '${metadata.id}' version is required.`,
      "plugin.metadata.version",
    );
  }

  if (plugin.provider.id !== metadata.id) {
    throw new SearchConfigurationException(
      `Provider plugin '${metadata.id}' provider id must match metadata id.`,
      "plugin.provider.id",
    );
  }

  if (plugin.provider.type !== metadata.type) {
    throw new SearchConfigurationException(
      `Provider plugin '${metadata.id}' provider type must match metadata type.`,
      "plugin.provider.type",
    );
  }

  validateCapabilities(metadata.id, metadata.capabilities);
}

function validateCapabilities(providerId: string, capabilities: ProviderPluginCapabilitySet): void {
  for (const capability of REQUIRED_CAPABILITIES) {
    if (typeof capabilities[capability] !== "boolean") {
      throw new SearchConfigurationException(
        `Provider plugin '${providerId}' capability '${capability}' must be declared.`,
        `plugin.metadata.capabilities.${capability}`,
      );
    }
  }

  if (
    capabilities.future === undefined ||
    capabilities.future === null ||
    Array.isArray(capabilities.future) ||
    typeof capabilities.future !== "object"
  ) {
    throw new SearchConfigurationException(
      `Provider plugin '${providerId}' future capability map is required.`,
      "plugin.metadata.capabilities.future",
    );
  }

  for (const [capability, supported] of Object.entries(capabilities.future)) {
    if (typeof supported !== "boolean") {
      throw new SearchConfigurationException(
        `Provider plugin '${providerId}' future capability '${capability}' must be boolean.`,
        "plugin.metadata.capabilities.future",
      );
    }
  }
}

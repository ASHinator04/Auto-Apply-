import { createProviderPluginConfiguration } from "./configuration";
import type { ProviderPluginConfiguration } from "./configuration";
import { SearchConfigurationException } from "./errors";
import type { ProviderPlugin, ProviderPluginMetadata, ProviderPluginRegistration } from "./plugin";
import { ProviderPluginLifecycleStatus } from "./plugin";
import { SearchProviderRegistry } from "./registry";
import type { SearchProvider } from "./types";
import { validateProviderPlugin } from "./plugin-validation";

interface RegisteredProviderPlugin {
  plugin: ProviderPlugin;
  configuration: ProviderPluginConfiguration;
  status: ProviderPluginLifecycleStatus;
}

export interface ProviderPluginDescriptor {
  metadata: ProviderPluginMetadata;
  configuration: ProviderPluginConfiguration;
  status: ProviderPluginLifecycleStatus;
}

export class ProviderPluginRegistry {
  private readonly plugins = new Map<string, RegisteredProviderPlugin>();

  constructor(registrations: Iterable<ProviderPluginRegistration> = []) {
    for (const registration of registrations) {
      this.register(registration);
    }
  }

  register(registration: ProviderPluginRegistration): void {
    const configuration = createProviderPluginConfiguration(registration.configuration);
    const { plugin } = registration;

    validateProviderPlugin(plugin);

    if (this.plugins.has(plugin.metadata.id)) {
      throw new SearchConfigurationException(
        `Provider plugin '${plugin.metadata.id}' is already registered.`,
        "plugin.metadata.id",
      );
    }

    this.plugins.set(plugin.metadata.id, {
      plugin,
      configuration,
      status: configuration.enabled
        ? ProviderPluginLifecycleStatus.Validated
        : ProviderPluginLifecycleStatus.Disabled,
    });
  }

  list(): ProviderPluginDescriptor[] {
    return [...this.plugins.values()].map((entry) => this.describe(entry));
  }

  listMetadata(): ProviderPluginMetadata[] {
    return this.list().map((descriptor) => descriptor.metadata);
  }

  resolve(providerId: string): ProviderPlugin | null {
    return this.plugins.get(providerId)?.plugin ?? null;
  }

  enable(providerId: string): void {
    const entry = this.require(providerId);
    entry.configuration = { ...entry.configuration, enabled: true };
    entry.status = ProviderPluginLifecycleStatus.Validated;
  }

  disable(providerId: string): void {
    const entry = this.require(providerId);
    entry.configuration = { ...entry.configuration, enabled: false };
    entry.status = ProviderPluginLifecycleStatus.Disabled;
  }

  validate(providerId: string): void {
    validateProviderPlugin(this.require(providerId).plugin);
  }

  async initialize(providerId: string): Promise<void> {
    const entry = this.require(providerId);

    if (!entry.configuration.enabled) {
      throw new SearchConfigurationException(
        `Provider plugin '${providerId}' is disabled and cannot be initialized.`,
        "plugin.configuration.enabled",
      );
    }

    await entry.plugin.initialize?.({ configuration: entry.configuration });
    entry.status = ProviderPluginLifecycleStatus.Ready;
  }

  async initializeAll(): Promise<void> {
    for (const providerId of this.plugins.keys()) {
      const entry = this.require(providerId);

      if (entry.configuration.enabled) {
        await this.initialize(providerId);
      }
    }
  }

  async shutdown(providerId: string): Promise<void> {
    const entry = this.require(providerId);

    await entry.plugin.shutdown?.();
    entry.status = ProviderPluginLifecycleStatus.Shutdown;
  }

  readyProviders(): SearchProvider[] {
    return [...this.plugins.values()]
      .filter((entry) => entry.status === ProviderPluginLifecycleStatus.Ready)
      .map((entry) => ({
        ...entry.plugin.provider,
        enabled: entry.configuration.enabled,
      }));
  }

  createSearchProviderRegistry(): SearchProviderRegistry {
    return new SearchProviderRegistry(this.readyProviders());
  }

  private require(providerId: string): RegisteredProviderPlugin {
    const entry = this.plugins.get(providerId);

    if (entry === undefined) {
      throw new SearchConfigurationException(
        `Provider plugin '${providerId}' is not registered.`,
        "plugin.metadata.id",
      );
    }

    return entry;
  }

  private describe(entry: RegisteredProviderPlugin): ProviderPluginDescriptor {
    return {
      metadata: entry.plugin.metadata,
      configuration: entry.configuration,
      status: entry.status,
    };
  }
}

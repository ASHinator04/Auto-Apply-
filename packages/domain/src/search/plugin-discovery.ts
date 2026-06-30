import type { ProviderPlugin, ProviderPluginRegistration } from "./plugin";

export interface ProviderPluginDiscoverer {
  discover(): Promise<ProviderPluginRegistration[]> | ProviderPluginRegistration[];
}

export async function discoverProviderPlugins(
  discoverers: readonly ProviderPluginDiscoverer[],
): Promise<ProviderPluginRegistration[]> {
  const discovered = await Promise.all(
    discoverers.map(async (discoverer) => discoverer.discover()),
  );

  return discovered.flat();
}

export function createStaticProviderPluginDiscoverer(
  plugins: readonly ProviderPlugin[],
): ProviderPluginDiscoverer {
  return {
    discover() {
      return plugins.map((plugin) => ({ plugin }));
    },
  };
}

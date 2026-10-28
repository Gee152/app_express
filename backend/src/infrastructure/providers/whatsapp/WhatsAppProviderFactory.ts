import { envConfig } from '../../../config/env.config.js';
import { IWhatsAppProvider } from './IWhatsAppProvider.js';
import { EvolutionApiProvider } from './EvolutionApiProvider.js';
import { MockWhatsAppProvider } from './MockWhatsAppProvider.js';

let cachedProvider: IWhatsAppProvider | null = null;

export function getWhatsAppProvider(): IWhatsAppProvider {
  if (cachedProvider) return cachedProvider;

  const { provider, evolutionApiUrl, evolutionApiKey, evolutionInstanceName } = envConfig.whatsapp;

  // Se a chave não estiver configurada ou provider for mock, usa MockWhatsAppProvider
  if (provider === 'mock' || !evolutionApiKey || evolutionApiKey === '') {
    cachedProvider = new MockWhatsAppProvider();
    return cachedProvider;
  }

  if (provider === 'evolution') {
    cachedProvider = new EvolutionApiProvider(evolutionApiUrl, evolutionApiKey, evolutionInstanceName);
    return cachedProvider;
  }

  cachedProvider = new MockWhatsAppProvider();
  return cachedProvider;
}

export function setWhatsAppProviderForTesting(provider: IWhatsAppProvider | null): void {
  cachedProvider = provider;
}

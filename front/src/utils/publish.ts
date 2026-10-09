import type { Empresa, Categoria, Produto, Config } from '../types';
import { api } from '../services/api';

/** Estrutura do JSON de dados de uma loja pública. */
export interface PublicStoreData {
  versao: string;
  slug: string;
  empresa: Empresa;
  categorias: Categoria[];
  produtos: Produto[];
  config: Config;
  nichoId: string;
  publicadaEm: string;
}

/** Caminho relativo à base do deploy do JSON público de uma loja (fallback). */
export function publicStorePath(slug: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}lojas/${slug}.json`.replace(/\/{2,}/g, '/');
}

/**
 * Lê os dados públicos da loja a partir do backend PostgreSQL (API REST)
 * com fallback para arquivo estático em modo PWA offline.
 */
export async function fetchPublicStore(slug: string): Promise<PublicStoreData | undefined> {
  try {
    // 1. Tenta buscar direto do Backend via API REST
    const backendStore = await api.stores.getBySlug(slug);
    if (backendStore && backendStore.config) {
      const cfg = backendStore.config;
      return {
        versao: '2.0-backend',
        slug: backendStore.slug,
        empresa: cfg.empresa || { nome: backendStore.name, whatsapp: backendStore.whatsapp, telefone: backendStore.whatsapp },
        categorias: cfg.categorias || [],
        produtos: cfg.produtos || [],
        config: cfg.config || {},
        nichoId: cfg.nichoId || 'restaurante',
        publicadaEm: backendStore.updatedAt || new Date().toISOString(),
      };
    }
  } catch (err) {
    // Se falhar ou estiver offline, tenta ler do arquivo estático (PWA)
    console.debug('Backend offline ou loja não encontrada na API, tentando fallback estático:', err);
  }

  try {
    const res = await fetch(publicStorePath(slug), { cache: 'no-cache' });
    if (!res.ok) return undefined;
    const json = (await res.json()) as PublicStoreData;
    if (!json || json.slug !== slug) return undefined;
    return json;
  } catch {
    return undefined;
  }
}

/** Converte um timestamp ISO para data amigável. */
export function formatPublicagem(data: string): string {
  try {
    return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return data;
  }
}
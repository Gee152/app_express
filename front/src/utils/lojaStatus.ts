import { LojaDono, LojaSnapshot } from '../db/db';
import { LojaStatusEnum } from '../types';

export interface LojaStatusDetalhes {
  status: LojaStatusEnum; // 'publicada' | 'rascunho'
  isPublicada: boolean;
  isRascunho: boolean;
  temLoginSenha: boolean;
  temPerfilConfigurado: boolean;
  temProdutos: boolean;
  totalProdutos: number;
  motivoIncompleto?: string[];
}

/**
 * Calcula o status de publicação da loja baseado nas regras de negócio:
 * 1. Usuário criou login e senha válidos.
 * 2. Configuração completa: perfil com informações da loja, onboarding concluído e produtos cadastrados.
 */
export function calcularStatusLoja(loja: {
  slug?: string;
  nome?: string;
  isOnboarded?: boolean;
  dono?: LojaDono;
  produtosCount?: number;
  data?: LojaSnapshot;
}): LojaStatusDetalhes {
  const dono = loja.dono;

  // 1. Tem login configurado (dono associado com e-mail)
  const temLoginSenha = Boolean(
    dono?.email && dono.email.trim() !== ''
  );

  // 2. Configuração da loja (perfil, produtos e onboarding)
  const produtos = loja.data?.produtos || [];
  const totalProdutos = typeof loja.produtosCount === 'number' ? loja.produtosCount : produtos.length;
  const temProdutos = totalProdutos > 0;

  const empresaNome = (loja.data?.empresa?.nome || loja.nome || '').trim();
  const empresaContato = Boolean(
    loja.data?.empresa?.whatsapp?.trim() ||
    loja.data?.empresa?.telefone?.trim() ||
    dono?.telefone?.trim()
  );

  const isOnboarded = Boolean(loja.isOnboarded || loja.data?.isOnboarded);
  const temPerfilConfigurado = Boolean(empresaNome && (empresaContato || isOnboarded));

  // Uma loja só é considerada Publicada/Completa se:
  // - Possui credenciais (login + senha)
  // - Completou o onboarding
  // - Possui produtos cadastrados
  // - Possui perfil com informações
  const isPublicada = Boolean(temLoginSenha && isOnboarded && temProdutos && temPerfilConfigurado);
  const status = isPublicada ? LojaStatusEnum.PUBLICADA : LojaStatusEnum.RASCUNHO;

  const motivoIncompleto: string[] = [];
  if (!temLoginSenha) motivoIncompleto.push('Falta login/senha');
  if (!isOnboarded) motivoIncompleto.push('Onboarding pendente');
  if (!temProdutos) motivoIncompleto.push('Sem produtos');
  if (!temPerfilConfigurado) motivoIncompleto.push('Perfil incompleto');

  return {
    status,
    isPublicada,
    isRascunho: !isPublicada,
    temLoginSenha,
    temPerfilConfigurado,
    temProdutos,
    totalProdutos,
    motivoIncompleto: motivoIncompleto.length > 0 ? motivoIncompleto : undefined,
  };
}

export function rotuloStatusLoja(status: LojaStatusEnum): { texto: string; cor: string; icone: string } {
  if (status === LojaStatusEnum.PUBLICADA) {
    return {
      texto: 'Publicada',
      cor: 'bg-[#E6FFFA] text-[#12B886] border border-[#12B886]/30 dark:bg-[#004D40] dark:text-[#69F0AE] dark:border-[#69F0AE]/40',
      icone: '✓',
    };
  }
  return {
    texto: 'Rascunho',
    cor: 'bg-[#FFF9E6] text-[#FAB005] border border-[#FAB005]/30 dark:bg-[#424200] dark:text-[#FFFF00] dark:border-[#FFFF00]/40',
    icone: '📝',
  };
}

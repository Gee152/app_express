export enum LojaStatusEnum {
  PUBLICADA = 'publicada',
  RASCUNHO = 'rascunho',
}

export interface CampoPersonalizado {
  id: string;
  label: string;
  tipo: 'text' | 'textarea' | 'select';
  obrigatorio: boolean;
  placeholder?: string;
  opcoes?: string[];
}

export interface NichoConfig {
  id: string;
  nome: string;
  icone: string;
  descricao: string;
  exemplos: string[];
  templatePadrao: string;
  temasRecomendados: string[];
  camposObrigatorios: string[];
  camposPersonalizados: CampoPersonalizado[];
  configuracaoProduto: {
    temCategoria: boolean;
    temDescricao: boolean;
    temPreco: boolean;
    temImagem: boolean;
    camposExtras: string[];
  };
}

export interface TemaCores {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary?: string;
  border?: string;
  accent?: string;
}

export interface TemaConfig {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  preview?: string;
  recommendedFor?: string[];
  cores: TemaCores;
}

export interface PromoSlide {
  id: string;
  tag?: string;
  titulo?: string;
  subtitulo?: string;
  descricao?: string;
  badgeDesconto?: string;
  textoBotao?: string;
  imagem?: string;
  linkProdutoId?: number | string;
}

export interface PromoBannerConfig {
  ativo: boolean;
  tag?: string; // ex.: "OFERTA DA SEMANA", "PROMOÇÃO DO DIA"
  titulo?: string; // ex.: "Combo Especial"
  subtitulo?: string; // ex.: "Artesanal + Batata Frita Fofinha"
  descricao?: string; // texto explicativo
  badgeDesconto?: string; // ex.: "20% OFF", "FRETE GRÁTIS"
  textoBotao?: string; // ex.: "Pedir Oferta", "Aproveitar"
  imagem?: string; // imagem personalizada panorâmica (WebP base64)
  linkProdutoId?: number | string; // ID do produto a abrir no modal ao clicar
  slides?: PromoSlide[]; // múltiplos slides para carrossel/slider
  intervaloSegundos?: number; // tempo de rotação do slider (padrão: 5s)
}

export interface Empresa {
  nome: string;
  telefone: string;
  whatsapp: string;
  instagram?: string;
  facebook?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  pontoReferencia?: string;
  temEspacoFisico?: boolean;
  googleMapsUrl?: string;
  horarioFuncionamento?: string;
  pix?: string;
  email?: string;
  logo?: string;
  banner?: string;
  promoBanner?: PromoBannerConfig;
  headlineTitulo?: string;
  headlineSubtitulo?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  // Campos dinâmicos do nicho
  [key: string]: any;
}

export interface Categoria {
  id: number | string;
  nome: string;
  ordem: number;
  icone?: string;
}

export interface ProdutoOpcionalItem {
  id: string;
  nome: string;
  preco: number;
}

export type ProdutoOpcaoTipo = 'unica' | 'multipla';

export interface ProdutoOpcao {
  id: string;
  nome: string; // ex.: "Tamanho", "Adicionais", "Borda"
  tipo: ProdutoOpcaoTipo; // unica = escolher 1; multipla = liga/desliga
  itens: ProdutoOpcionalItem[];
}

export interface Produto {
  id: number | string;
  nome: string;
  descricao: string;
  categoria: number | string;
  preco: number;
  imagem?: string;
  thumbnail?: string;
  status: boolean;
  destaque: boolean;
  ordem: number;
  opcoes?: ProdutoOpcao[];
  linkExternoAtivo?: boolean; // Switch para ativar/desativar venda em outra plataforma (Shopee, Mercado Livre, etc.)
  linkExterno?: string; // Link de compra externo (Shopee, Mercado Livre, Amazon, etc.)
  nomePlataformaExterna?: string; // Ex.: "Shopee", "Mercado Livre", "Amazon", "Kiwify", "Outra"
  cliquesExternos?: number; // Contador de rastreamento de cliques de saída para o link externo
  [key: string]: any;
}

export interface Config {
  versao: string;
  nicho: string;
  tema: TemaConfig;
  customPalettes?: TemaConfig[];
  customizacao: {
    corPrimaria: string;
    corSecundaria: string;
    fonte: string;
    darkMode: boolean;
  };
  tipoComida?: string;
  publicacao: {
    data: string;
    ultimaPublicacao: string;
    versaoSite: string;
  };
}

export type PedidoStatus = 'novo' | 'preparando' | 'pronto' | 'concluido';

export interface PedidoItem {
  nome: string;
  quantidade: number;
  preco: number;
  subtotal: number;
  opcoes?: string;
}

export interface Pedido {
  id: string;
  data: number; // timestamp de criação
  cliente: string;
  tipoEntrega: 'entrega' | 'retirada';
  endereco?: string;
  formaPagamento: string;
  trocoPara?: string;
  observacoes?: string;
  itens: PedidoItem[];
  total: number;
  status: PedidoStatus; // "novo" (recebido), "preparando" (em preparo), "pronto" (a sair), "concluido" (entregue)
}

export interface CartItemOpcao {
  grupo: string;
  itens: { nome: string; preco: number }[];
}

export interface CartItem {
  id: string; // unique item key
  produto: Produto;
  quantidade: number;
  observacoes?: string;
  opcoesSelecionadas?: Record<string, string>;
  opcoesDetalhe?: CartItemOpcao[];
  acrescimo?: number; // soma dos preços dos opcionais escolhidos (por 1 unidade)
}

export interface ProcessedImageResult {
  main: string; // Data URL or Blob URL
  thumb: string;
  originalSize: number;
  mainSize: number;
  thumbSize: number;
  width: number;
  height: number;
  format: string;
}

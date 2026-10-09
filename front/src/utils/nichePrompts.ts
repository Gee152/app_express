export interface NichePromptContext {
  nomeLoja?: string;
  nomeItem?: string;
  categoria?: string;
}

export interface NichePromptDefinition {
  logo: string;
  banner: string;
  promo: string;
  produto: string;
  smartTextExample: string;
}

const NICHE_PROMPTS: Record<string, NichePromptDefinition> = {
  restaurante: {
    logo: 'Logotipo gastronômico moderno e minimalista para {loja}. Vetorizado, traços limpos, cores apetitosas e elegantes, fundo neutro sólido, alta definição, proporção 1:1 quadrada (500x500px). Sem texto ilegível.',
    banner: 'Fotografia panorâmica widescreen profissional de gastronomia para cabeçalho do restaurante {loja}. Mesa de restaurante rústica e elegante com pratos suculentos, iluminação cinematográfica quente e aconchegante, vapor sutil saindo da comida, proporção 3:1 (1200x400px). Alta definição 8k.',
    promo: 'Banner panorâmico widescreen comercial de alta gastronomia para oferta e promoção especial de {loja}. Prato delicioso e suculento em destaque ao centro/lateral, fumaça sutil, ingredientes frescos, iluminação cinematográfica quente de estúdio publicitário, composição hero banner widescreen de largura total, proporção 3:1 (1200x400px). Sem texto ou tipografia sobreposta.',
    produto: 'Fotografia profissional de gastronomia (food photography) de "{item}". Servido em prato de cerâmica artesanal, ângulo em 45 graus, textura suculenta nítida, iluminação suave de estúdio, fundo neutro desfocado (bokeh), proporção 1:1 quadrada (800x800px). Sem texto sobre a imagem.',
    smartTextExample: `🥟 Os 10 Sabores Principais (Bases)
Estes são os recheios clássicos e mais pedidos para a base do pastel:
Carne Clássica: Carne moída temperada com cheiro-verde.
Queijo Tradicional: Queijo muçarela derretido.
Frango Desfiado: Frango desfiado suculento com temperos da casa.
Calabresa: Linguiça calabresa fatiada com cebola.
Pizza: Muçarela, presunto, tomate picado e orégano.

🧀 Opções de Adicionais
Catupiry Original - R$ 4,00
Cheddar Cremoso - R$ 4,00
Bacon em Cubos - R$ 3,50
Ovo Cozido Picado - R$ 2,00
Azeitona Fatiada - R$ 1,50
Geleia de Pimenta - R$ 3,00`,
  },

  loja: {
    logo: 'Logotipo sofisticado e moderno para a marca de moda e vitrine "{loja}". Tipografia minimalista de luxo, monograma elegante, fundo limpo e neutro, alta definição, proporção 1:1 quadrada (500x500px). Sem elementos poluídos.',
    banner: 'Banner widescreen editorial de moda e lifestyle para vitrine de "{loja}". Cenário minimalista contemporâneo, estética clean e luminosa, iluminação de estúdio comercial de alto padrão, proporção 3:1 (1200x400px). Alta resolução.',
    promo: 'Banner publicitário panorâmico widescreen para campanha promocional de moda e vitrine de "{loja}". Coleção de roupas e acessórios premium dispostos com elegância em ambiente editorial contemporâneo, iluminação suave de estúdio, composição hero banner widescreen de largura total, proporção 3:1 (1200x400px). Sem texto sobreposto.',
    produto: 'Fotografia profissional de produto para e-commerce (product photography) de "{item}". Em manequim invisível ou estúdio neutro, iluminação suave sem sombras duras, cores fiéis e textura nítida dos tecidos/materiais, proporção 1:1 quadrada (800x800px). Sem texto sobre a imagem.',
    smartTextExample: `👕 Escolha o Tamanho (Grade)
Tamanho P: Veste 36-38
Tamanho M: Veste 40
Tamanho G: Veste 42
Tamanho GG: Veste 44-46

🎨 Opções de Cores e Acabamentos
Preto Clássico
Branco Off-White
Azul Marinho
Verde Militar

🎁 Adicionais para Presente
Embalagem de Presente Premium - R$ 8,00
Cartão Personalizado com Mensagem - R$ 4,00
Sacola Kraft com Laço de Cetim - R$ 5,00`,
  },

  servicos: {
    logo: 'Logotipo refinado e elegante para salão de beleza, barbearia ou clínica de estética "{loja}". Linhas orgânicas, estética premium e acolhedora, fundo neutro, proporção 1:1 quadrada (500x500px).',
    banner: 'Fotografia panorâmica widescreen de espaço moderno e acolhedor de estética e beleza de "{loja}". Poltronas elegantes, espelhos iluminados com LED suave, plantas decorativas e ambiente relaxante, proporção 3:1 (1200x400px).',
    promo: 'Banner panorâmico widescreen de cuidados estéticos, bem-estar e beleza para promoção especial de "{loja}". Ambiente relaxante de spa de luxo com detalhes dourados e terrosos, iluminação suave acolhedora, composição hero banner widescreen de largura total, proporção 3:1 (1200x400px). Sem texto sobreposto.',
    produto: 'Fotografia profissional do serviço ou procedimento "{item}". Modelo em ambiente de estética clean e sofisticado, iluminação suave de beleza, foco na precisão e cuidado, proporção 1:1 quadrada (800x800px). Sem texto sobreposto.',
    smartTextExample: `💇 Procedimento Principal
Corte Personalizado: Diagnóstico capilar e visagismo completo.
Coloração Global: Tintura profissional com hidratação.
Mechas & Luzes: Técnicas modernas de iluminação capilar.
Design de Sobrancelhas: Alinhamento simétrico e acabamento.

✨ Tratamentos e Adicionais
Lavagem Especial com Massagem Craniana - R$ 25,00
Nutrição e Reconstrução Profunda - R$ 60,00
Finalização com Escova Modelada - R$ 35,00
Barboterapia com Toalha Quente - R$ 30,00`,
  },

  tecnica: {
    logo: 'Logotipo moderno e confiável para assistência técnica e tecnologia "{loja}". Símbolo clean representando circuitos e precisão técnica, fundo neutro, proporção 1:1 quadrada (500x500px).',
    banner: 'Banner widescreen de laboratório técnico moderno de reparos eletrônicos de "{loja}". Bancada organizada com ferramentas de precisão, microscópio e iluminação técnica azul suave, proporção 3:1 (1200x400px).',
    promo: 'Banner panorâmico widescreen de manutenção e tecnologia de ponta para ofertas de "{loja}". Smartphones modernos, placas de circuito e dispositivos em ambiente de bancada tecnológica iluminada com LEDs azuis, proporção 3:1 (1200x400px). Sem texto.',
    produto: 'Fotografia nítida de peça de reposição ou serviço de manutenção de "{item}". Em bancada técnica limpa com fundo desfocado, detalhes nítidos e iluminação precisa, proporção 1:1 quadrada (800x800px).',
    smartTextExample: `📱 Modelos de Dispositivos Atendidos
iPhone Linha 11 ao 15
Samsung Galaxy Linha S e A
Xiaomi Linha Redmi e Note
Motorola Linha Moto G e Edge

🛡️ Serviços & Acessórios Adicionais
Aplicação de Película Cerâmica 9D - R$ 35,00
Garantia Estendida de 180 Dias - R$ 50,00
Limpeza Interna e Desoxidação - R$ 40,00
Cabo Original Homologado - R$ 45,00`,
  },

  imobiliaria: {
    logo: 'Logotipo arquitetônico moderno e imponente para imobiliária ou corretor "{loja}". Formas geométricas elegantes, vetorizado, fundo neutro sólido, proporção 1:1 quadrada (500x500px).',
    banner: 'Fotografia panorâmica widescreen de fachada de residência de alto padrão ou edifício contemporâneo ao entardecer (golden hour) com iluminação cênica, proporção 3:1 (1200x400px).',
    promo: 'Banner panorâmico widescreen de living decorado de luxo em empreendimento imobiliário de alto padrão para campanha especial de "{loja}". Janelas amplas, luz natural abundante, acabamento impecável, proporção 3:1 (1200x400px). Sem texto.',
    produto: 'Fotografia imobiliária profissional (real estate photography) de "{item}". Ambiente amplo com iluminação natural suave, lente grande-angular nítida, acabamentos de primeira linha, proporção 1:1 quadrada (800x800px). Sem texto.',
    smartTextExample: `🏠 Tipologia do Imóvel
Apartamento 2 Dormitórios (1 Suíte): 68m² com varanda grill.
Apartamento 3 Dormitórios (2 Suítes): 92m² com varanda gourmet.
Cobertura Duplex: 150m² com piscina privativa.

🚗 Opcionais & Vagas Extras
Vaga de Garagem Coberta Adicional - R$ 25.000,00
Depósito Privativo no Subsolo - R$ 10.000,00
Kit Acabamento Porcelanato e Gesso - R$ 18.000,00`,
  },

  saude: {
    logo: 'Logotipo minimalista de saúde, clínica ou consultório "{loja}". Símbolo de cuidado, bem-estar e confiança, cores suaves, fundo neutro, proporção 1:1 quadrada (500x500px).',
    banner: 'Fotografia widescreen de recepção e consultório médico moderno e acolhedor de "{loja}". Ambiente clean, luminoso e humanizado com detalhes em madeira clara e plantas, proporção 3:1 (1200x400px).',
    promo: 'Banner panorâmico widescreen de clínica médica e odontológica contemporânea com tecnologia avançada e atendimento humanizado para ofertas de "{loja}", proporção 3:1 (1200x400px). Sem texto.',
    produto: 'Fotografia profissional do procedimento de saúde ou consulta "{item}". Ambiente esterilizado, moderno e acolhedor, estética hospitalar/clínica de alto padrão, proporção 1:1 quadrada (800x800px).',
    smartTextExample: `🩺 Especialidades e Consultas
Consulta Inicial com Avaliação Completa
Retorno com Análise de Exames
Sessão de Fisioterapia Especializada
Clareamento Dental a Laser

📋 Procedimentos Adicionais
Exame Preventivo Complementar - R$ 80,00
Aplicação de Flúor e Profilaxia - R$ 60,00
Laudo Médico Detalhado - R$ 50,00`,
  },

  automotivo: {
    logo: 'Logotipo dinâmico, forte e veloz para centro automotivo ou concessionária "{loja}". Linhas aerodinâmicas modernas, proporção 1:1 quadrada (500x500px).',
    banner: 'Fotografia panorâmica de showroom automotivo de luxo ou centro de estética automotiva de "{loja}". Carro com pintura espelhada impecável sob luzes lineares de estúdio, proporção 3:1 (1200x400px).',
    promo: 'Banner panorâmico widescreen de veículos esportivos e estética automotiva de luxo com pintura brilhante vitrificada para promoção de "{loja}", proporção 3:1 (1200x400px). Sem texto.',
    produto: 'Fotografia automotiva profissional de "{item}". Ângulo dramático em estúdio escuro com iluminação refletida na carroceria e peças, foco nítido, proporção 1:1 quadrada (800x800px).',
    smartTextExample: `🚗 Pacotes de Serviços
Polimento Técnico Comercial: Restaura o brilho da pintura.
Vitrificação de Pintura Cerâmica: Proteção de até 3 anos.
Higienização Interna Completa: Bancos, carpetes e teto.
Troca de Óleo e Filtros: Revisão preventiva completa.

🔧 Opcionais & Proteções Extras
Impermeabilização de Bancos de Tecido - R$ 120,00
Revitalização de Faróis com Polímero - R$ 80,00
Higienização de Ar Condicionado com Ozônio - R$ 60,00`,
  },

  educacao: {
    logo: 'Logotipo acadêmico contemporâneo e inovador para escola ou curso "{loja}". Símbolo de conhecimento e evolução, proporção 1:1 quadrada (500x500px).',
    banner: 'Banner widescreen de ambiente educacional moderno e colaborativo de "{loja}". Espaço com estudantes interagindo, tecnologia e design contemporâneo, proporção 3:1 (1200x400px).',
    promo: 'Banner panorâmico widescreen de ambiente de aprendizagem dinâmico com estudantes engajados e tecnologia para campanha de matrícula de "{loja}", proporção 3:1 (1200x400px). Sem texto.',
    produto: 'Fotografia de mentoria ou módulo de treinamento "{item}". Ambiente de aprendizado prático com foco e interação dinâmica, proporção 1:1 quadrada (800x800px).',
    smartTextExample: `📚 Módulos do Curso
Módulo Básico: Fundamentos e introdução prática.
Módulo Intermediário: Aplicação de projetos reais.
Módulo Avançado: Estratégias de mercado e otimização.

🎓 Benefícios e Mentorias Extras
Sessão de Mentoria Individual (1h) - R$ 150,00
Certificado Físico com Envio Nacional - R$ 40,00
Acesso Vitalício às Gravações - R$ 80,00`,
  },

  outros: {
    logo: 'Logotipo minimalista, profissional e memorável para a marca "{loja}". Vetorizado, design limpo, fundo neutro, alta definição, proporção 1:1 quadrada (500x500px). Sem texto ilegível.',
    banner: 'Banner panorâmico widescreen profissional e convidativo para cabeçalho da loja "{loja}". Ambiente moderno e organizado, iluminação suave de estúdio, proporção 3:1 (1200x400px).',
    promo: 'Banner panorâmico widescreen comercial para oferta especial e destaques de "{loja}". Composição elegante de produtos em cenário contemporâneo, proporção 3:1 (1200x400px). Sem texto sobreposto.',
    produto: 'Fotografia profissional de produto para catálogo de "{item}". Em ângulo de 45 graus, iluminação suave uniforme, fundo limpo neutro em estúdio, proporção 1:1 quadrada (800x800px).',
    smartTextExample: `📦 Opções Principais
Opção Padrão: Versão clássica com todos os itens essenciais.
Opção Premium: Versão completa com acabamento especial.
Opção Personalizada: Feito sob medida conforme sua solicitação.

✨ Opcionais e Personalizações
Embalagem Especial para Presente - R$ 10,00
Personalização com Nome Gravado - R$ 15,00
Garantia Estendida - R$ 25,00`,
  },
};

/**
 * Retorna o prompt ideal customizado para o nicho, tipo de imagem e contexto da loja.
 */
export function getNicheImagePrompt(
  nichoId = 'restaurante',
  tipo: 'logo' | 'banner' | 'promo' | 'produto',
  context: NichePromptContext = {}
): string {
  const nicheKey = NICHO_ALIASES[nichoId] || (NICHE_PROMPTS[nichoId] ? nichoId : 'outros');
  const nicheDef = NICHE_PROMPTS[nicheKey] || NICHE_PROMPTS.outros;

  const rawTemplate = nicheDef[tipo] || NICHE_PROMPTS.outros[tipo];

  const lojaName = context.nomeLoja?.trim() || 'Minha Empresa';
  const itemName = context.nomeItem?.trim() || 'meu produto';

  return rawTemplate
    .replace(/\{loja\}/g, lojaName)
    .replace(/\{item\}/g, itemName);
}

/**
 * Retorna um exemplo de texto bruto contextualizado para o nicho selecionado.
 */
export function getNicheSmartTextExample(nichoId = 'restaurante'): string {
  const nicheKey = NICHO_ALIASES[nichoId] || (NICHE_PROMPTS[nichoId] ? nichoId : 'outros');
  const nicheDef = NICHE_PROMPTS[nicheKey] || NICHE_PROMPTS.outros;
  return nicheDef.smartTextExample;
}

const NICHO_ALIASES: Record<string, string> = {
  hamburgueria: 'restaurante',
  pizzaria: 'restaurante',
  acai: 'restaurante',
  doceria: 'restaurante',
  calcados: 'loja',
  roupas: 'loja',
  eletronicos: 'tecnica',
  cosmeticos: 'saude',
  barbearia: 'servicos',
  salao: 'servicos',
  estetica: 'saude',
};

/**
 * Retorna o título e subtítulo padrão de boas-vindas da vitrine conforme o nicho.
 */
export function getNicheDefaultHeadline(nichoId = 'restaurante'): { titulo: string; subtitulo: string } {
  const key = NICHO_ALIASES[nichoId] || nichoId;
  switch (key) {
    case 'tecnica':
      return {
        titulo: 'Tecnologia & Suporte Especializado! ⚡',
        subtitulo: 'Soluções completas, manutenção de alta precisão e os melhores produtos.',
      };
    case 'loja':
      return {
        titulo: 'As Melhores Novidades & Tendências! ✨',
        subtitulo: 'Confira nossa seleção exclusiva e faça seu pedido em instantes.',
      };
    case 'servicos':
      return {
        titulo: 'Excelência & Dedicação em Cada Detalhe! ⭐',
        subtitulo: 'Serviços profissionais de alta qualidade prontos para atender você.',
      };
    case 'imobiliaria':
      return {
        titulo: 'Encontre o Imóvel dos Seus Sonhos! 🏡',
        subtitulo: 'As melhores oportunidades de compra, venda e locação para você.',
      };
    case 'saude':
      return {
        titulo: 'Cuidado & Bem-Estar que Você Merece! 💖',
        subtitulo: 'Produtos e serviços dedicados à sua saúde, beleza e qualidade de vida.',
      };
    case 'automotivo':
      return {
        titulo: 'Cuidado & Performance para o Seu Veículo! 🚗',
        subtitulo: 'Peças, manutenção especializada e serviços automotivos de confiança.',
      };
    case 'educacao':
      return {
        titulo: 'Conhecimento & Evolução para o Seu Futuro! 🎓',
        subtitulo: 'Cursos, treinamentos e materiais de excelência para seu desenvolvimento.',
      };
    case 'restaurante':
    default:
      return {
        titulo: 'Sabor Excelente, Humor Renovado! ✨',
        subtitulo: 'Escolha os melhores pratos artesanais e faça seu pedido em instantes.',
      };
  }
}

import { ProdutoOpcao, ProdutoOpcionalItem } from '../types';

export interface ParsedProductStructure {
  nome?: string;
  descricao?: string;
  preco?: string;
  opcoes: ProdutoOpcao[];
}

let seqId = 0;
const uid = (prefix = 'item') => `${prefix}-${Date.now()}-${seqId++}`;

/**
 * Analisa e extrai automaticamente grupos de sabores, bases, adicionais,
 * preços e descrições a partir de textos brutos colados pelo lojista.
 */
export function parseProductRawText(rawText: string): ParsedProductStructure {
  if (!rawText || !rawText.trim()) {
    return { opcoes: [] };
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { opcoes: [] };
  }

  let extractedNome = '';
  let extractedPreco = '';
  const descLines: string[] = [];
  const opcoes: ProdutoOpcao[] = [];

  let currentGrupo: ProdutoOpcao | null = null;

  // Regex para identificar cabeçalhos de grupos
  // Ex: "🥟 Os 10 Sabores Principais (Bases)", "🧀 16 Itens de Opções (Adicionais para Escolha)", "## Tamanhos", "1. Escolha sua Base"
  const isHeaderLine = (line: string) => {
    // Linhas com emojis no início + texto
    if (/^[^\w\s\d(]{1,4}\s*[A-Z0-9]/u.test(line)) return true;
    // Marcadores markdown
    if (/^#{1,4}\s+/i.test(line)) return true;
    // Palavras-chave típicas de grupos
    if (
      /(sabores|bases|adicionais|opções|opcoes|escolha|tamanho|ingredientes|molhos|coberturas|acompanhamentos|extras|bebidas|combos|adicionais para escolha)/i.test(
        line
      ) &&
      (line.length < 80 || line.includes(':') || line.includes('('))
    ) {
      return true;
    }
    return false;
  };

  // Infere se um grupo é de escolha única ou múltipla
  const inferTipoGrupo = (titulo: string): 'unica' | 'multipla' => {
    const t = titulo.toLowerCase();
    if (t.includes('base') || t.includes('tamanho') || t.includes('principal') || t.includes('escolha 1') || t.includes('única') || t.includes('unica') || t.includes('sabor')) {
      return 'unica';
    }
    if (t.includes('adicional') || t.includes('extra') || t.includes('acres') || t.includes('turbinar') || t.includes('opç') || t.includes('opc') || t.includes('ingrediente') || t.includes('cobertura')) {
      return 'multipla';
    }
    return 'multipla';
  };

  // Limpa o título do cabeçalho
  const cleanHeaderTitle = (line: string) => {
    return line
      .replace(/^#{1,4}\s*/, '')
      .replace(/^[^\w\s\d(]{1,4}\s*/u, '') // remove emoji inicial
      .replace(/:\s*$/, '')
      .trim();
  };

  // Extrai preço de uma linha de item (ex: "Bacon - R$ 4,50" ou "+R$ 3.00" ou "(+ R$ 5,00)")
  const extractPriceFromLine = (line: string): { cleanName: string; price: number } => {
    let price = 0;
    // Identifica padrões de preço explícitos como "R$ 4,50", "+ R$ 3", "+3,50", "(+ R$ 2,00)"
    const priceMatch = line.match(/(?:R\$\s*|\+\s*R?\$?\s*|\(\s*\+?\s*R?\$?\s*)([0-9]+(?:[.,][0-9]{1,2})?)\s*\)?/i);
    let cleanName = line;

    if (priceMatch) {
      const numStr = priceMatch[1].replace(',', '.');
      const val = parseFloat(numStr);
      if (!isNaN(val) && val > 0 && val < 5000) {
        price = val;
        cleanName = cleanName.replace(priceMatch[0], '');
      }
    }

    // Remove prefixos como "-", "*", "•", "1.", "1 -", etc. e traços soltos
    cleanName = cleanName
      .replace(/^[-*•\d.)\]]+\s*/, '')
      .replace(/\s*-\s*$/, '')
      .replace(/:\s*$/, '')
      .trim();

    return { cleanName, price };
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detecta se é o início de um grupo
    if (isHeaderLine(line)) {
      const headerTitle = cleanHeaderTitle(line);
      const tipo = inferTipoGrupo(headerTitle);

      currentGrupo = {
        id: uid('grupo'),
        nome: headerTitle || 'Opções',
        tipo,
        itens: [],
      };
      opcoes.push(currentGrupo);
      continue;
    }

    // Se já estamos dentro de um grupo, processa as linhas seguintes como itens
    if (currentGrupo) {
      // Se a linha parece uma frase explicativa sem item (ex: "Estes são os recheios clássicos..."), guarda como contexto/descrição
      if (
        (line.endsWith(':') && !line.includes(' - ') && line.length > 30) ||
        line.startsWith('Estes são') ||
        line.startsWith('Opções para o cliente') ||
        line.startsWith('Escolha até')
      ) {
        descLines.push(line.replace(/:$/, ''));
        continue;
      }

      // Se contém "Nome: Descrição" (ex: "Carne Clássica: Carne moída temperada...")
      let itemNome = line;
      if (line.includes(':')) {
        const parts = line.split(':');
        const candidateName = parts[0].trim().replace(/^[-*•\d.)\]]+\s*/, '');
        if (candidateName.length > 0 && candidateName.length < 50) {
          itemNome = candidateName;
        }
      }

      const { cleanName, price } = extractPriceFromLine(itemNome);
      if (cleanName.length > 0) {
        currentGrupo.itens.push({
          id: uid('item'),
          nome: cleanName,
          preco: price,
        });
      }
    } else {
      // Fora de qualquer grupo: primeiras linhas podem ser nome / descrição
      if (i === 0 && line.length < 60 && !line.includes(':') && !line.includes('R$')) {
        extractedNome = line;
      } else {
        // Tenta detectar preço do produto base
        const pMatch = line.match(/R\$\s*([0-9]+(?:[.,][0-9]{2})?)/i);
        if (pMatch && !extractedPreco) {
          extractedPreco = pMatch[1].replace('.', ',');
        } else {
          descLines.push(line);
        }
      }
    }
  }

  // Remove grupos vazios se houver
  const validOpcoes = opcoes.filter((g) => g.itens.length > 0);

  return {
    nome: extractedNome || undefined,
    descricao: descLines.length > 0 ? descLines.join('\n\n') : undefined,
    preco: extractedPreco || undefined,
    opcoes: validOpcoes,
  };
}

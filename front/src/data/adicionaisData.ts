import { ProdutoOpcao } from '../types';

export type TipoComida = 'pizzaria' | 'hamburgueria' | 'acai' | 'doceria' | 'restaurante';

export const TIPO_COMIDA_PADRAO: TipoComida = 'hamburgueria';

export const TIPOS_COMIDA: { id: TipoComida; nome: string }[] = [
  { id: 'pizzaria', nome: 'Pizzaria' },
  { id: 'hamburgueria', nome: 'Hamburgueria' },
  { id: 'acai', nome: 'Açaí / Sorveteria' },
  { id: 'doceria', nome: 'Doceria / Sobremesas' },
  { id: 'restaurante', nome: 'Restaurante / Outros' },
];

let seq = 0;
const novId = () => `opc-${Date.now()}-${seq++}`;

export function grupoOpcional(
  nome: string,
  tipo: ProdutoOpcao['tipo'],
  itens: [string, number][]
): ProdutoOpcao {
  return {
    id: novId(),
    nome,
    tipo,
    itens: itens.map(([n, p]) => ({ id: novId(), nome: n, preco: p })),
  };
}

export const TIPO_ADICIONAIS: Record<TipoComida, ProdutoOpcao[]> = {
  pizzaria: [
    grupoOpcional('Tamanho', 'unica', [
      ['Média', 0],
      ['Grande', 10],
      ['Família', 18],
    ]),
    grupoOpcional('Borda', 'unica', [
      ['Sem borda', 0],
      ['Catupiry', 12],
      ['Cheddar', 12],
      ['Chocolate', 15],
    ]),
    grupoOpcional('Adicionais', 'multipla', [
      ['Queijo extra', 6],
      ['Bacon', 5],
      ['Calabresa', 4],
      ['Azeitona', 2],
      ['Orégano', 0],
    ]),
  ],
  hamburgueria: [
    grupoOpcional('Tamanho', 'unica', [
      ['Simples', 0],
      ['Duplo', 15],
      ['Triplo', 28],
    ]),
    grupoOpcional('Adicionais', 'multipla', [
      ['Bacon', 5],
      ['Cheddar', 4],
      ['Queijo extra', 4],
      ['Ovo', 3],
      ['Molho da casa', 3],
      ['Pão brioche', 4],
    ]),
  ],
  acai: [
    grupoOpcional('Tamanho', 'unica', [
      ['300ml', 0],
      ['500ml', 12],
      ['700ml', 16],
      ['1 litro', 22],
    ]),
    grupoOpcional('Adicionais', 'multipla', [
      ['Granola', 3],
      ['Leite condensado', 4],
      ['Nutella', 8],
      ['Morango', 8],
      ['Banana', 4],
      ['Uva', 5],
    ]),
  ],
  doceria: [
    grupoOpcional('Tamanho', 'unica', [
      ['Ponto', 0],
      ['Médio', 10],
      ['Grande', 18],
    ]),
    grupoOpcional('Adicionais', 'multipla', [
      ['Calda de chocolate', 5],
      ['Morango', 8],
      ['Chantilly', 4],
      ['Granulado', 2],
    ]),
  ],
  restaurante: [
    grupoOpcional('Adicionais', 'multipla', [
      ['Molho especial', 3],
      ['Queijo extra', 5],
      ['Proteína extra', 8],
      ['Adicional de acompanhamento', 6],
    ]),
  ],
};

export function getTemplateAdicionais(tipo: string | undefined): ProdutoOpcao[] {
  const key = (tipo || TIPO_COMIDA_PADRAO) as TipoComida;
  const template = TIPO_ADICIONAIS[key] || TIPO_ADICIONAIS[TIPO_COMIDA_PADRAO];
  return JSON.parse(JSON.stringify(template)) as ProdutoOpcao[];
}

/** Normaliza opções antigas ({ nome, opcoes: string[] }) para a nova forma com preço. */
export function normalizarOpcoes(grupos: any[] | undefined): ProdutoOpcao[] {
  if (!grupos || !Array.isArray(grupos)) return [];
  return grupos.map((g) => {
    if (g && Array.isArray(g.itens)) {
      return {
        id: g.id || novId(),
        nome: g.nome,
        tipo: g.tipo === 'multipla' ? 'multipla' : 'unica',
        itens: g.itens.map((i: any) => ({
          id: i.id || novId(),
          nome: i.nome,
          preco: Number(i.preco) || 0,
        })),
      } as ProdutoOpcao;
    }
    // forma legada
    return {
      id: g.id || novId(),
      nome: g.nome,
      tipo: 'unica',
      itens: (g.opcoes || []).map((o: string) => ({ id: novId(), nome: o, preco: 0 })),
    } as ProdutoOpcao;
  });
}

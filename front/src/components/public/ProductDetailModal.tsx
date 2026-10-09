import React, { useState } from 'react';
import { Produto, TemaCores, CartItemOpcao } from '../../types';
import { X, Plus, Minus, ShoppingBag, Star, Heart, Sparkles, ExternalLink, MousePointerClick } from 'lucide-react';
import { normalizarOpcoes } from '../../data/adicionaisData';
import { getContrastText } from '../../utils/colors';
import { RichTextRenderer } from '../ui/RichTextRenderer';
import { useCatalog } from '../../context/CatalogContext';

const getMarketplaceInfo = (url?: string, customNome?: string) => {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.includes('shopee') || (customNome && customNome.toLowerCase().includes('shopee'))) {
    return {
      nome: 'Comprar na Shopee',
      icone: '🟠',
      corBg: 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/30',
      badge: 'Shopee Oficial',
    };
  }
  if (lower.includes('mercadolivre') || lower.includes('mercado livre') || lower.includes('meli.la') || (customNome && customNome.toLowerCase().includes('mercado livre'))) {
    return {
      nome: 'Comprar no Mercado Livre',
      icone: '🟡',
      corBg: 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black shadow-yellow-900/20',
      badge: 'Mercado Livre',
    };
  }
  if (lower.includes('amazon') || (customNome && customNome.toLowerCase().includes('amazon'))) {
    return {
      nome: 'Comprar na Amazon',
      icone: '📦',
      corBg: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30',
      badge: 'Amazon Brasil',
    };
  }
  if (lower.includes('hotmart') || (customNome && customNome.toLowerCase().includes('hotmart'))) {
    return {
      nome: 'Comprar na Hotmart',
      icone: '🔴',
      corBg: 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/30',
      badge: 'Hotmart',
    };
  }
  if (lower.includes('kiwify') || (customNome && customNome.toLowerCase().includes('kiwify'))) {
    return {
      nome: 'Comprar na Kiwify',
      icone: '🟢',
      corBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30',
      badge: 'Kiwify',
    };
  }
  return {
    nome: customNome ? `Comprar no ${customNome}` : 'Comprar no Link Oficial',
    icone: '🔗',
    corBg: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30',
    badge: customNome || 'Compre Online',
  };
};

interface ProductDetailModalProps {
  produto: Produto;
  primaryColor: string;
  themeCores?: TemaCores;
  onClose: () => void;
  onAddToCart: (
    produto: Produto,
    quantidade: number,
    observacoes?: string,
    opcoesSelecionadas?: Record<string, string>,
    opcoesDetalhe?: CartItemOpcao[]
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  produto,
  primaryColor,
  themeCores,
  onClose,
  onAddToCart,
}) => {
  const { trackCliqueLinkExterno } = useCatalog();
  const [quantidade, setQuantidade] = useState(1);
  const [observacoes, setObservacoes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const primary = themeCores?.primary || primaryColor || '#4F3BFF';
  const grupos = normalizarOpcoes(produto.opcoes);
  const primaryContrast = getContrastText(primary);

  const isExternalPurchase = Boolean(produto.linkExternoAtivo && produto.linkExterno);
  const mp = isExternalPurchase ? getMarketplaceInfo(produto.linkExterno, produto.nomePlataformaExterna) : null;

  const [selUnica, setSelUnica] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    grupos.forEach((g) => {
      if (g.tipo === 'unica' && g.itens[0]) init[g.id] = g.itens[0].id;
    });
    return init;
  });

  const [selMulti, setSelMulti] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    grupos.forEach((g) => {
      if (g.tipo === 'multipla') init[g.id] = [];
    });
    return init;
  });

  const toggleMulti = (gid: string, iid: string) => {
    setSelMulti((prev) => {
      const cur = prev[gid] || [];
      return { ...prev, [gid]: cur.includes(iid) ? cur.filter((x) => x !== iid) : [...cur, iid] };
    });
  };

  let extraCost = 0;
  const opcoesDetalhe: CartItemOpcao[] = [];
  const resumo: Record<string, string> = {};
  grupos.forEach((g) => {
    const escolhidos =
      g.tipo === 'unica'
        ? g.itens.filter((i) => i.id === selUnica[g.id])
        : g.itens.filter((i) => (selMulti[g.id] || []).includes(i.id));
    const chosen = escolhidos.map((i) => ({ nome: i.nome, preco: i.preco }));
    if (chosen.length > 0) {
      opcoesDetalhe.push({ grupo: g.nome, itens: chosen });
      resumo[g.nome] = chosen.map((c) => c.nome).join(', ');
    }
    escolhidos.forEach((i) => {
      extraCost += Number(i.preco) || 0;
    });
  });

  const subtotal = (produto.preco + extraCost) * quantidade;

  const handleAdd = () => {
    onAddToCart(produto, quantidade, observacoes, resumo, opcoesDetalhe);
    onClose();
  };

  const handleExternalClick = () => {
    if (produto.linkExterno) {
      trackCliqueLinkExterno(produto.id);
      window.open(produto.linkExterno, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] rounded-3xl overflow-hidden shadow-2xl border border-[#E0E0E0] dark:border-[#333333] max-h-[92vh] flex flex-col relative transition-colors">
        
        <div className="relative h-60 sm:h-72 w-full flex-shrink-0 bg-slate-900 overflow-hidden">
          {produto.imagem ? (
            <img
              src={produto.imagem}
              alt={produto.nome}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 font-bold">
              Sem Imagem
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-950/80 transition-all cursor-pointer z-10 border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-slate-950/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-950/80 transition-all cursor-pointer z-10 border border-white/20"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </button>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
            <div className="space-y-1 min-w-0">
              {produto.destaque && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  Destaque
                </span>
              )}
              <h3 className="font-black text-lg sm:text-xl drop-shadow-md truncate">{produto.nome}</h3>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-[11px] text-slate-300 block font-semibold">Preço</span>
              <span className="font-black text-xl sm:text-2xl text-emerald-400 drop-shadow-md">
                R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 divide-y divide-[#E0E0E0] dark:divide-[#333333]">
          
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5] uppercase tracking-wider">Detalhes do Produto</h4>
            {produto.descricao ? (
              <RichTextRenderer
                rawContent={produto.descricao}
                className="text-xs sm:text-sm text-[#212529] dark:text-[#FFFFFF] leading-relaxed"
              />
            ) : (
              <p className="text-xs text-[#6C757D] dark:text-[#757575] italic">Nenhuma descrição informada.</p>
            )}
          </div>

          {isExternalPurchase && mp ? (
            <div className="pt-4 space-y-3">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <span>{mp.icone}</span>
                    <span>Vendido na Loja Oficial</span>
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
                    {mp.badge}
                  </span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Este produto é comercializado através da nossa plataforma oficial na <strong>{produto.nomePlataformaExterna || 'loja externa'}</strong>. Ao clicar no botão abaixo, você será redirecionado para concluir sua compra com segurança.
                </p>
              </div>
            </div>
          ) : (
            grupos.length > 0 && (
              <div className="pt-4 space-y-4">
                {grupos.map((g) => (
                  <div key={g.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5] uppercase tracking-wider">{g.nome}</h4>
                      <span className="text-[10px] text-[#6C757D] dark:text-[#757575] font-semibold">
                        {g.tipo === 'unica' ? 'Escolha 1' : 'Opcionais'}
                      </span>
                    </div>

                    {g.tipo === 'unica' ? (
                      <div className="space-y-1.5">
                        {g.itens.map((item) => {
                          const isSelected = selUnica[g.id] === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelUnica({ ...selUnica, [g.id]: item.id })}
                              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-[#4F3BFF] dark:border-[#7C4DFF] bg-[#EDF2F7] dark:bg-[#2C2C2C]'
                                  : 'border-[#E0E0E0] dark:border-[#333333] hover:bg-[#F5F7FB] dark:hover:bg-[#2C2C2C]/50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                                  style={{ borderColor: isSelected ? primary : '#94A3B8' }}
                                >
                                  {isSelected && (
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }} />
                                  )}
                                </div>
                                <span className="text-xs font-bold text-[#212529] dark:text-[#FFFFFF]">{item.nome}</span>
                              </div>
                              {Number(item.preco) > 0 && (
                                <span className="text-xs font-black" style={{ color: primary }}>
                                  + R$ {Number(item.preco).toFixed(2).replace('.', ',')}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {g.itens.map((item) => {
                          const isChecked = (selMulti[g.id] || []).includes(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => toggleMulti(g.id, item.id)}
                              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                isChecked
                                  ? 'border-[#4F3BFF] dark:border-[#7C4DFF] bg-[#EDF2F7] dark:bg-[#2C2C2C]'
                                  : 'border-[#E0E0E0] dark:border-[#333333] hover:bg-[#F5F7FB] dark:hover:bg-[#2C2C2C]/50'
                              }`}
                            >
                              <span className="text-xs font-bold text-[#212529] dark:text-[#FFFFFF]">
                                {item.nome}
                                {Number(item.preco) > 0 ? (
                                  <span className="ml-1.5 text-[11px] font-black" style={{ color: primary }}>
                                    (+ R$ {Number(item.preco).toFixed(2).replace('.', ',')})
                                  </span>
                                ) : (
                                  <span className="ml-1.5 text-[11px] text-[#6C757D] dark:text-[#757575]">Grátis</span>
                                )}
                              </span>
                              <div
                                className="w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out"
                                style={{ backgroundColor: isChecked ? primary : '#475569' }}
                              >
                                <div
                                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                                    isChecked ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {!isExternalPurchase && (
            <div className="space-y-1.5 pt-4">
              <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5] uppercase tracking-wider">Observações / Instruções:</label>
              <textarea
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Ponto da carne, sem cebola, maionese à parte..."
                className="w-full p-3 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-xs text-[#212529] dark:text-[#FFFFFF] placeholder-[#ADB5BD] dark:placeholder-[#757575] outline-none"
              />
            </div>
          )}
        </div>

        <div className="p-4 bg-[#F5F7FB] dark:bg-[#1E1E1E] border-t border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between gap-3 flex-shrink-0 transition-colors">
          {isExternalPurchase && mp ? (
            <button
              type="button"
              onClick={handleExternalClick}
              className={`w-full py-3.5 sm:py-4 px-5 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${mp.corBg}`}
            >
              <span>{mp.nome}</span>
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-1.5 bg-[#EDF2F7] dark:bg-[#2C2C2C] p-1 rounded-2xl border border-[#E0E0E0] dark:border-[#333333]">
                <button
                  onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] font-bold flex items-center justify-center hover:opacity-80 transition-all active:scale-95 shadow-2xs"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-black text-sm text-[#212529] dark:text-[#FFFFFF]">{quantidade}</span>
                <button
                  onClick={() => setQuantidade((q) => q + 1)}
                  className="w-9 h-9 rounded-xl bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] font-bold flex items-center justify-center hover:opacity-80 transition-all active:scale-95 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 py-3.5 px-5 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-between hover:opacity-95"
                style={{ backgroundColor: primary, color: primaryContrast }}
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                  <span>Adicionar ao Pedido</span>
                </span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

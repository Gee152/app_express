import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { processImageFile, formatBytes } from '../../utils/imagePipeline';
import { Plus, Trash2, Edit2, Package, FolderPlus, Star, Check, Loader2, Eye, EyeOff, Wand2, Sparkles, ExternalLink, MousePointerClick, ShoppingBag } from 'lucide-react';
import { Produto, ProdutoOpcao, ProdutoOpcionalItem } from '../../types';
import { getTemplateAdicionais, normalizarOpcoes, TIPOS_COMIDA } from '../../data/adicionaisData';
import { Select } from '../ui/Select';
import { ImageDimensionBadge } from '../ui/ImageDimensionBadge';
import { AutoResizeTextarea } from '../ui/AutoResizeTextarea';
import { LexicalRichTextEditor } from '../ui/LexicalRichTextEditor';
import { SmartTextImporterModal } from '../ui/SmartTextImporterModal';
import { ParsedProductStructure } from '../../utils/textParser';
import { getNicheImagePrompt } from '../../utils/nichePrompts';

let optSeq = 0;
const novOptId = () => `op-${Date.now()}-${optSeq++}`;

export const ProductManager: React.FC = () => {
  const {
    categorias,
    produtos,
    addCategoria,
    deleteCategoria,
    addProduto,
    updateProduto,
    deleteProduto,
    tipoComida,
    setTipoComida,
    empresa,
    nichoId,
  } = useCatalog();

  const [filterCat, setFilterCat] = useState<number | string>('todos');
  const [searchFilter, setSearchFilter] = useState('');

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('📂');

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSmartImporterOpen, setIsSmartImporterOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Produto | null>(null);

  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pCategory, setPCategory] = useState<number | string>(categorias[0]?.id || 1);
  const [pPrice, setPPrice] = useState('');
  
  // Plataforma externa (Shopee, Mercado Livre, etc.)
  const [pLinkExternoAtivo, setPLinkExternoAtivo] = useState(false);
  const [pLinkExterno, setPLinkExterno] = useState('');
  const [pNomePlataformaExterna, setPNomePlataformaExterna] = useState('Shopee');

  const [pStatus, setPStatus] = useState(true);
  const [pDestaque, setPDestaque] = useState(false);
  const [pImg, setPImg] = useState('');
  const [pThumb, setPThumb] = useState('');
  const [imgUploading, setImgUploading] = useState(false);
  const [imgStats, setImgStats] = useState('');
  const [pOpcoes, setPOpcoes] = useState<ProdutoOpcao[]>([]);

  const handleApplySmartText = (data: ParsedProductStructure) => {
    if (data.nome && !pName.trim()) {
      setPName(data.nome);
    }
    if (data.preco && !pPrice.trim()) {
      setPPrice(data.preco);
    }
    if (data.descricao) {
      setPDesc((prev) => (prev.trim() ? `${prev.trim()}\n\n${data.descricao}` : data.descricao || ''));
    }
    if (data.opcoes.length > 0) {
      setPOpcoes((prev) => [...prev, ...data.opcoes]);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    addCategoria(catName.trim(), catIcon || '📂');
    setCatName('');
  };

  const handleOpenNew = () => {
    setEditingProd(null);
    setPName('');
    setPDesc('');
    setPCategory(categorias[0]?.id || 1);
    setPPrice('');
    setPLinkExternoAtivo(false);
    setPLinkExterno('');
    setPNomePlataformaExterna('Shopee');
    setPStatus(true);
    setPDestaque(false);
    setPImg('');
    setPThumb('');
    setImgStats('');
    setPOpcoes(getTemplateAdicionais(tipoComida));
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Produto) => {
    setEditingProd(p);
    setPName(p.nome);
    setPDesc(p.descricao || '');
    setPCategory(p.categoria);
    setPPrice(p.preco.toString());
    setPLinkExternoAtivo(Boolean(p.linkExternoAtivo || p.linkExterno));
    setPLinkExterno(p.linkExterno || '');
    setPNomePlataformaExterna(p.nomePlataformaExterna || 'Shopee');
    setPStatus(p.status ?? true);
    setPDestaque(p.destaque);
    setPImg(p.imagem || '');
    setPThumb(p.thumbnail || '');
    setImgStats('');
    setPOpcoes(normalizarOpcoes(p.opcoes));
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImgUploading(true);
      const res = await processImageFile(file, { maxSize: 1200, thumbSize: 350 });
      setPImg(res.main);
      setPThumb(res.thumb);
      setImgStats(`${formatBytes(res.originalSize)} → ${formatBytes(res.mainSize)} (WebP 75%)`);
    } catch (err) {
      alert('Erro ao carregar imagem: ' + err);
    } finally {
      setImgUploading(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    const numPrice = parseFloat(pPrice.replace(',', '.')) || 0;

    const prodPayload = {
      nome: pName.trim(),
      descricao: pDesc.trim(),
      categoria: pCategory,
      preco: numPrice,
      linkExternoAtivo: pLinkExternoAtivo,
      linkExterno: pLinkExternoAtivo ? pLinkExterno.trim() : undefined,
      nomePlataformaExterna: pLinkExternoAtivo ? (pNomePlataformaExterna.trim() || 'Shopee') : undefined,
      status: pStatus,
      destaque: pDestaque,
      imagem: pImg,
      thumbnail: pThumb,
      opcoes: pOpcoes.filter((g) => g.nome.trim() && g.itens.length > 0),
    };

    if (editingProd) {
      updateProduto(editingProd.id, {
        ...prodPayload,
        cliquesExternos: editingProd.cliquesExternos || 0,
      });
    } else {
      addProduto({
        ...prodPayload,
        cliquesExternos: 0,
      });
    }

    setIsModalOpen(false);
  };

  // ---- Gerenciamento de opções / adicionais por produto ----
  const addGrupo = () => {
    setPOpcoes((prev) => [...prev, { id: novOptId(), nome: 'Novo grupo', tipo: 'multipla', itens: [] }]);
  };

  const updateGrupo = (gid: string, data: Partial<ProdutoOpcao>) => {
    setPOpcoes((prev) => prev.map((g) => (g.id === gid ? { ...g, ...data } : g)));
  };

  const removeGrupo = (gid: string) => {
    setPOpcoes((prev) => prev.filter((g) => g.id !== gid));
  };

  const addItemGrupo = (gid: string) => {
    setPOpcoes((prev) =>
      prev.map((g) => (g.id === gid ? { ...g, itens: [...g.itens, { id: novOptId(), nome: '', preco: 0 }] } : g))
    );
  };

  const updateItemGrupo = (gid: string, iid: string, data: Partial<ProdutoOpcionalItem>) => {
    setPOpcoes((prev) =>
      prev.map((g) => (g.id === gid ? { ...g, itens: g.itens.map((i) => (i.id === iid ? { ...i, ...data } : i)) } : g))
    );
  };

  const removeItemGrupo = (gid: string, iid: string) => {
    setPOpcoes((prev) =>
      prev.map((g) => (g.id === gid ? { ...g, itens: g.itens.filter((i) => i.id !== iid) } : g))
    );
  };

  // Filtered list
  const filteredProducts = produtos.filter((p) => {
    if (filterCat !== 'todos' && p.categoria != filterCat) return false;
    if (searchFilter.trim()) {
      const term = searchFilter.toLowerCase();
      return p.nome.toLowerCase().includes(term) || (p.descricao || '').toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Categories Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <FolderPlus className="w-5 h-5 text-indigo-600" />
          <span>Categorias ({categorias.length})</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {categorias.map((c) => (
            <div
              key={c.id}
              className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2"
            >
              <span>{c.icone}</span>
              <span>{c.nome}</span>
              <button
                onClick={() => deleteCategoria(c.id)}
                className="text-slate-400 hover:text-red-600 font-bold"
                title="Excluir Categoria"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddCategory} className="flex gap-2 pt-1">
          <input
            type="text"
            value={catIcon}
            onChange={(e) => setCatIcon(e.target.value)}
            placeholder="Emoji"
            className="w-16 px-3 py-2 rounded-xl border border-slate-300 text-xs text-center"
          />
          <input
            type="text"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Nova categoria..."
            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </form>
      </div>

      {/* Products List & Management */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <span>Gerenciar Produtos ({produtos.length})</span>
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex flex-wrap items-center gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Tipo de comida:</label>
              <Select
                value={tipoComida}
                onChange={(v) => setTipoComida(String(v))}
                options={TIPOS_COMIDA.map((t) => ({ value: t.id, label: t.nome }))}
                className="w-full sm:w-auto"
                buttonClassName="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                title="Define os adicionais padrão dos novos produtos"
              />
            </div>
            <button
              onClick={handleOpenNew}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo Produto</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filtrar por nome ou descrição..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none"
          />

          <Select
            value={filterCat}
            onChange={(v) => setFilterCat(v)}
            options={[
              { value: 'todos', label: `Todas as Categorias (${produtos.length})` },
              ...categorias.map((c) => ({ value: c.id, label: `${c.icone} ${c.nome}` })),
            ]}
            className="w-full sm:w-auto"
            buttonClassName="px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white"
          />
        </div>

        {/* Banner de Rastreamento de Plataformas Externas (Shopee/Mercado Livre) */}
        {produtos.some((p) => p.linkExternoAtivo && p.linkExterno) && (
          <div className="p-4 rounded-2xl bg-[#EDF2F7] dark:bg-[#2C2C2C] border border-[#E0E0E0] dark:border-[#333333] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs flex-shrink-0">
                <MousePointerClick className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#212529] dark:text-[#FFFFFF] text-sm flex items-center gap-2">
                  <span>Tráfego para Lojas Externas</span>
                  <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {produtos.filter((p) => p.linkExternoAtivo && p.linkExterno).length} {produtos.filter((p) => p.linkExternoAtivo && p.linkExterno).length === 1 ? 'produto integrado' : 'produtos integrados'}
                  </span>
                </h4>
                <p className="text-[#6C757D] dark:text-[#B0BEC5]">
                  Acompanhamento de clientes direcionados para comprar na Shopee, Mercado Livre e outras plataformas.
                </p>
              </div>
            </div>
            <div className="px-4 py-2 bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-center self-start sm:self-auto flex-shrink-0 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#6C757D] dark:text-[#B0BEC5] block">Total de Cliques</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                {produtos.reduce((acc, p) => acc + (Number(p.cliquesExternos) || 0), 0)}
              </span>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <Package className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-bold">Nenhum produto encontrado com estes filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const catObj = categorias.find((c) => c.id == p.categoria);
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border bg-white dark:bg-[#1E1E1E] shadow-2xs space-y-3 flex flex-col justify-between transition-colors ${
                    p.status === false ? 'opacity-50 border-dashed border-[#E0E0E0] dark:border-[#333333]' : 'border-[#E0E0E0] dark:border-[#333333]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {p.thumbnail || p.imagem ? (
                          <img src={p.thumbnail || p.imagem} alt={p.nome} className="w-12 h-12 rounded-lg object-cover border border-[#E0E0E0] dark:border-[#333333]" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[#EDF2F7] dark:bg-[#2C2C2C] border border-[#E0E0E0] dark:border-[#333333] flex items-center justify-center text-[10px] text-[#6C757D] dark:text-[#B0BEC5]">
                            Sem Foto
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-[#212529] dark:text-[#FFFFFF] line-clamp-1">{p.nome}</h4>
                          <span className="text-[10px] font-semibold text-[#4F3BFF] dark:text-[#A58BFF] bg-[#EDF2F7] dark:bg-[#2C2C2C] px-2 py-0.5 rounded-md">
                            {catObj ? `${catObj.icone || ''} ${catObj.nome}` : 'Geral'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => updateProduto(p.id, { status: p.status === false ? true : false })}
                        className="p-1 text-[#6C757D] hover:text-[#212529] dark:text-[#B0BEC5] dark:hover:text-[#FFFFFF]"
                        title={p.status === false ? 'Ativar no catálogo' : 'Ocultar no catálogo'}
                      >
                        {p.status === false ? <EyeOff className="w-4 h-4 text-[#6C757D]" /> : <Eye className="w-4 h-4 text-[#12B886] dark:text-[#69F0AE]" />}
                      </button>
                    </div>

                    <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5] line-clamp-2 leading-relaxed">{p.descricao || 'Sem descrição'}</p>

                    {/* Badge de Plataforma Externa vs Modo WhatsApp */}
                    {p.linkExternoAtivo && p.linkExterno ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                        <ExternalLink className="w-3 h-3 text-amber-600" />
                        <span>{p.nomePlataformaExterna || 'Plataforma Externa'}</span>
                        <span className="opacity-60">•</span>
                        <span className="font-extrabold text-amber-900 dark:text-amber-200">
                          {p.cliquesExternos || 0} {p.cliquesExternos === 1 ? 'clique' : 'cliques'}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#6C757D] dark:text-[#B0BEC5] text-[10px] font-semibold">
                        <span>💬 Pedido via WhatsApp</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E0E0E0] dark:border-[#333333]">
                    <span className="font-extrabold text-sm text-[#212529] dark:text-[#FFFFFF]">
                      R$ {Number(p.preco).toFixed(2).replace('.', ',')}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-[#6C757D] dark:text-[#B0BEC5] hover:bg-[#EDF2F7] dark:hover:bg-[#2C2C2C]"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProduto(p.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#1E1E1E] max-w-xl w-full rounded-2xl shadow-2xl border border-[#E0E0E0] dark:border-[#333333] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#212529] dark:text-[#FFFFFF]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between border-b border-[#E0E0E0] dark:border-[#333333] p-4 sm:p-5 flex-shrink-0 bg-[#F5F7FB] dark:bg-[#2C2C2C]/50">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-[#212529] dark:text-[#FFFFFF]">
                  {editingProd ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSmartImporterOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-extrabold bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                  title="Cole cardápios, listas de sabores ou adicionais para estruturar automaticamente"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">🪄 Importar Texto IA</span>
                  <span className="sm:hidden">IA</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#6C757D] dark:text-[#B0BEC5] font-bold hover:bg-[#E0E0E0] dark:hover:bg-[#333333] cursor-pointer flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Body Form */}
            <form id="product-form" onSubmit={handleSaveProduct} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5]">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="Ex: Camiseta Oversized Streetwear"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-xs sm:text-sm outline-none focus:border-[#4F3BFF] dark:focus:border-[#895FFF] bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5]">Categoria *</label>
                  <Select
                    value={pCategory}
                    onChange={(v) => setPCategory(v)}
                    options={categorias.map((c) => ({ value: c.id, label: `${c.icone} ${c.nome}` }))}
                    buttonClassName="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-xs sm:text-sm bg-white dark:bg-[#1E1E1E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5]">Preço Base (R$) *</label>
                  <input
                    type="text"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    placeholder="45,90"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-xs sm:text-sm outline-none focus:border-[#4F3BFF] dark:focus:border-[#895FFF] bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF]"
                  />
                </div>
              </div>

              {/* Switch Vender em Outra Plataforma (Shopee, Mercado Livre, etc.) */}
              <div className="p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F5F7FB] dark:bg-[#2C2C2C]/50 space-y-3 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                      pLinkExternoAtivo 
                        ? 'bg-amber-500 text-white shadow-xs' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                    }`}>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-[#212529] dark:text-[#FFFFFF]">
                        Vender em Outra Plataforma (Shopee, Mercado Livre...)
                      </h4>
                      <p className="text-[11px] text-[#6C757D] dark:text-[#B0BEC5]">
                        Redireciona o botão de compra deste item diretamente para seu link externo.
                      </p>
                    </div>
                  </div>

                  {/* Switch Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setPLinkExternoAtivo(!pLinkExternoAtivo)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      pLinkExternoAtivo ? 'bg-[#4F3BFF] dark:bg-[#7C4DFF]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    role="switch"
                    aria-checked={pLinkExternoAtivo}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        pLinkExternoAtivo ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {pLinkExternoAtivo ? (
                  <div className="space-y-3 pt-2 border-t border-[#E0E0E0] dark:border-[#333333] animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5]">
                          Nome da Plataforma
                        </label>
                        <Select
                          value={pNomePlataformaExterna}
                          onChange={(v) => setPNomePlataformaExterna(String(v))}
                          options={[
                            { value: 'Shopee', label: '🟠 Shopee' },
                            { value: 'Mercado Livre', label: '🟡 Mercado Livre' },
                            { value: 'Amazon', label: '🔵 Amazon' },
                            { value: 'Hotmart', label: '🔴 Hotmart' },
                            { value: 'Kiwify', label: '🟢 Kiwify' },
                            { value: 'Loja Externa', label: '🌐 Outro Site / Link' },
                          ]}
                          buttonClassName="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-xs sm:text-sm bg-white dark:bg-[#1E1E1E]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5]">
                          Link Direto de Compra *
                        </label>
                        <input
                          type="url"
                          required={pLinkExternoAtivo}
                          value={pLinkExterno}
                          onChange={(e) => setPLinkExterno(e.target.value)}
                          placeholder="https://shopee.com.br/produto-..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-xs sm:text-sm outline-none focus:border-[#4F3BFF] dark:focus:border-[#895FFF] bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] font-mono placeholder:font-sans"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <MousePointerClick className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        <strong>Rastreamento Ativo:</strong> Ao clicar no botão deste produto na vitrine, o cliente será enviado ao link da {pNomePlataformaExterna || 'loja externa'} e o sistema registrará a contagem de cliques para você acompanhar no painel.
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#6C757D] dark:text-[#757575]">
                    ✓ <strong>Modo Padrão:</strong> Os clientes adicionam este produto à sacola e finalizam o pedido diretamente com você pelo WhatsApp.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-[#FFFFFF]">Descrição Detalhada (Lexical Rich Text)</label>
                  <span className="text-[10px] text-indigo-600 dark:text-[#A58BFF] font-semibold">✨ Negrito, Itálico, Listas</span>
                </div>
                <LexicalRichTextEditor
                  value={pDesc}
                  onChange={(text) => setPDesc(text)}
                  placeholder="Descreva ingredientes, materiais, receitas ou detalhes do produto..."
                  minHeight="85px"
                  maxHeight="180px"
                />
              </div>

              {/* Image upload */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-[#FFFFFF]">Foto do Produto (WebP)</label>
                  <ImageDimensionBadge
                    dimensao="800x800 px (1:1)"
                    tipo="Foto do Produto"
                    promptExemplo={getNicheImagePrompt(nichoId, 'produto', { nomeLoja: empresa?.nome, nomeItem: pName })}
                  />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 dark:border-[#444444] bg-slate-50 dark:bg-[#262626]">
                  {pImg ? (
                    <img src={pThumb || pImg} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-[#383838]" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-[#1E1E1E] flex items-center justify-center text-xs text-slate-400 dark:text-[#757575]">
                      Foto
                    </div>
                  )}
                  <label className="cursor-pointer px-3 py-1.5 bg-white dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#444444] rounded-lg text-xs font-bold text-slate-700 dark:text-[#FFFFFF] inline-flex items-center gap-1 shadow-2xs hover:bg-slate-50 dark:hover:bg-[#2C2C2C]">
                    {imgUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Carregar Foto</span>}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {pImg && (
                    <button
                      type="button"
                      onClick={() => {
                        setPImg('');
                        setPThumb('');
                        setImgStats('');
                      }}
                      className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg text-xs font-bold cursor-pointer"
                      title="Remover foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {imgStats && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">{imgStats}</span>}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-[#FFFFFF] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pDestaque}
                    onChange={(e) => setPDestaque(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                  />
                  <span>Destacar produto</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-[#FFFFFF] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pStatus}
                    onChange={(e) => setPStatus(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                  />
                  <span>Ativo no catálogo</span>
                </label>
              </div>

              {/* Opções e Adicionais */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#333333]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-[#FFFFFF] block">Opções e Adicionais (com preço)</label>
                    <p className="text-[10px] text-slate-400 dark:text-[#B0BEC5]">
                      Ex.: "Sabores/Bases" (escolhe 1) e "Adicionais" (liga/desliga com preço somado).
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsSmartImporterOpen(true)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                    >
                      <Wand2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>🪄 Colar Lista Inteligente</span>
                    </button>
                    <button
                      type="button"
                      onClick={addGrupo}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-[#2C2C2C] text-indigo-700 dark:text-[#A58BFF] hover:bg-indigo-100 dark:hover:bg-[#383838] border border-indigo-200 dark:border-[#444444] transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar grupo
                    </button>
                  </div>
                </div>

                {pOpcoes.length === 0 && (
                  <p className="text-[11px] text-slate-400 dark:text-[#757575] italic bg-slate-50 dark:bg-[#262626] p-3 rounded-xl border border-slate-200 dark:border-[#383838]">
                    Nenhum grupo de opções. Clique em "Adicionar grupo" ou use "🪄 Colar Lista Inteligente".
                  </p>
                )}

                {pOpcoes.map((g) => (
                  <div key={g.id} className="border border-slate-200 dark:border-[#383838] rounded-xl p-3 space-y-2.5 bg-slate-50/70 dark:bg-[#262626] shadow-2xs transition-colors">
                    <div className="flex flex-wrap gap-2 items-center">
                      <input
                        type="text"
                        value={g.nome}
                        onChange={(e) => updateGrupo(g.id, { nome: e.target.value })}
                        placeholder="Nome do grupo (ex.: Sabores / Adicionais)"
                        className="flex-1 min-w-[140px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#444444] text-xs outline-none bg-white dark:bg-[#1E1E1E] font-bold text-slate-800 dark:text-[#FFFFFF] placeholder:text-slate-400 dark:placeholder:text-[#757575] focus:ring-1 focus:ring-indigo-500"
                      />
                      <Select
                        value={g.tipo}
                        onChange={(v) => updateGrupo(g.id, { tipo: v as ProdutoOpcao['tipo'] })}
                        options={[
                          { value: 'unica', label: 'Escolher 1 (Única)' },
                          { value: 'multipla', label: 'Liga/desliga (Múltipla)' },
                        ]}
                        className="min-w-[150px]"
                        buttonClassName="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-[#444444] text-xs bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-[#FFFFFF] font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => removeGrupo(g.id)}
                        className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg cursor-pointer transition-colors"
                        title="Remover grupo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Scrollable Items list if many items */}
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {g.itens.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.nome}
                            onChange={(e) => updateItemGrupo(g.id, item.id, { nome: e.target.value })}
                            placeholder="Nome do item (ex.: Bacon em Cubos)"
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#444444] text-xs outline-none bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-[#FFFFFF] placeholder:text-slate-400 dark:placeholder:text-[#757575] focus:ring-1 focus:ring-indigo-500"
                          />
                          <div className="flex items-center gap-1 bg-white dark:bg-[#1E1E1E] px-2 py-1 rounded-lg border border-slate-300 dark:border-[#444444]">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-[#B0BEC5]">+R$</span>
                            <input
                              type="number"
                              min={0}
                              step="0.50"
                              value={Number.isFinite(item.preco) ? item.preco : 0}
                              onChange={(e) => updateItemGrupo(g.id, item.id, { preco: parseFloat(e.target.value) || 0 })}
                              className="w-16 text-xs outline-none bg-transparent font-semibold text-slate-800 dark:text-[#FFFFFF]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItemGrupo(g.id, item.id)}
                            className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg cursor-pointer transition-colors"
                            title="Remover item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addItemGrupo(g.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-[#1E1E1E] text-indigo-700 dark:text-[#A58BFF] hover:bg-indigo-50 dark:hover:bg-[#2C2C2C] border border-slate-200 dark:border-[#444444] transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar item</span>
                    </button>
                  </div>
                ))}
              </div>
            </form>

            {/* Fixed Sticky Footer - NEVER Lost or Pushed Off-Screen */}
            <div className="flex items-center justify-end gap-2.5 p-4 border-t border-slate-100 dark:border-[#333333] bg-slate-50 dark:bg-[#1E1E1E] flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-[#B0BEC5] hover:bg-slate-200 dark:hover:bg-[#2C2C2C] transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="product-form"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 dark:bg-[#7C4DFF] hover:brightness-110 shadow-md active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Produto</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Text Importer Modal */}
      <SmartTextImporterModal
        isOpen={isSmartImporterOpen}
        onClose={() => setIsSmartImporterOpen(false)}
        onApply={handleApplySmartText}
        nichoId={nichoId}
      />
    </div>
  );
};

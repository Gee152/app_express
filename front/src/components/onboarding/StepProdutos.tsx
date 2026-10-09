import React, { useState } from 'react';
import { Select } from '../ui/Select';
import { useCatalog } from '../../context/CatalogContext';
import { processImageFile, formatBytes } from '../../utils/imagePipeline';
import { Plus, Trash2, Edit2, Package, FolderPlus, Sparkles, Image as ImageIcon, Star, Check, Loader2, Wand2, ExternalLink } from 'lucide-react';
import { ImageDimensionBadge } from '../ui/ImageDimensionBadge';
import { AutoResizeTextarea } from '../ui/AutoResizeTextarea';
import { LexicalRichTextEditor } from '../ui/LexicalRichTextEditor';
import { SmartTextImporterModal } from '../ui/SmartTextImporterModal';
import { ParsedProductStructure } from '../../utils/textParser';
import { getNicheImagePrompt } from '../../utils/nichePrompts';
import { Produto } from '../../types';

export const StepProdutos: React.FC = () => {
  const {
    categorias,
    produtos,
    addCategoria,
    deleteCategoria,
    addProduto,
    updateProduto,
    deleteProduto,
    loadSampleDataForNiche,
    nichoId,
    empresa,
  } = useCatalog();

  // Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📂');

  // Product Form Modal State
  const [isAddingProd, setIsAddingProd] = useState(false);
  const [isSmartImporterOpen, setIsSmartImporterOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Produto | null>(null);

  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategory, setProdCategory] = useState<number | string>(categorias[0]?.id || 1);
  const [prodPrice, setProdPrice] = useState('');
  const [prodLinkExterno, setProdLinkExterno] = useState('');
  const [prodDestaque, setProdDestaque] = useState(false);
  const [prodImage, setProdImage] = useState<string>('');
  const [prodThumb, setProdThumb] = useState<string>('');
  const [processingImg, setProcessingImg] = useState(false);
  const [imgStats, setImgStats] = useState<string>('');

  const handleApplySmartText = (data: ParsedProductStructure) => {
    if (data.nome && !prodName.trim()) {
      setProdName(data.nome);
    }
    if (data.preco && !prodPrice.trim()) {
      setProdPrice(data.preco);
    }
    if (data.descricao) {
      setProdDesc((prev) => (prev.trim() ? `${prev.trim()}\n\n${data.descricao}` : data.descricao || ''));
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategoria(newCatName.trim(), newCatIcon || '📂');
    setNewCatName('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProcessingImg(true);
      const res = await processImageFile(file, { maxSize: 1200, thumbSize: 350, quality: 0.75 });
      setProdImage(res.main);
      setProdThumb(res.thumb);
      setImgStats(`${formatBytes(res.originalSize)} → ${formatBytes(res.mainSize)} (WebP 75%)`);
    } catch (err) {
      alert('Erro ao processar imagem do produto: ' + err);
    } fontally: {
      setProcessingImg(false);
    }
  };

  const handleOpenNewProd = () => {
    setEditingProd(null);
    setProdName('');
    setProdDesc('');
    setProdCategory(categorias[0]?.id || 1);
    setProdPrice('');
    setProdLinkExterno('');
    setProdDestaque(false);
    setProdImage('');
    setProdThumb('');
    setImgStats('');
    setIsAddingProd(true);
  };

  const handleEditProd = (p: Produto) => {
    setEditingProd(p);
    setProdName(p.nome);
    setProdDesc(p.descricao || '');
    setProdCategory(p.categoria);
    setProdPrice(p.preco.toString());
    setProdLinkExterno(p.linkExterno || '');
    setProdDestaque(p.destaque);
    setProdImage(p.imagem || '');
    setProdThumb(p.thumbnail || '');
    setImgStats('');
    setIsAddingProd(true);
  };

  const handleSaveProd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      alert('O nome do produto é obrigatório.');
      return;
    }

    const numericPrice = parseFloat(prodPrice.replace(',', '.')) || 0;

    if (editingProd) {
      updateProduto(editingProd.id, {
        nome: prodName.trim(),
        descricao: prodDesc.trim(),
        categoria: prodCategory,
        preco: numericPrice,
        linkExterno: prodLinkExterno.trim() || undefined,
        destaque: prodDestaque,
        imagem: prodImage,
        thumbnail: prodThumb,
      });
    } else {
      addProduto({
        nome: prodName.trim(),
        descricao: prodDesc.trim(),
        categoria: prodCategory,
        preco: numericPrice,
        linkExterno: prodLinkExterno.trim() || undefined,
        status: true,
        destaque: prodDestaque,
        imagem: prodImage,
        thumbnail: prodThumb,
      });
    }

    setIsAddingProd(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Passo 4: Categorias e Produtos</h2>
        <p className="text-sm md:text-base text-slate-600">
          Cadastre os primeiros itens do seu catálogo ou carregue um modelo pronto de exemplo.
        </p>
      </div>

      {/* Quick Action: Seed Sample Data */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
            ✨
          </div>
          <div>
            <h4 className="font-bold text-sm text-amber-950">Quer economizar tempo?</h4>
            <p className="text-xs text-amber-800">Carregue um catálogo completo de exemplo para seu nicho e edite conforme necessário.</p>
          </div>
        </div>
        <button
          onClick={() => loadSampleDataForNiche(nichoId)}
          className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex-shrink-0 cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Carregar Dados de Exemplo</span>
        </button>
      </div>

      {/* Categories Management */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <FolderPlus className="w-5 h-5 text-indigo-600" />
          <span>1. Categorias do Catálogo</span>
        </h3>

        {/* Existing Categories Badges */}
        <div className="flex flex-wrap gap-2">
          {categorias.map((cat) => (
            <div
              key={cat.id}
              className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2"
            >
              <span>{cat.icone || '📂'}</span>
              <span>{cat.nome}</span>
              <button
                onClick={() => deleteCategoria(cat.id)}
                className="text-slate-400 hover:text-red-600 transition-colors ml-1"
                title="Excluir Categoria"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Create Category Input Form */}
        <form onSubmit={handleCreateCategory} className="flex gap-2 pt-2">
          <input
            type="text"
            value={newCatIcon}
            onChange={(e) => setNewCatIcon(e.target.value)}
            placeholder="Emoji"
            className="w-16 px-3 py-2 rounded-xl border border-slate-300 text-sm text-center"
          />
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nova categoria (ex: Bebidas, Lanches, Serviços)..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </form>
      </div>

      {/* Products Management List */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <span>2. Produtos / Serviços Cadastrados ({produtos.length})</span>
          </h3>
          <button
            onClick={handleOpenNewProd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Adicionar Produto</span>
          </button>
        </div>

        {/* Product Grid / List */}
        {produtos.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Nenhum produto cadastrado ainda.</p>
            <p className="text-xs text-slate-400 mt-1">Clique em "+ Adicionar Produto" acima para cadastrar seus itens.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {produtos.map((p) => {
              const catObj = categorias.find((c) => c.id == p.categoria);
              return (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {p.thumbnail || p.imagem ? (
                          <img
                            src={p.thumbnail || p.imagem}
                            alt={p.nome}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs flex-shrink-0">
                            Sem foto
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{p.nome}</h4>
                          <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {catObj ? `${catObj.icone || ''} ${catObj.nome}` : 'Geral'}
                          </span>
                        </div>
                      </div>
                      {p.destaque && (
                        <span className="p-1 rounded-md bg-amber-100 text-amber-700" title="Destaque">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{p.descricao || 'Sem descrição'}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="font-extrabold text-base text-slate-900">
                      R$ {Number(p.preco).toFixed(2).replace('.', ',')}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditProd(p)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProduto(p.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
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

      {/* Product Form Modal */}
      {isAddingProd && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Fixed Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5 flex-shrink-0 bg-slate-50/80">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                {editingProd ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSmartImporterOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-extrabold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                  title="Cole cardápios ou listas para preenchimento inteligente"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">🪄 Importar Texto IA</span>
                  <span className="sm:hidden">IA</span>
                </button>
                <button
                  onClick={() => setIsAddingProd(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/80 text-slate-600 font-bold hover:bg-slate-300 cursor-pointer flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <form id="onboarding-prod-form" onSubmit={handleSaveProd} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Ex: Burger Master Bacon"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Categoria *</label>
                  <Select
                    value={prodCategory}
                    onChange={(v) => setProdCategory(v)}
                    options={categorias.map((c) => ({ value: c.id, label: `${c.icone} ${c.nome}` }))}
                    buttonClassName="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Preço (R$) *</label>
                  <input
                    type="text"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="38,90"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              {/* Link de Compra Externo (Shopee, Mercado Livre, etc.) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Link Externo de Compra (Opcional)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Shopee, Mercado Livre, Amazon, etc.</span>
                </div>
                <input
                  type="url"
                  value={prodLinkExterno}
                  onChange={(e) => setProdLinkExterno(e.target.value)}
                  placeholder="Ex: https://shopee.com.br/... ou https://mercadolivre.com.br/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono placeholder:font-sans"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Descrição Detalhada (Lexical Rich Text)</label>
                  <span className="text-[10px] text-indigo-600 font-semibold">✨ Negrito, Itálico, Listas</span>
                </div>
                <LexicalRichTextEditor
                  value={prodDesc}
                  onChange={(text) => setProdDesc(text)}
                  placeholder="Descreva ingredientes, materiais ou detalhes do produto..."
                  minHeight="85px"
                  maxHeight="180px"
                />
              </div>

              {/* Image Upload with Compression */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Foto do Produto (WebP)</label>
                  <ImageDimensionBadge
                    dimensao="800x800 px (1:1)"
                    tipo="Foto do Produto"
                    promptExemplo={getNicheImagePrompt(nichoId, 'produto', { nomeLoja: empresa?.nome, nomeItem: prodName })}
                  />
                  {imgStats && <span className="text-[10px] text-emerald-600 font-mono">{imgStats}</span>}
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50">
                  {prodImage ? (
                    <img src={prodThumb || prodImage} alt="Preview" className="w-16 h-16 rounded-xl object-cover border" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <label className="cursor-pointer px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-2">
                    {processingImg ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        <span>Comprimindo...</span>
                      </>
                    ) : (
                      <span>{prodImage ? 'Alterar Foto' : 'Carregar Foto'}</span>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-destaque"
                  checked={prodDestaque}
                  onChange={(e) => setProdDestaque(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <label htmlFor="chk-destaque" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Destacar este produto no topo do catálogo
                </label>
              </div>
            </form>

            {/* Fixed Sticky Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsAddingProd(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="onboarding-prod-form"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
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

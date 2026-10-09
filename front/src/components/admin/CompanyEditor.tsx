import React, { useState, useMemo } from 'react';
import { Select } from '../ui/Select';
import { useCatalog } from '../../context/CatalogContext';
import { NICHOS } from '../../data/nichos';
import { processImageFile, formatBytes } from '../../utils/imagePipeline';
import {
  Store,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Check,
  Save,
  UserCog,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Tag,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Lock,
  Key,
  X,
  Globe,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { ImageDimensionBadge } from '../ui/ImageDimensionBadge';
import { AutoResizeTextarea } from '../ui/AutoResizeTextarea';
import { getNicheImagePrompt, getNicheDefaultHeadline } from '../../utils/nichePrompts';
import { PromoSlide } from '../../types';

export const CompanyEditor: React.FC = () => {
  const { empresa, updateEmpresa, nichoId, dono, updateDono, produtos } = useCatalog();
  const selectedNicho = NICHOS.find((n) => n.id === nichoId) || NICHOS[0];

  const [savedMessage, setSavedMessage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoStats, setLogoStats] = useState<string>('');

  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerStats, setBannerStats] = useState<string>('');

  const [uploadingPromoImg, setUploadingPromoImg] = useState(false);
  const [promoImgStats, setPromoImgStats] = useState<string>('');

  const [activePromoSlideIdx, setActivePromoSlideIdx] = useState(0);

  const [clienteNome, setClienteNome] = useState(dono?.nome || '');
  const [clienteEmail, setClienteEmail] = useState(dono?.email || '');
  const [clienteTelefone, setClienteTelefone] = useState(dono?.telefone || '');
  const [clienteSaved, setClienteSaved] = useState(false);
  const [clienteErro, setClienteErro] = useState('');

  // Modal de Troca Segura de Senha (com verificação da senha antiga)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  const promoBanner = empresa.promoBanner || { ativo: true };
  const currentSlides = useMemo<PromoSlide[]>(() => {
    if (promoBanner.slides && promoBanner.slides.length > 0) {
      return promoBanner.slides;
    }
    return [
      {
        id: 'slide-1',
        tag: promoBanner.tag || 'OFERTA DO DIA',
        titulo: promoBanner.titulo || 'Combo Especial',
        subtitulo: promoBanner.subtitulo || 'Artesanal + Acompanhamento Especial',
        descricao:
          promoBanner.descricao ||
          'Aproveite a combinação perfeita com ingredientes frescos e receita exclusiva com desconto especial por tempo limitado.',
        badgeDesconto: promoBanner.badgeDesconto || '20% OFF',
        textoBotao: promoBanner.textoBotao || 'Aproveitar Oferta',
        imagem: promoBanner.imagem,
        linkProdutoId: promoBanner.linkProdutoId,
      },
    ];
  }, [promoBanner]);

  const activeSlide = currentSlides[activePromoSlideIdx] || currentSlides[0];

  const handleUpdatePromo = (dados: Partial<typeof promoBanner>) => {
    updateEmpresa({
      promoBanner: {
        ...promoBanner,
        ...dados,
      },
    });
  };

  const handleUpdateActiveSlide = (changes: Partial<PromoSlide>) => {
    const updated = [...currentSlides];
    updated[activePromoSlideIdx] = { ...updated[activePromoSlideIdx], ...changes };

    // Sincroniza campos base com o slide 0 para compatibilidade 100%
    const baseSync =
      activePromoSlideIdx === 0
        ? {
            tag: updated[0].tag,
            titulo: updated[0].titulo,
            subtitulo: updated[0].subtitulo,
            descricao: updated[0].descricao,
            badgeDesconto: updated[0].badgeDesconto,
            textoBotao: updated[0].textoBotao,
            imagem: updated[0].imagem,
            linkProdutoId: updated[0].linkProdutoId,
          }
        : {};

    handleUpdatePromo({
      ...baseSync,
      slides: updated,
    });
  };

  const handleAddNewOffer = () => {
    if (currentSlides.length >= 5) return;
    const newIndex = currentSlides.length;
    const newSlide: PromoSlide = {
      id: `slide-${Date.now()}`,
      tag: `OFERTA ${newIndex + 1}`,
      titulo: `Nova Oferta ${newIndex + 1}`,
      subtitulo: 'Descrição curta da oferta ou combo',
      descricao: 'Aproveite esta condição especial por tempo limitado no nosso catálogo!',
      badgeDesconto: '15% OFF',
      textoBotao: 'Pedir Oferta',
    };
    const updated = [...currentSlides, newSlide];
    handleUpdatePromo({
      slides: updated,
    });
    setActivePromoSlideIdx(newIndex);
  };

  const handleRemoveCurrentOffer = (idxToRemove: number) => {
    if (currentSlides.length <= 1) return;
    const updated = currentSlides.filter((_, i) => i !== idxToRemove);

    const baseSync = {
      tag: updated[0].tag,
      titulo: updated[0].titulo,
      subtitulo: updated[0].subtitulo,
      descricao: updated[0].descricao,
      badgeDesconto: updated[0].badgeDesconto,
      textoBotao: updated[0].textoBotao,
      imagem: updated[0].imagem,
      linkProdutoId: updated[0].linkProdutoId,
    };

    handleUpdatePromo({
      ...baseSync,
      slides: updated,
    });
    if (activePromoSlideIdx >= updated.length) {
      setActivePromoSlideIdx(updated.length - 1);
    }
  };

  const handlePromoSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPromoImg(true);
      const res = await processImageFile(file, { maxSize: 1600, thumbSize: 400 });
      handleUpdateActiveSlide({ imagem: res.main });
      setPromoImgStats(`${formatBytes(res.originalSize)} → ${formatBytes(res.mainSize)} (WebP Panorâmico)`);
    } catch (err) {
      alert('Erro ao processar imagem da promoção: ' + err);
    } finally {
      setUploadingPromoImg(false);
    }
  };

  const handleConfirmChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');

    const currentActualPwd = dono?.senha || '123456';
    if (!senhaAtual) {
      setPwdError('Por favor, informe sua senha atual.');
      return;
    }
    if (senhaAtual !== currentActualPwd) {
      setPwdError('❌ A senha atual informada está incorreta.');
      return;
    }
    if (!novaSenha || novaSenha.length < 4) {
      setPwdError('❌ A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }
    if (novaSenha === senhaAtual) {
      setPwdError('⚠️ A nova senha não pode ser idêntica à senha atual.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setPwdError('❌ A confirmação da nova senha não confere.');
      return;
    }

    try {
      setIsChangingPwd(true);
      await updateDono({ senha: novaSenha });
      setPwdSuccess(true);
      setClienteSaved(true);
      setTimeout(() => {
        setPwdSuccess(false);
        setIsPasswordModalOpen(false);
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarSenha('');
      }, 1200);
    } catch (err) {
      setPwdError('Erro ao atualizar a senha: ' + err);
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleSaveCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setClienteErro('');
    if (!clienteNome.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteEmail.trim())) {
      setClienteErro('Preencha nome e um e-mail válido.');
      return;
    }
    await updateDono({
      nome: clienteNome,
      email: clienteEmail,
      telefone: clienteTelefone,
    });
    setClienteSaved(true);
    setTimeout(() => setClienteSaved(false), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const res = await processImageFile(file, { maxSize: 600, thumbSize: 200 });
      updateEmpresa({ logo: res.main });
      setLogoStats(`${formatBytes(res.originalSize)} → ${formatBytes(res.mainSize)} (WebP)`);
    } catch (err) {
      alert('Erro ao processar logo: ' + err);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBanner(true);
      const res = await processImageFile(file, { maxSize: 1600, thumbSize: 400 });
      updateEmpresa({ banner: res.main });
      setBannerStats(`${formatBytes(res.originalSize)} → ${formatBytes(res.mainSize)} (WebP)`);
    } catch (err) {
      alert('Erro ao processar banner: ' + err);
    } finally {
      setUploadingBanner(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-xl text-slate-900">Perfil e Dados da Empresa</h3>
          <p className="text-xs text-slate-500">Configure as informações de exibição e os campos dinâmicos do seu nicho ({selectedNicho.nome}).</p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>

      {savedMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
          <span>Informações salvas com sucesso!</span>
        </div>
      )}

      {/* Visual Identity Uploads */}
      <div className="space-y-4">
        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-indigo-600" />
          <span>Identidade Visual</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 space-y-3 text-center flex flex-col items-center justify-between">
            <div className="space-y-2 flex flex-col items-center">
              <label className="text-xs font-bold text-slate-700 block">Logo da Loja</label>
              <ImageDimensionBadge
                dimensao="500x500 px (1:1)"
                tipo="Logo da Loja"
                promptExemplo={getNicheImagePrompt(nichoId, 'logo', { nomeLoja: empresa.nome })}
              />
              {empresa.logo ? (
                <img src={empresa.logo} alt="Logo" className="w-20 h-20 rounded-xl object-cover border bg-white mt-1 shadow-xs" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 mt-1">
                  <Store className="w-8 h-8" />
                </div>
              )}
              {logoStats && <p className="text-[10px] text-emerald-700 font-mono">{logoStats}</p>}
            </div>
            <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 mt-2">
              {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Trocar Logo</span>}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>

          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 space-y-3 text-center flex flex-col items-center justify-between">
            <div className="space-y-2 flex flex-col items-center w-full">
              <label className="text-xs font-bold text-slate-700 block">Banner de Capa</label>
              <ImageDimensionBadge
                dimensao="1200x400 px (3:1)"
                tipo="Banner de Capa"
                promptExemplo={getNicheImagePrompt(nichoId, 'banner', { nomeLoja: empresa.nome })}
              />
              {empresa.banner ? (
                <img src={empresa.banner} alt="Banner" className="w-full h-20 rounded-xl object-cover border bg-white mt-1 shadow-xs" />
              ) : (
                <div className="w-full h-20 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 text-xs mt-1">
                  Sem Banner
                </div>
              )}
              {bannerStats && <p className="text-[10px] text-emerald-700 font-mono">{bannerStats}</p>}
            </div>
            <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 mt-2">
              {uploadingBanner ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Trocar Banner</span>}
              <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Promo Banner / Featured Card Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-[#333333]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-[#FFFFFF] flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Banner de Promoção & Oferta do Dia</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-[#B0BEC5]">
              Personalize o card de destaque que aparece no topo da vitrine para chamar a atenção dos clientes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleUpdatePromo({ ativo: !promoBanner.ativo })}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              promoBanner.ativo
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-200 dark:bg-[#2C2C2C] text-slate-600 dark:text-[#B0BEC5] border border-slate-300 dark:border-[#3A3A3A]'
            }`}
          >
            {promoBanner.ativo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{promoBanner.ativo ? 'Banner Ativo' : 'Banner Oculto'}</span>
          </button>
        </div>

        {promoBanner.ativo && (
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-[#383838] bg-slate-50/70 dark:bg-[#262626] space-y-4 transition-colors">
            
            {/* Paginação / Seletor de Ofertas (Até 5 Imagens e Ofertas) */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-200 dark:border-[#383838] shadow-2xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-extrabold text-slate-500 dark:text-[#B0BEC5] uppercase tracking-wider pl-1 pr-1.5 hidden sm:inline">
                  Ofertas:
                </span>
                {currentSlides.map((slide, idx) => (
                  <button
                    key={slide.id || idx}
                    type="button"
                    onClick={() => setActivePromoSlideIdx(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      activePromoSlideIdx === idx
                        ? 'bg-indigo-600 dark:bg-[#7C4DFF] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-[#2C2C2C] text-slate-700 dark:text-[#B0BEC5] hover:bg-slate-200 dark:hover:bg-[#383838] border border-slate-200 dark:border-[#383838]'
                    }`}
                  >
                    <span>🏷️ Oferta {idx + 1}</span>
                    {idx === 0 && <span className="text-[10px] opacity-75">(Principal)</span>}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {currentSlides.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddNewOffer}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Oferta ({currentSlides.length}/5)</span>
                  </button>
                )}

                {currentSlides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCurrentOffer(activePromoSlideIdx)}
                    className="px-2.5 py-1.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                    title="Excluir esta oferta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Oferta {activePromoSlideIdx + 1}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Formulário da Oferta Ativa */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* Imagem do Banner Promocional da Oferta Selecionada */}
              <div className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-[#444444] bg-white dark:bg-[#1E1E1E] space-y-2 text-center flex flex-col items-center justify-between">
                <div className="space-y-1.5 w-full flex flex-col items-center">
                  <div className="flex items-center justify-between w-full">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-[#FFFFFF] block">
                      Imagem da Oferta {activePromoSlideIdx + 1}
                    </label>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-[#A58BFF] bg-indigo-50 dark:bg-[#7C4DFF]/20 px-2 py-0.5 rounded-full">
                      Slide {activePromoSlideIdx + 1} de {currentSlides.length}
                    </span>
                  </div>
                  <ImageDimensionBadge
                    dimensao="1200x400 px (3:1)"
                    tipo={`Banner Promocional ${activePromoSlideIdx + 1}`}
                    promptExemplo={getNicheImagePrompt(nichoId, 'promo', { nomeLoja: empresa.nome })}
                  />
                  {activeSlide.imagem ? (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-[#383838] mt-1 shadow-xs bg-slate-900">
                      <img src={activeSlide.imagem} alt={activeSlide.titulo || 'Promo'} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleUpdateActiveSlide({ imagem: undefined })}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer shadow-xs"
                        title="Remover imagem desta oferta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-28 rounded-xl bg-slate-100 dark:bg-[#2C2C2C] border border-slate-200 dark:border-[#383838] flex flex-col items-center justify-center text-slate-400 dark:text-[#757575] text-[11px] p-2 mt-1">
                      <span>Usando foto do produto em destaque</span>
                    </div>
                  )}
                  {promoImgStats && <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">{promoImgStats}</p>}
                </div>

                <label className="cursor-pointer px-3 py-1.5 bg-indigo-50 dark:bg-[#2C2C2C] hover:bg-indigo-100 dark:hover:bg-[#383838] text-indigo-700 dark:text-[#A58BFF] border border-indigo-200 dark:border-[#444444] rounded-lg text-xs font-bold inline-flex items-center gap-1.5 mt-2">
                  {uploadingPromoImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>{activeSlide.imagem ? 'Trocar Imagem' : 'Enviar Foto da Promoção'}</span>}
                  <input type="file" accept="image/*" onChange={handlePromoSlideImageUpload} className="hidden" />
                </label>
              </div>

              {/* Textos Principais da Oferta Selecionada */}
              <div className="md:col-span-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-[#FFFFFF]">Etiqueta Superior (Tag)</label>
                    <input
                      type="text"
                      placeholder="Ex: OFERTA DO DIA"
                      value={activeSlide.tag || ''}
                      onChange={(e) => handleUpdateActiveSlide({ tag: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-[#444444] text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-[#FFFFFF] placeholder:text-slate-400 dark:placeholder:text-[#757575]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-[#FFFFFF]">Selo de Desconto / Badge</label>
                    <input
                      type="text"
                      placeholder="Ex: 20% OFF ou FRETE GRÁTIS"
                      value={activeSlide.badgeDesconto || ''}
                      onChange={(e) => handleUpdateActiveSlide({ badgeDesconto: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-[#444444] text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-[#FFFFFF] placeholder:text-slate-400 dark:placeholder:text-[#757575]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-[#FFFFFF]">Título Principal</label>
                    <input
                      type="text"
                      placeholder="Ex: Combo Especial Artesanal"
                      value={activeSlide.titulo || ''}
                      onChange={(e) => handleUpdateActiveSlide({ titulo: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-[#444444] text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-[#FFFFFF] placeholder:text-slate-400 dark:placeholder:text-[#757575]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-[#FFFFFF]">Subtítulo / Complemento</label>
                    <input
                      type="text"
                      placeholder="Ex: Batata Frita Fofinha Inclusa"
                      value={activeSlide.subtitulo || ''}
                      onChange={(e) => handleUpdateActiveSlide({ subtitulo: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-[#444444] text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-[#FFFFFF] placeholder:text-slate-400 dark:placeholder:text-[#757575]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-[#FFFFFF]">Texto Descritivo</label>
                  <AutoResizeTextarea
                    minRows={2}
                    maxRows={5}
                    placeholder="Descrição da oferta ou ingredientes..."
                    value={activeSlide.descricao || ''}
                    onChange={(e) => handleUpdateActiveSlide({ descricao: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#444444] text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-[#FFFFFF] placeholder:text-slate-400 dark:placeholder:text-[#757575] leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-[#FFFFFF]">Texto do Botão</label>
                    <input
                      type="text"
                      placeholder="Ex: Pedir Oferta"
                      value={activeSlide.textoBotao || ''}
                      onChange={(e) => handleUpdateActiveSlide({ textoBotao: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-[#444444] text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-[#FFFFFF] placeholder:text-slate-400 dark:placeholder:text-[#757575]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-[#FFFFFF]">Produto Vinculado ao Botão</label>
                    <select
                      value={activeSlide.linkProdutoId || ''}
                      onChange={(e) => handleUpdateActiveSlide({ linkProdutoId: e.target.value || undefined })}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-[#444444] text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-[#FFFFFF]"
                    >
                      <option value="">Primeiro item em destaque (padrão)</option>
                      {produtos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome} (R$ {Number(p.preco).toFixed(2).replace('.', ',')})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Nome da Empresa / Loja *</label>
          <input
            type="text"
            required
            value={empresa.nome || ''}
            onChange={(e) => updateEmpresa({ nome: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">WhatsApp para Pedidos *</label>
          <input
            type="text"
            required
            value={empresa.whatsapp || ''}
            onChange={(e) => updateEmpresa({ whatsapp: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Endereço Completo</label>
          <input
            type="text"
            value={empresa.endereco || ''}
            onChange={(e) => updateEmpresa({ endereco: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Instagram</label>
          <input
            type="text"
            value={empresa.instagram || ''}
            onChange={(e) => updateEmpresa({ instagram: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Chave PIX</label>
          <input
            type="text"
            value={empresa.pix || ''}
            onChange={(e) => updateEmpresa({ pix: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">E-mail de Contato</label>
          <input
            type="text"
            value={empresa.email || ''}
            onChange={(e) => updateEmpresa({ email: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Título & Mensagem de Boas-Vindas da Vitrine (Headline) */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span>Mensagem de Boas-Vindas da Vitrine (Headline)</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Personalize o título e subtítulo de destaque que aparecem no topo do catálogo abaixo do banner.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const suggested = getNicheDefaultHeadline(nichoId);
              updateEmpresa({
                headlineTitulo: suggested.titulo,
                headlineSubtitulo: suggested.subtitulo,
              });
            }}
            className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 cursor-pointer inline-flex items-center gap-1.5 transition-colors"
            title="Preencher com sugestão baseada no seu nicho"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sugerir para {selectedNicho.nome}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Título Principal da Vitrine (H2)</label>
            <input
              type="text"
              value={empresa.headlineTitulo ?? ''}
              onChange={(e) => updateEmpresa({ headlineTitulo: e.target.value })}
              placeholder={getNicheDefaultHeadline(nichoId).titulo}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Subtítulo Explicativo</label>
            <input
              type="text"
              value={empresa.headlineSubtitulo ?? ''}
              onChange={(e) => updateEmpresa({ headlineSubtitulo: e.target.value })}
              placeholder={getNicheDefaultHeadline(nichoId).subtitulo}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Espaço Físico & Localização (Atendimento Presencial) */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span>Espaço Físico & Localização</span>
                {(empresa.temEspacoFisico ?? !!empresa.endereco) ? (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Ativo na Vitrine</span>
                ) : (
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Opcional</span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500">
                Informe o endereço do seu ponto de atendimento e integre com o Google Maps para seus clientes traçarem rotas.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={empresa.temEspacoFisico ?? !!empresa.endereco}
              onChange={(e) => updateEmpresa({ temEspacoFisico: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {(empresa.temEspacoFisico ?? !!empresa.endereco) && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Endereço Completo (Rua / Av.)</label>
                <input
                  type="text"
                  placeholder="Ex: Av. Boa Viagem, 1500"
                  value={empresa.endereco || ''}
                  onChange={(e) => updateEmpresa({ endereco: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Número / Sala</label>
                <input
                  type="text"
                  placeholder="Ex: Sala 201 ou Nº 120"
                  value={empresa.numero || ''}
                  onChange={(e) => updateEmpresa({ numero: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Bairro</label>
                <input
                  type="text"
                  placeholder="Ex: Boa Viagem"
                  value={empresa.bairro || ''}
                  onChange={(e) => updateEmpresa({ bairro: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Cidade / UF</label>
                <input
                  type="text"
                  placeholder="Ex: Recife - PE"
                  value={empresa.cidade || ''}
                  onChange={(e) => updateEmpresa({ cidade: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Ponto de Referência / Complemento</label>
                <input
                  type="text"
                  placeholder="Ex: Próximo ao Shopping, em frente à farmácia..."
                  value={empresa.pontoReferencia || ''}
                  onChange={(e) => updateEmpresa({ pontoReferencia: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Horário de Atendimento Presencial</label>
                <input
                  type="text"
                  placeholder="Ex: Seg a Sex: 08h às 18h | Sáb: 08h às 13h"
                  value={empresa.horarioFuncionamento || ''}
                  onChange={(e) => updateEmpresa({ horarioFuncionamento: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* Link Google Maps & Helper */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Link Direto do Google Maps (Como Chegar)</span>
                </label>
                {empresa.endereco && (
                  <button
                    type="button"
                    onClick={() => {
                      const query = encodeURIComponent(
                        `${empresa.endereco}${empresa.numero ? `, ${empresa.numero}` : ''}${empresa.bairro ? ` - ${empresa.bairro}` : ''}${empresa.cidade ? `, ${empresa.cidade}` : ''}`
                      );
                      updateEmpresa({ googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${query}` });
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer hover:underline"
                  >
                    ⚡ Gerar link a partir do endereço
                  </button>
                )}
              </div>
              <input
                type="url"
                placeholder="https://maps.app.goo.gl/... ou https://google.com/maps/..."
                value={empresa.googleMapsUrl || ''}
                onChange={(e) => updateEmpresa({ googleMapsUrl: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono placeholder:font-sans"
              />
            </div>

            {/* Mapa Preview */}
            {empresa.endereco && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <span>🗺️</span>
                    <span>Prévia da Localização no Mapa:</span>
                  </span>
                  <a
                    href={
                      empresa.googleMapsUrl ||
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${empresa.endereco}${empresa.numero ? `, ${empresa.numero}` : ''}${empresa.bairro ? ` - ${empresa.bairro}` : ''}${empresa.cidade ? `, ${empresa.cidade}` : ''}`
                      )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Testar no Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100 relative">
                  <iframe
                    title="Mapa Google Maps"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      `${empresa.endereco}${empresa.numero ? `, ${empresa.numero}` : ''}${empresa.bairro ? `, ${empresa.bairro}` : ''}${empresa.cidade ? `, ${empresa.cidade}` : ''}`
                    )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dados do Cliente / Dono */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <UserCog className="w-4 h-4 text-indigo-600" />
          <span>Dados do Cliente / Dono</span>
          {dono ? (
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Cadastrado</span>
          ) : (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Sem cadastro</span>
          )}
        </h4>
        <p className="text-[11px] text-slate-500">
          Dados de identificação do comprador do sistema. O telefone é sincronizado como WhatsApp da loja.
        </p>
        <form onSubmit={handleSaveCliente} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Nome do Cliente</label>
            <input type="text" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">E-mail</label>
            <input type="text" value={clienteEmail} onChange={(e) => setClienteEmail(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Telefone / WhatsApp</label>
            <input type="text" value={clienteTelefone} onChange={(e) => setClienteTelefone(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="space-y-1">
            <div className="relative">
              <input
                type="password"
                readOnly
                value="••••••••••••"
                onClick={() => {
                  setSenhaAtual('');
                  setNovaSenha('');
                  setConfirmarSenha('');
                  setPwdError('');
                  setIsPasswordModalOpen(true);
                }}
                onFocus={() => {
                  setSenhaAtual('');
                  setNovaSenha('');
                  setConfirmarSenha('');
                  setPwdError('');
                  setIsPasswordModalOpen(true);
                }}
                placeholder="Clique para alterar sua senha"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 cursor-pointer text-slate-600 font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => {
                  setSenhaAtual('');
                  setNovaSenha('');
                  setConfirmarSenha('');
                  setPwdError('');
                  setIsPasswordModalOpen(true);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] border border-indigo-200 cursor-pointer transition-colors"
              >
                Trocar Senha
              </button>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Salvar Dados do Cliente</span>
            </button>
            {clienteSaved && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <Check className="w-4 h-4 stroke-[3]" /> Dados salvos!
              </span>
            )}
            {clienteErro && <span className="text-xs font-bold text-red-600">{clienteErro}</span>}
          </div>
        </form>
      </div>

      {/* Dynamic Niche Fields */}
      {selectedNicho.camposPersonalizados.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Campos Específicos para {selectedNicho.nome}</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedNicho.camposPersonalizados.map((field) => {
              const val = empresa[field.id] || '';

              if (field.tipo === 'select') {
                return (
                  <div key={field.id} className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{field.label}</label>
                    <Select
                      value={val}
                      onChange={(v) => updateEmpresa({ [field.id]: String(v) })}
                      options={field.opcoes?.map((opt) => ({ value: opt, label: opt })) || []}
                      placeholder="Selecione..."
                      buttonClassName="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                  </div>
                );
              }

              if (field.tipo === 'textarea') {
                return (
                  <div key={field.id} className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">{field.label}</label>
                    <AutoResizeTextarea
                      minRows={2}
                      maxRows={6}
                      value={val}
                      onChange={(e) => updateEmpresa({ [field.id]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white leading-relaxed"
                    />
                  </div>
                );
              }

              return (
                <div key={field.id} className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{field.label}</label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateEmpresa({ [field.id]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Troca Segura de Senha com Verificação da Senha Antiga */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">Alterar Senha de Acesso</h4>
                  <p className="text-xs text-slate-500">Confirme sua senha atual para definir uma nova.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pwdSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-emerald-900">Senha Alterada com Sucesso!</p>
                  <p className="text-[11px] text-emerald-700 font-normal">Sua nova senha já está ativa para os próximos acessos.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmChangePassword} className="space-y-4">
                {pwdError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{pwdError}</span>
                  </div>
                )}

                {/* 1. Senha Atual */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Senha Atual *</span>
                    <span className="text-[10px] text-slate-400 font-normal">Obrigatório para verificação</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSenhaAtual ? 'text' : 'password'}
                      required
                      autoFocus
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      placeholder="Digite sua senha atual"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                      title={showSenhaAtual ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {showSenhaAtual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2. Nova Senha */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nova Senha *</label>
                  <div className="relative">
                    <input
                      type={showNovaSenha ? 'text' : 'password'}
                      required
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNovaSenha(!showNovaSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                      title={showNovaSenha ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {showNovaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 3. Confirmar Nova Senha */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Confirmar Nova Senha *</label>
                  <div className="relative">
                    <input
                      type={showConfirmarSenha ? 'text' : 'password'}
                      required
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                      title={showConfirmarSenha ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {showConfirmarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPwd}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isChangingPwd ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verificando...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verificar e Alterar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Select } from '../ui/Select';
import { useCatalog } from '../../context/CatalogContext';
import { NICHOS } from '../../data/nichos';
import { processImageFile, formatBytes } from '../../utils/imagePipeline';
import { Store, Phone, MapPin, Instagram, Facebook, Image as ImageIcon, Sparkles, Loader2, Check } from 'lucide-react';
import { ImageDimensionBadge } from '../ui/ImageDimensionBadge';
import { getNicheImagePrompt } from '../../utils/nichePrompts';

export const StepEmpresa: React.FC = () => {
  const { empresa, updateEmpresa, nichoId } = useCatalog();
  const selectedNicho = NICHOS.find((n) => n.id === nichoId) || NICHOS[0];

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoStats, setLogoStats] = useState<{ orig: number; opt: number } | null>(null);

  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerStats, setBannerStats] = useState<{ orig: number; opt: number } | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const res = await processImageFile(file, { maxSize: 600, thumbSize: 150 });
      updateEmpresa({ logo: res.main });
      setLogoStats({ orig: res.originalSize, opt: res.mainSize });
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
      setBannerStats({ orig: res.originalSize, opt: res.mainSize });
    } catch (err) {
      alert('Erro ao processar banner: ' + err);
    } finally {
      setUploadingBanner(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-black text-slate-900">Configurações da sua Empresa</h2>
        <p className="text-xs text-slate-500 mt-1">
          Preencha os dados básicos da sua loja para personalizar o catálogo para os seus clientes.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Identidade Visual */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            <span>Identidade Visual & Imagens (Pipeline de Otimização Automático WebP)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Logo Upload */}
            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-between text-center space-y-3">
              <div className="flex flex-col items-center space-y-2">
                <label className="text-xs font-bold text-slate-700">Logo da Loja</label>
                <ImageDimensionBadge
                  dimensao="500x500 px (1:1)"
                  tipo="Logo da Loja"
                  promptExemplo={getNicheImagePrompt(nichoId, 'logo', { nomeLoja: empresa.nome })}
                />
                {empresa.logo ? (
                  <div className="relative group mt-1">
                    <img
                      src={empresa.logo}
                      alt="Logo preview"
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500 shadow-md bg-white"
                    />
                    <div className="absolute -bottom-2 inset-x-0 text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center gap-1 shadow-xs">
                      <Check className="w-3 h-3" />
                      <span>Otimizada</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-200/80 flex items-center justify-center text-slate-400 mt-1">
                    <Store className="w-8 h-8" />
                  </div>
                )}

                {logoStats && (
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                    {formatBytes(logoStats.orig)} → {formatBytes(logoStats.opt)} (Reduzido!)
                  </p>
                )}
              </div>

              <label className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 mt-2">
                {uploadingLogo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Otimizando...</span>
                  </>
                ) : (
                  <span>{empresa.logo ? 'Alterar Logo' : 'Fazer Upload da Logo'}</span>
                )}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>

            {/* Banner Upload */}
            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-between text-center space-y-3">
              <div className="flex flex-col items-center space-y-2 w-full">
                <label className="text-xs font-bold text-slate-700">Banner de Capa Principal</label>
                <ImageDimensionBadge
                  dimensao="1200x400 px (3:1)"
                  tipo="Banner de Capa"
                  promptExemplo={getNicheImagePrompt(nichoId, 'banner', { nomeLoja: empresa.nome })}
                />

                {empresa.banner ? (
                  <div className="w-full h-24 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-md relative bg-slate-200 mt-1">
                    <img src={empresa.banner} alt="Banner preview" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full shadow-xs">
                      WebP 1600px
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-24 rounded-xl bg-slate-200/80 flex items-center justify-center text-slate-400 text-xs mt-1">
                    Proporção Recomendada: 3:1 (1200x400px)
                  </div>
                )}

                {bannerStats && (
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                    {formatBytes(bannerStats.orig)} → {formatBytes(bannerStats.opt)} (Otimizado WebP)
                  </p>
                )}
              </div>

              <label className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 mt-2">
                {uploadingBanner ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Otimizando...</span>
                  </>
                ) : (
                  <span>{empresa.banner ? 'Alterar Banner' : 'Fazer Upload do Banner'}</span>
                )}
                <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
              </label>
            </div>

          </div>
        </div>

        {/* Section 2: General Info */}
        <div className="space-y-4 pt-2">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Store className="w-5 h-5 text-indigo-600" />
            <span>Informações Principais de Contato</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nome do Estabelecimento *</label>
              <input
                type="text"
                value={empresa.nome || ''}
                onChange={(e) => updateEmpresa({ nome: e.target.value })}
                placeholder="Ex: Sabor & Arte Restaurante"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">WhatsApp para Receber Pedidos *</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={empresa.whatsapp || ''}
                  onChange={(e) => updateEmpresa({ whatsapp: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Endereço Completo</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={empresa.endereco || ''}
                  onChange={(e) => updateEmpresa({ endereco: e.target.value })}
                  placeholder="Rua das Flores, 123 - São Paulo, SP"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Instagram</label>
              <div className="relative">
                <Instagram className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={empresa.instagram || ''}
                  onChange={(e) => updateEmpresa({ instagram: e.target.value })}
                  placeholder="@seunegocio"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Chave PIX para Pagamentos</label>
              <input
                type="text"
                value={empresa.pix || ''}
                onChange={(e) => updateEmpresa({ pix: e.target.value })}
                placeholder="CNPJ, E-mail ou Telefone"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Facebook</label>
              <div className="relative">
                <Facebook className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={empresa.facebook || ''}
                  onChange={(e) => updateEmpresa({ facebook: e.target.value })}
                  placeholder="facebook.com/seunegocio"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Dynamic Niche Fields */}
        {selectedNicho.camposPersonalizados.length > 0 && (
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Campos Específicos para {selectedNicho.nome}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedNicho.camposPersonalizados.map((field) => {
                const val = empresa[field.id] || '';

                if (field.tipo === 'select') {
                  return (
                    <div key={field.id} className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        {field.label} {field.obrigatorio && '*'}
                      </label>
                      <Select
                        value={val}
                        onChange={(v) => updateEmpresa({ [field.id]: String(v) })}
                        options={[
                          ...(field.opcoes?.map((opt) => ({ value: opt, label: opt })) || []),
                        ]}
                        placeholder="Selecione..."
                        buttonClassName="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                      />
                    </div>
                  );
                }

                if (field.tipo === 'textarea') {
                  return (
                    <div key={field.id} className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-700">
                        {field.label} {field.obrigatorio && '*'}
                      </label>
                      <textarea
                        rows={2}
                        value={val}
                        onChange={(e) => updateEmpresa({ [field.id]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  );
                }

                return (
                  <div key={field.id} className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {field.label} {field.obrigatorio && '*'}
                    </label>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => updateEmpresa({ [field.id]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

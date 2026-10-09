import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { TEMAS } from '../../data/temas';
import { NICHOS } from '../../data/nichos';
import { Sparkles, Palette, Check, Plus } from 'lucide-react';
import { CustomPaletteManager } from '../admin/CustomPaletteManager';

export const StepTema: React.FC = () => {
  const { config, setTema, customPalettes, nichoId } = useCatalog();
  const [tab, setTab] = useState<'presets' | 'custom'>('presets');

  const selectedNicho = NICHOS.find((n) => n.id === nichoId);

  // Filter recommended themes first
  const sortedTemas = [...TEMAS].sort((a, b) => {
    const aRec = a.recommendedFor?.includes(nichoId) ? -1 : 1;
    const bRec = b.recommendedFor?.includes(nichoId) ? -1 : 1;
    return aRec - bRec;
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#212529] dark:text-[#FFFFFF]">Passo 2: Escolha o tema e paleta de cores</h2>
        <p className="text-sm md:text-base text-[#6C757D] dark:text-[#B0BEC5]">
          Selecione um tema curado para {selectedNicho?.nome || 'o seu segmento'} ou crie suas próprias paletas de cores.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex justify-center border-b border-[#E0E0E0] dark:border-[#333333] pb-3">
        <div className="inline-flex p-1 bg-[#EDF2F7] dark:bg-[#2C2C2C] rounded-xl gap-1">
          <button
            onClick={() => setTab('presets')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              tab === 'presets'
                ? 'bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] shadow-sm'
                : 'text-[#6C757D] dark:text-[#B0BEC5] hover:text-[#212529] dark:hover:text-[#FFFFFF]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Temas Prontos ({TEMAS.length})</span>
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              tab === 'custom'
                ? 'bg-white dark:bg-[#1E1E1E] text-[#212529] dark:text-[#FFFFFF] shadow-sm'
                : 'text-[#6C757D] dark:text-[#B0BEC5] hover:text-[#212529] dark:hover:text-[#FFFFFF]'
            }`}
          >
            <Palette className="w-4 h-4 text-[#4F3BFF] dark:text-[#7C4DFF]" />
            <span>Personalizar ({customPalettes.length}/4)</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {tab === 'presets' ? (
        <div className="space-y-6">
          {/* Custom Palettes if created */}
          {customPalettes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-[#212529] dark:text-[#FFFFFF] flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#4F3BFF] dark:text-[#7C4DFF]" />
                  <span>Suas Paletas Personalizadas ({customPalettes.length}/4)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setTab('custom')}
                  className="text-xs text-[#4F3BFF] dark:text-[#7C4DFF] hover:underline font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Gerenciar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customPalettes.map((tema) => {
                  const isSelected = config.tema.id === tema.id;

                  return (
                    <div
                      key={tema.id}
                      onClick={() => setTema(tema)}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all space-y-2 relative bg-white dark:bg-[#1E1E1E] ${
                        isSelected ? 'border-[#4F3BFF] dark:border-[#7C4DFF] shadow-md ring-2 ring-indigo-500/20' : 'border-[#E0E0E0] dark:border-[#333333] hover:border-[#4F3BFF]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{tema.icone}</span>
                          <h4 className="font-bold text-sm text-[#212529] dark:text-[#FFFFFF]">{tema.nome}</h4>
                        </div>
                        <span className="text-[10px] bg-indigo-100 dark:bg-[#7C4DFF]/20 text-indigo-800 dark:text-[#A58BFF] font-bold px-2 py-0.5 rounded-full">
                          Personalizada
                        </span>
                      </div>

                      <div className="flex items-center gap-1 pt-2">
                        <div className="w-6 h-6 rounded-md border border-[#E0E0E0] dark:border-[#333333]" style={{ backgroundColor: tema.cores.primary }} />
                        <div className="w-6 h-6 rounded-md border border-[#E0E0E0] dark:border-[#333333]" style={{ backgroundColor: tema.cores.secondary }} />
                        <div className="w-6 h-6 rounded-md border border-[#E0E0E0] dark:border-[#333333]" style={{ backgroundColor: tema.cores.tertiary }} />
                        <div className="w-6 h-6 rounded-md border border-[#E0E0E0] dark:border-[#333333]" style={{ backgroundColor: tema.cores.background }} />
                        <div className="w-6 h-6 rounded-md border border-[#E0E0E0] dark:border-[#333333]" style={{ backgroundColor: tema.cores.surface }} />
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preset Themes List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTemas.map((tema) => {
              const isSelected = config.tema.id === tema.id;
              const isRecommended = tema.recommendedFor?.includes(nichoId);

              return (
                <div
                  key={tema.id}
                  onClick={() => setTema(tema)}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition-all space-y-3 relative bg-white dark:bg-[#1E1E1E] ${
                    isSelected
                      ? 'border-[#4F3BFF] dark:border-[#7C4DFF] shadow-md ring-2 ring-indigo-500/20'
                      : 'border-[#E0E0E0] dark:border-[#333333] hover:border-[#4F3BFF]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tema.icone}</span>
                      <h3 className="font-bold text-base text-[#212529] dark:text-[#FFFFFF]">{tema.nome}</h3>
                    </div>
                    {isRecommended && (
                      <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full flex-shrink-0">
                        Recomendado
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5] leading-relaxed">{tema.descricao}</p>

                  {/* Color Swatches */}
                  <div className="pt-2 border-t border-[#E0E0E0] dark:border-[#333333]">
                    <p className="text-[11px] font-medium text-[#6C757D] dark:text-[#B0BEC5] mb-1.5">Paleta:</p>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-7 h-7 rounded-lg border border-[#E0E0E0] dark:border-[#333333] shadow-2xs"
                        style={{ backgroundColor: tema.cores.primary }}
                        title="Cor Primária"
                      />
                      <div
                        className="w-7 h-7 rounded-lg border border-[#E0E0E0] dark:border-[#333333] shadow-2xs"
                        style={{ backgroundColor: tema.cores.secondary }}
                        title="Cor Secundária"
                      />
                      <div
                        className="w-7 h-7 rounded-lg border border-[#E0E0E0] dark:border-[#333333] shadow-2xs"
                        style={{ backgroundColor: tema.cores.tertiary }}
                        title="Cor Terciária"
                      />
                      <div
                        className="w-7 h-7 rounded-lg border border-[#E0E0E0] dark:border-[#333333] shadow-2xs"
                        style={{ backgroundColor: tema.cores.background }}
                        title="Fundo"
                      />
                      <div
                        className="w-7 h-7 rounded-lg border border-[#E0E0E0] dark:border-[#333333] shadow-2xs"
                        style={{ backgroundColor: tema.cores.surface }}
                        title="Superfície"
                      />
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <CustomPaletteManager />
      )}
    </div>
  );
};

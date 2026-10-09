import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { TEMAS } from '../../data/temas';
import { NICHOS } from '../../data/nichos';
import { Sparkles, Palette, Check, Plus, Moon, Sun } from 'lucide-react';
import { CustomPaletteManager } from './CustomPaletteManager';

export const ThemeManager: React.FC = () => {
  const { config, setTema, customPalettes, nichoId, isDarkMode, toggleDarkMode } = useCatalog();
  const [tab, setTab] = useState<'presets' | 'custom'>('presets');

  const selectedNicho = NICHOS.find((n) => n.id === nichoId);

  return (
    <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-6 text-[#212529] dark:text-[#FFFFFF] transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E0E0E0] dark:border-[#333333] pb-4 gap-4">
        <div>
          <h3 className="font-extrabold text-xl text-[#212529] dark:text-[#FFFFFF]">Tema e Paleta de Cores</h3>
          <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5]">Altere o visual do seu catálogo digital a qualquer momento.</p>
        </div>

        <div className="inline-flex p-1 bg-[#EDF2F7] dark:bg-[#2C2C2C] rounded-xl gap-1 self-start sm:self-auto">
          <button
            onClick={() => setTab('presets')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              tab === 'presets' ? 'bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white shadow-2xs' : 'text-[#6C757D] dark:text-[#B0BEC5] hover:text-[#212529] dark:hover:text-[#FFFFFF]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Temas Prontos</span>
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              tab === 'custom' ? 'bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white shadow-2xs' : 'text-[#6C757D] dark:text-[#B0BEC5] hover:text-[#212529] dark:hover:text-[#FFFFFF]'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-[#A58BFF]" />
            <span>Personalizar ({customPalettes.length}/4)</span>
          </button>
        </div>
      </div>

      {/* Dark Mode Quick Switcher Card */}
      <div className="p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F5F7FB] dark:bg-[#2C2C2C]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs ${
            isDarkMode ? 'bg-[#1E1E1E] text-[#A58BFF] border border-[#333333]' : 'bg-[#EDF2F7] text-[#4F3BFF] border border-[#E0E0E0]'
          }`}>
            {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-[#212529] dark:text-[#FFFFFF] flex items-center gap-1.5">
              <span>Modo Escuro (Dark Mode)</span>
              {isDarkMode && <span className="text-[10px] bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white font-black px-2 py-0.2 rounded-full">Ativado</span>}
            </h4>
            <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5]">
              {isDarkMode
                ? 'Catálogo em modo escuro de alto contraste para melhor leitura noturna.'
                : 'Catálogo em modo claro com fundo limpo e cores vibrantes.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-95 flex-shrink-0 ${
            isDarkMode
              ? 'bg-[#4F3BFF] dark:bg-[#7C4DFF] hover:brightness-110 text-white shadow-sm'
              : 'bg-[#EDF2F7] hover:brightness-95 text-[#4F3BFF] border border-[#E0E0E0] shadow-2xs'
          }`}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-300" />
              <span>Mudar para Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#4F3BFF]" />
              <span>Ativar Modo Escuro</span>
            </>
          )}
        </button>
      </div>

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
                  className="text-xs text-[#4F3BFF] dark:text-[#A58BFF] hover:underline font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Gerenciar Paletas</span>
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
                        isSelected ? 'border-[#4F3BFF] dark:border-[#7C4DFF] shadow-xs ring-2 ring-[#4F3BFF]/20 dark:ring-[#7C4DFF]/20' : 'border-[#E0E0E0] dark:border-[#333333] hover:border-[#4F3BFF]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{tema.icone}</span>
                          <h4 className="font-bold text-sm text-[#212529] dark:text-[#FFFFFF]">{tema.nome}</h4>
                        </div>
                        <span className="text-[10px] bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#4F3BFF] dark:text-[#A58BFF] font-bold px-2 py-0.5 rounded-full">
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
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-[#212529] dark:text-[#FFFFFF] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Temas Pré-definidos ({TEMAS.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMAS.map((tema) => {
                const isSelected = config.tema.id === tema.id;
                const isRecommended = tema.recommendedFor?.includes(nichoId);

                return (
                  <div
                    key={tema.id}
                    onClick={() => setTema(tema)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all space-y-2 relative bg-white dark:bg-[#1E1E1E] ${
                      isSelected ? 'border-[#4F3BFF] dark:border-[#7C4DFF] shadow-xs ring-2 ring-[#4F3BFF]/20 dark:ring-[#7C4DFF]/20' : 'border-[#E0E0E0] dark:border-[#333333] hover:border-[#4F3BFF]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{tema.icone}</span>
                        <h4 className="font-bold text-sm text-[#212529] dark:text-[#FFFFFF]">{tema.nome}</h4>
                      </div>
                      {isRecommended && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                          Recomendado
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#6C757D] dark:text-[#B0BEC5] line-clamp-2">{tema.descricao}</p>

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
        </div>
      ) : (
        <CustomPaletteManager />
      )}
    </div>
  );
};

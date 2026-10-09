import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { Plus, Trash2, Check, Edit2, AlertCircle, Palette, Sparkles } from 'lucide-react';
import { TemaCores } from '../../types';

export const CustomPaletteManager: React.FC = () => {
  const {
    config,
    setTema,
    customPalettes,
    addCustomPalette,
    updateCustomPalette,
    deleteCustomPalette,
    updateCustomColors,
  } = useCatalog();

  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState<string>('');

  const currentTheme = config.tema;
  const isCustomActive = customPalettes.some((p) => p.id === currentTheme.id);

  const handleCreateNewPalette = () => {
    setLimitWarning(null);
    if (customPalettes.length >= 4) {
      setLimitWarning(
        'Você atingiu o limite máximo de 4 paletas personalizadas! Para alterar as cores, selecione uma das paletas existentes que você mesmo criou e faça as modificações.'
      );
      return;
    }

    const result = addCustomPalette();
    if (!result.success) {
      setLimitWarning(result.message || 'Não foi possível adicionar nova paleta.');
    }
  };

  const handleStartRename = (id: string, name: string) => {
    setEditingId(id);
    setTempName(name);
  };

  const handleSaveRename = (id: string) => {
    if (tempName.trim()) {
      updateCustomPalette(id, { nome: tempName.trim() });
    }
    setEditingId(null);
  };

  const fields: { key: keyof TemaCores; label: string; desc: string }[] = [
    { key: 'primary', label: 'Cor Primária', desc: 'Botões principais, destaques e links' },
    { key: 'secondary', label: 'Cor Secundária', desc: 'Cabeçalhos, acentos e destaques' },
    { key: 'tertiary', label: 'Cor Terciária', desc: 'Acentos secundários e detalhes' },
    { key: 'background', label: 'Fundo da Página', desc: 'Cor de fundo geral do catálogo' },
    { key: 'surface', label: 'Superfície do Card', desc: 'Cor de fundo dos cards de produto' },
    { key: 'text', label: 'Texto Principal', desc: 'Cor dos títulos e nomes de produtos' },
  ];

  return (
    <div className="space-y-6">
      {/* Warning Box if limit reached */}
      {limitWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <h5 className="font-bold text-xs text-amber-900">Limite de 4 Paletas Atingido</h5>
            <p className="text-xs text-amber-800 leading-relaxed">{limitWarning}</p>
          </div>
          <button
            type="button"
            onClick={() => setLimitWarning(null)}
            className="text-amber-500 hover:text-amber-800 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Custom Palettes Grid */}
      {customPalettes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {customPalettes.map((palette, index) => {
            const isSelected = currentTheme.id === palette.id;

            return (
              <div
                key={palette.id}
                onClick={() => {
                  setTema(palette);
                  setLimitWarning(null);
                }}
                className={`p-4 rounded-2xl border-2 transition-all space-y-3 cursor-pointer relative bg-white ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                {/* Palette Title & Renaming */}
                <div className="flex items-center justify-between gap-1">
                  {editingId === palette.id ? (
                    <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="px-2 py-0.5 text-xs font-bold border rounded bg-white w-full outline-none focus:border-indigo-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(palette.id)}
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-bold text-slate-800 truncate">{palette.nome}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartRename(palette.id, palette.nome);
                        }}
                        className="text-slate-400 hover:text-indigo-600 p-0.5"
                        title="Renomear Paleta"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Tem certeza que deseja excluir a "${palette.nome}"?`)) {
                        deleteCustomPalette(palette.id);
                        setLimitWarning(null);
                      }
                    }}
                    className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                    title="Excluir Paleta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Swatches */}
                <div className="flex items-center gap-1 pt-1">
                  <div className="w-6 h-6 rounded-lg border border-slate-300 shadow-2xs" style={{ backgroundColor: palette.cores.primary }} title="Primária" />
                  <div className="w-6 h-6 rounded-lg border border-slate-300 shadow-2xs" style={{ backgroundColor: palette.cores.secondary }} title="Secundária" />
                  <div className="w-6 h-6 rounded-lg border border-slate-300 shadow-2xs" style={{ backgroundColor: palette.cores.tertiary }} title="Terciária" />
                  <div className="w-6 h-6 rounded-lg border border-slate-300 shadow-2xs" style={{ backgroundColor: palette.cores.background }} title="Fundo" />
                  <div className="w-6 h-6 rounded-lg border border-slate-300 shadow-2xs" style={{ backgroundColor: palette.cores.surface }} title="Superfície" />
                </div>

                {/* Selected Status */}
                <div className="flex items-center justify-between text-[11px] font-bold pt-1">
                  <span className="text-slate-400">Paleta #{index + 1}</span>
                  {isSelected ? (
                    <span className="text-indigo-600 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Ativa
                    </span>
                  ) : (
                    <span className="text-slate-400 hover:text-indigo-600">Usar</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-3">
          <Palette className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-900 text-base">Minhas Paletas Personalizadas</h4>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              {customPalettes.length} / 4 adicionadas
            </span>

            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Você pode criar até 4 paletas customizadas. Clique no botão acima para adicionar sua primeira paleta.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreateNewPalette}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeira Paleta</span>
          </button>
        </div>
      )}

      {/* Editor Panel for Selected Theme Colors */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-5">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Ajustar Cores da Paleta Ativa ({currentTheme.nome})</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              As alterações abaixo modificam em tempo real a paleta selecionada.
            </p>
          </div>
          {isCustomActive && (
            <span className="text-[11px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full">
              Editando Paleta Personalizada
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map(({ key, label, desc }) => (
            <div key={key} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">{label}</label>
                <span className="text-[11px] font-mono font-semibold text-slate-400">{currentTheme.cores[key]}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">{desc}</p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="color"
                  value={currentTheme.cores[key] || '#000000'}
                  onChange={(e) => updateCustomColors({ [key]: e.target.value })}
                  className="w-10 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={currentTheme.cores[key] || ''}
                  onChange={(e) => updateCustomColors({ [key]: e.target.value })}
                  className="flex-1 px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-mono uppercase bg-white outline-none focus:border-indigo-500"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Live Card Preview */}
        <div className="pt-2">
          <p className="text-xs font-bold text-slate-700 mb-2">Pré-visualização do Card no Catálogo:</p>
          <div
            className="p-5 rounded-2xl border transition-all max-w-sm mx-auto shadow-sm space-y-3"
            style={{
              backgroundColor: currentTheme.cores.surface || '#FFFFFF',
              borderColor: currentTheme.cores.border || '#E2E8F0',
            }}
          >
            <div
              className="w-full h-28 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-xs"
              style={{ backgroundColor: currentTheme.cores.secondary || '#3B82F6' }}
            >
              Imagem do Produto
            </div>
            <h5 className="font-black text-sm" style={{ color: currentTheme.cores.text || '#1A1A1A' }}>
               Hambúrguer Especial Gourmet
            </h5>
            <p className="text-xs opacity-80" style={{ color: currentTheme.cores.text || '#1A1A1A' }}>
              Pão brioche, carne artesanal 180g e queijo derretido.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="font-black text-base" style={{ color: currentTheme.cores.primary || '#F59E0B' }}>
                R$ 34,90
              </span>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-lg font-bold text-xs text-white shadow-xs"
                style={{ backgroundColor: currentTheme.cores.primary || '#F59E0B' }}
              >
                + Pedir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

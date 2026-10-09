import React, { useState, useMemo } from 'react';
import { Sparkles, Wand2, ArrowRight, Check, X, Layers, ListPlus, FileText } from 'lucide-react';
import { parseProductRawText, ParsedProductStructure } from '../../utils/textParser';
import { getNicheSmartTextExample } from '../../utils/nichePrompts';
import { AutoResizeTextarea } from './AutoResizeTextarea';

interface SmartTextImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: ParsedProductStructure) => void;
  nichoId?: string;
}

export const SmartTextImporterModal: React.FC<SmartTextImporterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  nichoId = 'restaurante',
}) => {
  const [rawText, setRawText] = useState('');

  const parsed = useMemo(() => {
    return parseProductRawText(rawText);
  }, [rawText]);

  const totalItens = parsed.opcoes.reduce((acc, g) => acc + g.itens.length, 0);

  const nicheExample = useMemo(() => {
    return getNicheSmartTextExample(nichoId);
  }, [nichoId]);

  const handleApply = () => {
    onApply(parsed);
    onClose();
  };

  const handleFillExample = () => {
    setRawText(nicheExample);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-[70] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                Importador & Estruturador Inteligente de Texto
              </h3>
              <p className="text-[11px] text-slate-500">
                Cole listas do WhatsApp, receitas, cardápios ou grades de produtos para criar opções automaticamente.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Cole o texto bruto aqui:</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFillExample}
                  className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-200/80 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Testar com Exemplo do meu Nicho</span>
                </button>
                {rawText && (
                  <button
                    type="button"
                    onClick={() => setRawText('')}
                    className="text-[11px] text-red-500 hover:underline font-bold"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            <AutoResizeTextarea
              minRows={6}
              maxRows={14}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Cole aqui qualquer texto com grupos, recheios, tamanhos ou opções. Exemplo para seu nicho:\n\n${nicheExample}`}
              className="p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono leading-relaxed placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Live Analysis Preview */}
          {rawText.trim() && (
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>Estrutura Detectada Automaticamente:</span>
                </span>
                <span className="text-[11px] font-bold bg-indigo-200/80 text-indigo-800 px-2 py-0.5 rounded-full">
                  {parsed.opcoes.length} grupo(s) · {totalItens} item(ns)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto">
                {parsed.opcoes.map((g, idx) => (
                  <div key={g.id || idx} className="bg-white p-2.5 rounded-lg border border-indigo-100 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="line-clamp-1">📁 {g.nome}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {g.tipo === 'unica' ? 'Escolha 1' : 'Múltipla'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2">
                      {g.itens.map((i) => i.nome + (i.preco > 0 ? ` (+R$ ${i.preco.toFixed(2)})` : '')).join(', ')}
                    </p>
                  </div>
                ))}
              </div>

              {parsed.descricao && (
                <div className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-lg border border-indigo-100">
                  <strong className="text-slate-700">Descrição extraída:</strong> {parsed.descricao.slice(0, 120)}...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={parsed.opcoes.length === 0 && !parsed.descricao}
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Aplicar no Produto ({totalItens} itens)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

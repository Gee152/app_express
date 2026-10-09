import React, { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';

interface ImageDimensionBadgeProps {
  dimensao: string; // Ex: "800x800 px (1:1)" ou "1200x400 px (3:1)"
  tipo: string; // Ex: "Logo", "Banner de Capa", "Foto do Produto", "Oferta Promocional"
  promptExemplo: string;
  className?: string;
}

export const ImageDimensionBadge: React.FC<ImageDimensionBadgeProps> = ({
  dimensao,
  tipo,
  promptExemplo,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(promptExemplo).then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      });
    } else {
      window.prompt('Copie o prompt abaixo:', promptExemplo);
    }
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Badge de Dimensões e Gatilho do Modal de IA */}
      <div className="flex items-center gap-1.5 bg-slate-100/90 hover:bg-slate-100 border border-slate-200/90 rounded-full px-2.5 py-0.5 text-[10px] text-slate-600 font-medium shadow-2xs transition-colors">
        <span className="font-bold text-slate-700">📐 {dimensao}</span>
        <span className="text-slate-300">|</span>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-extrabold hover:underline cursor-pointer transition-colors"
          title="Ver prompt pronto para IA"
        >
          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
          <span>Gerar com IA</span>
        </button>
      </div>

      {/* Modal Dialog Centralizado e Isolado (Evita quebra de layout e barras de rolagem) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-800 text-left animate-in fade-in zoom-in-95 duration-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white leading-tight">Prompt IA — {tipo}</h3>
                  <span className="text-[11px] font-bold text-indigo-400">Proporção Ideal: {dimensao}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
                title="Fechar"
              >
                ✕
              </button>
            </div>

            {/* Instruction */}
            <p className="text-xs text-slate-300 leading-relaxed">
              💡 <strong>Como usar:</strong> Copie o prompt pronto abaixo e cole em ferramentas como <em>ChatGPT, Midjourney, Leonardo.ai, Ideogram ou Copilot</em> para gerar a imagem exata nas proporções recomendadas do seu catálogo.
            </p>

            {/* Prompt Box */}
            <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed max-h-48 overflow-y-auto select-all shadow-inner">
              "{promptExemplo}"
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={handleCopiar}
                className={`flex-[2] py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                  copiado
                    ? 'bg-emerald-600 text-white shadow-emerald-900/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
                }`}
              >
                {copiado ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Prompt Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Prompt para Gerar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { ShoppingBag, Zap, ShieldCheck, Download, Sparkles, Store } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { setActiveStep, loadSampleDataForNiche, finishOnboarding } = useCatalog();

  const handleStartDemo = (nicho: string) => {
    loadSampleDataForNiche(nicho);
    finishOnboarding();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-center items-center p-4 md:p-8">
      <div className="max-w-3xl w-full bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/60 p-6 md:p-10 shadow-2xl text-center space-y-8">
        
        {/* Badge Header */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs md:text-sm font-semibold tracking-wide">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Versão 2.0 • 100% Front-end & Grátis</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Catálogo Express
          </h1>
          <p className="text-base md:text-xl text-slate-300 max-w-xl mx-auto leading-relaxed">
            Crie seu catálogo digital, cardápio ou vitrine de produtos com pedidos no WhatsApp em menos de 10 minutos.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-100">Onboarding por Nicho</h3>
            <p className="text-xs text-slate-400">Campos dinâmicos e temas curados para o seu tipo de negócio.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-100">Sem Backend ou Mensalidade</h3>
            <p className="text-xs text-slate-400">Dados salvos localmente e hospedagem 100% grátis.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-100">Exportação em 1 Clique</h3>
            <p className="text-xs text-slate-400">Baixe um pacote ZIP pronto para Netlify ou GitHub Pages.</p>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="space-y-4 pt-4">
          <button
            onClick={() => setActiveStep(1)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-3"
          >
            <Store className="w-5 h-5" />
            <span>Criar Meu Catálogo Agora →</span>
          </button>

          {/* Quick Demo Pre-load */}
          <div className="pt-4 border-t border-slate-700/60">
            <p className="text-xs text-slate-400 mb-3">Ou experimente um modelo pronto imediatamente:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => handleStartDemo('restaurante')}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-medium text-slate-200 transition-colors"
              >
                🍔 Demo Restaurante
              </button>
              <button
                onClick={() => handleStartDemo('loja')}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-medium text-slate-200 transition-colors"
              >
                🛍️ Demo Loja de Moda
              </button>
              <button
                onClick={() => handleStartDemo('servicos')}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-medium text-slate-200 transition-colors"
              >
                💇 Demo Barbearia / Serviços
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

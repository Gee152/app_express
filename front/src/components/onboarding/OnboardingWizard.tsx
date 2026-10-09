import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { WelcomeScreen } from './WelcomeScreen';
import { StepNicho } from './StepNicho';
import { StepTema } from './StepTema';
import { StepEmpresa } from './StepEmpresa';
import { StepProdutos } from './StepProdutos';
import { CheckCircle2, ArrowRight, ArrowLeft, Rocket, Moon, Sun, AlertCircle } from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const { activeStep, setActiveStep, completeOnboarding, isDarkMode, toggleDarkMode } = useCatalog();
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  if (activeStep === 0) {
    return <WelcomeScreen />;
  }

  const stepsList = [
    { num: 1, title: 'Nicho' },
    { num: 2, title: 'Tema & Cores' },
    { num: 3, title: 'Empresa' },
    { num: 4, title: 'Produtos' },
  ];

  const handleNext = async () => {
    if (activeStep < 4) {
      setActiveStep(activeStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPublishing(true);
      setPublishError(null);
      try {
        await completeOnboarding();
      } catch (err: any) {
        console.error('Erro ao publicar catálogo:', err);
        setPublishError(err.message || 'Erro ao conectar ao servidor para publicação.');
      } finally {
        setPublishing(false);
      }
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveStep(0);
    }
  };

  return (
    <div className={`min-h-screen bg-[#F5F7FB] dark:bg-[#121212] text-[#212529] dark:text-[#FFFFFF] pb-20 transition-colors ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Top Header & Progress Stepper */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#1E1E1E]/90 backdrop-blur-md border-b border-[#E0E0E0] dark:border-[#333333] shadow-2xs transition-colors">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span className="font-extrabold text-lg text-[#4F3BFF] dark:text-[#A58BFF] tracking-tight">Catálogo Express</span>
          </div>

          {/* Stepper Progress Badges */}
          <div className="hidden sm:flex items-center gap-2">
            {stepsList.map((step) => {
              const isDone = activeStep > step.num;
              const isCurrent = activeStep === step.num;

              return (
                <div key={step.num} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-[#4F3BFF] dark:bg-[#7C4DFF] text-white shadow-xs'
                        : isDone
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                        : 'bg-[#EDF2F7] dark:bg-[#2C2C2C] text-[#6C757D] dark:text-[#B0BEC5]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <span>{step.num}</span>
                    )}
                    <span>{step.title}</span>
                  </div>
                  {step.num < 4 && <div className="w-4 h-[2px] bg-[#E0E0E0] dark:bg-[#333333]" />}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#2C2C2C] text-[#212529] dark:text-amber-400 hover:brightness-95 transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
              title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="text-xs font-bold text-[#6C757D] dark:text-[#B0BEC5] sm:hidden">
              Passo {activeStep} de 4
            </div>
          </div>
        </div>
      </header>

      {/* Main Wizard Content Area */}
      <main className="max-w-5xl mx-auto px-4 pt-8">
        {activeStep === 1 && <StepNicho />}
        {activeStep === 2 && <StepTema />}
        {activeStep === 3 && <StepEmpresa />}
        {activeStep === 4 && <StepProdutos />}
      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className="fixed bottom-0 inset-x-0 bg-white dark:bg-[#1E1E1E] border-t border-[#E0E0E0] dark:border-[#333333] p-4 shadow-lg z-30 transition-colors">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={handlePrev}
              disabled={publishing}
              className="px-5 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] hover:bg-slate-50 dark:hover:bg-[#2C2C2C] font-bold text-xs text-[#212529] dark:text-[#B0BEC5] transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            {publishError && (
              <div className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{publishError}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={publishing}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-extrabold text-sm text-white transition-all shadow-md cursor-pointer inline-flex items-center justify-center gap-2 ${
              publishing ? 'opacity-70 cursor-not-allowed' : ''
            } ${
              activeStep === 4
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                : 'bg-[#4F3BFF] dark:bg-[#7C4DFF] hover:brightness-110 shadow-indigo-600/20'
            }`}
          >
            {activeStep === 4 ? (
              publishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publicando no servidor...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>Publicar Catálogo & Ir ao Painel →</span>
                </>
              )
            ) : (
              <>
                <span>Avançar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

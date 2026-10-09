import React from 'react';
import { Download, X, Smartphone, Share, PlusSquare, MoreVertical, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS?: boolean;
  canInstallPrompt?: boolean;
  onInstallDirect?: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isIOS = false,
  canInstallPrompt = false,
  onInstallDirect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-indigo-700/80 hover:bg-indigo-800 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
              📱
            </div>
            <div>
              <h2 className="text-xl font-extrabold leading-tight">Baixar Aplicativo PWA</h2>
              <p className="text-xs text-indigo-100 font-medium mt-0.5">Acesso rápido direto da tela inicial do seu celular ou PC</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          
          {/* Direct Install Button if supported */}
          {canInstallPrompt && onInstallDirect && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-3">
              <div className="flex items-center gap-2 font-extrabold text-sm text-emerald-800">
                <Zap className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Instalação Direta Disponível!</span>
              </div>
              <p className="text-xs text-emerald-700">
                Seu navegador suporta a instalação imediata em 1 clique sem precisar acessar menus.
              </p>
              <button
                onClick={() => {
                  onInstallDirect();
                  onClose();
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Aplicativo Agora</span>
              </button>
            </div>
          )}

          {/* Perks list */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-lg">🚀</span>
              <p className="text-[11px] font-bold text-slate-700 mt-1">Mais Rápido</p>
              <p className="text-[10px] text-slate-400">Carrega instantaneamente</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-lg">📲</span>
              <p className="text-[11px] font-bold text-slate-700 mt-1">Tela Cheia</p>
              <p className="text-[10px] text-slate-400">Sem barra de URL</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-lg">🔒</span>
              <p className="text-[11px] font-bold text-slate-700 mt-1">100% Seguro</p>
              <p className="text-[10px] text-slate-400">Sem ocupar memória</p>
            </div>
          </div>

          {/* Instructions section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span>Como Instalar Passo a Passo</span>
            </h3>

            {isIOS ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-700">
                <p className="font-bold text-slate-900 text-sm">No iPhone / iPad (Safari):</p>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">1</div>
                  <p>Toque no botão de <strong>Compartilhar</strong> <Share className="w-3.5 h-3.5 inline text-indigo-600" /> na barra inferior do Safari.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">2</div>
                  <p>Role o menu para baixo e toque em <PlusSquare className="w-3.5 h-3.5 inline text-indigo-600" /> <strong>"Adicionar à Tela de Início"</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">3</div>
                  <p>Confirme clicando em <strong>Adicionar</strong> no canto superior direito.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-700">
                <p className="font-bold text-slate-900 text-sm">No Smartphone / Chrome / Edge:</p>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">1</div>
                  <p>Toque no menu de 3 pontos <MoreVertical className="w-3.5 h-3.5 inline text-indigo-600" /> no canto superior do navegador.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">2</div>
                  <p>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">3</div>
                  <p>Aguarde o ícone ser criado na área de trabalho ou menu do seu celular!</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
            >
              Entendi, fechar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

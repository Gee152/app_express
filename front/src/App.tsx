import React, { Suspense, lazy } from 'react';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import { Loader2, Store } from 'lucide-react';

// Code-splitting: cada tela vira um chunk separado, carregado sob demanda.
// As telas usam named exports; React.lazy espera `default`, então mapeamos.
const OnboardingWizard = lazy(() => import('./components/onboarding/OnboardingWizard').then((m) => ({ default: m.OnboardingWizard })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const PublicCatalog = lazy(() => import('./components/public/PublicCatalog').then((m) => ({ default: m.PublicCatalog })));
const StoreManager = lazy(() => import('./components/admin/StoreManager').then((m) => ({ default: m.StoreManager })));
const CadastroScreen = lazy(() => import('./components/auth/CadastroScreen').then((m) => ({ default: m.CadastroScreen })));
const LoginScreen = lazy(() => import('./components/auth/LoginScreen').then((m) => ({ default: m.LoginScreen })));
const PedidosView = lazy(() => import('./components/admin/PedidosView').then((m) => ({ default: m.PedidosView })));

const LoadingScreen: React.FC = () => {
  const { empresa } = useCatalog();

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex flex-col items-center justify-center p-4 z-50">
      <div className="flex flex-col items-center gap-4 text-center max-w-xs animate-fade-in">
        {empresa?.logo ? (
          <img
            src={empresa.logo}
            alt={empresa.nome || 'Logo da Loja'}
            className="w-20 h-20 rounded-2xl object-cover shadow-xl border border-slate-800 animate-pulse"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg animate-pulse">
            <Store className="w-8 h-8" />
          </div>
        )}

        <div className="space-y-1">
          <h2 className="font-extrabold text-lg text-slate-100">
            {empresa?.nome || 'Carregando Loja...'}
          </h2>
          <p className="text-xs text-slate-400">Preparando o catálogo digital para você</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-slate-800 text-xs font-semibold text-indigo-400 mt-2 shadow-xs">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          <span>Carregando vitrine...</span>
        </div>
      </div>
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { activeView, isLoading, isClienteLogado } = useCatalog();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Cliente logado não tem acesso ao Super Admin (Lojas)
  const view = isClienteLogado && activeView === 'storemanager' ? 'admin' : activeView;

  return (
    <Suspense fallback={<LoadingScreen />}>
      {view === 'admin' && <AdminDashboard />}
      {view === 'storemanager' && <StoreManager />}
      {view === 'public' && <PublicCatalog />}
      {view === 'cadastro' && <CadastroScreen />}
      {(view === 'login' || view === 'superadmin-login') && <LoginScreen />}
      {view === 'onboarding' && <OnboardingWizard />}
      {view === 'pedidos' && <PedidosView />}
    </Suspense>
  );
};

export default function App() {
  return (
    <CatalogProvider>
      <MainAppContent />
    </CatalogProvider>
  );
}
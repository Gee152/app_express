import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Customer, CustomerPet } from '../types';
import { api } from '../services/api';

export interface CustomerRegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  hasTransportBox: boolean;
  petName: string;
  petBreed?: string;
  petSpecies?: string;
  petSpecialCare?: string;
  pets?: Array<{
    name: string;
    breed?: string;
    species?: string;
    specialCare?: string;
    hasTransportBox?: boolean;
  }>;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedPetId: string | null;
  selectedPet: CustomerPet | null;
  setSelectedPetId: (id: string) => void;
  login: (email: string, password: string, slug?: string) => Promise<{ ok: boolean; message?: string }>;
  register: (data: CustomerRegisterData, slug?: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  // Modal control
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register', onAuthSuccess?: () => void) => void;
  closeAuthModal: () => void;
  onAuthSuccessCallback: (() => void) | null;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

function getStoreSlugFromUrl(): string {
  if (typeof window === 'undefined') return 'default';
  const params = new URLSearchParams(window.location.search);
  const lojaParam = params.get('loja') || params.get('slug');
  if (lojaParam) return lojaParam.toLowerCase().trim();

  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts.length > 0 && parts[0] !== 'admin' && parts[0] !== 'pedidos' && parts[0] !== 'agendamentos') {
    return parts[0].toLowerCase().trim();
  }
  return 'default';
}

function getStorageKey(slug?: string): string {
  const currentSlug = slug || getStoreSlugFromUrl();
  return `customer_auth_session_${currentSlug}`;
}

export const CustomerAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [onAuthSuccessCallback, setOnAuthSuccessCallback] = useState<(() => void) | null>(null);

  // Load session from storage on mount
  useEffect(() => {
    try {
      const key = getStorageKey();
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.customer && parsed.token) {
          setCustomer(parsed.customer);
          setToken(parsed.token);
          if (parsed.customer.pets && parsed.customer.pets.length > 0) {
            setSelectedPetId(parsed.customer.pets[0].id);
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar sessão do cliente:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update selected pet if customer pets change
  useEffect(() => {
    if (customer && customer.pets && customer.pets.length > 0) {
      if (!selectedPetId || !customer.pets.some((p) => p.id === selectedPetId)) {
        setSelectedPetId(customer.pets[0].id);
      }
    } else {
      setSelectedPetId(null);
    }
  }, [customer, selectedPetId]);

  const saveSession = useCallback((newCustomer: Customer, newToken: string, slug?: string) => {
    setCustomer(newCustomer);
    setToken(newToken);
    if (newCustomer.pets && newCustomer.pets.length > 0) {
      setSelectedPetId(newCustomer.pets[0].id);
    }
    try {
      const key = getStorageKey(slug);
      localStorage.setItem(key, JSON.stringify({ customer: newCustomer, token: newToken }));
    } catch (e) {
      console.warn('Erro ao salvar sessão no localStorage:', e);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string, slug?: string): Promise<{ ok: boolean; message?: string }> => {
      const targetSlug = slug || getStoreSlugFromUrl();
      try {
        const res = await api.customerAuth.login(targetSlug, { email, password });
        if (res && res.customer && res.token) {
          saveSession(res.customer, res.token, targetSlug);
          setIsAuthModalOpen(false);
          if (onAuthSuccessCallback) {
            onAuthSuccessCallback();
            setOnAuthSuccessCallback(null);
          }
          return { ok: true };
        }
        return { ok: false, message: 'Resposta inválida do servidor.' };
      } catch (err: any) {
        // Fallback para desenvolvimento offline se o backend ainda estiver migrando
        const localKey = `mock_customer_db_${targetSlug}`;
        const localUsersRaw = localStorage.getItem(localKey);
        if (localUsersRaw) {
          try {
            const users: Array<Customer & { passwordHash?: string; passwordPlain?: string }> = JSON.parse(localUsersRaw);
            const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
            if (found && (found.passwordPlain === password || !found.passwordPlain)) {
              const mockToken = `mock_cust_tok_${Date.now()}`;
              saveSession(found, mockToken, targetSlug);
              setIsAuthModalOpen(false);
              if (onAuthSuccessCallback) {
                onAuthSuccessCallback();
                setOnAuthSuccessCallback(null);
              }
              return { ok: true };
            }
          } catch {
            // ignore
          }
        }
        return { ok: false, message: err?.message || 'Falha ao autenticar cliente.' };
      }
    },
    [saveSession, onAuthSuccessCallback]
  );

  const register = useCallback(
    async (data: CustomerRegisterData, slug?: string): Promise<{ ok: boolean; message?: string }> => {
      const targetSlug = slug || getStoreSlugFromUrl();
      try {
        const res = await api.customerAuth.register(targetSlug, data);
        if (res && res.customer && res.token) {
          saveSession(res.customer, res.token, targetSlug);
          setIsAuthModalOpen(false);
          if (onAuthSuccessCallback) {
            onAuthSuccessCallback();
            setOnAuthSuccessCallback(null);
          }
          return { ok: true };
        }
        return { ok: false, message: 'Não foi possível cadastrar o cliente.' };
      } catch (err: any) {
        // Fallback local se a rota remota falhar
        const newPets: CustomerPet[] = [];
        if (data.pets && data.pets.length > 0) {
          data.pets.forEach((p, idx) => {
            if (p.name.trim()) {
              newPets.push({
                id: `pet_${Date.now()}_${idx}`,
                name: p.name.trim(),
                breed: p.breed?.trim() || '',
                species: p.species || 'cao',
                specialCare: p.specialCare?.trim() || '',
                hasTransportBox: p.hasTransportBox ?? data.hasTransportBox,
              });
            }
          });
        } else if (data.petName && data.petName.trim()) {
          newPets.push({
            id: `pet_${Date.now()}_0`,
            name: data.petName.trim(),
            breed: data.petBreed?.trim() || '',
            species: data.petSpecies || 'cao',
            specialCare: data.petSpecialCare?.trim() || '',
            hasTransportBox: data.hasTransportBox,
          });
        }

        const fallbackCustomer: Customer = {
          id: `cust_${Date.now()}`,
          storeId: targetSlug,
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          phone: data.phone.trim(),
          hasTransportBox: data.hasTransportBox,
          pets: newPets,
          createdAt: new Date().toISOString(),
        };

        const localKey = `mock_customer_db_${targetSlug}`;
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        existing.push({ ...fallbackCustomer, passwordPlain: data.password });
        localStorage.setItem(localKey, JSON.stringify(existing));

        const mockToken = `mock_cust_tok_${Date.now()}`;
        saveSession(fallbackCustomer, mockToken, targetSlug);
        setIsAuthModalOpen(false);
        if (onAuthSuccessCallback) {
          onAuthSuccessCallback();
          setOnAuthSuccessCallback(null);
        }
        return { ok: true };
      }
    },
    [saveSession, onAuthSuccessCallback]
  );

  const logout = useCallback(() => {
    setCustomer(null);
    setToken(null);
    setSelectedPetId(null);
    try {
      const key = getStorageKey();
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Erro ao deslogar cliente:', e);
    }
  }, []);

  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login', onAuthSuccess?: () => void) => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    if (onAuthSuccess) {
      setOnAuthSuccessCallback(() => onAuthSuccess);
    } else {
      setOnAuthSuccessCallback(null);
    }
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setOnAuthSuccessCallback(null);
  }, []);

  const selectedPet = customer?.pets?.find((p) => p.id === selectedPetId) || (customer?.pets?.[0] ?? null);

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        isAuthenticated: Boolean(customer && token),
        isLoading,
        selectedPetId,
        selectedPet,
        setSelectedPetId,
        login,
        register,
        logout,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        onAuthSuccessCallback,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};

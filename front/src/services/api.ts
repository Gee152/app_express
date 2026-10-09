const API_BASE_URL = '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = sessionStorage.getItem('catalogo_jwt_token') || localStorage.getItem('catalogo_jwt_token');
    }
  }

  public setToken(token: string | null, persist = false): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        sessionStorage.setItem('catalogo_jwt_token', token);
        if (persist) localStorage.setItem('catalogo_jwt_token', token);
      } else {
        sessionStorage.removeItem('catalogo_jwt_token');
        localStorage.removeItem('catalogo_jwt_token');
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'Erro na requisição ao servidor.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || (errorData.errors ? errorData.errors.join(', ') : errorMessage);
      } catch {
        errorMessage = `Erro ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  // --- Auth API ---
  public auth = {
    login: async (email: string, password: string) => {
      const data = await this.request<{
        token: string;
        user: { id: string; name: string; email: string; role: string; storeId: string | null };
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      this.setToken(data.token);
      return data;
    },

    register: async (payload: { name: string; email: string; password: string; storeId?: string }) => {
      const data = await this.request<{
        id: string;
        name: string;
        email: string;
        role: string;
        storeId: string | null;
        createdAt: string;
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    },

    me: async () => {
      return this.request<{ user: { userId: string; storeId: string | null; role: string } }>('/auth/me');
    },

    logout: () => {
      this.setToken(null);
    },
  };

  // --- Stores API ---
  public stores = {
    list: async () => {
      return this.request<Array<{
        id: string;
        slug: string;
        name: string;
        whatsapp: string;
        status: string;
        config: Record<string, any>;
        createdAt: string;
        updatedAt: string;
      }>>('/stores');
    },

    getBySlug: async (slug: string) => {
      return this.request<{
        id: string;
        slug: string;
        name: string;
        whatsapp: string;
        status: string;
        config: Record<string, any>;
        createdAt: string;
        updatedAt: string;
      }>(`/stores/${slug}`);
    },

    create: async (payload: { name: string; slug: string; whatsapp?: string; status?: string; config?: Record<string, any> }) => {
      return this.request<{
        id: string;
        slug: string;
        name: string;
        whatsapp: string;
        status: string;
        config: Record<string, any>;
        createdAt: string;
        updatedAt: string;
      }>('/stores', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    update: async (slug: string, payload: { name?: string; whatsapp?: string; status?: string; config?: Record<string, any> }) => {
      return this.request<{
        id: string;
        slug: string;
        name: string;
        whatsapp: string;
        status: string;
        config: Record<string, any>;
        createdAt: string;
        updatedAt: string;
      }>(`/stores/${slug}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    delete: async (slug: string) => {
      return this.request<void>(`/stores/${slug}`, {
        method: 'DELETE',
      });
    },

    togglePayment: async (slug: string, isPaid: boolean) => {
      return this.request<{
        store: any;
        subscription: {
          status: string;
          planType: string;
          planDays: number;
          daysRemaining: number;
          expiresAt: string | null;
          expiresAtISO: string | null;
          isPaid: boolean;
          isActive: boolean;
          isExpiringSoon: boolean;
          isExpired: boolean;
        };
      }>(`/stores/${slug}/payment`, {
        method: 'PATCH',
        body: JSON.stringify({ isPaid }),
      });
    },

    selectPlan: async (slug: string, planType: string) => {
      return this.request<{
        store: any;
        subscription: {
          status: string;
          planType: string;
          planDays: number;
          daysRemaining: number;
          expiresAt: string | null;
          expiresAtISO: string | null;
          isPaid: boolean;
          isActive: boolean;
          isExpiringSoon: boolean;
          isExpired: boolean;
        };
      }>(`/stores/${slug}/plan`, {
        method: 'PATCH',
        body: JSON.stringify({ planType }),
      });
    },

    getSubscription: async (slug: string) => {
      return this.request<{
        status: string;
        planType: string;
        planDays: number;
        daysRemaining: number;
        expiresAt: string | null;
        expiresAtISO: string | null;
        isPaid: boolean;
        isActive: boolean;
        isExpiringSoon: boolean;
        isExpired: boolean;
      }>(`/stores/${slug}/subscription`);
    },
  };

  // --- Users API (Superroot) ---
  public users = {
    list: async () => {
      return this.request<Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        storeId: string | null;
        createdAt: string;
        store?: {
          id: string;
          name: string;
          slug: string;
          status: string;
          whatsapp?: string;
        } | null;
      }>>('/users');
    },
  };
}


export const api = new ApiService();

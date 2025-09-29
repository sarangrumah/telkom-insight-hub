import { apiFetch } from '@/lib/apiClient';

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category_id: string | null;
  is_active: boolean;
  file_url: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface FaqCategory {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

export interface FaqCreatePayload {
  question: string;
  answer: string;
  category_id?: string | 'none' | null;
  is_active?: boolean;
  file_url?: string | null;
}

export type FaqUpdatePayload = Partial<FaqCreatePayload>;

export interface CategoryCreatePayload {
  name: string;
  description?: string | null;
}

export type CategoryUpdatePayload = Partial<CategoryCreatePayload>;

function toQuery(params?: Record<string, string | number | undefined>) {
  if (!params) return '';
  const q = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return q ? `?${q}` : '';
}

export const FAQApi = {
  // Public
  async listPublic(params?: { search?: string; category_id?: string }) : Promise<Faq[]> {
    const res = await apiFetch(`/api/faqs${toQuery(params)}`);
    return res.faqs ?? [];
  },
  async listCategoriesPublic(): Promise<FaqCategory[]> {
    const res = await apiFetch('/api/faq-categories');
    return res.categories ?? [];
  },

  // Admin
  async adminList(): Promise<Faq[]> {
    const res = await apiFetch('/api/admin/faqs');
    return res.faqs ?? [];
  },
  async create(data: FaqCreatePayload): Promise<Faq> {
    const res = await apiFetch('/api/faqs', { method: 'POST', body: JSON.stringify(data) });
    return res.data as Faq;
  },
  async update(id: string, data: FaqUpdatePayload): Promise<Faq> {
    const res = await apiFetch(`/api/faqs/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    return res.data as Faq;
  },
  async remove(id: string): Promise<void> {
    await apiFetch(`/api/faqs/${id}`, { method: 'DELETE' });
  },
  categories: {
    async create(data: CategoryCreatePayload): Promise<FaqCategory> {
      const res = await apiFetch('/api/faq-categories', { method: 'POST', body: JSON.stringify(data) });
      return res.data as FaqCategory;
    },
    async update(id: string, data: CategoryUpdatePayload): Promise<FaqCategory> {
      const res = await apiFetch(`/api/faq-categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      return res.data as FaqCategory;
    },
    async remove(id: string): Promise<void> {
      await apiFetch(`/api/faq-categories/${id}`, { method: 'DELETE' });
    },
  },
};
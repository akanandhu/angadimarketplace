import { api } from '../client';
import type { Brand, District, Model, Variant } from '../types';

export const catalogueApi = {
  districts: () => api<District[]>('/locations/districts'),
  brands: () => api<Brand[]>('/vehicle-catalogue/brands'),
  models: (brandId: string) => api<Model[]>(`/vehicle-catalogue/brands/${brandId}/models`),
  variants: (modelId: string) => api<Variant[]>(`/vehicle-catalogue/models/${modelId}/variants`),
  resolve: (brand: string, model?: string) =>
    api<{ brand: Model | null; model: Model | null }>('/vehicle-catalogue/resolve', {
      query: { brand, model },
    }),
};

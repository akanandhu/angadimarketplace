'use client';

import { useQuery } from '@tanstack/react-query';
import { catalogueApi } from '@/lib/api/endpoints/catalogue';
import { keys } from '@/lib/query/keys';

const DAY = 24 * 60 * 60 * 1000;

export const useDistricts = () =>
  useQuery({ queryKey: keys.districts, queryFn: catalogueApi.districts, staleTime: DAY });

export const useBrands = () =>
  useQuery({ queryKey: keys.brands, queryFn: catalogueApi.brands, staleTime: DAY });

export const useModels = (brandId?: string) =>
  useQuery({
    queryKey: keys.models(brandId ?? ''),
    queryFn: () => catalogueApi.models(brandId!),
    enabled: Boolean(brandId),
    staleTime: DAY,
  });

export const useVariants = (modelId?: string) =>
  useQuery({
    queryKey: keys.variants(modelId ?? ''),
    queryFn: () => catalogueApi.variants(modelId!),
    enabled: Boolean(modelId),
    staleTime: DAY,
  });

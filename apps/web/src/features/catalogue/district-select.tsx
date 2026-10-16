'use client';

import { cn } from '@/lib/cn';
import { useDistricts } from './hooks';

interface Props {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Use slugs (search) instead of ids (forms). */
  by?: 'id' | 'slug';
  placeholder?: string;
  className?: string;
}

export function DistrictSelect({ id, value, onChange, by = 'id', placeholder, className }: Props) {
  const { data: districts = [] } = useDistricts();
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        'h-11 w-full rounded-input border border-line-strong bg-surface px-3 text-[15px] focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none',
        className,
      )}
    >
      <option value="">{placeholder ?? 'Select district'}</option>
      {districts.map((district) => (
        <option key={district.id} value={by === 'id' ? district.id : district.slug}>
          {district.name}
        </option>
      ))}
    </select>
  );
}

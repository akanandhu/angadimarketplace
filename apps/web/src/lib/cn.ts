import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Joins classes and lets later Tailwind utilities override earlier conflicting ones. */
export const cn = (...values: ClassValue[]) => twMerge(clsx(values));

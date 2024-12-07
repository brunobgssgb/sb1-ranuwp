import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCode(code: string): string {
  // Remove any existing dashes and clean the code
  return code.replace(/\D/g, '');
}

export function isValidCode(code: string): boolean {
  // Remove any dashes for validation
  const cleanCode = code.replace(/\D/g, '');
  return /^\d{16}$/.test(cleanCode);
}

export function cleanCode(code: string): string {
  // Remove any non-digit characters
  return code.replace(/\D/g, '');
}
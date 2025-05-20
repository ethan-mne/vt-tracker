import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle different phone number formats
  if (digits.length === 10) {
    // US/Canada format: (XXX) XXX-XXXX
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // US/Canada with country code: 1 (XXX) XXX-XXXX
    return digits.replace(/1(\d{3})(\d{3})(\d{4})/, '1 ($1) $2-$3');
  } else if (digits.length === 12 && digits.startsWith('33')) {
    // French format: +33 X XX XX XX XX
    return digits.replace(/33(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '+33 $1 $2 $3 $4 $5');
  }
  
  // Return original if no known format matches
  return phone;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
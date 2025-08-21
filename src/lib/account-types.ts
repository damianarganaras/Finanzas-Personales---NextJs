/**
 * Utilidades para manejar tipos de cuenta y su display en español
 */

import { Wallet, CreditCard, Landmark, TrendingUp, LucideIcon } from 'lucide-react';

export type AccountTypeKey = 'asset' | 'liability' | 'expense' | 'revenue';

export const ACCOUNT_TYPE_NAMES: Record<AccountTypeKey, string> = {
  asset: 'Activo',
  liability: 'Pasivo',
  expense: 'Gasto',
  revenue: 'Ingreso',
} as const;

export const ACCOUNT_TYPE_COLORS: Record<AccountTypeKey, string> = {
  asset: 'bg-green-100 text-green-800',
  liability: 'bg-red-100 text-red-800',
  expense: 'bg-orange-100 text-orange-800',
  revenue: 'bg-blue-100 text-blue-800'
} as const;

export const ACCOUNT_TYPE_ICONS: Record<AccountTypeKey, LucideIcon> = {
  asset: Wallet,
  liability: CreditCard,
  expense: TrendingUp,
  revenue: Landmark
} as const;

/**
 * Normaliza una cadena de tipo de cuenta a la clave canónica en minúsculas
 */
export function normalizeAccountType(type: string | undefined | null): AccountTypeKey | null {
  if (!type) return null;
  const key = String(type).toLowerCase() as AccountTypeKey;
  return (['asset', 'liability', 'expense', 'revenue'] as const).includes(key)
    ? key
    : null;
}

/**
 * Obtiene el nombre en español de un tipo de cuenta
 */
export function getAccountTypeName(type: string): string {
  const key = normalizeAccountType(type);
  return key ? ACCOUNT_TYPE_NAMES[key] : type;
}

/**
 * Obtiene las clases CSS para el color de badge de un tipo de cuenta
 */
export function getAccountTypeColor(type: string): string {
  const key = normalizeAccountType(type);
  return key ? ACCOUNT_TYPE_COLORS[key] : 'bg-gray-100 text-gray-800';
}

/**
 * Obtiene el componente de icono para un tipo de cuenta
 */
export function getAccountTypeIconComponent(type: string): LucideIcon {
  const key = normalizeAccountType(type);
  return key ? ACCOUNT_TYPE_ICONS[key] : Wallet;
}

/**
 * Verifica si un tipo de cuenta es válido
 */
export function isValidAccountType(type: string): type is AccountTypeKey {
  return normalizeAccountType(type) !== null;
}

/**
 * Filtra cuentas por tipo
 */
export function filterAccountsByType<T extends { accountType: { type: string } }>(
  accounts: T[], 
  type: AccountTypeKey
): T[] {
  const target = normalizeAccountType(type) as AccountTypeKey;
  return accounts.filter((account) => normalizeAccountType(account.accountType.type) === target);
}

/**
 * Obtiene todos los tipos de cuenta válidos
 */
export function getAccountTypes(): AccountTypeKey[] {
  return Object.keys(ACCOUNT_TYPE_NAMES) as AccountTypeKey[];
}

/**
 * Obtiene todas las opciones de tipos de cuenta para formularios
 */
export function getAccountTypeOptions(): Array<{ value: AccountTypeKey; label: string }> {
  return getAccountTypes().map(type => ({
    value: type,
    label: ACCOUNT_TYPE_NAMES[type]
  }));
}

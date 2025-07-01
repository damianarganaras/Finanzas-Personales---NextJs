export * from './auth';
export * from './account';
export * from './transaction';

// Tipos para monedas
export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

// Tipos para tipos de cuenta
export interface AccountType {
  id: string;
  type: string;
  name?: string;
  description?: string;
}

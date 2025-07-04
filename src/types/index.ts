export * from './auth';
export * from './account';
export * from './transaction';
export * from './credit-card';
export * from './budget';

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

// Tipos para categorías
export interface Category {
  id: string;
  name: string;
  userId: string;
  userGroupId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para tags/etiquetas
export interface Tag {
  id: string;
  name: string;
  userId: string;
  userGroupId: string;
  createdAt: Date;
  updatedAt: Date;
}

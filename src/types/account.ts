import { Decimal } from '@prisma/client/runtime/library';

export interface Account {
  id: string;
  name: string;
  accountTypeId: string;
  virtualBalance?: Decimal | null;
  iban?: string;
  active: boolean;
  userId: string;
  userGroupId: string;
  currencyId: string;
  createdAt: Date;
  updatedAt: Date;
  accountType: AccountType;
  currency: Currency;
}

export interface AccountType {
  id: string;
  type: 'asset' | 'expense' | 'revenue' | 'liability';
  name: string;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

export type AccountFormData = {
  name: string;
  accountTypeId: string;
  virtualBalance?: number;
  iban?: string;
  active: boolean;
  currencyId: string;
};

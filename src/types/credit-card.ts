import { Decimal } from '@prisma/client/runtime/library';
import { Account } from './account';
import { Transaction } from './transaction';

export interface CreditCard {
  id: string;
  name: string;
  last4Digits: string;
  limit: Decimal;
  closingDay: number;
  dueDay: number;
  active: boolean;
  userId: string;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
  account: Account;
  purchases: CreditCardPurchase[];
}

export interface CreditCardPurchase {
  id: string;
  creditCardId: string;
  transactionId: string;
  totalAmount: Decimal;
  installments: number;
  hasInterest: boolean;
  interestRate?: Decimal | null;
  description: string;
  purchaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
  creditCard: CreditCard;
  transaction: Transaction;
  installmentPayments: InstallmentPayment[];
}

export interface InstallmentPayment {
  id: string;
  creditCardPurchaseId: string;
  installmentNumber: number;
  amount: Decimal;
  dueDate: Date;
  paidDate?: Date | null;
  transactionId?: string | null;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
  creditCardPurchase: CreditCardPurchase;
  paymentTransaction?: Transaction | null;
}

export type CreditCardFormData = {
  name: string;
  last4Digits: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  active: boolean;
  accountId: string;
};

export type CreditCardPurchaseFormData = {
  creditCardId: string;
  totalAmount: number;
  installments: number;
  hasInterest: boolean;
  interestRate?: number;
  description: string;
  purchaseDate: Date;
  categoryIds: string[];
  tagIds: string[];
};

export type InstallmentPaymentSummary = {
  totalPending: number;
  totalOverdue: number;
  nextPayments: InstallmentPayment[];
  monthlyTotal: number;
};

export interface Transaction {
  id: string;
  accountId: string;
  transactionJournalId: string;
  amount: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  account: {
    id: string;
    name: string;
    accountType: {
      type: string;
    };
  };
  transactionJournal: TransactionJournal;
  categories: Category[];
  tags: Tag[];
}

export interface TransactionJournal {
  id: string;
  userId: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  transactions: Transaction[];
}

export interface Category {
  id: string;
  name: string;
  userId: string;
}

export interface Tag {
  id: string;
  name: string;
  userId: string;
}

export type TransactionType = 'withdrawal' | 'deposit' | 'transfer';

export type TransactionFormData = {
  type: TransactionType;
  description: string;
  amount: number;
  date: Date;
  sourceAccountId?: string;
  destinationAccountId?: string;
  categoryIds: string[];
  tagIds: string[];
  notes?: string;
};

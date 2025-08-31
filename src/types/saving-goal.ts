export type Currency = 'ARS' | 'USD';

export interface SavingGoal {
  id: string;
  name: string;
  currency: Currency;
  targetAmount: number;
  currentAmount: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface SavingContribution {
  id: string;
  goalId: string;
  amount: number;
  currency: Currency;
  date: string;
  createdAt?: string;
}

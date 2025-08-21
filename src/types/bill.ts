export interface Bill {
  id: string;
  name: string;
  description?: string | null;
  amount: number;
  frequency: string;
  nextDueDate: Date;
  active: boolean;
  autoPayEnabled: boolean;
  userId: string;
  categoryId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: { id: string; name: string } | null;
}

export interface CreateBillData {
  name: string;
  description?: string | null;
  amount: number;
  frequency?: string;
  nextDueDate?: Date;
  active?: boolean;
  autoPayEnabled?: boolean;
  categoryId: string;
}

export interface UpdateBillData {
  name?: string;
  description?: string | null;
  amount?: number;
  frequency?: string;
  nextDueDate?: Date;
  active?: boolean;
  autoPayEnabled?: boolean;
  categoryId?: string | null;
}

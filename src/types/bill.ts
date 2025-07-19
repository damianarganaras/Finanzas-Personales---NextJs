export interface Bill {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  nextDueDate: Date;
  active: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBillData {
  name: string;
  amount: number;
  frequency?: string;
  nextDueDate?: Date;
  active?: boolean;
}

export interface UpdateBillData {
  name?: string;
  amount?: number;
  frequency?: string;
  nextDueDate?: Date;
  active?: boolean;
}

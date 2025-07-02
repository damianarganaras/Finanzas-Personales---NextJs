import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const accountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  accountTypeId: z.string().min(1, 'El tipo de cuenta es requerido'),
  virtualBalance: z.number().optional(),
  iban: z.string().optional(),
  active: z.boolean(),
  currencyId: z.string().min(1, 'La moneda es requerida').optional(),
});

export const transactionSchema = z.object({
  type: z.enum(['withdrawal', 'deposit', 'transfer']),
  description: z.string().min(1, 'La descripción es requerida'),
  amount: z.number().positive('El monto debe ser positivo'),
  date: z.date(),
  sourceAccountId: z.string().optional(),
  destinationAccountId: z.string().optional(),
  categoryIds: z.array(z.string()).optional().default([]),
  tagIds: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.type === 'withdrawal' && !data.sourceAccountId) {
    return false;
  }
  if (data.type === 'deposit' && !data.destinationAccountId) {
    return false;
  }
  if (data.type === 'transfer' && (!data.sourceAccountId || !data.destinationAccountId)) {
    return false;
  }
  return true;
}, {
  message: "Debe seleccionar las cuentas apropiadas según el tipo de transacción",
});

export const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
});

export const budgetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  active: z.boolean().default(true),
  amount: z.number().positive('El monto debe ser positivo'),
  startDate: z.date(),
  endDate: z.date(),
  categoryIds: z.array(z.string()).default([]),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AccountFormData = z.infer<typeof accountSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;

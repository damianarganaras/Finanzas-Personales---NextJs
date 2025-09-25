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
  currencyId: z.string().min(1, 'La moneda es requerida'),
});

export const transactionSchema = z.object({
  type: z.enum(['withdrawal', 'deposit', 'transfer']),
  description: z.string().min(1, 'La descripción es requerida'),
  amount: z.number().positive('El monto debe ser positivo'),
  date: z.date(),
  sourceAccountId: z.string().optional(),
  destinationAccountId: z.string().optional(),
  categoryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
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

export const billSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  // Acepta números o strings y los convierte a number positivo
  amount: z.coerce.number().positive('Debe ser un número positivo'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  // Acepta string o Date y los convierte a Date
  nextDueDate: z.coerce.date(),
  frequency: z.enum(['weekly', 'monthly', 'quarterly', 'annually']).default('monthly'),
  active: z.boolean().default(true),
  autoPayEnabled: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AccountFormData = z.infer<typeof accountSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
export type BillFormData = z.infer<typeof billSchema>;

// UserSettings validation (shared)
export const userSettingsSchema = z.object({
  defaultCurrency: z.enum(['ARS', 'USD', 'EUR']).default('ARS'),
  language: z.enum(['es', 'en']).default('es'),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
  numberFormat: z.enum(['es-AR', 'en-US', 'en-GB']).default('es-AR'),
  theme: z.enum(['light', 'dark', 'system']).default('light'),
  dashboardWidgets: z.record(z.boolean()).optional(),
});
export type UserSettingsData = z.infer<typeof userSettingsSchema>;

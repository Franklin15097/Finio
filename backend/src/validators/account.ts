import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100, 'Название слишком длинное'),
  type: z.enum(['cash', 'bank', 'credit', 'investment', 'checking', 'savings', 'emergency'], {
    errorMap: () => ({ message: 'Неверный тип счета' })
  }),
  percentage: z.number().min(0).max(100, 'Процент должен быть от 0 до 100').optional().default(0),
  planned_balance: z.number().optional().default(0),
  actual_balance: z.number().optional().default(0),
  currency: z.string().length(3, 'Валюта должна быть 3 символа (например, USD)').optional().default('RUB'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат цвета').optional().default('#6366f1'),
  icon: z.string().max(50, 'Иконка слишком длинная').optional().default('wallet')
});

export const updateAccountSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100, 'Название слишком длинное').optional(),
  type: z.enum(['cash', 'bank', 'credit', 'investment', 'checking', 'savings', 'emergency']).optional(),
  percentage: z.number().min(0).max(100).optional(),
  planned_balance: z.number().optional(),
  actual_balance: z.number().optional(),
  currency: z.string().length(3).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional()
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

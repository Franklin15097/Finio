import { z } from 'zod';

export const createTransactionSchema = z.object({
  category_id: z.number().int().positive().optional().nullable(),
  amount: z.number().positive().max(1000000000, 'Сумма слишком большая'),
  description: z.string().min(1, 'Описание обязательно').max(255, 'Описание слишком длинное'),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты (YYYY-MM-DD)')
});

export const updateTransactionSchema = z.object({
  category_id: z.number().int().positive().optional().nullable(),
  amount: z.number().positive().max(1000000000, 'Сумма слишком большая').optional(),
  description: z.string().min(1, 'Описание обязательно').max(255, 'Описание слишком длинное').optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты (YYYY-MM-DD)').optional()
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

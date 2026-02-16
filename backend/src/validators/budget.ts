import { z } from 'zod';

export const createBudgetSchema = z.object({
  category_id: z.number().int().positive('ID категории должен быть положительным'),
  limit_amount: z.number().positive('Лимит должен быть положительным').max(1000000000, 'Лимит слишком большой'),
  month: z.number().int().min(1, 'Месяц должен быть от 1 до 12').max(12, 'Месяц должен быть от 1 до 12'),
  year: z.number().int().min(2000, 'Год должен быть больше 2000').max(2100, 'Год должен быть меньше 2100')
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

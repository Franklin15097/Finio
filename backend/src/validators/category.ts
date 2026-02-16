import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(50, 'Название слишком длинное'),
  type: z.enum(['income', 'expense'], { errorMap: () => ({ message: 'Тип должен быть income или expense' }) }),
  icon: z.string().max(50, 'Иконка слишком длинная').optional().default('💰'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат цвета (например, #6366f1)').optional().default('#6366f1')
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(50, 'Название слишком длинное').optional(),
  type: z.enum(['income', 'expense'], { errorMap: () => ({ message: 'Тип должен быть income или expense' }) }).optional(),
  icon: z.string().max(50, 'Иконка слишком длинная').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Неверный формат цвета (например, #6366f1)').optional()
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

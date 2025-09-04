import { z } from 'zod';

// Common validation schemas for the igreja-conciliada project

// Phone number validation (Brazilian format)
export const phoneSchema = z.string()
  .min(10, "Telefone deve ter pelo menos 10 dígitos")
  .max(15, "Telefone deve ter no máximo 15 dígitos")
  .regex(/^[\+]?[0-9\(\)\-\s]+$/, "Formato de telefone inválido");

// Email validation with custom message
export const emailSchema = z.string()
  .email("Formato de email inválido")
  .min(1, "Email é obrigatório");

// Name validation
export const nameSchema = z.string()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(100, "Nome deve ter no máximo 100 caracteres")
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços");

// Password validation
export const passwordSchema = z.string()
  .min(8, "Senha deve ter pelo menos 8 caracteres")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Senha deve conter ao menos uma letra minúscula, maiúscula e um número");

// Date validation for ISO date strings
export const isoDateSchema = z.string()
  .datetime("Data deve estar em formato ISO válido");

// URL validation
export const urlSchema = z.string()
  .url("URL inválida")
  .optional();

// Tenant slug validation (URL-friendly)
export const slugSchema = z.string()
  .min(3, "Slug deve ter pelo menos 3 caracteres")
  .max(50, "Slug deve ter no máximo 50 caracteres")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras minúsculas, números e hífens");

// Money validation (positive numbers with up to 2 decimal places)
export const moneySchema = z.number()
  .nonnegative("Valor deve ser positivo")
  .max(999999.99, "Valor muito alto")
  .refine(
    (val) => Math.floor(val * 100) === val * 100,
    "Valor deve ter no máximo 2 casas decimais"
  );

// Duration in minutes validation
export const durationSchema = z.number()
  .int("Duração deve ser um número inteiro")
  .min(15, "Duração mínima é 15 minutos")
  .max(480, "Duração máxima é 8 horas (480 minutos)");

// Array of strings validation for groups/tags
export const stringArraySchema = z.array(z.string())
  .default([])
  .refine((arr) => arr.every(str => str.trim().length > 0), "Itens não podem estar vazios");

// Common enum schemas
export const userRoleSchema = z.enum(['admin', 'leader', 'member']);
export const memberStatusSchema = z.enum(['active', 'inactive']);
export const appointmentStatusSchema = z.enum(['scheduled', 'completed', 'cancelled']);
export const paymentStatusSchema = z.enum(['pending', 'paid', 'refunded']);
export const leaderTypeSchema = z.enum([
  'Pastor', 
  'Líder de Louvor', 
  'Líder de Jovens', 
  'Líder Infantil', 
  'Diácono', 
  'Presbítero'
]);

// Combined schemas for common use cases
export const addressSchema = z.object({
  street: z.string().min(1, "Rua é obrigatória"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(2).max(2, "Estado deve ter 2 caracteres"),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  country: z.string().default("BR")
}).optional();

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['asc', 'desc']).default('desc')
});

// Search filters schema
export const searchFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  tags: z.array(z.string()).optional()
});

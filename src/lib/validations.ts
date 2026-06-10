import { z } from 'zod';

// Esquema para registro de usuario
export const userRegisterSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(['super_admin', 'university', 'aspirant']).optional().default('aspirant'),
  // Cambiado de universityName (string) a universityId (número o string numérico)
  universityId: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional().or(z.literal('').transform(() => undefined)),
});

// Esquema para login
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

// Esquema para creación de universidad (Admin)
export const universityCreateSchema = z.object({
  name: z.string().min(3, "Nombre muy corto"),
  country: z.string().optional(),
  acronym: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});
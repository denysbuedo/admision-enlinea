import { z } from 'zod';

// Esquema para registro de usuario
export const userRegisterSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(['student', 'admin', 'reviewer']).optional().default('student'),
});

// Esquema para creación de programa
export const programCreateSchema = z.object({
  name: z.string().min(3, "El nombre del programa es muy corto"),
  universityId: z.string().uuid("ID de universidad inválido"),
  degree: z.string().min(2, "El grado es requerido"),
  duration: z.number().int().positive("La duración debe ser positiva"),
  description: z.string().optional(),
});

// Tipos inferidos desde los esquemas
export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type ProgramCreateInput = z.infer<typeof programCreateSchema>;
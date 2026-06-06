import { describe, it, expect } from 'vitest';
import { userRegisterSchema, programCreateSchema } from './validations';

describe('Validaciones con Zod', () => {
  describe('userRegisterSchema', () => {
    it('debería pasar con datos válidos', () => {
      const data = {
        name: "Juan Pérez",
        email: "juan@example.com",
        password: "secure123"
      };
      
      expect(() => userRegisterSchema.parse(data)).not.toThrow();
    });

    it('debería fallar con email inválido', () => {
      const data = {
        name: "Juan",
        email: "no-es-email",
        password: "123456"
      };
      
      expect(() => userRegisterSchema.parse(data)).toThrow();
    });
  });

  describe('programCreateSchema', () => {
    it('debería pasar con datos válidos', () => {
      const data = {
        name: "Ingeniería de Sistemas",
        universityId: "123e4567-e89b-12d3-a456-426614174000",
        degree: "Pregrado",
        duration: 10
      };
      
      expect(() => programCreateSchema.parse(data)).not.toThrow();
    });

    it('debería fallar si la duración es negativa', () => {
      const data = {
        name: "Programa Test",
        universityId: "123e4567-e89b-12d3-a456-426614174000",
        degree: "Test",
        duration: -5
      };
      
      expect(() => programCreateSchema.parse(data)).toThrow();
    });
  });
});
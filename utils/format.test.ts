import { describe, it, expect } from 'vitest';

describe('Utilidades de Formato', () => {
  it('debería formatear una fecha correctamente', () => {
    // Ejemplo simple para validar que vitest corre
    const date = new Date('2024-01-01');
    const formatted = date.toLocaleDateString('es-ES');
    
    expect(formatted).toBe('1/1/2024');
  });

  it('debería capitalizar un string', () => {
    const text = 'hola mundo';
    const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
    
    expect(capitalized).toBe('Hola mundo');
  });
});
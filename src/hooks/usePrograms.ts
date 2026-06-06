import { useState, useEffect } from 'react';

export interface Program {
  id: string;
  name: string;
  universityId: string;
  degree: string;
  duration: number;
  description?: string;
}

export function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/programs')
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar programas');
        return res.json();
      })
      .then((data) => {
        setPrograms(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const createProgram = async (data: Omit<Program, 'id'>) => {
    const res = await fetch('/api/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al crear programa');
    }

    const newProgram = await res.json();
    setPrograms((prev) => [...prev, newProgram]);
    return newProgram;
  };

  return { programs, loading, error, createProgram };
}
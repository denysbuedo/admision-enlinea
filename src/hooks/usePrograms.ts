'use client';

import { useEffect, useState } from 'react';

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

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/programs');
      if (!res.ok) throw new Error('Failed to fetch programs');
      const data = await res.json();
      setPrograms(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createProgram = async (programData: Omit<Program, 'id'>) => {
    const res = await fetch('/api/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(programData),
    });

    if (res.ok) {
      await fetchPrograms();
      return { success: true };
    } else {
      const error = await res.json();
      return { success: false, message: error.message };
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return { programs, loading, error, refetch: fetchPrograms, createProgram };
}
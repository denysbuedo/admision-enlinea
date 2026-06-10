'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface University {
  id: number;
  name: string;
  country: string;
}

export default function AdminUniversitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', country: 'Cuba', acronym: '', website: '' });
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'super_admin')) {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchUniversities();
    }
  }, [session, status, router]);

  const fetchUniversities = async () => {
    const res = await fetch('/api/admin/universities');
    if (res.ok) {
      const data = await res.json();
      setUniversities(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const res = await fetch('/api/admin/universities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      setMsg({ type: 'success', text: 'Universidad creada correctamente' });
      setFormData({ name: '', country: 'Cuba', acronym: '', website: '' });
      fetchUniversities();
    } else {
      setMsg({ type: 'error', text: data.error });
    }
    setLoading(false);
  };

  if (status === 'loading') return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Universidades</h1>

      {msg && (
        <div className={`mb-4 p-4 rounded ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Nueva Universidad</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">País</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Acrónimo (Opcional)</label>
              <input
                type="text"
                value={formData.acronym}
                onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Sitio Web (Opcional)</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Universidad'}
            </button>
          </form>
        </div>

        {/* Lista */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Universidades Registradas</h2>
          <ul className="space-y-2">
            {universities.map((uni) => (
              <li key={uni.id} className="border-b pb-2 flex justify-between items-center">
                <div>
                  <span className="font-medium">{uni.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({uni.country})</span>
                </div>
                {uni.acronym && <span className="text-xs bg-gray-200 px-2 py-1 rounded">{uni.acronym}</span>}
              </li>
            ))}
            {universities.length === 0 && <li className="text-gray-500">No hay universidades registradas.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
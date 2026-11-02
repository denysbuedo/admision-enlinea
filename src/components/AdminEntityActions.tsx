"use client";
import { useEffect, useRef, useState } from 'react';

type Entity = { id: number; name: string; email?: string; role?: string; isActive: boolean;
  universityId?: number | null; country?: string | null; city?: string | null; faculty?: string | null;
  website?: string | null; description?: string | null };
type Institution = { id: number; name: string; isActive: boolean };
export default function AdminEntityActions({ kind, record, institutions = [], onSaved }: {
  kind: 'users' | 'universities'; record: Entity; institutions?: Institution[]; onSaved: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const initial = () => ({ name: record.name, email: record.email || '', role: record.role || 'aspirant',
    isActive: record.isActive, universityId: String(record.universityId || ''), note: '', country: record.country || '',
    city: record.city || '', faculty: record.faculty || '', website: record.website || '', description: record.description || '' });
  const [form, setForm] = useState(initial);
  useEffect(() => { if (open && !dialog.current?.open) dialog.current?.showModal(); }, [open]);
  const institutionChange = form.role === 'university' && (record.role !== 'university' || Number(form.universityId) !== record.universityId);
  async function remove() {
    if (!window.confirm(`¿Eliminar definitivamente ${record.name}? Si tiene datos vinculados se conservará.`)) return;
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/admin/${kind}/${record.id}`, { method: 'DELETE' });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      await onSaved();
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo eliminar'); }
    finally { setBusy(false); }
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    const body = kind === 'users' ? { name: form.name, email: form.email, role: form.role, isActive: form.isActive,
      universityId: form.role === 'university' && form.universityId ? Number(form.universityId) : null, note: form.note }
      : { name: form.name, country: form.country, city: form.city, faculty: form.faculty, website: form.website,
        description: form.description, isActive: form.isActive };
    try {
      const response = await fetch(`/api/admin/${kind}/${record.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      await onSaved(); setOpen(false);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo guardar'); }
    finally { setBusy(false); }
  }
  function text(key: 'name' | 'email' | 'country' | 'city' | 'faculty' | 'website', label: string, required = false, type = 'text') {
    return <label className="block text-sm font-medium">{label}<input className="input-field mt-1" type={type} required={required}
      maxLength={key === 'name' ? (kind === 'users' ? 150 : 200) : key === 'email' ? 254 : key === 'website' ? 500 : 200}
      value={form[key]} onChange={event => setForm(previous => ({ ...previous, [key]: event.target.value }))} /></label>;
  }
  return <div className="space-y-2">
    <div className="flex gap-3"><button className="text-blue-700 text-sm" disabled={busy} onClick={() => { setForm(initial()); setError(''); setOpen(true); }}>Editar</button>
      <button className="text-red-700 text-sm" disabled={busy} onClick={remove}>Eliminar</button></div>
    {error && !open && <p role="alert" className="text-red-700 text-sm">{error}</p>}
    {open && <dialog ref={dialog} onCancel={event => { if (busy) event.preventDefault(); else setOpen(false); }} className="rounded-xl p-0 w-[min(92vw,36rem)] max-h-[90vh] backdrop:bg-black/50">
      <form onSubmit={save} className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Editar {kind === 'users' ? 'usuario' : 'universidad'}</h2>
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {text('name', 'Nombre', true)}
        {kind === 'users' ? <>
          {text('email', 'Correo electrónico', true, 'email')}
          <label className="block">Rol<select aria-label="Rol" className="input-field" value={form.role} onChange={event => setForm(previous => ({ ...previous, role: event.target.value, universityId: event.target.value === 'university' ? previous.universityId : '' }))}>
            <option value="aspirant">Aspirante</option><option value="university">Representante institucional</option><option value="super_admin">Administrador</option>
          </select></label>
          {form.role === 'university' && <>
            <label className="block">Universidad<select aria-label="Universidad" className="input-field" required value={form.universityId} onChange={event => setForm(previous => ({ ...previous, universityId: event.target.value }))}>
              <option value="">Seleccione una universidad</option>{institutions.filter(item => item.isActive || item.id === record.universityId).map(item => <option key={item.id} value={item.id}>{item.name}{item.isActive ? '' : ' (inactiva)'}</option>)}
            </select></label>
            {institutionChange && <label className="block">Verificación de representación institucional<textarea className="input-field" required minLength={10} maxLength={1000}
              value={form.note} onChange={event => setForm(previous => ({ ...previous, note: event.target.value }))} placeholder="Indique cómo verificó la autorización institucional" /></label>}
          </>}
          <p className="text-sm text-slate-600">Los cambios de permisos o datos de cuenta pueden requerir iniciar sesión nuevamente. No puedes eliminar ni desactivar tu propia cuenta administrativa.</p>
        </> : <>{text('country', 'País')}{text('city', 'Ciudad')}{text('faculty', 'Facultad / Unidad')}{text('website', 'Sitio web', false, 'url')}
          <label className="block">Descripción<textarea className="input-field" maxLength={5000} value={form.description} onChange={event => setForm(previous => ({ ...previous, description: event.target.value }))} /></label></>}
        <label className="flex gap-2"><input type="checkbox" checked={form.isActive} onChange={event => setForm(previous => ({ ...previous, isActive: event.target.checked }))} />{kind === 'users' ? 'Cuenta activa' : 'Universidad activa'}</label>
        <div className="flex gap-3"><button className="btn-primary" disabled={busy} type="submit">{busy ? 'Guardando…' : 'Guardar cambios'}</button>
          <button className="btn-secondary" type="button" disabled={busy} onClick={() => setOpen(false)}>Cancelar</button></div>
      </form>
    </dialog>}
  </div>;
}

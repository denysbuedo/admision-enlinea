import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { ManagementError, userEdit, universityEdit, editUser, deleteUser, editUniversity, deleteUniversity } from './admin-management';

export async function manage(request: Request, params: Promise<{ id: string }>, kind: 'users' | 'universities', method: 'PATCH' | 'DELETE') {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.role !== 'super_admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    const { id } = await params;
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });
    if (method === 'DELETE') {
      if (kind === 'users') await deleteUser(Number(id), session.userId);
      else await deleteUniversity(Number(id), session.userId);
    } else {
      const body = await request.json().catch(() => null);
      if (kind === 'users') {
        const parsed = userEdit.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: 'Revisa nombre, correo, rol, actividad e institución' }, { status: 400 });
        await editUser(Number(id), session.userId, parsed.data);
      } else {
        const parsed = universityEdit.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: 'Revisa los datos y usa una web http o https válida' }, { status: 400 });
        await editUniversity(Number(id), session.userId, parsed.data);
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ManagementError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'No se pudo completar la operación' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

const publicOrigin = 'https://convocatorias.reduniv.edu.cu';

export function allowsSameOriginMutation(request: Request): boolean {
  const fetchSite = request.headers.get('sec-fetch-site')?.toLowerCase();
  if (fetchSite === 'cross-site') return false;

  const origin = request.headers.get('origin');
  if (origin === null) return true;
  if (origin === 'null') return false;

  try {
    const parsedOrigin = new URL(origin);
    const expectedOrigin = process.env.NODE_ENV === 'production'
      ? publicOrigin
      : new URL(request.url).origin;
    return parsedOrigin.origin === origin && parsedOrigin.origin === expectedOrigin;
  } catch {
    return false;
  }
}

export function rejectCrossOriginMutation(request: Request): NextResponse | null {
  if (allowsSameOriginMutation(request)) return null;
  return NextResponse.json({ error: 'Origen de solicitud no permitido' }, { status: 403 });
}

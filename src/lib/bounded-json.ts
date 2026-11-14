export type BoundedJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413; error: string };

/** Read a JSON request without allowing an unbounded body allocation. */
export async function readBoundedJson(request: Request, maxBytes: number): Promise<BoundedJsonResult> {
  const contentLength = request.headers.get('content-length');
  if (contentLength !== null) {
    if (!/^\d+$/.test(contentLength)) return { ok: false, status: 400, error: 'Solicitud inválida' };
    if (Number(contentLength) > maxBytes) return { ok: false, status: 413, error: 'La solicitud es demasiado grande' };
  }

  if (!request.body) return { ok: false, status: 400, error: 'Solicitud inválida' };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return { ok: false, status: 413, error: 'La solicitud es demasiado grande' };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, error: 'Solicitud inválida' };
  }

  try {
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, status: 400, error: 'JSON inválido' };
  }
}

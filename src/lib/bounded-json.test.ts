import { describe, expect, it } from 'vitest';
import { readBoundedJson } from './bounded-json';

function jsonRequest(body: string, headers?: HeadersInit): Request {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers,
    body,
  });
}

describe('readBoundedJson', () => {
  it('parses a body at the byte limit', async () => {
    const response = await readBoundedJson(jsonRequest('{"a":1}'), 7);
    expect(response).toEqual({ ok: true, value: { a: 1 } });
  });

  it('rejects a body that exceeds the limit without Content-Length', async () => {
    const response = await readBoundedJson(jsonRequest('{"a":1}'), 6);
    expect(response).toEqual({ ok: false, status: 413, error: 'La solicitud es demasiado grande' });
  });

  it('rejects a declared oversized body before reading it', async () => {
    const response = await readBoundedJson(jsonRequest('{"a":1}', { 'content-length': '99' }), 8);
    expect(response).toEqual({ ok: false, status: 413, error: 'La solicitud es demasiado grande' });
  });

  it('counts UTF-8 bytes rather than JavaScript characters', async () => {
    const response = await readBoundedJson(jsonRequest('{"x":"á"}'), 10);
    expect(response).toEqual({ ok: true, value: { x: 'á' } });
  });

  it('rejects malformed JSON', async () => {
    const response = await readBoundedJson(jsonRequest('{'), 10);
    expect(response).toEqual({ ok: false, status: 400, error: 'JSON inválido' });
  });
});

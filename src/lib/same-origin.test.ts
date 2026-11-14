import { afterEach, describe, expect, it, vi } from 'vitest';
import { allowsSameOriginMutation, rejectCrossOriginMutation } from './same-origin';

afterEach(() => vi.unstubAllEnvs());

describe('same-origin mutation guard', () => {
  it('accepts the canonical production origin', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const request = new Request('http://internal-host/api/programs', {
      method: 'POST',
      headers: { origin: 'https://convocatorias.reduniv.edu.cu' },
    });
    expect(allowsSameOriginMutation(request)).toBe(true);
  });

  it('rejects a different production origin', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const request = new Request('http://internal-host/api/programs', {
      method: 'POST',
      headers: { origin: 'https://attacker.example' },
    });
    expect(allowsSameOriginMutation(request)).toBe(false);
  });

  it('rejects cross-site Fetch Metadata even without Origin', () => {
    const request = new Request('http://localhost:3000/api/programs', {
      method: 'POST',
      headers: { 'sec-fetch-site': 'cross-site' },
    });
    expect(allowsSameOriginMutation(request)).toBe(false);
  });

  it('rejects opaque and malformed origins', () => {
    for (const origin of ['null', 'not-an-origin', 'http://localhost:3000/path']) {
      const request = new Request('http://localhost:3000/api/programs', {
        method: 'POST', headers: { origin },
      });
      expect(allowsSameOriginMutation(request)).toBe(false);
    }
  });

  it('allows same-origin local requests and non-browser clients without Origin', () => {
    const local = new Request('http://localhost:3000/api/programs', {
      method: 'POST', headers: { origin: 'http://localhost:3000' },
    });
    const client = new Request('https://convocatorias.reduniv.edu.cu/api/programs', { method: 'POST' });
    expect(allowsSameOriginMutation(local)).toBe(true);
    expect(allowsSameOriginMutation(client)).toBe(true);
  });

  it('returns 403 for a cross-origin mutation', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const request = new Request('https://convocatorias.reduniv.edu.cu/api/applications', {
      method: 'POST', headers: { origin: 'https://attacker.example' },
    });
    const response = rejectCrossOriginMutation(request);
    expect(response?.status).toBe(403);
    expect(await response?.json()).toEqual({ error: 'Origen de solicitud no permitido' });
  });
});

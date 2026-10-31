import { NextRequest } from 'next/server';
import { notificationStore } from '@/lib/notification-store';
import { verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value || request.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return new Response('Unauthorized', { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return new Response('Invalid token', { status: 401 });

  const encoder = new TextEncoder();
  let cleanup = () => {};
  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let unsubscribe = () => {};
      let timer: ReturnType<typeof setInterval> | undefined;
      const stop = (closeStream: boolean) => {
        if (closed) return;
        closed = true;
        unsubscribe();
        clearInterval(timer);
        request.signal.removeEventListener('abort', close);
        if (closeStream) controller.close();
      };
      const close = () => stop(true);
      cleanup = () => stop(false);
      const validate = async () => {
        if (closed) return false;
        const valid = await verifyToken(token);
        if (closed) return false;
        if (!valid) { close(); return false; }
        return true;
      };
      // Check current authorization before delivering each event, not just at connection time.
      unsubscribe = notificationStore.subscribe(String(payload.userId), data => {
        void validate().then(valid => { if (valid && !closed) controller.enqueue(encoder.encode(data)); });
      });
      timer = setInterval(() => { void validate(); }, 30000);
      request.signal.addEventListener('abort', close, { once: true });
      if (request.signal.aborted) { close(); return; }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));
    },
    cancel() { cleanup(); },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  });
}

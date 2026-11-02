import { manage } from '@/lib/admin-management-route';
type Context = { params: Promise<{ id: string }> };
export function PATCH(request: Request, { params }: Context) { return manage(request, params, 'users', 'PATCH'); }
export function DELETE(request: Request, { params }: Context) { return manage(request, params, 'users', 'DELETE'); }

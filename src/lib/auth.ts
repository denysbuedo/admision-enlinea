import { db } from "@/db";
import { users, universities } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export interface CustomSession {
  userId: number;
  role: "super_admin" | "university" | "aspirant";
  universityId: number | null;
  email?: string;
  user: {
    id: string;
    email: string;
    role: "super_admin" | "university" | "aspirant";
    universityId: number | null;
  };
}

const tokenClaims = z.object({
  userId: z.number().int().positive().safe(),
  email: z.string().email(),
  role: z.enum(['super_admin', 'university', 'aspirant']),
  universityId: z.number().int().positive().safe().nullable(),
  sessionVersion: z.string().regex(/^[a-f0-9]{64}$/),
  revision: z.number().int().nonnegative().safe(),
  iat: z.number().int().nonnegative(),
  exp: z.number().int().positive(),
});
type VerifiedToken = z.infer<typeof tokenClaims>;
type Account = Pick<typeof users.$inferSelect, 'id' | 'email' | 'role' | 'universityId' | 'password' | 'isActive' | 'updatedAt' | 'sessionRevision' | 'institutionalStatus'>;
const lifetime = 7 * 24 * 60 * 60;

function signingSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() !== secret || Buffer.byteLength(secret) < 32 || new Set(secret).size < 8) {
    throw new Error('JWT_SECRET must be configured with a strong random secret of at least 32 bytes');
  }
  return secret;
}

// Keyed fingerprint: never put a password or its hash in the readable JWT payload.
// Database triggers monotonically advance the revision on security-field changes.
function sessionVersion(user: Account, secret: string): string {
  return createHmac('sha256', secret).update(JSON.stringify([
    'convoca-session-v2', user.id, user.email, user.role, user.universityId, user.sessionRevision,
    user.password, user.isActive, user.updatedAt?.getTime() ?? null,
  ])).digest('hex');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: Account): string {
  const secret = signingSecret();
  if (!user.isActive) throw new Error('Inactive account');
  if (user.role === 'university' && user.institutionalStatus !== 'approved') throw new Error('Institutional approval required');
  const payload = {
    userId: user.id, email: user.email, role: user.role, universityId: user.universityId,
    sessionVersion: sessionVersion(user, secret),
    revision: user.sessionRevision,
  };
  const now = Math.floor(Date.now() / 1000);
  tokenClaims.parse({ ...payload, iat: now, exp: now + lifetime });
  return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: lifetime });
}

export async function verifyToken(token: string): Promise<VerifiedToken | null> {
  try {
    const secret = signingSecret();
    const decoded = tokenClaims.safeParse(jwt.verify(token, secret, { algorithms: ['HS256'], maxAge: lifetime }));
    if (!decoded.success) return null;
    const claims = decoded.data;
    const now = Math.floor(Date.now() / 1000);
    if (claims.iat > now || claims.exp <= claims.iat || claims.exp - claims.iat > lifetime) return null;
    const [user] = await db.select().from(users).where(eq(users.id, claims.userId));
    if (!user?.isActive || user.role !== claims.role || user.universityId !== claims.universityId || user.email !== claims.email) return null;
    if (user.sessionRevision !== claims.revision) return null;
    if (user.role === 'university' && user.institutionalStatus !== 'approved') return null;
    if (user.role === 'university') {
      if (!user.universityId) return null;
      const [institution] = await db.select({ isActive: universities.isActive }).from(universities).where(eq(universities.id, user.universityId));
      if (!institution?.isActive) return null;
    }
    const current = Buffer.from(sessionVersion(user, secret), 'hex');
    if (!timingSafeEqual(current, Buffer.from(claims.sessionVersion, 'hex'))) return null;
    return claims;
  } catch {
    // Malformed tokens, invalid configuration and unavailable DB all fail closed.
    return null;
  }
}

export async function getSession(): Promise<CustomSession | null> {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded) return null;
    return {
      userId: decoded.userId, role: decoded.role, universityId: decoded.universityId, email: decoded.email,
      user: { id: String(decoded.userId), email: decoded.email, role: decoded.role, universityId: decoded.universityId },
    };
  } catch {
    return null;
  }
}

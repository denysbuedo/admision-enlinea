import NextAuth, { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Datos inválidos");
        }

        const userList = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);
        
        if (userList.length === 0) {
          throw new Error("Usuario no encontrado");
        }

        const user = userList[0];

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Contraseña incorrecta");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          universityId: user.universityId,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.universityId = user.universityId;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.universityId = token.universityId as number;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.JWT_SECRET,
};

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

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: number; email: string; role: string; universityId: number | null }): string {
  const secret = process.env.JWT_SECRET || "default_secret";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export async function verifyToken(token: string): Promise<any> {
  const secret = process.env.JWT_SECRET || "default_secret";
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

// Función helper para obtener la sesión en servidores (Route Handlers)
export async function getSession(): Promise<CustomSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) return null;

    return {
      userId: decoded.userId,
      role: decoded.role,
      universityId: decoded.universityId,
      email: decoded.email,
      user: {
        id: decoded.userId.toString(),
        email: decoded.email || "",
        role: decoded.role,
        universityId: decoded.universityId,
      },
    };
  } catch (error) {
    console.error("getSession error:", error);
    return null;
  }
}

export default NextAuth(authOptions);

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    universityId: number | null;
  }
  interface Session {
    user: User;
    role?: string;
    userId?: number;
    universityId?: number | null;
  }
}
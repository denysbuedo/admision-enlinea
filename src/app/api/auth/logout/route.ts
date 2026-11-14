import { NextResponse } from "next/server";
import { rejectCrossOriginMutation } from '@/lib/same-origin';

export async function POST(request: Request) {
  const originRejection = rejectCrossOriginMutation(request);
  if (originRejection) return originRejection;
  const response = NextResponse.json({ message: "Sesión cerrada" });
  response.cookies.delete("auth_token");
  return response;
}

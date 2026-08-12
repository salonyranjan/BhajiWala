import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminSession, validAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({}));
  if (!validAdminPassword(password)) return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  const session = createAdminSession(); const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, session.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: session.maxAge });
  return response;
}

export function DELETE() { const response = NextResponse.json({ ok: true }); response.cookies.set(ADMIN_SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 }); return response; }

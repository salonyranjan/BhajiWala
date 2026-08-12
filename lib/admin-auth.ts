import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "bhajiwala_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function signature(value: string) { return createHmac("sha256", process.env.ADMIN_PASSWORD ?? "").update(value).digest("hex"); }

export function validAdminPassword(password: unknown) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof password !== "string") return false;
  const provided = Buffer.from(password); const configured = Buffer.from(expected);
  return provided.length === configured.length && timingSafeEqual(provided, configured);
}

export function createAdminSession() { const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS; return { token: `${expiresAt}.${signature(String(expiresAt))}`, maxAge: SESSION_DURATION_SECONDS }; }

export function isAdminRequest(request: Request) {
  const token = request.headers.get("cookie")?.match(new RegExp(`(?:^|; )${ADMIN_SESSION_COOKIE}=([^;]+)`))?.[1];
  if (!token) return false;
  const [expiresAt, suppliedSignature] = token.split(".");
  if (!expiresAt || !suppliedSignature || Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;
  const supplied = Buffer.from(suppliedSignature); const expected = Buffer.from(signature(expiresAt));
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", service: "bhajiwala", database: "connected" });
  } catch {
    return NextResponse.json({ status: "unavailable", service: "bhajiwala", database: "unreachable" }, { status: 503 });
  }
}

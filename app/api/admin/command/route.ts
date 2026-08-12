import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin-auth";

const intent = z.discriminatedUnion("action", [z.object({ action: z.literal("availability"), item: z.string(), available: z.boolean() }), z.object({ action: z.literal("price"), item: z.string(), delta: z.number().int() }), z.object({ action: z.literal("reservations") })]);

export async function POST(request: Request) {
  const { command } = await request.json().catch(() => ({}));
  if (!isAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (typeof command !== "string" || !command.trim()) return Response.json({ error: "Enter an owner command." }, { status: 400 });
  if (!process.env.GROQ_API_KEY) return Response.json({ error: "AI service is not configured." }, { status: 503 });
  const menu = await prisma.menuItem.findMany({ select: { name: true } });
  const { object } = await generateObject({ model: groq("llama-3.3-70b-versatile"), schema: intent, prompt: `Parse this owner command: ${command}. Menu items: ${menu.map(item => item.name).join(", ")}. Use availability for disable/enable; price delta for price increases/decreases; reservations for listing today's active reservations.` });
  if (object.action === "availability") { const item = await prisma.menuItem.update({ where: { name: object.item }, data: { available: object.available } }); return Response.json({ message: `${item.name} is now ${item.available ? "available" : "unavailable"}.` }); }
  if (object.action === "price") { const item = await prisma.menuItem.update({ where: { name: object.item }, data: { price: { increment: object.delta } } }); return Response.json({ message: `${item.name} is now Rs. ${item.price}.` }); }
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const reservations = await prisma.reservation.findMany({ where: { date: { gte: start }, status: "CONFIRMED" }, orderBy: { timeSlot: "asc" } });
  return Response.json({ message: `${reservations.length} active reservations today.`, reservations });
}

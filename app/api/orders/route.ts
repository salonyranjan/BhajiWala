import { prisma } from "@/lib/prisma";
import { sendOperationalEmail } from "@/lib/email";
import { z } from "zod";

const orderSchema = z.object({
  customerName: z.string().min(2).max(80),
  phone: z.string().min(8).max(20),
  location: z.string().min(3).max(180),
  notes: z.string().max(300).optional(),
  items: z.array(z.object({ name: z.string(), price: z.number().int().positive(), quantity: z.number().int().min(1).max(20) })).min(1),
});

async function emailKitchenOrder(order: { id: string; customerName: string; phone: string; location: string; notes: string | null; total: number; items: { name: string; quantity: number; price: number }[] }) {
  const itemLines = order.items.map(item => `- ${item.quantity} x ${item.name} (Rs. ${item.price * item.quantity})`).join("\n");
  const message = `NEW BHAJIWALA ORDER #${order.id.slice(-6).toUpperCase()}\n\nCustomer: ${order.customerName}\nPhone: ${order.phone}\nLocation: ${order.location}\n\nItems:\n${itemLines}\n\nTotal: Rs. ${order.total}\nPayment: Cash on delivery to Rajiv Ranjan${order.notes ? `\nNote: ${order.notes}` : ""}`;
  return sendOperationalEmail({ subject: `New Bhajiwala order #${order.id.slice(-6).toUpperCase()}`, text: message, idempotencyKey: `bhajiwala-order-${order.id}` });
}

export async function POST(request: Request) {
  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Please complete your order details." }, { status: 400 });
  const data = parsed.data;
  const total = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = await prisma.order.create({ data: { customerName: data.customerName, phone: data.phone, location: data.location, notes: data.notes || null, total, items: { create: data.items } }, include: { items: true } });
  const emailNotification = await emailKitchenOrder(order);
  return Response.json({ order, emailNotificationSent: emailNotification.sent, emailNotificationError: emailNotification.sent ? undefined : emailNotification.reason }, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const phone = searchParams.get("phone");
  if (id || phone) {
    const orderCode = id?.trim().toLowerCase() ?? "";
    const normalizedPhone = phone?.replace(/\D/g, "") ?? "";
    if (!/^[a-z0-9]{6}$/.test(orderCode) || normalizedPhone.length < 8 || normalizedPhone.length > 20) return Response.json({ error: "Enter the 6-character order number and the phone number used for the order." }, { status: 400 });
    const matchingOrders = await prisma.order.findMany({ where: { id: { endsWith: orderCode } }, select: { id: true, phone: true, status: true, total: true, createdAt: true, items: { select: { name: true, price: true, quantity: true } } }, take: 5 });
    const order = matchingOrders.find(candidate => candidate.phone.replace(/\D/g, "") === normalizedPhone);
    if (!order) return Response.json({ error: "Order not found. Please check your order number and phone." }, { status: 404 });
    return Response.json({ order });
  }
  if (request.headers.get("x-admin-password") !== process.env.ADMIN_PASSWORD) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } });
  return Response.json({ orders });
}

export async function PATCH(request: Request) {
  if (request.headers.get("x-admin-password") !== process.env.ADMIN_PASSWORD) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = z.object({ id: z.string().min(1), status: z.enum(["NEW", "ACCEPTED", "COOKING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]) }).safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid order update." }, { status: 400 });
  const order = await prisma.order.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status } });
  return Response.json({ order });
}

import { prisma } from "./prisma";
export async function menuContext() { const items = await prisma.menuItem.findMany({ where:{available:true}, orderBy:{category:"asc"} }); return items.map(i => `${i.name} — ₹${i.price}; ${i.description}; ${i.spiceLevel}; tags: ${i.tags}`).join("\n"); }

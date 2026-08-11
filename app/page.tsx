import { prisma } from "@/lib/prisma";
import { AddaExperience } from "@/components/adda-experience";
export const dynamic="force-dynamic";
export default async function Home(){const items=await prisma.menuItem.findMany({orderBy:{name:"asc"}});return <AddaExperience items={items.map(x=>({...x,createdAt:undefined,updatedAt:undefined}))}/>}

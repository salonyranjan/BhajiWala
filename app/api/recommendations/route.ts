import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { menuContext } from "@/lib/menu-context";
const output=z.object({suggestions:z.array(z.object({name:z.string(),reason:z.string()})).length(3)});
export async function POST(request:Request) { const {craving}=await request.json(); if(!craving?.trim()) return Response.json({error:"Tell us what you're craving."},{status:400}); const menu=await menuContext(); if(!process.env.GROQ_API_KEY) return Response.json({suggestions:[{name:"Pav Bhaji",reason:"A warm, filling Adda favourite."},{name:"Samosa Chat",reason:"Tangy, crunchy comfort food."},{name:"Masala Chai",reason:"The perfect comforting pairing."}]}); const {object}=await generateObject({model:groq("llama-3.3-70b-versatile"),schema:output,prompt:`You are a friendly cafe recommender. Only recommend menu names supplied below. Match this craving: ${craving}. Menu:\n${menu}`}); return Response.json(object); }

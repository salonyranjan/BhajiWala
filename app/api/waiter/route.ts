import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { menuContext } from "@/lib/menu-context";

export async function POST(request: Request) {
  const { messages = [], language = "en" } = await request.json();
  if (!process.env.GROQ_API_KEY) return Response.json({ error: "AI service is not configured." }, { status: 503 });
  const menu = await menuContext();
  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are Bhaji Buddy, the warm help and support assistant for Bhajiwala. Use only this live menu context:\n${menu}\nSupport customers with menu choices, spice levels, food orders, reservations, bulk orders, delivery inside Shri Krishna Science Centre, and payment to Rajiv Ranjan. Wait time is typically 10-15 minutes; do not claim a precise live queue. Do not invent ingredients. Reply in ${language === "hi" ? "simple Hindi (Devanagari)" : "clear English"}.`,
    messages,
  });
  return Response.json({ text });
}

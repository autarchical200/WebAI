import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { question } = await req.json();

  if (!question) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: question,
    });

    return NextResponse.json({ answer: result.text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

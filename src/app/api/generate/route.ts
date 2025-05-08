import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { subject, grade, topic } = await req.json();

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });
  const prompt = `Hãy tạo 5 câu hỏi trắc nghiệm môn ${subject}, lớp ${grade}, chủ đề ${topic}, mỗi câu có 4 đáp án A, B, C, D và gợi ý đáp án đúng.`;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const questions = result.text;

    // Lưu vào Supabase
    const { error } = await supabase.from('questions').insert([
      { subject, grade, topic, content: questions },
    ]);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Gemini error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

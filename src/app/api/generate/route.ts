import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  // Lấy thông tin từ request body
  const { subject, grade, topic, questionCount } = await req.json();

  // Lấy ID môn học từ bảng subjects
  const { data: subjectData, error: subjectError } = await supabase
    .from('subjects')
    .select('id')
    .eq('name', subject)
    .single();

  if (subjectError || !subjectData) {
    return NextResponse.json({ error: 'Môn học không hợp lệ.' }, { status: 400 });
  }

  // Lấy ID lớp học từ bảng grades
  const { data: gradeData, error: gradeError } = await supabase
    .from('grades')
    .select('id')
    .eq('name', grade)
    .single();

  if (gradeError || !gradeData) {
    return NextResponse.json({ error: 'Lớp học không hợp lệ.' }, { status: 400 });
  }

  // Khởi tạo Google GenAI API với API Key
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

  // Tạo prompt để gửi cho AI, điều chỉnh số lượng câu hỏi theo yêu cầu
  const prompt = `Hãy tạo ${questionCount} câu hỏi trắc nghiệm môn ${subject}, lớp ${grade}, chủ đề ${topic}, mỗi câu có 4 đáp án A, B, C, D và gợi ý đáp án đúng.`;

  try {
    // Gửi yêu cầu tới Google GenAI API để tạo câu hỏi
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const questions = result.text;

    // Lưu câu hỏi vào bảng questions với subject_id và grade_id
    const { error } = await supabase.from('questions').insert([{
      subject_id: subjectData.id,
      grade_id: gradeData.id,
      topic,
      content: questions,
    }]);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Trả về câu hỏi đã tạo
    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Gemini error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

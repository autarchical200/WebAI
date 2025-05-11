import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { subject, grade, topic, questionCount } = await req.json();

  // Lấy ID môn học
  const { data: subjectData, error: subjectError } = await supabase
    .from('subjects')
    .select('id')
    .eq('name', subject)
    .single();

  if (subjectError || !subjectData) {
    return NextResponse.json({ error: 'Môn học không hợp lệ.' }, { status: 400 });
  }

  // Lấy ID lớp học
  const { data: gradeData, error: gradeError } = await supabase
    .from('grades')
    .select('id')
    .eq('name', grade)
    .single();

  if (gradeError || !gradeData) {
    return NextResponse.json({ error: 'Lớp học không hợp lệ.' }, { status: 400 });
  }

  const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

  const prompt = `Hãy tạo ${questionCount} câu hỏi trắc nghiệm môn ${subject}, lớp ${grade}, chủ đề ${topic}.
Mỗi câu có định dạng như sau (không giải thích):

**Câu X:** Nội dung câu hỏi?
A. Đáp án A  
B. Đáp án B  
C. Đáp án C  
D. Đáp án D  
**Gợi ý đáp án:** <A/B/C/D>`;

  try {
const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

const result = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
});

const markdownText = await result.response.text();




    // Parse markdown Gemini trả về
    const questions = markdownText.trim().split('**Câu ').slice(1).map((block: string, index: any) => {
      const lines = block.trim().split('\n');
      const content = lines[0].split(':')[1]?.trim() || '';
      const answers = lines.slice(1, 5).map((line: string) => line.replace(/^[A-D]\.\s*/, '').trim());
      const correctLine = lines.find((line: string | string[]) => line.includes('**Gợi ý đáp án:**')) || '';
      const correctAnswer = correctLine.split('**Gợi ý đáp án:**')[1]?.trim()?.toUpperCase() || '';
      return {
        content,
        answers,
        correct_answer: correctAnswer,
      };
    });

    // Lưu từng câu hỏi vào bảng questions
    const insertData = questions.map((q: { content: any; answers: any; correct_answer: any; }) => ({
      subject_id: subjectData.id,
      grade_id: gradeData.id,
      topic,
      content: q.content,
      answers: q.answers,
      correct_answer: q.correct_answer,
    }));

    const { error: insertError } = await supabase.from('questions').insert(insertData);

    if (insertError) {
      console.error('Lỗi khi lưu câu hỏi:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Tạo và lưu câu hỏi thành công', questions });
  } catch (error: any) {
    console.error('Lỗi Gemini:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

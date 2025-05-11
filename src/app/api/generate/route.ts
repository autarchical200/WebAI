import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { subject, grade, topic, questionCount, difficulty } = await req.json(); // ✅ Thêm difficulty

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

  const prompt = `Hãy tạo ${questionCount} câu hỏi trắc nghiệm môn ${subject}, lớp ${grade}, chủ đề ${topic}, độ khó ${difficulty}.
Mỗi câu có định dạng như sau (không giải thích):

**Câu X:** Nội dung câu hỏi?
A. Đáp án A  
B. Đáp án B  
C. Đáp án C  
D. Đáp án D  
**Gợi ý đáp án:** <A/B/C/D>
**Giải thích:** <Giải thích câu trả lời đúng>`;

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const markdownText = await result.response.text();

    const questions = markdownText.trim().split('**Câu ').slice(1).map((block: string) => {
      const lines = block.trim().split('\n');
      const content = lines[0].split(':')[1]?.trim() || '';
      const answers = lines.slice(1, 5).map((line: string) => line.replace(/^[A-D]\.\s*/, '').trim());
      const correctLine = lines.find((line: string) => line.includes('**Gợi ý đáp án:**')) || '';
      const correctAnswer = correctLine.split('**Gợi ý đáp án:**')[1]?.trim()?.toUpperCase() || '';
      const explanationLine = lines.find((line: string) => line.includes('**Giải thích:**')) || '';
      const explanation = explanationLine.split('**Giải thích:**')[1]?.trim() || '';

      return {
        content,
        answers,
        correct_answer: correctAnswer,
        explanation, // Thêm giải thích
        difficulty,  // ✅ Độ khó được truyền từ phía client
      };
    });

    const { data: testData, error: testError } = await supabase
      .from('tests')
      .insert([
        {
          name: `Bài kiểm tra - ${topic}`,
          description: `Chủ đề: ${topic}`,
        },
      ])
      .select('id')
      .single();

    if (testError || !testData) {
      return NextResponse.json({ error: 'Lỗi khi tạo bài kiểm tra.' }, { status: 500 });
    }

    const testId = testData.id;

    const insertData = questions.map((q) => ({
      subject_id: subjectData.id,
      grade_id: gradeData.id,
      topic,
      content: q.content,
      answers: q.answers,
      correct_answer: q.correct_answer,
      test_id: testId,
      difficulty: difficulty || q.difficulty, // ← Ưu tiên lấy từ client nếu có
      explanation: q.explanation, // Thêm giải thích vào cơ sở dữ liệu
    }));

    const { data: insertedQuestions, error: insertError } = await supabase
      .from('questions')
      .insert(insertData)
      .select('id');

    if (insertError) {
      console.error('Lỗi khi lưu câu hỏi:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const testQuestionsData = insertedQuestions.map((q: { id: number }) => ({
      test_id: testId,
      question_id: q.id,
    }));

    const { error: insertTestQuestionsError } = await supabase
      .from('test_questions')
      .insert(testQuestionsData);

    if (insertTestQuestionsError) {
      console.error('Lỗi khi lưu mối quan hệ bài kiểm tra và câu hỏi:', insertTestQuestionsError);
      return NextResponse.json({ error: insertTestQuestionsError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Tạo và lưu câu hỏi thành công',
      questions,
      testId,
    });

  } catch (error: any) {
    console.error('Lỗi Gemini:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

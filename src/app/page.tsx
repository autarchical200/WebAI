import QuestionForm from './components/QuestionForm';

export default function Home() {
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">EduAI - Tạo & Lưu câu hỏi bằng AI</h1>
      <QuestionForm />
    </main>
  );
}

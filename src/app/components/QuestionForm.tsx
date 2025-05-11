'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

function Spinner() {
  return <div className="w-6 h-6 border-4 border-t-4 border-blue-500 rounded-full animate-spin mx-auto"></div>;
}

export default function QuestionForm() {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [savedQuestions, setSavedQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);

  useEffect(() => {
    const fetchSubjectsAndGrades = async () => {
      const resSubjects = await fetch('/api/get-subjects');
      const resGrades = await fetch('/api/get-grades');
      const subjectsData = await resSubjects.json();
      const gradesData = await resGrades.json();
      setSubjects(subjectsData);
      setGrades(gradesData);
    };
    fetchSubjectsAndGrades();
    fetchSavedQuestions();
  }, []);

  const fetchSavedQuestions = async () => {
    const res = await fetch('/api/get-questions');
    const data = await res.json();
    setSavedQuestions(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQuestions([]);

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, grade, topic, questionCount }),
    });

    const data = await res.json();
    if (data.questions && Array.isArray(data.questions)) {
      setQuestions(data.questions);
      fetchSavedQuestions();
    } else {
      setQuestions([]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="shadow-lg rounded-lg bg-white">
        <CardHeader className="bg-blue-500 text-white rounded-t-lg py-4 px-6">
          <CardTitle className="text-xl font-semibold">Tạo câu hỏi</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Các input giữ nguyên như trước */}

            <div className="space-y-2">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Môn học</label>
              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn môn học</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.name}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Lớp</label>
              <select
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn lớp</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Chủ đề</label>
              <input
                id="topic"
                type="text"
                placeholder="Nhập chủ đề"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700">Số lượng câu hỏi</label>
              <input
                id="questionCount"
                type="number"
                min="1"
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              {loading ? 'Đang tạo câu hỏi...' : 'Tạo câu hỏi'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-lg bg-white">
        <CardHeader className="bg-green-500 text-white rounded-t-lg py-4 px-6">
          <CardTitle className="text-lg font-semibold">Câu hỏi đã tạo</CardTitle>
        </CardHeader>
 <CardContent className="p-6">
  {loading ? (
    <Spinner />
  ) : (
    questions.length > 0 ? (
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={idx} className="border-b border-gray-200 py-4 space-y-2">
            <p className="font-medium text-gray-800">📌 <strong>Câu {idx + 1}:</strong> {q.content}</p>
            {q.answers && Array.isArray(q.answers) && q.answers.map((ans: string, i: number) => (
              <div key={i} className="pl-4">
                <span className="font-semibold">{String.fromCharCode(65 + i)}.</span> {ans}
              </div>
            ))}
            <p className="text-green-600 font-semibold">✔️ Đáp án đúng: {q.correct_answer}</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500">Chưa có câu hỏi nào được tạo.</p>
    )
  )}
</CardContent>

      </Card>

      <Card className="shadow-lg rounded-lg bg-white">
        <CardHeader className="bg-indigo-500 text-white rounded-t-lg py-4 px-6">
          <CardTitle className="text-lg font-semibold">Câu hỏi đã lưu</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {savedQuestions.length === 0 ? (
            <p className="text-gray-500">Chưa có câu hỏi nào được lưu.</p>
          ) : (
           savedQuestions.map((q) => (
  <div key={q.id} className="border-b border-gray-200 py-4 space-y-2">
    <p className="font-medium text-gray-800">📌 <strong>Câu hỏi:</strong> {q.content}</p>
    {q.answers && Array.isArray(q.answers) && q.answers.map((ans: string, idx: number) => (
      <div key={idx} className="pl-4">
        <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span> {ans}
      </div>
    ))}
    <p className="text-green-600 font-semibold">✔️ Đáp án đúng: {q.correct_answer}</p>
  </div>
))

          )}
        </CardContent>
      </Card>
    </div>
  );
}

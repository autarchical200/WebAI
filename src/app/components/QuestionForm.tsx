'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function QuestionForm() {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState('');
  const [savedQuestions, setSavedQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQuestions('');

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, grade, topic }),
    });

    const data = await res.json();
    if (data.questions) {
      setQuestions(data.questions);
      fetchSavedQuestions();
    } else {
      setQuestions('Đã xảy ra lỗi.');
    }
    setLoading(false);
  };

  const fetchSavedQuestions = async () => {
    const res = await fetch('/api/get-questions');
    const data = await res.json();
    setSavedQuestions(data);
  };

  useEffect(() => {
    fetchSavedQuestions();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tạo câu hỏi bằng AI</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Môn học (vd: Toán)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Input
              placeholder="Lớp (vd: 12)"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
            <Input
              placeholder="Chủ đề (vd: Phương trình bậc hai)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Button type="submit" className="w-full">
              {loading ? 'Đang tạo...' : 'Tạo câu hỏi'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {questions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Câu hỏi mới</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap">{questions}</pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh sách câu hỏi đã lưu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {savedQuestions.length === 0 ? (
            <p>Chưa có câu hỏi nào được lưu.</p>
          ) : (
            savedQuestions.map((q) => (
              <Card key={q.id} className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-base">{q.subject} - Lớp {q.grade} ({q.topic})</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm">{q.content}</pre>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

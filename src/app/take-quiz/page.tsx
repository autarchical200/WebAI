'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TakeQuiz() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);  // Lưu số câu trả lời đúng
  const [showPopup, setShowPopup] = useState(false);  // Điều khiển việc hiển thị popup

  useEffect(() => {
    const stored = localStorage.getItem('currentExam');
    if (stored) {
      setQuestions(JSON.parse(stored));
    }
  }, []);

  const handleSubmit = () => {
    setSubmitted(true);

    // Tính số câu trả lời đúng
    const correctAnswers = questions.reduce((count, q, idx) => {
      if (answers[idx] === q.correct_answer) {
        count++;
      }
      return count;
    }, 0);

    setCorrectCount(correctAnswers);
    setShowPopup(true);  // Hiển thị popup sau khi nộp bài
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Bài kiểm tra</h1>

      {questions.map((q, idx) => (
        <div key={idx} className="space-y-2 border-b pb-4">
          <p className="font-medium">
            <strong>Câu {idx + 1}:</strong> {q.content}
          </p>
          {q.answers.map((ans: string, i: number) => {
            const option = String.fromCharCode(65 + i);
            const isSelected = answers[idx] === option;
            const isCorrect = q.correct_answer === option;
            const isWrong = submitted && isSelected && !isCorrect;
            return (
              <div key={i} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`q-${idx}`}
                  value={option}
                  checked={isSelected}
                  disabled={submitted}
                  onChange={() =>
                    setAnswers((prev) => ({ ...prev, [idx]: option }))
                  }
                />
                <label className={submitted && isCorrect ? 'text-green-600 font-bold' : isWrong ? 'text-red-600' : ''}>
                  {option}. {ans}
                </label>
              </div>
            );
          })}

          {/* Hiển thị giải thích sau khi nộp bài */}
          {submitted && answers[idx] !== q.correct_answer && (
            <div>
              <p className="text-green-600">✔️ Đáp án đúng: {q.correct_answer}</p>
              {q.explanation && (
                <div className="mt-2 text-sm text-gray-700 bg-gray-100 p-4 rounded-lg">
                  <strong>Giải thích: </strong> {q.explanation}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {!submitted ? (
        <Button
          onClick={handleSubmit}
          className="w-full bg-green-600 text-white hover:bg-green-700"
        >
          Nộp bài
        </Button>
      ) : (
        <p className="text-center text-blue-600 font-semibold">✅ Bạn đã nộp bài!</p>
      )}

      {/* Popup thông báo kết quả */}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-semibold">Bạn đã nộp bài!</h2>
            <p className="mt-4 text-lg">Làm đúng {correctCount}/{questions.length}</p>
            <div className="mt-6">
              <Button onClick={closePopup} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-800">
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

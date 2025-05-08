"use client";

import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnswer("");

    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    setAnswer(data.answer || "Đã xảy ra lỗi.");
    setLoading(false);
  };

  return (
    <main style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>💬 Hỏi Hưng Phan</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Nhập câu hỏi..."
          style={{ width: "100%", padding: 10 }}
        />
        <button type="submit" style={{ marginTop: 10, padding: 10 }}>
          Gửi
        </button>
      </form>
      {loading ? <p>⏳ Đang trả lời...</p> : <p>{answer}</p>}
    </main>
  );
}

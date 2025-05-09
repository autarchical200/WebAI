import { supabase } from '@/lib/supabase'; // Giả sử bạn đã cấu hình Supabase
import { NextResponse } from 'next/server';

export async function GET() {
  // Lấy dữ liệu câu hỏi từ bảng 'questions'
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('id', { ascending: false });

  // Nếu có lỗi
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Trả về dữ liệu câu hỏi
  return NextResponse.json(data);
}

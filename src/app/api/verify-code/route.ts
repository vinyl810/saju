import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  const accessCode = process.env.ACCESS_CODE;

  if (code === accessCode) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: '잘못된 코드입니다.' }, { status: 401 });
}

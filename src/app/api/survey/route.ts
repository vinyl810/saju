import { NextResponse } from 'next/server';
import { z } from 'zod';
import { saveSurveyResponse } from '@/lib/db/survey';

const SurveySchema = z.object({
  type: z.enum(['saju', 'compatibility']),
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SurveySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await saveSurveyResponse(parsed.data);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: '설문 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

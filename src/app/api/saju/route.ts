import { NextResponse } from 'next/server';
import { z } from 'zod';
import { performSajuAnalysis } from '@/lib/saju';
import { logger } from '@/lib/logger';
import { logSajuSearch } from '@/lib/db/search-log';

const MOD = 'api-saju';

const BirthInputSchema = z.object({
  year: z.number().int().min(1920).max(2100),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  gender: z.enum(['남', '여']),
  isLunar: z.boolean(),
  isLeapMonth: z.boolean(),
  useYajasi: z.boolean(),
  birthPlace: z.string().optional(),
  longitude: z.number().optional(),
});

export async function POST(request: Request) {
  logger.info(MOD, `POST /api/saju 요청 수신`);
  try {
    const body = await request.json();
    logger.info(MOD, `요청 바디`, body);

    const parsed = BirthInputSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn(MOD, `입력값 검증 실패`, { errors: parsed.error.flatten() });
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    logger.info(MOD, `입력값 검증 통과, 사주 분석 시작`);
    const result = performSajuAnalysis(parsed.data);
    logger.info(MOD, `사주 분석 완료, 응답 전송`);

    await logSajuSearch(parsed.data);

    return NextResponse.json(result);
  } catch (error) {
    logger.error(MOD, `사주 계산 오류`, { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: '사주 계산 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

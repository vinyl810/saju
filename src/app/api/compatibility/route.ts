import { NextResponse } from 'next/server';
import { z } from 'zod';
import { performCompatibilityAnalysis } from '@/lib/saju';
import { logger } from '@/lib/logger';
import { logCompatSearch } from '@/lib/db/search-log';

const MOD = 'api-compatibility';

const PersonSchema = z.object({
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

const CompatibilityInputSchema = z.object({
  person1: PersonSchema,
  person2: PersonSchema,
});

export async function POST(request: Request) {
  logger.info(MOD, `POST /api/compatibility 요청 수신`);
  try {
    const body = await request.json();
    logger.info(MOD, `요청 바디`, body);

    const parsed = CompatibilityInputSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn(MOD, `입력값 검증 실패`, { errors: parsed.error.flatten() });
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    logger.info(MOD, `입력값 검증 통과, 궁합 분석 시작`);
    const result = performCompatibilityAnalysis(parsed.data);
    logger.info(MOD, `궁합 분석 완료`, { totalScore: result.result.totalScore, grade: result.result.grade });

    logCompatSearch(parsed.data.person1, parsed.data.person2).catch(() => {});

    return NextResponse.json(result);
  } catch (error) {
    logger.error(MOD, `궁합 계산 오류`, { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: '궁합 계산 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

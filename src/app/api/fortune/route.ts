import { NextResponse } from 'next/server';
import { z } from 'zod';
import { performSajuAnalysis } from '@/lib/saju';
import { calculateYearlyFortune, calculateMonthlyFortune, calculateDailyFortune } from '@/lib/saju/yearly-fortune';
import { interpretYearlyFortune, interpretMonthlyFortune, interpretDailyFortune } from '@/lib/saju/interpretation';
import { logger } from '@/lib/logger';

const MOD = 'api-fortune';

const FortuneInputSchema = z.object({
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
  // 운세 조회 대상 날짜
  targetYear: z.number().int().min(1920).max(2100),
  targetMonth: z.number().int().min(1).max(12),
  targetDay: z.number().int().min(1).max(31),
});

export async function POST(request: Request) {
  logger.info(MOD, `POST /api/fortune 요청 수신`);
  try {
    const body = await request.json();
    logger.info(MOD, `요청 바디`, body);

    const parsed = FortuneInputSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn(MOD, `입력값 검증 실패`, { errors: parsed.error.flatten() });
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { targetYear, targetMonth, targetDay, ...birthInput } = parsed.data;
    logger.info(MOD, `운세 조회 대상`, { targetYear, targetMonth, targetDay });

    const analysis = performSajuAnalysis(birthInput);

    const yearlyFortune = interpretYearlyFortune(
      calculateYearlyFortune(targetYear, analysis.fourPillars),
      analysis.yongsin
    );
    logger.info(MOD, `세운 계산 완료`, { year: targetYear, score: yearlyFortune.score });

    const monthlyFortune = interpretMonthlyFortune(
      calculateMonthlyFortune(targetYear, targetMonth, analysis.fourPillars),
      analysis.yongsin
    );
    logger.info(MOD, `월운 계산 완료`, { month: targetMonth, score: monthlyFortune.score });

    const dailyFortune = interpretDailyFortune(
      calculateDailyFortune(targetYear, targetMonth, targetDay, analysis.fourPillars),
      analysis.yongsin
    );
    logger.info(MOD, `일운 계산 완료`, { day: targetDay, score: dailyFortune.score });

    logger.info(MOD, `운세 응답 전송`);
    return NextResponse.json({
      yearlyFortune,
      monthlyFortune,
      dailyFortune,
    });
  } catch (error) {
    logger.error(MOD, `운세 계산 오류`, { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: '운세 계산 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

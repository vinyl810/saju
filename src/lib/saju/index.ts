import type { BirthInput, SajuAnalysis, CompatibilityInput, CompatibilityResult } from './types';
import { calculateFourPillars } from './four-pillars';
import { analyzeFiveElements } from './five-elements';
import { analyzeYongsin } from './yongsin';
import { analyzeRelationships } from './relationships';
import { calculateMajorFortunes } from './major-fortune';
import { calculateYearlyFortune, calculateMonthlyFortune, calculateDailyFortune } from './yearly-fortune';
import { interpretMajorFortune, interpretYearlyFortune, interpretMonthlyFortune, interpretDailyFortune } from './interpretation';
import { getPersonalityProfile } from '../data/personality-map';
import { analyzeCompatibility } from './compatibility';
import { logger } from '../logger';

const MOD = 'saju-index';

/**
 * 사주 분석 전체 수행 (메인 진입점)
 */
export function performSajuAnalysis(input: BirthInput): SajuAnalysis {
  logger.info(MOD, `========== performSajuAnalysis 시작 ==========`, input);

  // 1. 사주팔자 계산
  const { fourPillars, solarDate, solarTimeCorrection } = calculateFourPillars(input);
  logger.info(MOD, `사주팔자 계산 완료`, {
    년주: `${fourPillars.year.ganJi.cheongan}${fourPillars.year.ganJi.jiji}`,
    월주: `${fourPillars.month.ganJi.cheongan}${fourPillars.month.ganJi.jiji}`,
    일주: `${fourPillars.day.ganJi.cheongan}${fourPillars.day.ganJi.jiji}`,
    시주: `${fourPillars.hour.ganJi.cheongan}${fourPillars.hour.ganJi.jiji}`,
  });

  // 2. 오행 분석
  const fiveElements = analyzeFiveElements(fourPillars, solarDate.year, solarDate.month, solarDate.day);
  logger.info(MOD, `오행 분석 완료`, { strongest: fiveElements.strongest, weakest: fiveElements.weakest, strength: fiveElements.dayMasterStrength });

  // 3. 용신 분석
  const yongsin = analyzeYongsin(fourPillars, solarDate.year, solarDate.month, solarDate.day);
  logger.info(MOD, `용신 분석 완료`, { yongsin: yongsin.yongsin, method: yongsin.method });

  // 4. 합충형파해 관계 분석
  const relationships = analyzeRelationships(fourPillars);
  logger.info(MOD, `관계 분석 완료`, { count: relationships.length });

  // 5. 대운 계산 + 해석
  const rawMajorFortunes = calculateMajorFortunes(input, fourPillars, solarDate.year, solarDate.month, solarDate.day);
  const majorFortunes = rawMajorFortunes.map(f => interpretMajorFortune(f, yongsin));
  logger.info(MOD, `대운 계산 완료`, { count: majorFortunes.length });

  // 6. 세운 (현재 연도)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  const rawYearlyFortune = calculateYearlyFortune(currentYear, fourPillars);
  const currentYearFortune = interpretYearlyFortune(rawYearlyFortune, yongsin);
  logger.info(MOD, `세운 계산 완료`, { year: currentYear, score: currentYearFortune.score });

  // 7. 월운 (현재 월)
  const rawMonthlyFortune = calculateMonthlyFortune(currentYear, currentMonth, fourPillars);
  const currentMonthFortune = interpretMonthlyFortune(rawMonthlyFortune, yongsin);
  logger.info(MOD, `월운 계산 완료`, { month: currentMonth, score: currentMonthFortune.score });

  // 8. 일운 (오늘)
  const rawDailyFortune = calculateDailyFortune(currentYear, currentMonth, currentDay, fourPillars);
  const todayFortune = interpretDailyFortune(rawDailyFortune, yongsin);
  logger.info(MOD, `일운 계산 완료`, { day: currentDay, score: todayFortune.score });

  // 9. 성격 프로파일
  const personality = getPersonalityProfile(
    fourPillars.day.ganJi.cheongan,
    fourPillars.day.ganJi.jiji
  );
  logger.info(MOD, `성격 프로파일 생성 완료`, { title: personality.title });

  logger.info(MOD, `========== performSajuAnalysis 완료 ==========`);

  return {
    fourPillars,
    fiveElements,
    yongsin,
    majorFortunes,
    currentYearFortune,
    currentMonthFortune,
    todayFortune,
    personality,
    relationships,
    birthInput: input,
    solarBirthDate: solarDate,
    solarTimeCorrection,
  };
}

/**
 * 궁합 분석 수행
 */
export function performCompatibilityAnalysis(input: CompatibilityInput): {
  result: CompatibilityResult;
  person1Analysis: SajuAnalysis;
  person2Analysis: SajuAnalysis;
} {
  logger.info(MOD, `========== performCompatibilityAnalysis 시작 ==========`);

  logger.info(MOD, `Person 1 분석 시작`);
  const person1Analysis = performSajuAnalysis(input.person1);

  logger.info(MOD, `Person 2 분석 시작`);
  const person2Analysis = performSajuAnalysis(input.person2);

  const result = analyzeCompatibility(
    person1Analysis.fourPillars,
    person2Analysis.fourPillars,
    person1Analysis.fiveElements,
    person2Analysis.fiveElements,
    person1Analysis.yongsin,
    person2Analysis.yongsin
  );

  logger.info(MOD, `========== performCompatibilityAnalysis 완료 ==========`, { totalScore: result.totalScore, grade: result.grade });

  return { result, person1Analysis, person2Analysis };
}

// Re-export types
export type * from './types';

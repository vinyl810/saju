import type { FourPillars, FiveElement, FiveElementCount, FiveElementAnalysis, Cheongan } from './types';
import { CHEONGAN_ELEMENT, JIJI_ELEMENT, HIDDEN_STEMS, GENERATED_BY, GENERATES } from './constants';
import { getSajuMonth } from './solar-terms';
import { logger } from '../logger';

const MOD = 'five-elements';

/**
 * 사주팔자의 오행 분포 계산
 * 천간 4개 + 지지 지장간 가중치 포함
 */
export function countFiveElements(fourPillars: FourPillars): FiveElementCount {
  logger.info(MOD, `countFiveElements 시작`);
  const counts: FiveElementCount = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

  const pillars = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour];

  for (const p of pillars) {
    // 천간: 1점
    counts[CHEONGAN_ELEMENT[p.ganJi.cheongan]] += 1;

    // 지지 지장간 (가중치: 정기 0.6, 중기 0.3, 여기 0.1)
    const hs = HIDDEN_STEMS[p.ganJi.jiji];
    counts[CHEONGAN_ELEMENT[hs.main]] += 0.6;
    if (hs.middle) counts[CHEONGAN_ELEMENT[hs.middle]] += 0.3;
    if (hs.residual) counts[CHEONGAN_ELEMENT[hs.residual]] += 0.1;
  }

  // 소수점 둘째자리 반올림
  for (const key of Object.keys(counts) as FiveElement[]) {
    counts[key] = Math.round(counts[key] * 100) / 100;
  }

  logger.info(MOD, `countFiveElements 결과`, counts);
  return counts;
}

/**
 * 일간 강약 판정 (신강/신약)
 * - 득령 (월지와 일간의 관계): 30점
 * - 득지 (일지): 20점
 * - 득세 (나머지 6글자): 각 8점
 * 총점 50점 이상이면 신강, 미만이면 신약
 */
export function calculateDayMasterStrength(
  fourPillars: FourPillars,
  solarYear: number,
  solarMonth: number,
  solarDay: number
): { strength: 'strong' | 'weak' | 'neutral'; score: number } {
  const dayMasterElement = CHEONGAN_ELEMENT[fourPillars.day.ganJi.cheongan];
  logger.info(MOD, `calculateDayMasterStrength 시작`, { dayMaster: fourPillars.day.ganJi.cheongan, dayMasterElement });
  let score = 0;

  // 도움되는 오행: 같은 오행(비겁) + 나를 생하는 오행(인성)
  const helpingElements: FiveElement[] = [dayMasterElement, GENERATED_BY[dayMasterElement]];
  logger.debug(MOD, `도움되는 오행`, { helpingElements });

  function isHelping(element: FiveElement): boolean {
    return helpingElements.includes(element);
  }

  // 1. 득령 (월지 정기): 30점
  const monthJijiMainStem = HIDDEN_STEMS[fourPillars.month.ganJi.jiji].main;
  if (isHelping(CHEONGAN_ELEMENT[monthJijiMainStem])) {
    score += 30;
    logger.debug(MOD, `득령 +30`, { monthJiji: fourPillars.month.ganJi.jiji, mainStem: monthJijiMainStem });
  }

  // 2. 득지 (일지 정기): 20점
  const dayJijiMainStem = HIDDEN_STEMS[fourPillars.day.ganJi.jiji].main;
  if (isHelping(CHEONGAN_ELEMENT[dayJijiMainStem])) {
    score += 20;
    logger.debug(MOD, `득지 +20`, { dayJiji: fourPillars.day.ganJi.jiji, mainStem: dayJijiMainStem });
  }

  // 3. 득세 (나머지 글자들): 각 8점
  // 년간, 월간, 시간
  const otherStems = [
    fourPillars.year.ganJi.cheongan,
    fourPillars.month.ganJi.cheongan,
    fourPillars.hour.ganJi.cheongan,
  ];
  for (const stem of otherStems) {
    if (isHelping(CHEONGAN_ELEMENT[stem])) {
      score += 8;
      logger.debug(MOD, `득세(천간) +8`, { stem });
    }
  }

  // 년지, 시지 정기
  const otherBranches = [
    fourPillars.year.ganJi.jiji,
    fourPillars.hour.ganJi.jiji,
  ];
  for (const branch of otherBranches) {
    const mainStem = HIDDEN_STEMS[branch].main;
    if (isHelping(CHEONGAN_ELEMENT[mainStem])) {
      score += 8;
      logger.debug(MOD, `득세(지지) +8`, { branch, mainStem });
    }
  }

  // 판정
  let strength: 'strong' | 'weak' | 'neutral';
  if (score >= 55) {
    strength = 'strong';
  } else if (score <= 35) {
    strength = 'weak';
  } else {
    strength = 'neutral';
  }

  logger.info(MOD, `calculateDayMasterStrength 결과`, { strength, score });
  return { strength, score };
}

/**
 * 종합 오행 분석
 */
export function analyzeFiveElements(
  fourPillars: FourPillars,
  solarYear: number,
  solarMonth: number,
  solarDay: number
): FiveElementAnalysis {
  logger.info(MOD, `analyzeFiveElements 시작`, { solarYear, solarMonth, solarDay });
  const counts = countFiveElements(fourPillars);

  // 합계
  const total = counts.목 + counts.화 + counts.토 + counts.금 + counts.수;

  // 백분율
  const percentages: FiveElementCount = {
    목: Math.round((counts.목 / total) * 100),
    화: Math.round((counts.화 / total) * 100),
    토: Math.round((counts.토 / total) * 100),
    금: Math.round((counts.금 / total) * 100),
    수: Math.round((counts.수 / total) * 100),
  };

  // 최강/최약
  const elements: FiveElement[] = ['목', '화', '토', '금', '수'];
  const sorted = [...elements].sort((a, b) => counts[b] - counts[a]);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  // 결여 오행
  const missing = elements.filter(e => counts[e] === 0);

  // 일간 강약
  const dayMasterElement = CHEONGAN_ELEMENT[fourPillars.day.ganJi.cheongan];
  const { strength, score } = calculateDayMasterStrength(
    fourPillars, solarYear, solarMonth, solarDay
  );

  const result = {
    counts,
    percentages,
    strongest,
    weakest,
    missing,
    dayMasterElement,
    dayMasterStrength: strength,
    strengthScore: score,
  };

  logger.info(MOD, `analyzeFiveElements 결과`, {
    strongest, weakest, missing,
    dayMasterElement, strength, score,
    percentages,
  });

  return result;
}

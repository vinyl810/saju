import type { BirthInput, FourPillars, GanJi, Pillar, Cheongan, Jiji, SolarTimeCorrectionInfo } from './types';
import {
  CHEONGAN, JIJI, CHEONGAN_ELEMENT, CHEONGAN_YINYANG,
  JIJI_ELEMENT, JIJI_YINYANG, HIDDEN_STEMS,
  MONTH_STEM_START, HOUR_STEM_START, hourToJiji,
} from './constants';
import { normalizeBirthDate, daysSinceEpoch } from './calendar';
import { getSajuMonth, getIpchunDate } from './solar-terms';
import { assignTenGods } from './ten-gods';
import { calculateSolarTimeCorrectionByCity, calculateSolarTimeCorrectionByLongitude } from './solar-time';
import { logger } from '../logger';

const MOD = 'four-pillars';

/**
 * 간지를 Pillar 객체로 변환 (십신은 나중에 배정)
 */
function ganjiToPillar(ganJi: GanJi): Pillar {
  logger.debug(MOD, `ganjiToPillar`, { cheongan: ganJi.cheongan, jiji: ganJi.jiji });
  return {
    ganJi,
    cheonganElement: CHEONGAN_ELEMENT[ganJi.cheongan],
    jijiElement: JIJI_ELEMENT[ganJi.jiji],
    cheonganYinYang: CHEONGAN_YINYANG[ganJi.cheongan],
    jijiYinYang: JIJI_YINYANG[ganJi.jiji],
    hiddenStems: HIDDEN_STEMS[ganJi.jiji],
  };
}

/**
 * 년주 계산
 */
export function calculateYearPillar(solarYear: number, solarMonth: number, solarDay: number): Pillar {
  logger.info(MOD, `calculateYearPillar 호출`, { solarYear, solarMonth, solarDay });
  const ipchun = getIpchunDate(solarYear);
  const birthDate = new Date(solarYear, solarMonth - 1, solarDay);

  let effectiveYear = solarYear;
  if (birthDate < ipchun) {
    effectiveYear = solarYear - 1;
    logger.info(MOD, `입춘 이전 → 전년도 적용`, { solarYear, effectiveYear, ipchun: ipchun.toISOString() });
  }

  const idx = ((effectiveYear - 4) % 60 + 60) % 60;
  const ganJi: GanJi = {
    cheongan: CHEONGAN[idx % 10],
    jiji: JIJI[idx % 12],
  };
  logger.info(MOD, `calculateYearPillar 결과`, { effectiveYear, idx60: idx, ganJi: `${ganJi.cheongan}${ganJi.jiji}` });
  return ganjiToPillar(ganJi);
}

/**
 * 월주 계산
 */
export function calculateMonthPillar(
  yearStem: Cheongan,
  solarYear: number,
  solarMonth: number,
  solarDay: number
): Pillar {
  logger.info(MOD, `calculateMonthPillar 호출`, { yearStem, solarYear, solarMonth, solarDay });
  const sajuMonth = getSajuMonth(solarYear, solarMonth, solarDay);

  const jijiIdx = (sajuMonth + 1) % 12;
  const monthJiji = JIJI[jijiIdx];

  const yearStemIdx = CHEONGAN.indexOf(yearStem);
  const stemStart = MONTH_STEM_START[yearStemIdx % 5];
  const monthStemIdx = (stemStart + (jijiIdx - 2 + 12) % 12) % 10;
  const monthCheongan = CHEONGAN[monthStemIdx];

  logger.info(MOD, `calculateMonthPillar 결과`, {
    sajuMonth, yearStem, yearStemIdx, stemStart,
    jijiIdx, monthStemIdx,
    ganJi: `${monthCheongan}${monthJiji}`,
  });
  return ganjiToPillar({ cheongan: monthCheongan, jiji: monthJiji });
}

/**
 * 일주 계산
 */
export function calculateDayPillar(solarYear: number, solarMonth: number, solarDay: number): Pillar {
  logger.info(MOD, `calculateDayPillar 호출`, { solarYear, solarMonth, solarDay });
  const days = daysSinceEpoch(solarYear, solarMonth, solarDay);
  const idx = ((days % 60) + 60) % 60;
  const ganJi = { cheongan: CHEONGAN[idx % 10], jiji: JIJI[idx % 12] };
  logger.info(MOD, `calculateDayPillar 결과`, { days, idx60: idx, ganJi: `${ganJi.cheongan}${ganJi.jiji}` });
  return ganjiToPillar(ganJi);
}

/**
 * 시주 계산
 */
export function calculateHourPillar(dayStem: Cheongan, hour: number): Pillar {
  logger.info(MOD, `calculateHourPillar 호출`, { dayStem, hour });
  const hourJiji = hourToJiji(hour);
  const jijiIdx = JIJI.indexOf(hourJiji);

  const dayStemIdx = CHEONGAN.indexOf(dayStem);
  const stemStart = HOUR_STEM_START[dayStemIdx % 5];
  const hourStemIdx = (stemStart + jijiIdx) % 10;

  const ganJi = { cheongan: CHEONGAN[hourStemIdx], jiji: hourJiji };
  logger.info(MOD, `calculateHourPillar 결과`, { hour, hourJiji, dayStem, stemStart, ganJi: `${ganJi.cheongan}${ganJi.jiji}` });
  return ganjiToPillar(ganJi);
}

/**
 * 사주팔자 전체 계산 (진입점)
 */
export function calculateFourPillars(input: BirthInput): {
  fourPillars: FourPillars;
  solarDate: { year: number; month: number; day: number };
  solarTimeCorrection?: SolarTimeCorrectionInfo;
} {
  logger.info(MOD, `========== calculateFourPillars 시작 ==========`, input);

  // 1. 양력 정규화
  const solar = normalizeBirthDate(input.year, input.month, input.day, input.isLunar, input.isLeapMonth);
  logger.info(MOD, `양력 정규화 완료`, solar);

  // 2. 진태양시 보정 (birthPlace 또는 longitude가 있을 때만)
  let effectiveHour = input.hour;
  let solarTimeCorrection: SolarTimeCorrectionInfo | undefined;
  let solarDayOffset = 0;

  if (input.birthPlace || input.longitude !== undefined) {
    let correctionResult;

    if (input.birthPlace) {
      correctionResult = calculateSolarTimeCorrectionByCity(
        solar.year, input.hour, input.minute, input.birthPlace,
      );
    }

    if (!correctionResult && input.longitude !== undefined) {
      correctionResult = calculateSolarTimeCorrectionByLongitude(
        solar.year, input.hour, input.minute, input.longitude,
        input.utcOffset,
      );
    }

    if (correctionResult) {
      effectiveHour = correctionResult.correctedHour;
      solarDayOffset = correctionResult.dayOffset;
      solarTimeCorrection = {
        applied: true,
        originalHour: correctionResult.originalHour,
        originalMinute: correctionResult.originalMinute,
        correctedHour: correctionResult.correctedHour,
        correctedMinute: correctionResult.correctedMinute,
        correctionMinutes: correctionResult.correctionMinutes,
        birthPlace: correctionResult.birthPlace,
        longitude: correctionResult.longitude,
      };
      logger.info(MOD, `진태양시 보정 적용`, {
        original: `${input.hour}:${input.minute}`,
        corrected: `${correctionResult.correctedHour}:${correctionResult.correctedMinute}`,
        correctionMinutes: correctionResult.correctionMinutes,
        dayOffset: solarDayOffset,
      });
    }
  }

  // 3. 진태양시 보정에 의한 날짜 오프셋 적용
  let effectiveDay = solar.day;
  let effectiveMonth = solar.month;
  let effectiveYear = solar.year;

  if (solarDayOffset !== 0) {
    const adjusted = new Date(solar.year, solar.month - 1, solar.day + solarDayOffset);
    effectiveYear = adjusted.getFullYear();
    effectiveMonth = adjusted.getMonth() + 1;
    effectiveDay = adjusted.getDate();
    logger.info(MOD, `진태양시 날짜 오프셋 적용`, { solarDayOffset, effective: { effectiveYear, effectiveMonth, effectiveDay } });
  }

  // 4. 야자시 처리 (보정 후 시간 기준)
  if (input.useYajasi && effectiveHour >= 23) {
    const nextDay = new Date(effectiveYear, effectiveMonth - 1, effectiveDay + 1);
    effectiveYear = nextDay.getFullYear();
    effectiveMonth = nextDay.getMonth() + 1;
    effectiveDay = nextDay.getDate();
    logger.info(MOD, `야자시 적용 → 다음날로`, { effective: { effectiveYear, effectiveMonth, effectiveDay } });
  }

  // 5. 년주
  const yearPillar = calculateYearPillar(effectiveYear, effectiveMonth, effectiveDay);
  logger.info(MOD, `년주: ${yearPillar.ganJi.cheongan}${yearPillar.ganJi.jiji}`);

  // 6. 월주
  const monthPillar = calculateMonthPillar(yearPillar.ganJi.cheongan, effectiveYear, effectiveMonth, effectiveDay);
  logger.info(MOD, `월주: ${monthPillar.ganJi.cheongan}${monthPillar.ganJi.jiji}`);

  // 7. 일주
  const dayPillar = calculateDayPillar(effectiveYear, effectiveMonth, effectiveDay);
  logger.info(MOD, `일주: ${dayPillar.ganJi.cheongan}${dayPillar.ganJi.jiji}`);

  // 8. 시주 (보정된 시간 사용)
  const hourPillar = calculateHourPillar(dayPillar.ganJi.cheongan, effectiveHour);
  logger.info(MOD, `시주: ${hourPillar.ganJi.cheongan}${hourPillar.ganJi.jiji}`);

  // 9. 십신 배정
  const fourPillars = assignTenGods({ year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar });
  logger.info(MOD, `========== calculateFourPillars 완료 ==========`, {
    년주: `${fourPillars.year.ganJi.cheongan}${fourPillars.year.ganJi.jiji}`,
    월주: `${fourPillars.month.ganJi.cheongan}${fourPillars.month.ganJi.jiji}`,
    일주: `${fourPillars.day.ganJi.cheongan}${fourPillars.day.ganJi.jiji}`,
    시주: `${fourPillars.hour.ganJi.cheongan}${fourPillars.hour.ganJi.jiji}`,
  });

  return { fourPillars, solarDate: solar, solarTimeCorrection };
}

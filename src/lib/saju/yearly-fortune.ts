import type { FourPillars, YearlyFortune, MonthlyFortune, DailyFortune, Cheongan, Jiji, FiveElement } from './types';
import {
  CHEONGAN, JIJI, CHEONGAN_ELEMENT, CHEONGAN_YINYANG,
  JIJI_ELEMENT, HIDDEN_STEMS, getTenGod,
  MONTH_STEM_START,
} from './constants';
import { daysSinceEpoch } from './calendar';
import { format } from 'date-fns';
import { logger } from '../logger';

const MOD = 'yearly-fortune';

/**
 * 세운 (연운) 계산
 * 해당 연도의 간지 = (연도 - 4) % 60
 */
export function calculateYearlyFortune(
  year: number,
  fourPillars: FourPillars
): YearlyFortune {
  logger.info(MOD, `calculateYearlyFortune 호출`, { year });
  const idx = ((year - 4) % 60 + 60) % 60;
  const cheongan = CHEONGAN[idx % 10];
  const jiji = JIJI[idx % 12];

  const dayMaster = fourPillars.day.ganJi.cheongan;
  const dayMasterElement = CHEONGAN_ELEMENT[dayMaster];
  const dayMasterYinYang = CHEONGAN_YINYANG[dayMaster];

  const cheonganElement = CHEONGAN_ELEMENT[cheongan];
  const jijiElement = JIJI_ELEMENT[jiji];
  const mainStem = HIDDEN_STEMS[jiji].main;

  const cheonganTenGod = getTenGod(
    dayMasterElement, dayMasterYinYang,
    cheonganElement, CHEONGAN_YINYANG[cheongan]
  );
  const jijiTenGod = getTenGod(
    dayMasterElement, dayMasterYinYang,
    CHEONGAN_ELEMENT[mainStem], CHEONGAN_YINYANG[mainStem]
  );

  logger.info(MOD, `calculateYearlyFortune 결과`, { year, ganJi: `${cheongan}${jiji}`, cheonganTenGod, jijiTenGod });

  return {
    ganJi: { cheongan, jiji },
    cheonganElement,
    jijiElement,
    cheonganTenGod,
    jijiTenGod,
    year,
    interpretation: '',
    score: 50,
  };
}

/**
 * 월운 계산
 * 해당 월의 간지 계산 (절기 기준이지만, 간략 버전으로 양력 월 사용)
 */
export function calculateMonthlyFortune(
  year: number,
  month: number,
  fourPillars: FourPillars
): MonthlyFortune {
  logger.info(MOD, `calculateMonthlyFortune 호출`, { year, month });
  // 해당 연도의 년간
  const yearIdx = ((year - 4) % 60 + 60) % 60;
  const yearStem = CHEONGAN[yearIdx % 10];
  const yearStemIdx = CHEONGAN.indexOf(yearStem);

  // 월지: 1월=인(2), 2월=묘(3), ..., 11월=자(0), 12월=축(1)
  // 양력 월 → 사주 월 (대략적)
  const sajuMonth = month <= 1 ? 12 : month - 1;
  const jijiIdx = (sajuMonth + 1) % 12;
  const monthJiji = JIJI[jijiIdx];

  // 월간 계산
  const stemStart = MONTH_STEM_START[yearStemIdx % 5];
  const monthStemIdx = (stemStart + (jijiIdx - 2 + 12) % 12) % 10;
  const monthCheongan = CHEONGAN[monthStemIdx];

  const dayMaster = fourPillars.day.ganJi.cheongan;
  const dayMasterElement = CHEONGAN_ELEMENT[dayMaster];
  const dayMasterYinYang = CHEONGAN_YINYANG[dayMaster];

  const cheonganElement = CHEONGAN_ELEMENT[monthCheongan];
  const jijiElement = JIJI_ELEMENT[monthJiji];
  const mainStem = HIDDEN_STEMS[monthJiji].main;

  const cheonganTenGod = getTenGod(
    dayMasterElement, dayMasterYinYang,
    cheonganElement, CHEONGAN_YINYANG[monthCheongan]
  );
  const jijiTenGod = getTenGod(
    dayMasterElement, dayMasterYinYang,
    CHEONGAN_ELEMENT[mainStem], CHEONGAN_YINYANG[mainStem]
  );

  logger.info(MOD, `calculateMonthlyFortune 결과`, { year, month, ganJi: `${monthCheongan}${monthJiji}`, cheonganTenGod, jijiTenGod });

  return {
    ganJi: { cheongan: monthCheongan, jiji: monthJiji },
    cheonganElement,
    jijiElement,
    cheonganTenGod,
    jijiTenGod,
    year,
    month,
    interpretation: '',
    score: 50,
  };
}

/**
 * 일운 계산
 * 기준일(1900-01-01 = 갑자일)로부터 계산
 */
export function calculateDailyFortune(
  year: number,
  month: number,
  day: number,
  fourPillars: FourPillars
): DailyFortune {
  logger.info(MOD, `calculateDailyFortune 호출`, { year, month, day });
  const days = daysSinceEpoch(year, month, day);
  const idx = ((days % 60) + 60) % 60;
  const cheongan = CHEONGAN[idx % 10];
  const jiji = JIJI[idx % 12];

  const dayMaster = fourPillars.day.ganJi.cheongan;
  const dayMasterElement = CHEONGAN_ELEMENT[dayMaster];
  const dayMasterYinYang = CHEONGAN_YINYANG[dayMaster];

  const cheonganElement = CHEONGAN_ELEMENT[cheongan];
  const jijiElement = JIJI_ELEMENT[jiji];
  const mainStem = HIDDEN_STEMS[jiji].main;

  const cheonganTenGod = getTenGod(
    dayMasterElement, dayMasterYinYang,
    cheonganElement, CHEONGAN_YINYANG[cheongan]
  );
  const jijiTenGod = getTenGod(
    dayMasterElement, dayMasterYinYang,
    CHEONGAN_ELEMENT[mainStem], CHEONGAN_YINYANG[mainStem]
  );

  const date = format(new Date(year, month - 1, day), 'yyyy-MM-dd');
  logger.info(MOD, `calculateDailyFortune 결과`, { date, ganJi: `${cheongan}${jiji}`, cheonganTenGod, jijiTenGod });

  return {
    ganJi: { cheongan, jiji },
    cheonganElement,
    jijiElement,
    cheonganTenGod,
    jijiTenGod,
    date,
    interpretation: '',
    score: 50,
  };
}

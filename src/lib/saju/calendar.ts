import KoreanLunarCalendar from 'korean-lunar-calendar';
import { logger } from '../logger';

const MOD = 'calendar';

interface SolarDate {
  year: number;
  month: number;
  day: number;
}

interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
}

const calendar = new KoreanLunarCalendar();

/**
 * 음력 → 양력 변환
 */
export function lunarToSolar(
  year: number,
  month: number,
  day: number,
  isLeapMonth: boolean = false
): SolarDate {
  logger.info(MOD, `lunarToSolar 호출`, { year, month, day, isLeapMonth });
  calendar.setLunarDate(year, month, day, isLeapMonth);
  const sol = calendar.getSolarCalendar();
  const result = {
    year: sol.year,
    month: sol.month,
    day: sol.day,
  };
  logger.info(MOD, `lunarToSolar 결과`, { lunar: { year, month, day, isLeapMonth }, solar: result });
  return result;
}

/**
 * 양력 → 음력 변환
 */
export function solarToLunar(
  year: number,
  month: number,
  day: number
): LunarDate {
  logger.info(MOD, `solarToLunar 호출`, { year, month, day });
  calendar.setSolarDate(year, month, day);
  const lun = calendar.getLunarCalendar();
  const result = {
    year: lun.year,
    month: lun.month,
    day: lun.day,
    isLeapMonth: lun.intercalation ?? false,
  };
  logger.info(MOD, `solarToLunar 결과`, { solar: { year, month, day }, lunar: result });
  return result;
}

/**
 * 양력 날짜를 Date 객체로 변환
 */
export function toDate(year: number, month: number, day: number): Date {
  logger.debug(MOD, `toDate 호출`, { year, month, day });
  return new Date(year, month - 1, day);
}

/**
 * 두 날짜 사이의 일수 차이 (절대값)
 */
export function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const result = Math.round(Math.abs(date1.getTime() - date2.getTime()) / msPerDay);
  logger.debug(MOD, `daysBetween 결과`, { date1: date1.toISOString(), date2: date2.toISOString(), days: result });
  return result;
}

/**
 * 기준일(1900-01-01 = 갑자일)로부터의 일수 계산
 */
export function daysSinceEpoch(year: number, month: number, day: number): number {
  const epoch = new Date(1900, 0, 1); // 1900-01-01
  const target = new Date(year, month - 1, day);
  const msPerDay = 24 * 60 * 60 * 1000;
  const result = Math.round((target.getTime() - epoch.getTime()) / msPerDay);
  logger.debug(MOD, `daysSinceEpoch`, { year, month, day, days: result });
  return result;
}

/**
 * 생년월일시 입력을 양력 기준으로 정규화
 */
export function normalizeBirthDate(
  year: number,
  month: number,
  day: number,
  isLunar: boolean,
  isLeapMonth: boolean = false
): SolarDate {
  logger.info(MOD, `normalizeBirthDate 호출`, { year, month, day, isLunar, isLeapMonth });
  if (isLunar) {
    const result = lunarToSolar(year, month, day, isLeapMonth);
    logger.info(MOD, `normalizeBirthDate 음력→양력 변환 완료`, result);
    return result;
  }
  logger.info(MOD, `normalizeBirthDate 양력 그대로 사용`, { year, month, day });
  return { year, month, day };
}

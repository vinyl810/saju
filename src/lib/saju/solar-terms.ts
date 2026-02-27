import { getSolarTermDate, getJeolDatesForYear, type SolarTermDate } from '../data/solar-terms-lookup';
import { logger } from '../logger';

const MOD = 'solar-terms';

/**
 * 주어진 양력 날짜가 어떤 절기 월에 해당하는지 판정
 * 반환값: 1(인월)~12(축월), 사주에서의 월 번호
 */
export function getSajuMonth(year: number, month: number, day: number): number {
  logger.info(MOD, `getSajuMonth 호출`, { year, month, day });

  const thisYearTerms = getJeolDatesForYear(year);
  const nextYearTerms = getJeolDatesForYear(year + 1);
  const prevYearTerms = getJeolDatesForYear(year - 1);

  logger.debug(MOD, `${year}년 절기 데이터 로드`, { thisYearTerms });

  const date = new Date(year, month - 1, day);

  const ipchun = thisYearTerms[1];
  const ipchunDate = new Date(year, ipchun.month - 1, ipchun.day);

  if (date < ipchunDate) {
    logger.debug(MOD, `입춘(${ipchun.month}/${ipchun.day}) 이전 → 전년도 기준`);
    const sohan = thisYearTerms[0];
    const sohanDate = new Date(year, sohan.month - 1, sohan.day);

    if (date >= sohanDate) {
      logger.info(MOD, `getSajuMonth 결과: 12 (축월, 소한~입춘)`, { year, month, day });
      return 12;
    }
    const prevDaeseol = prevYearTerms[11];
    const prevDaeseolDate = new Date(year - 1, prevDaeseol.month - 1, prevDaeseol.day);
    if (date >= prevDaeseolDate) {
      logger.info(MOD, `getSajuMonth 결과: 11 (자월, 대설~소한)`, { year, month, day });
      return 11;
    }
    logger.info(MOD, `getSajuMonth 결과: 11 (자월, fallback)`, { year, month, day });
    return 11;
  }

  for (let i = 2; i < 12; i++) {
    const termDate = new Date(year, thisYearTerms[i].month - 1, thisYearTerms[i].day);
    if (date < termDate) {
      const result = i - 1;
      logger.info(MOD, `getSajuMonth 결과: ${result} (${thisYearTerms[i - 1].name}~${thisYearTerms[i].name} 전일)`, { year, month, day });
      return result;
    }
  }

  const daeseol = thisYearTerms[11];
  const daeseolDate = new Date(year, daeseol.month - 1, daeseol.day);
  if (date >= daeseolDate) {
    const nextSohan = nextYearTerms[0];
    const nextSohanDate = new Date(year + 1, nextSohan.month - 1, nextSohan.day);
    if (date < nextSohanDate) {
      logger.info(MOD, `getSajuMonth 결과: 11 (자월, 대설 이후)`, { year, month, day });
      return 11;
    }
    logger.info(MOD, `getSajuMonth 결과: 12 (축월, 다음해 소한 이후)`, { year, month, day });
    return 12;
  }

  logger.info(MOD, `getSajuMonth 결과: 11 (최종 fallback)`, { year, month, day });
  return 11;
}

/**
 * 주어진 연도에서 입춘 날짜 반환
 */
export function getIpchunDate(year: number): Date {
  const terms = getJeolDatesForYear(year);
  const ipchun = terms[1];
  const result = new Date(year, ipchun.month - 1, ipchun.day);
  logger.debug(MOD, `getIpchunDate`, { year, ipchunMonth: ipchun.month, ipchunDay: ipchun.day });
  return result;
}

/**
 * 주어진 날짜 이전의 가장 가까운 절기 날짜 반환
 */
export function getPreviousJeolDate(year: number, month: number, day: number): Date {
  logger.debug(MOD, `getPreviousJeolDate 호출`, { year, month, day });
  const date = new Date(year, month - 1, day);
  const thisYearTerms = getJeolDatesForYear(year);
  const prevYearTerms = getJeolDatesForYear(year - 1);

  for (let i = 11; i >= 0; i--) {
    const termDate = new Date(year, thisYearTerms[i].month - 1, thisYearTerms[i].day);
    if (termDate <= date) {
      logger.debug(MOD, `getPreviousJeolDate 결과: ${thisYearTerms[i].name} (${year}/${thisYearTerms[i].month}/${thisYearTerms[i].day})`);
      return termDate;
    }
  }

  const prevDaeseol = prevYearTerms[11];
  logger.debug(MOD, `getPreviousJeolDate 결과: 전년 대설 (${year - 1}/${prevDaeseol.month}/${prevDaeseol.day})`);
  return new Date(year - 1, prevDaeseol.month - 1, prevDaeseol.day);
}

/**
 * 주어진 날짜 이후의 가장 가까운 절기 날짜 반환
 */
export function getNextJeolDate(year: number, month: number, day: number): Date {
  logger.debug(MOD, `getNextJeolDate 호출`, { year, month, day });
  const date = new Date(year, month - 1, day);
  const thisYearTerms = getJeolDatesForYear(year);
  const nextYearTerms = getJeolDatesForYear(year + 1);

  for (let i = 0; i < 12; i++) {
    const termDate = new Date(year, thisYearTerms[i].month - 1, thisYearTerms[i].day);
    if (termDate > date) {
      logger.debug(MOD, `getNextJeolDate 결과: ${thisYearTerms[i].name} (${year}/${thisYearTerms[i].month}/${thisYearTerms[i].day})`);
      return termDate;
    }
  }

  const nextSohan = nextYearTerms[0];
  logger.debug(MOD, `getNextJeolDate 결과: 다음해 소한 (${year + 1}/${nextSohan.month}/${nextSohan.day})`);
  return new Date(year + 1, nextSohan.month - 1, nextSohan.day);
}

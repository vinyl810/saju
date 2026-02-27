import type { BirthInput, FourPillars, MajorFortune, Gender, Cheongan, Jiji, FiveElement, TenGod } from './types';
import { CHEONGAN, JIJI, CHEONGAN_ELEMENT, CHEONGAN_YINYANG, JIJI_ELEMENT, HIDDEN_STEMS, getTenGod } from './constants';
import { getNextJeolDate, getPreviousJeolDate } from './solar-terms';
import { daysBetween, toDate } from './calendar';
import { logger } from '../logger';

const MOD = 'major-fortune';

/**
 * 순행/역행 판단
 * - 남양(남+양간), 여음(여+음간) = 순행
 * - 남음(남+음간), 여양(여+양간) = 역행
 */
export function isForward(gender: Gender, yearStemYinYang: string): boolean {
  let result: boolean;
  if (gender === '남') {
    result = yearStemYinYang === '양';
  } else {
    result = yearStemYinYang === '음';
  }
  logger.debug(MOD, `isForward`, { gender, yearStemYinYang, forward: result });
  return result;
}

/**
 * 대운 시작 나이 계산
 * - 순행: 생일 → 다음 절기까지 일수 ÷ 3
 * - 역행: 생일 → 이전 절기까지 일수 ÷ 3
 * (소수점은 반올림하되, 1일 = 4개월로 환산하여 보통 1~10세 사이)
 */
export function calculateMajorFortuneStartAge(
  gender: Gender,
  yearStemYinYang: string,
  solarYear: number,
  solarMonth: number,
  solarDay: number
): number {
  logger.info(MOD, `calculateMajorFortuneStartAge 호출`, { gender, yearStemYinYang, solarYear, solarMonth, solarDay });
  const forward = isForward(gender, yearStemYinYang);
  const birthDate = toDate(solarYear, solarMonth, solarDay);

  let targetDate: Date;
  if (forward) {
    targetDate = getNextJeolDate(solarYear, solarMonth, solarDay);
    logger.debug(MOD, `순행 → 다음 절기`, { targetDate: targetDate.toISOString() });
  } else {
    targetDate = getPreviousJeolDate(solarYear, solarMonth, solarDay);
    logger.debug(MOD, `역행 → 이전 절기`, { targetDate: targetDate.toISOString() });
  }

  const days = daysBetween(birthDate, targetDate);
  // 3일 = 1년, 소수점 반올림 (최소 1세)
  const startAge = Math.max(1, Math.round(days / 3));

  logger.info(MOD, `calculateMajorFortuneStartAge 결과`, { days, startAge });
  return startAge;
}

/**
 * 대운 10개 계산 (약 80년간)
 */
export function calculateMajorFortunes(
  input: BirthInput,
  fourPillars: FourPillars,
  solarYear: number,
  solarMonth: number,
  solarDay: number
): MajorFortune[] {
  logger.info(MOD, `calculateMajorFortunes 시작`, { gender: input.gender, solarYear, solarMonth, solarDay });

  const yearStemYinYang = CHEONGAN_YINYANG[fourPillars.year.ganJi.cheongan];
  const forward = isForward(input.gender, yearStemYinYang);

  const startAge = calculateMajorFortuneStartAge(
    input.gender, yearStemYinYang, solarYear, solarMonth, solarDay
  );

  // 월주에서 출발
  const monthStemIdx = CHEONGAN.indexOf(fourPillars.month.ganJi.cheongan);
  const monthBranchIdx = JIJI.indexOf(fourPillars.month.ganJi.jiji);

  const dayMaster = fourPillars.day.ganJi.cheongan;
  const dayMasterElement = CHEONGAN_ELEMENT[dayMaster];
  const dayMasterYinYang = CHEONGAN_YINYANG[dayMaster];

  logger.info(MOD, `대운 기본 정보`, { forward, startAge, monthStemIdx, monthBranchIdx, dayMaster });

  const fortunes: MajorFortune[] = [];

  for (let i = 1; i <= 10; i++) {
    const direction = forward ? i : -i;
    const stemIdx = ((monthStemIdx + direction) % 10 + 10) % 10;
    const branchIdx = ((monthBranchIdx + direction) % 12 + 12) % 12;

    const cheongan = CHEONGAN[stemIdx];
    const jiji = JIJI[branchIdx];

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

    const age = startAge + (i - 1) * 10;
    const year = solarYear + age;

    fortunes.push({
      ganJi: { cheongan, jiji },
      cheonganElement,
      jijiElement,
      cheonganTenGod,
      jijiTenGod,
      startAge: age,
      endAge: age + 9,
      startYear: year,
      interpretation: '',
      score: 50,
    });

    logger.debug(MOD, `대운 #${i}`, { ganJi: `${cheongan}${jiji}`, age: `${age}~${age + 9}세`, year });
  }

  logger.info(MOD, `calculateMajorFortunes 완료 (${fortunes.length}개)`);
  return fortunes;
}

import type { Cheongan, FiveElement, YinYang, TenGod, FourPillars } from './types';
import { CHEONGAN_ELEMENT, CHEONGAN_YINYANG, JIJI_ELEMENT, JIJI_YINYANG, getTenGod, HIDDEN_STEMS } from './constants';
import { logger } from '../logger';

const MOD = 'ten-gods';

/**
 * 일간 기준으로 특정 천간의 십신 판정
 */
export function getCheonganTenGod(dayMaster: Cheongan, target: Cheongan): TenGod {
  const result = getTenGod(
    CHEONGAN_ELEMENT[dayMaster],
    CHEONGAN_YINYANG[dayMaster],
    CHEONGAN_ELEMENT[target],
    CHEONGAN_YINYANG[target]
  );
  logger.debug(MOD, `getCheonganTenGod`, { dayMaster, target, result });
  return result;
}

/**
 * 일간 기준으로 특정 지지 정기의 십신 판정
 */
export function getJijiTenGod(dayMaster: Cheongan, target: string): TenGod {
  const jiji = target as keyof typeof JIJI_ELEMENT;
  const mainStem = HIDDEN_STEMS[jiji].main;
  const result = getTenGod(
    CHEONGAN_ELEMENT[dayMaster],
    CHEONGAN_YINYANG[dayMaster],
    CHEONGAN_ELEMENT[mainStem],
    CHEONGAN_YINYANG[mainStem]
  );
  logger.debug(MOD, `getJijiTenGod`, { dayMaster, target, mainStem, result });
  return result;
}

/**
 * 사주팔자 전체에 십신 배정
 */
export function assignTenGods(fourPillars: FourPillars): FourPillars {
  const dayMaster = fourPillars.day.ganJi.cheongan;
  logger.info(MOD, `assignTenGods 시작`, { dayMaster });

  const assignPillar = (pillar: typeof fourPillars.year, isDayPillar: boolean) => ({
    ...pillar,
    cheonganTenGod: isDayPillar
      ? undefined  // 일간은 자기 자신 (일주)
      : getCheonganTenGod(dayMaster, pillar.ganJi.cheongan),
    jijiTenGod: getJijiTenGod(dayMaster, pillar.ganJi.jiji),
  });

  const result = {
    year: assignPillar(fourPillars.year, false),
    month: assignPillar(fourPillars.month, false),
    day: assignPillar(fourPillars.day, true),
    hour: assignPillar(fourPillars.hour, false),
  };

  logger.info(MOD, `assignTenGods 완료`, {
    year: { cheongan: result.year.cheonganTenGod, jiji: result.year.jijiTenGod },
    month: { cheongan: result.month.cheonganTenGod, jiji: result.month.jijiTenGod },
    day: { jiji: result.day.jijiTenGod },
    hour: { cheongan: result.hour.cheonganTenGod, jiji: result.hour.jijiTenGod },
  });

  return result;
}

/**
 * 사주팔자에서 특정 십신 개수 세기
 */
export function countTenGod(fourPillars: FourPillars, tenGod: TenGod): number {
  let count = 0;
  const pillars = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour];

  for (const p of pillars) {
    if (p.cheonganTenGod === tenGod) count++;
    if (p.jijiTenGod === tenGod) count++;
  }
  logger.debug(MOD, `countTenGod`, { tenGod, count });
  return count;
}

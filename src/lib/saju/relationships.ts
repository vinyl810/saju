import type { FourPillars, Relationship, Jiji, Cheongan, PillarPosition } from './types';
import {
  CHEONGAN_COMBINES, CHEONGAN_CLASHES,
  YUKAP, SAMHAP, BANGHAP, YUKCHUNG, HYUNG, PA, HAE,
} from './constants';
import { logger } from '../logger';

const MOD = 'relationships';
const POSITIONS: PillarPosition[] = ['year', 'month', 'day', 'hour'];

/**
 * 천간합 확인
 */
export function findCheonganCombines(stems: Cheongan[]): Relationship[] {
  const results: Relationship[] = [];
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      for (const [a, b, element] of CHEONGAN_COMBINES) {
        if ((stems[i] === a && stems[j] === b) || (stems[i] === b && stems[j] === a)) {
          results.push({
            type: 'combine',
            name: `${a}${b}합${element}`,
            elements: [stems[i], stems[j]],
            positions: [POSITIONS[i], POSITIONS[j]],
            description: `${stems[i]}과(와) ${stems[j]}이(가) 합하여 ${element}으로 변합니다.`,
          });
        }
      }
    }
  }
  if (results.length > 0) logger.info(MOD, `천간합 발견`, { count: results.length, results: results.map(r => r.name) });
  return results;
}

/**
 * 천간충 확인
 */
export function findCheonganClashes(stems: Cheongan[]): Relationship[] {
  const results: Relationship[] = [];
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      for (const [a, b] of CHEONGAN_CLASHES) {
        if ((stems[i] === a && stems[j] === b) || (stems[i] === b && stems[j] === a)) {
          results.push({
            type: 'clash',
            name: `${a}${b}충`,
            elements: [stems[i], stems[j]],
            positions: [POSITIONS[i], POSITIONS[j]],
            description: `${stems[i]}과(와) ${stems[j]}이(가) 충합니다.`,
          });
        }
      }
    }
  }
  if (results.length > 0) logger.info(MOD, `천간충 발견`, { count: results.length, results: results.map(r => r.name) });
  return results;
}

/**
 * 지지 육합 확인
 */
export function findYukap(branches: Jiji[]): Relationship[] {
  const results: Relationship[] = [];
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      for (const [a, b, element] of YUKAP) {
        if ((branches[i] === a && branches[j] === b) || (branches[i] === b && branches[j] === a)) {
          results.push({
            type: 'combine',
            name: `${a}${b}합${element}`,
            elements: [branches[i], branches[j]],
            positions: [POSITIONS[i], POSITIONS[j]],
            description: `${branches[i]}과(와) ${branches[j]}이(가) 육합하여 ${element}으로 변합니다.`,
          });
        }
      }
    }
  }
  if (results.length > 0) logger.info(MOD, `육합 발견`, { count: results.length, results: results.map(r => r.name) });
  return results;
}

/**
 * 지지 삼합 확인
 */
export function findSamhap(branches: Jiji[]): Relationship[] {
  const results: Relationship[] = [];
  for (const [a, b, c, element] of SAMHAP) {
    if (branches.includes(a) && branches.includes(b) && branches.includes(c)) {
      const posA = POSITIONS[branches.indexOf(a)];
      const posC = POSITIONS[branches.lastIndexOf(c)];
      results.push({
        type: 'combine',
        name: `${a}${b}${c}삼합${element}`,
        elements: [a, c],
        positions: [posA, posC],
        description: `${a}, ${b}, ${c}이(가) 삼합하여 ${element}국을 이룹니다.`,
      });
    }
  }
  if (results.length > 0) logger.info(MOD, `삼합 발견`, { count: results.length, results: results.map(r => r.name) });
  return results;
}

/**
 * 지지 방합 확인
 */
export function findBanghap(branches: Jiji[]): Relationship[] {
  const results: Relationship[] = [];
  for (const [a, b, c, element] of BANGHAP) {
    if (branches.includes(a) && branches.includes(b) && branches.includes(c)) {
      const posA = POSITIONS[branches.indexOf(a)];
      const posC = POSITIONS[branches.lastIndexOf(c)];
      results.push({
        type: 'combine',
        name: `${a}${b}${c}방합${element}`,
        elements: [a, c],
        positions: [posA, posC],
        description: `${a}, ${b}, ${c}이(가) 방합하여 ${element}국을 이룹니다.`,
      });
    }
  }
  if (results.length > 0) logger.info(MOD, `방합 발견`, { count: results.length, results: results.map(r => r.name) });
  return results;
}

/**
 * 지지 육충 확인
 */
export function findYukchung(branches: Jiji[]): Relationship[] {
  const results: Relationship[] = [];
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      for (const [a, b] of YUKCHUNG) {
        if ((branches[i] === a && branches[j] === b) || (branches[i] === b && branches[j] === a)) {
          results.push({
            type: 'clash',
            name: `${a}${b}충`,
            elements: [branches[i], branches[j]],
            positions: [POSITIONS[i], POSITIONS[j]],
            description: `${branches[i]}과(와) ${branches[j]}이(가) 충합니다. 변화와 갈등의 기운이 있습니다.`,
          });
        }
      }
    }
  }
  if (results.length > 0) logger.info(MOD, `육충 발견`, { count: results.length, results: results.map(r => r.name) });
  return results;
}

/**
 * 지지 형 확인
 */
export function findHyung(branches: Jiji[]): Relationship[] {
  const results: Relationship[] = [];
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      for (const [a, b] of HYUNG) {
        if (a === b) {
          // 자형: 같은 지지가 두 개
          if (branches[i] === a && branches[j] === a) {
            results.push({
              type: 'punishment',
              name: `${a}${b}자형`,
              elements: [branches[i], branches[j]],
              positions: [POSITIONS[i], POSITIONS[j]],
              description: `${branches[i]}이(가) 자형(自刑)합니다.`,
            });
          }
        } else {
          if ((branches[i] === a && branches[j] === b) || (branches[i] === b && branches[j] === a)) {
            results.push({
              type: 'punishment',
              name: `${a}${b}형`,
              elements: [branches[i], branches[j]],
              positions: [POSITIONS[i], POSITIONS[j]],
              description: `${branches[i]}과(와) ${branches[j]}이(가) 형합니다.`,
            });
          }
        }
      }
    }
  }
  if (results.length > 0) logger.info(MOD, `형 발견`, { count: results.length, results: results.map(r => r.name) });
  return results;
}

/**
 * 지지 파 확인
 */
export function findPa(branches: Jiji[]): Relationship[] {
  const results: Relationship[] = [];
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      for (const [a, b] of PA) {
        if ((branches[i] === a && branches[j] === b) || (branches[i] === b && branches[j] === a)) {
          results.push({
            type: 'destruction',
            name: `${a}${b}파`,
            elements: [branches[i], branches[j]],
            positions: [POSITIONS[i], POSITIONS[j]],
            description: `${branches[i]}과(와) ${branches[j]}이(가) 파합니다.`,
          });
        }
      }
    }
  }
  if (results.length > 0) logger.info(MOD, `파 발견`, { count: results.length, results: results.map(r => r.name) });
  return results;
}

/**
 * 지지 해 확인
 */
export function findHae(branches: Jiji[]): Relationship[] {
  const results: Relationship[] = [];
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      for (const [a, b] of HAE) {
        if ((branches[i] === a && branches[j] === b) || (branches[i] === b && branches[j] === a)) {
          results.push({
            type: 'harm',
            name: `${a}${b}해`,
            elements: [branches[i], branches[j]],
            positions: [POSITIONS[i], POSITIONS[j]],
            description: `${branches[i]}과(와) ${branches[j]}이(가) 해합니다.`,
          });
        }
      }
    }
  }
  if (results.length > 0) logger.info(MOD, `해 발견`, { count: results.length, results: results.map(r => r.name) });
  return results;
}

/**
 * 사주팔자 전체의 합/충/형/파/해 분석
 */
export function analyzeRelationships(fourPillars: FourPillars): Relationship[] {
  logger.info(MOD, `analyzeRelationships 시작`);

  const stems: Cheongan[] = [
    fourPillars.year.ganJi.cheongan,
    fourPillars.month.ganJi.cheongan,
    fourPillars.day.ganJi.cheongan,
    fourPillars.hour.ganJi.cheongan,
  ];

  const branches: Jiji[] = [
    fourPillars.year.ganJi.jiji,
    fourPillars.month.ganJi.jiji,
    fourPillars.day.ganJi.jiji,
    fourPillars.hour.ganJi.jiji,
  ];

  logger.debug(MOD, `분석 대상`, { stems, branches });

  const results = [
    ...findCheonganCombines(stems),
    ...findCheonganClashes(stems),
    ...findYukap(branches),
    ...findSamhap(branches),
    ...findBanghap(branches),
    ...findYukchung(branches),
    ...findHyung(branches),
    ...findPa(branches),
    ...findHae(branches),
  ];

  logger.info(MOD, `analyzeRelationships 완료`, { totalRelationships: results.length, names: results.map(r => r.name) });
  return results;
}

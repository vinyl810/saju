import type { Jiji, HiddenStem } from './types';
import { HIDDEN_STEMS } from './constants';
import { logger } from '../logger';

const MOD = 'hidden-stems';

/**
 * 지지의 지장간(藏干) 조회
 */
export function getHiddenStems(jiji: Jiji): HiddenStem {
  const result = HIDDEN_STEMS[jiji];
  logger.debug(MOD, `getHiddenStems`, { jiji, main: result.main, middle: result.middle, residual: result.residual });
  return result;
}

/**
 * 지지의 정기(본기) 천간 조회
 */
export function getMainStem(jiji: Jiji): string {
  const main = HIDDEN_STEMS[jiji].main;
  logger.debug(MOD, `getMainStem`, { jiji, main });
  return main;
}

/**
 * 지지의 모든 지장간을 배열로 반환 (정기, 중기, 여기)
 */
export function getAllHiddenStems(jiji: Jiji): string[] {
  const hs = HIDDEN_STEMS[jiji];
  const result = [hs.main];
  if (hs.middle) result.push(hs.middle);
  if (hs.residual) result.push(hs.residual);
  logger.debug(MOD, `getAllHiddenStems`, { jiji, stems: result });
  return result;
}

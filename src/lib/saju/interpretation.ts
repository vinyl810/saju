import type { FourPillars, MajorFortune, YearlyFortune, MonthlyFortune, DailyFortune, YongsinAnalysis, TenGod, FiveElement } from './types';
import { CHEONGAN_ELEMENT, JIJI_ELEMENT, GENERATES, OVERCOMES, GENERATED_BY, OVERCOME_BY } from './constants';
import { logger } from '../logger';

const MOD = 'interpretation';

// ===== 십신 해석 =====
const TEN_GOD_INTERP: Record<TenGod, { keyword: string; fortune: string; career: string }> = {
  '비견': { keyword: '독립, 경쟁, 자존심', fortune: '동업이나 경쟁 상황이 발생합니다. 자신감을 갖되 독단을 경계하세요.', career: '독립 사업, 프리랜서, 체육' },
  '겁재': { keyword: '도전, 변화, 소비', fortune: '재물의 출입이 많고 변화가 큽니다. 지출 관리에 신경 쓰세요.', career: '영업, 투자, 유통' },
  '식신': { keyword: '표현, 재능, 여유', fortune: '창의력과 표현력이 좋아집니다. 취미나 재능을 발휘할 시기입니다.', career: '요리, 예술, 교육, 콘텐츠' },
  '상관': { keyword: '개혁, 반항, 자유', fortune: '기존 틀을 벗어나려는 욕구가 강합니다. 변화는 좋되 안정도 챙기세요.', career: '연예, 기술, 컨설팅, 변호사' },
  '편재': { keyword: '투자, 기회, 유동', fortune: '사업이나 투자에 좋은 기회가 올 수 있습니다. 과감하되 리스크 관리를 하세요.', career: '사업, 무역, 부동산, 금융' },
  '정재': { keyword: '안정, 저축, 근면', fortune: '꾸준한 노력이 결실을 맺는 시기입니다. 안정적인 수입이 기대됩니다.', career: '회계, 공무원, 금융, 관리직' },
  '편관': { keyword: '권위, 압박, 도전', fortune: '직장이나 시험에서 압박을 느낄 수 있습니다. 인내하면 좋은 결과가 있습니다.', career: '군인, 경찰, 의사, 법관' },
  '정관': { keyword: '규율, 명예, 책임', fortune: '승진이나 인정받을 기회가 있습니다. 도덕적이고 성실한 태도가 빛을 발합니다.', career: '공무원, 대기업, 교수, 판사' },
  '편인': { keyword: '학문, 영감, 고독', fortune: '학문이나 자격증 공부에 좋은 시기입니다. 새로운 지식을 탐구하세요.', career: '연구, IT, 의학, 철학' },
  '정인': { keyword: '학업, 보호, 안정', fortune: '학업이나 자격 취득에 유리합니다. 어르신이나 선배의 도움이 있습니다.', career: '교육, 공무원, 연구, 문학' },
};

// ===== 운세 해석 생성 =====

function getFortuneScore(
  cheonganTenGod: TenGod,
  jijiTenGod: TenGod,
  yongsin: YongsinAnalysis
): number {
  let score = 50;

  const goodTenGods: TenGod[] = ['정재', '정관', '정인', '식신'];
  const neutralTenGods: TenGod[] = ['비견', '편재', '편인'];
  const challengingTenGods: TenGod[] = ['겁재', '상관', '편관'];

  // 천간 십신 영향 (40%)
  if (goodTenGods.includes(cheonganTenGod)) score += 15;
  else if (challengingTenGods.includes(cheonganTenGod)) score -= 10;

  // 지지 십신 영향 (40%)
  if (goodTenGods.includes(jijiTenGod)) score += 15;
  else if (challengingTenGods.includes(jijiTenGod)) score -= 10;

  const finalScore = Math.max(10, Math.min(95, score));
  logger.debug(MOD, `getFortuneScore`, { cheonganTenGod, jijiTenGod, rawScore: score, finalScore });
  return finalScore;
}

/**
 * 대운 해석 생성
 */
export function interpretMajorFortune(
  fortune: MajorFortune,
  yongsin: YongsinAnalysis
): MajorFortune {
  logger.info(MOD, `interpretMajorFortune`, { age: `${fortune.startAge}~${fortune.endAge}`, ganJi: `${fortune.ganJi.cheongan}${fortune.ganJi.jiji}` });

  const chInterp = TEN_GOD_INTERP[fortune.cheonganTenGod];
  const jiInterp = TEN_GOD_INTERP[fortune.jijiTenGod];

  const interpretation = `${fortune.startAge}~${fortune.endAge}세 대운: ` +
    `천간 ${fortune.ganJi.cheongan}(${fortune.cheonganTenGod}) - ${chInterp.fortune} ` +
    `지지 ${fortune.ganJi.jiji}(${fortune.jijiTenGod}) - ${jiInterp.fortune}`;

  const score = getFortuneScore(fortune.cheonganTenGod, fortune.jijiTenGod, yongsin);

  return { ...fortune, interpretation, score };
}

/**
 * 세운 해석 생성
 */
export function interpretYearlyFortune(
  fortune: YearlyFortune,
  yongsin: YongsinAnalysis
): YearlyFortune {
  logger.info(MOD, `interpretYearlyFortune`, { year: fortune.year, ganJi: `${fortune.ganJi.cheongan}${fortune.ganJi.jiji}` });

  const chInterp = TEN_GOD_INTERP[fortune.cheonganTenGod];
  const jiInterp = TEN_GOD_INTERP[fortune.jijiTenGod];

  const interpretation = `${fortune.year}년 세운: ` +
    `${fortune.ganJi.cheongan}${fortune.ganJi.jiji}(${fortune.cheonganElement}/${fortune.jijiElement}) - ` +
    `${chInterp.fortune} ${jiInterp.keyword} 에너지가 지지에서 작용합니다.`;

  const score = getFortuneScore(fortune.cheonganTenGod, fortune.jijiTenGod, yongsin);

  return { ...fortune, interpretation, score };
}

/**
 * 월운 해석 생성
 */
export function interpretMonthlyFortune(
  fortune: MonthlyFortune,
  yongsin: YongsinAnalysis
): MonthlyFortune {
  logger.info(MOD, `interpretMonthlyFortune`, { year: fortune.year, month: fortune.month, ganJi: `${fortune.ganJi.cheongan}${fortune.ganJi.jiji}` });

  const chInterp = TEN_GOD_INTERP[fortune.cheonganTenGod];

  const interpretation = `${fortune.year}년 ${fortune.month}월: ` +
    `${fortune.ganJi.cheongan}${fortune.ganJi.jiji} - ${chInterp.fortune}`;

  const score = getFortuneScore(fortune.cheonganTenGod, fortune.jijiTenGod, yongsin);

  return { ...fortune, interpretation, score };
}

/**
 * 일운 해석 생성
 */
export function interpretDailyFortune(
  fortune: DailyFortune,
  yongsin: YongsinAnalysis
): DailyFortune {
  logger.info(MOD, `interpretDailyFortune`, { date: fortune.date, ganJi: `${fortune.ganJi.cheongan}${fortune.ganJi.jiji}` });

  const chInterp = TEN_GOD_INTERP[fortune.cheonganTenGod];
  const jiInterp = TEN_GOD_INTERP[fortune.jijiTenGod];

  const interpretation = `오늘의 운세: ${fortune.ganJi.cheongan}${fortune.ganJi.jiji}일 - ` +
    `${chInterp.keyword}의 기운이 흐릅니다. ${chInterp.fortune}`;

  const score = getFortuneScore(fortune.cheonganTenGod, fortune.jijiTenGod, yongsin);

  return { ...fortune, interpretation, score };
}

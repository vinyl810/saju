import type {
  FourPillars, CompatibilityResult, CompatibilityCategory,
  Cheongan, Jiji, FiveElement, YongsinAnalysis, FiveElementAnalysis,
} from './types';
import {
  CHEONGAN_ELEMENT, CHEONGAN_YINYANG, JIJI_ELEMENT,
  CHEONGAN_COMBINES, CHEONGAN_CLASHES,
  YUKAP, SAMHAP, YUKCHUNG,
} from './constants';
import { logger } from '../logger';

const MOD = 'compatibility';

/**
 * 1. 일간 관계 분석 (30%)
 */
function analyzeDayMasterRelation(fp1: FourPillars, fp2: FourPillars): CompatibilityCategory {
  const stem1 = fp1.day.ganJi.cheongan;
  const stem2 = fp2.day.ganJi.cheongan;
  logger.debug(MOD, `analyzeDayMasterRelation`, { stem1, stem2 });
  let score = 50;
  const details: string[] = [];

  // 천간합 체크
  for (const [a, b, element] of CHEONGAN_COMBINES) {
    if ((stem1 === a && stem2 === b) || (stem1 === b && stem2 === a)) {
      score = 95;
      details.push(`${stem1}${stem2} 천간합! ${element}으로 합화하여 궁합이 매우 좋습니다.`);
    }
  }

  // 천간충 체크
  for (const [a, b] of CHEONGAN_CLASHES) {
    if ((stem1 === a && stem2 === b) || (stem1 === b && stem2 === a)) {
      score = Math.min(score, 25);
      details.push(`${stem1}${stem2} 천간충! 갈등이 예상됩니다.`);
    }
  }

  // 같은 오행
  if (CHEONGAN_ELEMENT[stem1] === CHEONGAN_ELEMENT[stem2]) {
    score = Math.max(score, 70);
    details.push(`두 분 모두 ${CHEONGAN_ELEMENT[stem1]} 오행으로 공감대가 높습니다.`);
  }

  // 상생 관계
  const el1 = CHEONGAN_ELEMENT[stem1];
  const el2 = CHEONGAN_ELEMENT[stem2];
  if (isGenerating(el1, el2) || isGenerating(el2, el1)) {
    score = Math.max(score, 75);
    details.push(`일간이 상생 관계로 서로를 도와줍니다.`);
  }

  if (details.length === 0) {
    details.push(`일간 ${stem1}과(와) ${stem2}은(는) 특별한 관계가 없습니다.`);
  }

  logger.debug(MOD, `일간 관계 점수`, { score });

  return {
    name: '일간 관계',
    score,
    weight: 0.30,
    description: '두 사람의 일간(日干) 사이의 조화',
    details,
  };
}

/**
 * 2. 천간 전체 관계 (15%)
 */
function analyzeCheonganRelation(fp1: FourPillars, fp2: FourPillars): CompatibilityCategory {
  const stems1 = [fp1.year.ganJi.cheongan, fp1.month.ganJi.cheongan, fp1.day.ganJi.cheongan, fp1.hour.ganJi.cheongan];
  const stems2 = [fp2.year.ganJi.cheongan, fp2.month.ganJi.cheongan, fp2.day.ganJi.cheongan, fp2.hour.ganJi.cheongan];
  logger.debug(MOD, `analyzeCheonganRelation`, { stems1, stems2 });

  let combineCount = 0;
  let clashCount = 0;
  const details: string[] = [];

  for (const s1 of stems1) {
    for (const s2 of stems2) {
      for (const [a, b] of CHEONGAN_COMBINES) {
        if ((s1 === a && s2 === b) || (s1 === b && s2 === a)) {
          combineCount++;
        }
      }
      for (const [a, b] of CHEONGAN_CLASHES) {
        if ((s1 === a && s2 === b) || (s1 === b && s2 === a)) {
          clashCount++;
        }
      }
    }
  }

  let score = 50 + combineCount * 15 - clashCount * 15;
  score = Math.max(0, Math.min(100, score));

  if (combineCount > 0) details.push(`천간합 ${combineCount}개 발견 - 소통이 원활합니다.`);
  if (clashCount > 0) details.push(`천간충 ${clashCount}개 발견 - 의견 충돌이 있을 수 있습니다.`);
  if (combineCount === 0 && clashCount === 0) details.push('천간에 특별한 합충 관계가 없습니다.');

  logger.debug(MOD, `천간 관계 점수`, { combineCount, clashCount, score });

  return {
    name: '천간 조화',
    score,
    weight: 0.15,
    description: '두 사주의 천간 전체 관계',
    details,
  };
}

/**
 * 3. 지지 관계 (20%)
 */
function analyzeJijiRelation(fp1: FourPillars, fp2: FourPillars): CompatibilityCategory {
  const branches1 = [fp1.year.ganJi.jiji, fp1.month.ganJi.jiji, fp1.day.ganJi.jiji, fp1.hour.ganJi.jiji];
  const branches2 = [fp2.year.ganJi.jiji, fp2.month.ganJi.jiji, fp2.day.ganJi.jiji, fp2.hour.ganJi.jiji];
  logger.debug(MOD, `analyzeJijiRelation`, { branches1, branches2 });

  let combineCount = 0;
  let clashCount = 0;
  const details: string[] = [];

  for (const b1 of branches1) {
    for (const b2 of branches2) {
      // 육합
      for (const [a, b] of YUKAP) {
        if ((b1 === a && b2 === b) || (b1 === b && b2 === a)) {
          combineCount++;
        }
      }
      // 육충
      for (const [a, b] of YUKCHUNG) {
        if ((b1 === a && b2 === b) || (b1 === b && b2 === a)) {
          clashCount++;
        }
      }
    }
  }

  let score = 50 + combineCount * 12 - clashCount * 15;
  score = Math.max(0, Math.min(100, score));

  if (combineCount > 0) details.push(`지지 육합 ${combineCount}개 - 정서적 유대가 강합니다.`);
  if (clashCount > 0) details.push(`지지 육충 ${clashCount}개 - 생활 방식 충돌이 있을 수 있습니다.`);
  if (combineCount === 0 && clashCount === 0) details.push('지지에 특별한 합충 관계가 없습니다.');

  logger.debug(MOD, `지지 관계 점수`, { combineCount, clashCount, score });

  return {
    name: '지지 조화',
    score,
    weight: 0.20,
    description: '두 사주의 지지(地支) 관계',
    details,
  };
}

/**
 * 4. 오행 보완도 (20%)
 */
function analyzeElementComplement(
  fe1: FiveElementAnalysis,
  fe2: FiveElementAnalysis
): CompatibilityCategory {
  logger.debug(MOD, `analyzeElementComplement 시작`);
  const details: string[] = [];
  let complementScore = 0;

  // 서로의 부족한 오행을 보완하는지
  const elements: FiveElement[] = ['목', '화', '토', '금', '수'];
  for (const el of elements) {
    if (fe1.counts[el] < 0.5 && fe2.counts[el] >= 1.5) {
      complementScore += 15;
      details.push(`${el} 오행: 첫 번째 분이 부족하고 두 번째 분이 보충해줍니다.`);
    }
    if (fe2.counts[el] < 0.5 && fe1.counts[el] >= 1.5) {
      complementScore += 15;
      details.push(`${el} 오행: 두 번째 분이 부족하고 첫 번째 분이 보충해줍니다.`);
    }
  }

  // 오행 분포 유사도 (너무 치우치면 감점)
  let diffSum = 0;
  for (const el of elements) {
    diffSum += Math.abs(fe1.percentages[el] - fe2.percentages[el]);
  }
  const balanceScore = Math.max(0, 50 - diffSum / 2);

  const score = Math.min(100, complementScore + balanceScore);

  if (details.length === 0) {
    details.push('오행 보완 관계가 크지 않습니다.');
  }

  logger.debug(MOD, `오행 보완 점수`, { complementScore, balanceScore, score });

  return {
    name: '오행 보완',
    score,
    weight: 0.20,
    description: '부족한 오행을 서로 보완하는 정도',
    details,
  };
}

/**
 * 5. 용신 호환성 (15%)
 */
function analyzeYongsinCompatibility(
  ys1: YongsinAnalysis,
  ys2: YongsinAnalysis,
  fe1: FiveElementAnalysis,
  fe2: FiveElementAnalysis
): CompatibilityCategory {
  logger.debug(MOD, `analyzeYongsinCompatibility 시작`, { ys1Yongsin: ys1.yongsin, ys2Yongsin: ys2.yongsin });
  let score = 50;
  const details: string[] = [];

  // 상대방의 강한 오행이 내 용신인 경우
  if (fe2.strongest === ys1.yongsin) {
    score += 25;
    details.push(`상대의 강한 오행(${fe2.strongest})이 나의 용신과 일치합니다.`);
  }
  if (fe1.strongest === ys2.yongsin) {
    score += 25;
    details.push(`나의 강한 오행(${fe1.strongest})이 상대의 용신과 일치합니다.`);
  }

  // 상대의 강한 오행이 내 기신인 경우
  if (fe2.strongest === ys1.gisin) {
    score -= 15;
    details.push(`상대의 강한 오행(${fe2.strongest})이 나의 기신이라 부담될 수 있습니다.`);
  }
  if (fe1.strongest === ys2.gisin) {
    score -= 15;
    details.push(`나의 강한 오행(${fe1.strongest})이 상대의 기신이라 부담을 줄 수 있습니다.`);
  }

  score = Math.max(0, Math.min(100, score));

  if (details.length === 0) {
    details.push('용신 관점에서 보통의 호환성입니다.');
  }

  logger.debug(MOD, `용신 호환 점수`, { score });

  return {
    name: '용신 호환',
    score,
    weight: 0.15,
    description: '용신(必要한 오행)의 상호 지원 정도',
    details,
  };
}

function isGenerating(from: FiveElement, to: FiveElement): boolean {
  const map: Record<FiveElement, FiveElement> = {
    '목': '화', '화': '토', '토': '금', '금': '수', '수': '목',
  };
  return map[from] === to;
}

/**
 * 종합 궁합 분석
 */
export function analyzeCompatibility(
  fp1: FourPillars,
  fp2: FourPillars,
  fe1: FiveElementAnalysis,
  fe2: FiveElementAnalysis,
  ys1: YongsinAnalysis,
  ys2: YongsinAnalysis
): CompatibilityResult {
  logger.info(MOD, `analyzeCompatibility 시작`);

  const categories: CompatibilityCategory[] = [
    analyzeDayMasterRelation(fp1, fp2),
    analyzeCheonganRelation(fp1, fp2),
    analyzeJijiRelation(fp1, fp2),
    analyzeElementComplement(fe1, fe2),
    analyzeYongsinCompatibility(ys1, ys2, fe1, fe2),
  ];

  // 가중 평균 점수
  const totalScore = Math.round(
    categories.reduce((sum, cat) => sum + cat.score * cat.weight, 0)
  );

  // 등급
  let grade: 'S' | 'A' | 'B' | 'C' | 'D';
  if (totalScore >= 85) grade = 'S';
  else if (totalScore >= 70) grade = 'A';
  else if (totalScore >= 55) grade = 'B';
  else if (totalScore >= 40) grade = 'C';
  else grade = 'D';

  // 강점/약점
  const sorted = [...categories].sort((a, b) => b.score - a.score);
  const strengths = sorted.slice(0, 2).map(c => `${c.name}: ${c.details[0]}`);
  const weaknesses = sorted.slice(-2).filter(c => c.score < 50).map(c => `${c.name}: ${c.details[0]}`);

  // 요약
  const summaryMap: Record<string, string> = {
    'S': '두 분은 천생연분에 가까운 궁합입니다! 서로를 깊이 이해하고 보완해줄 수 있습니다.',
    'A': '좋은 궁합입니다. 서로의 장점을 살리며 조화롭게 지낼 수 있습니다.',
    'B': '무난한 궁합입니다. 서로 노력하면 좋은 관계를 유지할 수 있습니다.',
    'C': '다소 맞지 않는 부분이 있습니다. 서로의 차이를 이해하는 노력이 필요합니다.',
    'D': '상극의 기운이 강합니다. 서로를 존중하고 배려하는 자세가 특히 중요합니다.',
  };

  const adviceMap: Record<string, string> = {
    'S': '서로의 강점을 더욱 살려주세요. 함께하면 시너지가 큰 관계입니다.',
    'A': '작은 갈등에 너무 신경 쓰지 마세요. 큰 그림에서 좋은 인연입니다.',
    'B': '대화와 소통을 통해 서로를 더 깊이 이해해보세요.',
    'C': '서로 다른 점을 단점이 아닌 배울 점으로 바라보면 관계가 좋아집니다.',
    'D': '서로의 부족한 부분을 보완해주려는 마음가짐이 관계의 열쇠입니다.',
  };

  logger.info(MOD, `analyzeCompatibility 결과`, {
    totalScore,
    grade,
    categories: categories.map(c => ({ name: c.name, score: c.score })),
  });

  return {
    totalScore,
    grade,
    categories,
    summary: summaryMap[grade],
    strengths,
    weaknesses,
    advice: adviceMap[grade],
  };
}

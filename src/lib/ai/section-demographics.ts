import type { SajuAnalysis, FiveElement, TenGod, Relationship } from '@/lib/saju/types';
import type { AISectionKey } from './types';
import {
  CHEONGAN_HANJA,
  JIJI_HANJA,
  CHEONGAN_ELEMENT,
  ELEMENT_HANJA,
  TEN_GOD_HANJA,
} from '@/lib/saju/constants';
import { analyzeSpouseStar, formatTimingWindow } from '@/lib/saju/spouse-star';

// ===== 섹션별 데모그래픽 데이터 타입 =====

export interface GanjiBadge {
  label: string;   // e.g. "을사"
  hanja: string;   // e.g. "乙巳"
  element: FiveElement;
}

export interface ElementBadge {
  label: string;
  element: FiveElement;
}

export interface TenGodBadge {
  label: string;
  hanja: string;
}

export interface ElementBar {
  element: FiveElement;
  hanja: string;
  percentage: number;
}

export interface RelationshipBadge {
  name: string;
  type: 'combine' | 'clash' | 'punishment' | 'destruction' | 'harm';
}

export interface OverallDemographics {
  kind: 'overall';
  pillars: GanjiBadge[];
  dayMaster: ElementBadge;
  strength: string;        // '신강' | '신약' | '중화'
  yongsin: ElementBadge;
  huisin: ElementBadge;
}

export interface PersonalityDemographics {
  kind: 'personality';
  strengths: string[];
  weaknesses: string[];
}

export interface WealthDemographics {
  kind: 'wealth';
  tenGods: TenGodBadge[];
  yongsin: ElementBadge;
}

export interface CareerDemographics {
  kind: 'career';
  careers: string[];
  tenGods: TenGodBadge[];
}

export interface LoveDemographics {
  kind: 'love';
  relationships: RelationshipBadge[];
}

export interface HealthDemographics {
  kind: 'health';
  bars: ElementBar[];
  missing: FiveElement[];
  strongest: FiveElement;
  weakest: FiveElement;
}

export interface MarriageDemographics {
  kind: 'marriage';
  spouseStars: TenGodBadge[];
  spouseStarCount: number;
  spousePalace: GanjiBadge;
  hasSpouseStarInPalace: boolean;
  timingWindows: string[];
}

export interface YearAdviceDemographics {
  kind: 'yearAdvice';
  ganJi: GanjiBadge;
  score: number;
  tenGods: TenGodBadge[];
}

export type SectionDemographics =
  | OverallDemographics
  | PersonalityDemographics
  | WealthDemographics
  | CareerDemographics
  | LoveDemographics
  | MarriageDemographics
  | HealthDemographics
  | YearAdviceDemographics;

// ===== 헬퍼 =====

function makeGanjiBadge(cheongan: string, jiji: string): GanjiBadge {
  const c = cheongan as keyof typeof CHEONGAN_HANJA;
  const j = jiji as keyof typeof JIJI_HANJA;
  return {
    label: `${cheongan}${jiji}`,
    hanja: `${CHEONGAN_HANJA[c]}${JIJI_HANJA[j]}`,
    element: CHEONGAN_ELEMENT[c],
  };
}

function makeElementBadge(element: FiveElement, prefix: string): ElementBadge {
  return {
    label: `${prefix}: ${element}(${ELEMENT_HANJA[element]})`,
    element,
  };
}

function makeTenGodBadge(tenGod: TenGod): TenGodBadge {
  return {
    label: tenGod,
    hanja: TEN_GOD_HANJA[tenGod],
  };
}

const STRENGTH_LABEL: Record<string, string> = {
  strong: '신강',
  weak: '신약',
  neutral: '중화',
};

// ===== 메인 추출 함수 =====

export function getSectionDemographics(
  sectionKey: AISectionKey,
  analysis: SajuAnalysis,
): SectionDemographics | null {
  switch (sectionKey) {
    case 'overall':
      return getOverallDemographics(analysis);
    case 'personality':
      return getPersonalityDemographics(analysis);
    case 'wealth':
      return getWealthDemographics(analysis);
    case 'career':
      return getCareerDemographics(analysis);
    case 'love':
      return getLoveDemographics(analysis);
    case 'marriage':
      return getMarriageDemographics(analysis);
    case 'health':
      return getHealthDemographics(analysis);
    case 'yearAdvice':
      return getYearAdviceDemographics(analysis);
    default:
      return null;
  }
}

function getOverallDemographics(a: SajuAnalysis): OverallDemographics {
  const { fourPillars, yongsin } = a;
  const pillars = (['year', 'month', 'day', 'hour'] as const).map((pos) => {
    const p = fourPillars[pos];
    return makeGanjiBadge(p.ganJi.cheongan, p.ganJi.jiji);
  });

  const dayElement = fourPillars.day.cheonganElement;

  return {
    kind: 'overall',
    pillars,
    dayMaster: makeElementBadge(dayElement, '일간'),
    strength: STRENGTH_LABEL[yongsin.dayMasterStrength] ?? '중화',
    yongsin: makeElementBadge(yongsin.yongsin, '용신'),
    huisin: makeElementBadge(yongsin.huisin, '희신'),
  };
}

function getPersonalityDemographics(a: SajuAnalysis): PersonalityDemographics {
  return {
    kind: 'personality',
    strengths: a.personality.strengths,
    weaknesses: a.personality.weaknesses,
  };
}

function getWealthDemographics(a: SajuAnalysis): WealthDemographics {
  const tenGods: TenGodBadge[] = [];
  const { currentYearFortune, yongsin } = a;

  // 편재/정재 십신만 추출
  const wealthGods: TenGod[] = ['편재', '정재'];
  if (wealthGods.includes(currentYearFortune.cheonganTenGod)) {
    tenGods.push(makeTenGodBadge(currentYearFortune.cheonganTenGod));
  }
  if (wealthGods.includes(currentYearFortune.jijiTenGod)) {
    tenGods.push(makeTenGodBadge(currentYearFortune.jijiTenGod));
  }

  // 세운에 재성이 없으면 세운 십신 그대로 표시
  if (tenGods.length === 0) {
    tenGods.push(makeTenGodBadge(currentYearFortune.cheonganTenGod));
    tenGods.push(makeTenGodBadge(currentYearFortune.jijiTenGod));
  }

  return {
    kind: 'wealth',
    tenGods,
    yongsin: makeElementBadge(yongsin.yongsin, '용신'),
  };
}

function getCareerDemographics(a: SajuAnalysis): CareerDemographics {
  const tenGods: TenGodBadge[] = [];
  const { fourPillars } = a;

  // 관성 (편관/정관) 찾기
  const officialGods: TenGod[] = ['편관', '정관'];
  for (const pos of ['year', 'month', 'hour'] as const) {
    const p = fourPillars[pos];
    if (p.cheonganTenGod && officialGods.includes(p.cheonganTenGod)) {
      tenGods.push(makeTenGodBadge(p.cheonganTenGod));
    }
    if (p.jijiTenGod && officialGods.includes(p.jijiTenGod)) {
      tenGods.push(makeTenGodBadge(p.jijiTenGod));
    }
  }

  return {
    kind: 'career',
    careers: a.personality.career,
    tenGods,
  };
}

function getLoveDemographics(a: SajuAnalysis): LoveDemographics {
  return {
    kind: 'love',
    relationships: a.relationships.map((r: Relationship) => ({
      name: r.name,
      type: r.type,
    })),
  };
}

function getMarriageDemographics(a: SajuAnalysis): MarriageDemographics {
  const { fourPillars, birthInput, majorFortunes } = a;
  const result = analyzeSpouseStar(birthInput.gender, fourPillars, majorFortunes);

  const spouseStars = result.spouseStars.map((tg) => makeTenGodBadge(tg));
  const spousePalace = makeGanjiBadge(
    fourPillars.day.ganJi.cheongan,
    fourPillars.day.ganJi.jiji,
  );

  return {
    kind: 'marriage',
    spouseStars,
    spouseStarCount: result.spouseStarCount,
    spousePalace,
    hasSpouseStarInPalace: result.spousePalace.hasSpouseStar,
    timingWindows: result.marriageTimingWindows
      .filter((w) => w.category !== '참고')
      .map(formatTimingWindow),
  };
}

function getHealthDemographics(a: SajuAnalysis): HealthDemographics {
  const { fiveElements } = a;
  const elements: FiveElement[] = ['목', '화', '토', '금', '수'];

  return {
    kind: 'health',
    bars: elements.map((el) => ({
      element: el,
      hanja: ELEMENT_HANJA[el],
      percentage: fiveElements.percentages[el],
    })),
    missing: fiveElements.missing,
    strongest: fiveElements.strongest,
    weakest: fiveElements.weakest,
  };
}

function getYearAdviceDemographics(a: SajuAnalysis): YearAdviceDemographics {
  const { currentYearFortune } = a;
  return {
    kind: 'yearAdvice',
    ganJi: makeGanjiBadge(
      currentYearFortune.ganJi.cheongan,
      currentYearFortune.ganJi.jiji,
    ),
    score: currentYearFortune.score,
    tenGods: [
      makeTenGodBadge(currentYearFortune.cheonganTenGod),
      makeTenGodBadge(currentYearFortune.jijiTenGod),
    ],
  };
}

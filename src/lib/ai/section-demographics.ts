import type { SajuAnalysis, FiveElement, TenGod, Relationship, Cheongan } from '@/lib/saju/types';
import type { AISectionKey, AnalysisMode } from './types';
import {
  CHEONGAN,
  JIJI,
  CHEONGAN_HANJA,
  JIJI_HANJA,
  CHEONGAN_ELEMENT,
  CHEONGAN_YINYANG,
  JIJI_ELEMENT,
  HIDDEN_STEMS,
  MONTH_STEM_START,
  getTenGod,
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
  tenGods: TenGodBadge[];
}

export interface WealthDemographics {
  kind: 'wealth';
  keywords: string[];
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
  keywords: string[];
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

export interface MonthlyFortuneDemographics {
  kind: 'monthlyFortune';
  months: { month: number; ganJi: GanjiBadge; score: number; tenGods: TenGodBadge[] }[];
}

export interface LabLifeDemographics {
  kind: 'labLife';
  keywords: string[];
  tenGods: TenGodBadge[];  // 비겁/인성/식상
}

export interface ProfessorRelationDemographics {
  kind: 'professorRelation';
  keywords: string[];
  tenGods: TenGodBadge[];  // 관성/인성
}

export interface PaperAcceptanceDemographics {
  kind: 'paperAcceptance';
  tenGods: TenGodBadge[];  // 식상/재성
  yearScore: number;
  yearGanJi: GanjiBadge;
}

export interface RomanceDemographics {
  kind: 'romance';
  keywords: string[];
  relationships: RelationshipBadge[];
  spouseStars: TenGodBadge[];
}

export interface InterpersonalDemographics {
  kind: 'interpersonal';
  keywords: string[];
  relationships: RelationshipBadge[];
}

export interface ResearchPersonalityDemographics {
  kind: 'researchPersonality';
  keywords: string[];
  tenGods: TenGodBadge[];
}

export interface GraduationDemographics {
  kind: 'graduation';
  keywords: string[];
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
  | YearAdviceDemographics
  | MonthlyFortuneDemographics
  | LabLifeDemographics
  | ProfessorRelationDemographics
  | PaperAcceptanceDemographics
  | RomanceDemographics
  | InterpersonalDemographics
  | GraduationDemographics
  | ResearchPersonalityDemographics;

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

/** 일지 인덱스 기반 슬라이딩 윈도우로 키워드 N개 선택 */
function selectByJiji(pool: string[], jiji: string, count: number = 3): string[] {
  const jijiIdx = JIJI.indexOf(jiji as typeof JIJI[number]);
  const n = pool.length;
  const offset = (jijiIdx >= 0 ? jijiIdx : 0) % n;
  return Array.from({ length: count }, (_, i) => pool[(offset + i) % n]);
}

// ===== 메인 추출 함수 =====

export function getSectionDemographics(
  sectionKey: AISectionKey,
  analysis: SajuAnalysis,
  mode: AnalysisMode = 'general',
): SectionDemographics | null {
  switch (sectionKey) {
    case 'overall':
      return getOverallDemographics(analysis);
    case 'characterTraits':
      return getPersonalityDemographics(analysis);
    case 'personality':
      return mode === 'graduate' ? getResearchPersonalityDemographics(analysis) : getPersonalityDemographics(analysis);
    case 'wealth':
      return getWealthDemographics(analysis);
    case 'career':
      return getCareerDemographics(analysis);
    case 'love':
      return mode === 'graduate' ? getInterpersonalDemographics(analysis) : getLoveDemographics(analysis);
    case 'marriage':
      return mode === 'graduate' ? getGraduationDemographics(analysis) : getMarriageDemographics(analysis);
    case 'marriageFortune':
      return getMarriageDemographics(analysis);
    case 'health':
      return getHealthDemographics(analysis);
    case 'yearAdvice':
      return getYearAdviceDemographics(analysis);
    case 'monthlyFortune':
      return getMonthlyFortuneDemographics(analysis);
    case 'labLife':
      return getLabLifeDemographics(analysis);
    case 'professorRelation':
      return getProfessorRelationDemographics(analysis);
    case 'paperAcceptance':
      return getPaperAcceptanceDemographics(analysis);
    case 'romance':
      return getRomanceDemographics(analysis);
    default:
      return null;
  }
}

export function getSectionSummary(demographics: SectionDemographics): string | null {
  switch (demographics.kind) {
    case 'overall': {
      const d = demographics;
      const el = d.dayMaster.element;
      return `${el}(${ELEMENT_HANJA[el]})의 기운을 타고난 ${d.strength}한 사주입니다`;
    }
    case 'personality': {
      const top = demographics.strengths.slice(0, 2);
      if (top.length === 0) return null;
      return `${top.join('과 ')}을 겸비한 사람입니다`;
    }
    case 'wealth':
      return `${demographics.keywords[0]}이며 ${demographics.keywords[1]}을 지녔습니다`;
    case 'career': {
      const c = demographics.careers.slice(0, 2);
      if (c.length === 0) return null;
      return `${c.join(', ')} 분야에 적성이 있습니다`;
    }
    case 'love':
      return `${demographics.keywords[0]}으로, ${demographics.keywords[1]}이 특징입니다`;
    case 'marriage': {
      const d = demographics;
      const stars = d.spouseStars.map((s) => s.label).join(' · ');
      return `배우자성 ${stars}이 ${d.spouseStarCount}개 있는 사주입니다`;
    }
    case 'health': {
      const d = demographics;
      if (d.missing.length > 0) {
        return `${d.strongest}(${ELEMENT_HANJA[d.strongest]})이 강하고 ${d.missing.map((el) => `${el}(${ELEMENT_HANJA[el]})`).join(' · ')}이 부족한 체질입니다`;
      }
      return `${d.strongest}(${ELEMENT_HANJA[d.strongest]})이 강하고 ${d.weakest}(${ELEMENT_HANJA[d.weakest]})이 약한 체질입니다`;
    }
    case 'yearAdvice': {
      const d = demographics;
      return `${d.ganJi.label}(${d.ganJi.hanja})년, 올해 세운은 ${d.score}점입니다`;
    }
    case 'monthlyFortune': {
      const d = demographics;
      const best = d.months.reduce((a, b) => (a.score >= b.score ? a : b));
      const worst = d.months.reduce((a, b) => (a.score <= b.score ? a : b));
      return `${best.month}월이 가장 좋고(${best.score}점), ${worst.month}월에 주의가 필요합니다(${worst.score}점)`;
    }
    case 'labLife':
      return `${demographics.keywords[0]}이자 ${demographics.keywords[1]}을 갖춘 연구자입니다`;
    case 'professorRelation':
      return `${demographics.keywords[0]}와 ${demographics.keywords[1]}을 가진 사람입니다`;
    case 'paperAcceptance': {
      const d = demographics;
      return `올해 논문 적성은 ${d.yearScore}점, ${d.yearGanJi.label}(${d.yearGanJi.hanja})년의 흐름입니다`;
    }
    case 'romance':
      return `${demographics.keywords[0]}으로, ${demographics.keywords[1]}이 특징입니다`;
    case 'interpersonal':
      return `${demographics.keywords[0]}이며 ${demographics.keywords[1]}을 가진 사람입니다`;
    case 'graduation':
      return `${demographics.keywords[0]}이며 ${demographics.keywords[1]}을 갖춘 사람입니다`;
    case 'researchPersonality':
      return `${demographics.keywords[0]}이며 ${demographics.keywords[1]}을 가진 연구자입니다`;
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
  // 사주 전체에서 고유 십신 추출
  const seen = new Set<TenGod>();
  const tenGods: TenGodBadge[] = [];
  for (const pos of ['year', 'month', 'hour'] as const) {
    const p = a.fourPillars[pos];
    if (p.cheonganTenGod && !seen.has(p.cheonganTenGod)) {
      seen.add(p.cheonganTenGod);
      tenGods.push(makeTenGodBadge(p.cheonganTenGod));
    }
    if (p.jijiTenGod && !seen.has(p.jijiTenGod)) {
      seen.add(p.jijiTenGod);
      tenGods.push(makeTenGodBadge(p.jijiTenGod));
    }
  }
  const dayBranch = a.fourPillars.day.ganJi.jiji;
  return {
    kind: 'personality',
    strengths: selectByJiji(a.personality.strengths, dayBranch, 4),
    weaknesses: selectByJiji(a.personality.weaknesses, dayBranch, 3),
    tenGods,
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

  const dayMaster = a.fourPillars.day.ganJi.cheongan as Cheongan;
  const dayBranch = a.fourPillars.day.ganJi.jiji;
  return {
    kind: 'wealth',
    keywords: selectByJiji(WEALTH_KEYWORDS[dayMaster] || [], dayBranch),
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

  const dayBranch = a.fourPillars.day.ganJi.jiji;
  return {
    kind: 'career',
    careers: selectByJiji(a.personality.career, dayBranch, 4),
    tenGods,
  };
}

function getLoveDemographics(a: SajuAnalysis): LoveDemographics {
  const dayMaster = a.fourPillars.day.ganJi.cheongan as Cheongan;
  const dayBranch = a.fourPillars.day.ganJi.jiji;
  return {
    kind: 'love',
    keywords: selectByJiji(LOVE_KEYWORDS[dayMaster] || [], dayBranch),
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

  // 완전 결여(0%) 또는 10% 이하인 오행을 부족으로 표시
  const weak = elements.filter((el) => fiveElements.percentages[el] <= 10);

  return {
    kind: 'health',
    bars: elements.map((el) => ({
      element: el,
      hanja: ELEMENT_HANJA[el],
      percentage: fiveElements.percentages[el],
    })),
    missing: weak,
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

function calcMonthlyScore(chTG: TenGod, jiTG: TenGod): number {
  const good: TenGod[] = ['정재', '정관', '정인', '식신'];
  const bad: TenGod[] = ['겁재', '상관', '편관'];
  let s = 50;
  if (good.includes(chTG)) s += 15; else if (bad.includes(chTG)) s -= 10;
  if (good.includes(jiTG)) s += 15; else if (bad.includes(jiTG)) s -= 10;
  return Math.max(10, Math.min(95, s));
}

function getMonthlyFortuneDemographics(a: SajuAnalysis): MonthlyFortuneDemographics {
  const { fourPillars } = a;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const dayMaster = fourPillars.day.ganJi.cheongan;
  const dmElement = CHEONGAN_ELEMENT[dayMaster];
  const dmYinYang = CHEONGAN_YINYANG[dayMaster];

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = ((currentMonth - 1 + i) % 12) + 1;
    const y = currentYear + Math.floor((currentMonth - 1 + i) / 12);

    const yearIdx = ((y - 4) % 60 + 60) % 60;
    const yearStem = CHEONGAN[yearIdx % 10];
    const yearStemIdx = CHEONGAN.indexOf(yearStem);

    const sajuMonth = month <= 1 ? 12 : month - 1;
    const jijiIdx = (sajuMonth + 1) % 12;
    const monthJiji = JIJI[jijiIdx];
    const stemStart = MONTH_STEM_START[yearStemIdx % 5];
    const monthStemIdx = (stemStart + (jijiIdx - 2 + 12) % 12) % 10;
    const monthCheongan = CHEONGAN[monthStemIdx];

    const mainStem = HIDDEN_STEMS[monthJiji].main;
    const chTG = getTenGod(dmElement, dmYinYang, CHEONGAN_ELEMENT[monthCheongan], CHEONGAN_YINYANG[monthCheongan]);
    const jiTG = getTenGod(dmElement, dmYinYang, CHEONGAN_ELEMENT[mainStem], CHEONGAN_YINYANG[mainStem]);
    const score = calcMonthlyScore(chTG, jiTG);

    return {
      month,
      ganJi: makeGanjiBadge(monthCheongan, monthJiji),
      score,
      tenGods: [makeTenGodBadge(chTG), makeTenGodBadge(jiTG)],
    };
  });

  return { kind: 'monthlyFortune', months };
}

// 사주에서 특정 십신 그룹 추출 헬퍼
function findTenGods(a: SajuAnalysis, targets: TenGod[]): TenGodBadge[] {
  const found: TenGodBadge[] = [];
  const seen = new Set<TenGod>();
  for (const pos of ['year', 'month', 'hour'] as const) {
    const p = a.fourPillars[pos];
    if (p.cheonganTenGod && targets.includes(p.cheonganTenGod) && !seen.has(p.cheonganTenGod)) {
      seen.add(p.cheonganTenGod);
      found.push(makeTenGodBadge(p.cheonganTenGod));
    }
    if (p.jijiTenGod && targets.includes(p.jijiTenGod) && !seen.has(p.jijiTenGod)) {
      seen.add(p.jijiTenGod);
      found.push(makeTenGodBadge(p.jijiTenGod));
    }
  }
  return found;
}

function getLabLifeDemographics(a: SajuAnalysis): LabLifeDemographics {
  const dayMaster = a.fourPillars.day.ganJi.cheongan as Cheongan;
  const dayBranch = a.fourPillars.day.ganJi.jiji;
  // 비겁(동료), 인성(학습), 식상(창의) 계열
  const tenGods = findTenGods(a, ['비견', '겁재', '정인', '편인', '식신', '상관']);
  return { kind: 'labLife', keywords: selectByJiji(LAB_LIFE_KEYWORDS[dayMaster] || [], dayBranch), tenGods };
}

function getProfessorRelationDemographics(a: SajuAnalysis): ProfessorRelationDemographics {
  const dayMaster = a.fourPillars.day.ganJi.cheongan as Cheongan;
  const dayBranch = a.fourPillars.day.ganJi.jiji;
  // 관성(권위/상사), 인성(멘토/학습) 계열
  const tenGods = findTenGods(a, ['편관', '정관', '편인', '정인']);
  return { kind: 'professorRelation', keywords: selectByJiji(PROFESSOR_KEYWORDS[dayMaster] || [], dayBranch), tenGods };
}

function getPaperAcceptanceDemographics(a: SajuAnalysis): PaperAcceptanceDemographics {
  // 식상(표현/창작), 재성(성과/결실) 계열
  const tenGods = findTenGods(a, ['식신', '상관', '편재', '정재']);
  const { currentYearFortune } = a;

  // 논문운 전용 점수: 사주 내 식상/재성 보유 + 올해 세운 십신 반영
  const paperGods: TenGod[] = ['식신', '상관', '편재', '정재'];
  let paperScore = 50;
  // 사주 원국에 식상/재성이 있으면 가산
  for (const pos of ['year', 'month', 'hour'] as const) {
    const p = a.fourPillars[pos];
    if (p.cheonganTenGod && paperGods.includes(p.cheonganTenGod)) paperScore += 5;
    if (p.jijiTenGod && paperGods.includes(p.jijiTenGod)) paperScore += 5;
  }
  // 올해 세운에 식상/재성이 오면 가산, 관성(편관)은 압박으로 감산
  if (paperGods.includes(currentYearFortune.cheonganTenGod)) paperScore += 10;
  if (paperGods.includes(currentYearFortune.jijiTenGod)) paperScore += 10;
  if (currentYearFortune.cheonganTenGod === '편관') paperScore -= 8;
  if (currentYearFortune.jijiTenGod === '편관') paperScore -= 8;
  // 인성(정인/편인)은 학습력으로 소폭 가산
  if (currentYearFortune.cheonganTenGod === '정인' || currentYearFortune.cheonganTenGod === '편인') paperScore += 5;
  if (currentYearFortune.jijiTenGod === '정인' || currentYearFortune.jijiTenGod === '편인') paperScore += 5;
  paperScore = Math.max(15, Math.min(95, paperScore));

  return {
    kind: 'paperAcceptance',
    tenGods,
    yearScore: paperScore,
    yearGanJi: makeGanjiBadge(currentYearFortune.ganJi.cheongan, currentYearFortune.ganJi.jiji),
  };
}

function getRomanceDemographics(a: SajuAnalysis): RomanceDemographics {
  const dayMaster = a.fourPillars.day.ganJi.cheongan as Cheongan;
  const dayBranch = a.fourPillars.day.ganJi.jiji;
  const { birthInput, fourPillars, majorFortunes } = a;
  const spouseResult = analyzeSpouseStar(birthInput.gender, fourPillars, majorFortunes);
  return {
    kind: 'romance',
    keywords: selectByJiji(LOVE_KEYWORDS[dayMaster] || [], dayBranch),
    relationships: a.relationships.map((r: Relationship) => ({ name: r.name, type: r.type })),
    spouseStars: spouseResult.spouseStars.map((tg) => makeTenGodBadge(tg)),
  };
}

// ===== 키워드 사전 =====

const WEALTH_KEYWORDS: Record<Cheongan, string[]> = {
  '갑': ['대범한 투자형', '선구자 기질', '사업가 성향', '위험 감수형', '장기 비전형', '독자 노선형', '자기 확신형', '승부사 기질'],
  '을': ['안정 추구형', '꾸준한 축적가', '실속파', '협력 수익형', '저축 습관형', '부업 적성형', '알뜰 재테크형', '꼼꼼한 관리형'],
  '병': ['화끈한 소비형', '넓은 인맥형', '도전적 성격', '투자 직감형', '인맥 활용형', '트렌드 선도형', '과감한 배팅형', '명예 소비형'],
  '정': ['꼼꼼한 관리형', '알뜰한 성격', '내실형', '절세 전략가', '세심한 지출 관리', '안전 자산 선호', '장기 적금형', '가계부 달인'],
  '무': ['안정 지향형', '큰 그림 사고', '신중한 성격', '부동산 적성형', '장기 보유형', '보수적 투자형', '묵직한 자산형', '기반 축적형'],
  '기': ['실속 추구형', '절약가 기질', '틈새 포착형', '생활비 절약형', '소액 투자형', '현금 선호형', '알뜰 소비형', '실리 추구형'],
  '경': ['원칙적 관리형', '효율 중시형', '결단력', '체계적 포트폴리오형', '손절 결단형', '원칙 투자형', '고수익 추구형', '기술주 선호형'],
  '신': ['분석적 투자형', '전문가 기질', '높은 기준', '데이터 기반 투자', '가치 투자형', '리서치 중심형', '안전 마진 추구형', '정밀 분석형'],
  '임': ['다재다능형', '유연한 사고', '기회 포착형', '해외 투자형', '분산 투자형', '변동성 활용형', '유동 자산 선호형', '다각화 전략형'],
  '계': ['직관적 판단형', '창의적 감각', '섬세한 안목', '감성 소비형', '콘텐츠 수익형', '아이디어 사업형', '소규모 투자형', '틈새시장 발굴형'],
};

const LOVE_KEYWORDS: Record<Cheongan, string[]> = {
  '갑': ['주도적 성격', '강한 보호 본능', '자기 확신형', '솔직한 애정 표현', '듬직한 파트너', '자존심 강한 연인', '리더형 연인', '독립적 연애관'],
  '을': ['헌신적 성격', '깊은 배려심', '유연한 성격', '따뜻한 감성형', '공감 능력 뛰어남', '눈치 빠른 연인', '양보형 파트너', '부드러운 소통형'],
  '병': ['열정적 성격', '적극적 표현형', '매력 발산형', '화려한 연애 스타일', '다정한 성격', '분위기 주도형', '솔직한 감정형', '에너지 넘치는 연인'],
  '정': ['감성적 성격', '로맨티스트', '섬세한 감수성', '깊은 대화 선호', '내면 교감형', '정적인 데이트 선호', '한 사람 집중형', '예술적 감성형'],
  '무': ['안정 추구형', '든든한 성격', '한결같은 마음', '신뢰감 있는 연인', '변하지 않는 사랑', '묵직한 애정 표현', '포용력 큰 파트너', '책임감 강한 연인'],
  '기': ['세심한 성격', '조용한 헌신가', '실속파', '진심 어린 애정', '내조의 달인', '생활 밀착형 사랑', '꾸준한 관심형', '소소한 행복 추구형'],
  '경': ['강한 책임감', '직진형', '확실한 성격', '의리 있는 연인', '솔직담백한 표현', '결단력 있는 고백', '보호 본능형', '약속 중시형'],
  '신': ['까다로운 기준', '품격 추구형', '진지한 성격', '깊은 감정형', '세련된 연애 스타일', '높은 이상형 기준', '감각적 표현형', '완벽한 데이트 선호'],
  '임': ['자유로운 영혼', '매력적 성격', '다정다감', '넓은 교우 관계', '모험적 데이트형', '유머 감각 뛰어남', '낙천적 연애관', '개방적 사고형'],
  '계': ['감성 풍부형', '직관적 감수성', '신비로운 분위기', '깊은 공감 능력', '낭만적 사랑', '몽환적 매력', '감정 이입형 연인', '창의적 애정 표현'],
};

const LAB_LIFE_KEYWORDS: Record<Cheongan, string[]> = {
  '갑': ['독립적 연구자', '리더십', '주도적 성격', '연구실 이끔이', '큰 그림 설계자', '과감한 실험 설계', '책임감 강한 선배', '프로젝트 총괄형'],
  '을': ['높은 적응력', '팀플레이어', '협력형', '문헌 조사 달인', '후배 멘토형', '갈등 조율자', '꼼꼼한 기록자', '서포터형 연구자'],
  '병': ['활발한 토론가', '아이디어뱅크', '분위기 메이커', '학회 발표 강자', '네트워킹 달인', '프레젠테이션 능력자', '빠른 프로토타입형', '에너지 넘치는 랩원'],
  '정': ['꼼꼼한 실험가', '높은 집중력', '기록 중시형', '데이터 정리 달인', '야간 실험 집중형', '꾸준한 반복 실험형', '논문 작성 꼼꼼형', '조용한 몰입형'],
  '무': ['루틴 중시형', '체계적 사고', '묵묵한 실행가', '안정적 데이터 생산자', '장기 프로젝트 적합', '후배 교육 능력자', '랩 환경 관리자', '신뢰받는 랩원'],
  '기': ['세심한 준비형', '실용주의자', '성실한 성격', '재료 관리 달인', '프로토콜 준수형', '꾸준한 출석형', '매뉴얼 작성자', '실험실 살림꾼'],
  '경': ['효율적 실행가', '원칙주의자', '빠른 판단력', '실험 최적화 전문가', '데드라인 엄수형', '명확한 보고서 작성', '문제 직면 해결형', '효율적 시간 관리자'],
  '신': ['정교한 분석가', '완벽주의', '높은 기준', '통계 분석 달인', '오류 탐지 전문가', '논문 리뷰 능력자', '재현성 검증형', '까다로운 품질 관리자'],
  '임': ['창의적 사고형', '다양한 시각', '유연한 발상', '학제간 연구 적합', '새로운 방법론 도전자', '자유로운 연구 스타일', '해외 학회 참석형', '영감형 연구자'],
  '계': ['직관적 해석력', '감성적 통찰력', '섬세한 관찰자', '패턴 발견 능력자', '질적 연구 적합형', '감각적 데이터 시각화', '영감 기반 가설 수립', '미세 변화 포착형'],
};

const PROFESSOR_KEYWORDS: Record<Cheongan, string[]> = {
  '갑': ['당당한 태도', '독립적 성향', '강한 자기 주관', '소신 발언형', '존경 기반 관계', '독자 연구 선호', '강한 목표 의식', '리더십 어필형'],
  '을': ['유연한 태도', '공손한 성격', '조화 지향형', '눈치 빠른 소통', '갈등 회피형', '부드러운 설득력', '장기적 신뢰 구축', '세심한 보고형'],
  '병': ['적극적 성격', '열정적 표현', '강한 존재감', '적극적 질문형', '토론 주도형', '미팅 활성화형', '에너지 넘치는 보고', '임팩트 있는 발표형'],
  '정': ['높은 충성도', '세심한 성격', '성실한 태도', '꼼꼼한 보고서', '약속 엄수형', '진심 어린 존경', '디테일한 피드백 반영', '조용한 신뢰 구축'],
  '무': ['일관된 태도', '묵직한 신뢰감', '안정적 성격', '변함없는 성실함', '꾸준한 진행 보고', '위기 상황 침착형', '장기 프로젝트 안정형', '신뢰 기반 소통'],
  '기': ['꾸준한 성격', '성실한 태도', '세심한 배려심', '보이지 않는 서포트', '묵묵한 실행력', '교수 일정 배려형', '실험실 관리 능력자', '헌신적 연구 태도'],
  '경': ['명확한 의사 표현', '원칙주의', '효율 중시형', '직설적 보고 스타일', '결과 중심 소통', '기한 엄수형', '체계적 진행 관리', '문제 직면 해결형'],
  '신': ['논리적 사고', '전문성 추구', '정밀한 성격', '정교한 논증형', '비판적 피드백 수용', '데이터 기반 설득', '높은 학문적 기준', '디테일 중시 보고형'],
  '임': ['폭넓은 사고', '열린 마음', '아이디어 풍부', '자유로운 토론 선호', '새로운 관점 제시형', '다양한 접근법 시도', '글로벌 시야형', '창의적 연구 제안형'],
  '계': ['높은 공감 능력', '직관적 이해력', '섬세한 성격', '교수 감정 파악형', '분위기 맞춤형 소통', '감성적 연구 동기', '섬세한 상황 대처', '공감 기반 신뢰형'],
};

const INTERPERSONAL_KEYWORDS: Record<Cheongan, string[]> = {
  '갑': ['솔선수범형', '리더 기질', '높은 신뢰감', '팀 이끎이', '존경받는 선배', '책임감 있는 동료', '의지되는 존재', '결속력 강화형'],
  '을': ['경청형', '중재자 기질', '유연한 성격', '갈등 해결사', '부드러운 설득형', '분위기 완화형', '배려심 깊은 동료', '화합 추구형'],
  '병': ['분위기 메이커', '사교적 성격', '동기 부여자', '팀 에너자이저', '긍정 에너지형', '이벤트 기획형', '넓은 교우 관계', '활기찬 소통형'],
  '정': ['깊은 유대형', '1:1 소통 선호', '감성적 성격', '진심 어린 관계형', '비밀 보장형', '감정 교류 중시형', '소수 정예 교우형', '깊은 대화 선호형'],
  '무': ['안정적 조율자', '포용적 성격', '든든한 존재', '모임 중심인물', '갈등 완충형', '신뢰 기반 관계형', '어른스러운 성격', '안정감 제공형'],
  '기': ['세심한 배려형', '꾸준한 관계형', '조용한 헌신가', '뒷바라지형', '약속 잘 지키는 성격', '실질적 도움형', '생일 챙기기 달인', '꾸준한 안부형'],
  '경': ['솔직한 성격', '신의 중시형', '공정한 판단력', '의리파', '거짓 없는 소통', '원칙적 관계형', '믿을 수 있는 동료', '단호한 경계형'],
  '신': ['날카로운 통찰력', '높은 기준', '전문가형', '조언자 역할', '품격 있는 교우형', '냉철한 판단 동료', '선별적 관계형', '지적 대화 선호형'],
  '임': ['폭넓은 인맥형', '열린 성격', '아이디어 뱅크', '다양한 그룹 소속', '글로벌 네트워크형', '자유로운 소통형', '유머 감각형', '모험 동반자형'],
  '계': ['높은 공감 능력', '섬세한 관찰자', '창의적 협력가', '감정 읽기 달인', '조용한 지원자', '영감 나눔형', '분위기 감지형', '정서적 유대형'],
};

const RESEARCH_PERSONALITY_KEYWORDS: Record<Cheongan, string[]> = {
  '갑': ['개척형 연구자', '독자적 연구 테마', '강한 추진력', '연구 리더형', '대형 과제 적합', '선도적 연구 개척', '자기 주도 학습형', '비전 제시형'],
  '을': ['협업형 연구자', '문헌 조사 능력', '꼼꼼한 정리력', '팀 연구 적합형', '섬세한 데이터 관리', '지도교수 조율형', '논문 교정 달인', '꾸준한 학습형'],
  '병': ['발표형 연구자', '창의적 실험 설계', '빠른 아이디어 전환', '학회 스타형', '영감 기반 연구형', '네트워킹 능력자', '빠른 적응력', '트렌드 감지형'],
  '정': ['심층 분석형', '높은 논문 완성도', '치밀한 논리 구성', '데이터 해석 전문가', '야간 집중 연구형', '완성도 추구형', '단일 주제 몰입형', '정밀한 인용 관리'],
  '무': ['체계적 연구자', '장기 프로젝트형', '꾸준한 데이터 축적', '안정적 연구 환경 구축', '기초 연구 적합형', '대규모 데이터셋 관리형', '연구실 기둥형', '묵묵한 성과형'],
  '기': ['실용형 연구자', '응용 연구 적합', '현실적 문제 해결', '산학 협력 적합형', '특허 출원 적성형', '실험 매뉴얼 작성 달인', '재현 가능한 연구형', '꼼꼼한 실험 노트형'],
  '경': ['효율적 실험가', '빠른 결과 도출', '명확한 방법론', '실험 최적화 전문', '논문 투고 결단형', '명확한 가설 수립', '시간 관리 달인', '체계적 실험 설계형'],
  '신': ['정밀 분석형', '비판적 사고력', '높은 재현성 추구', '통계 전문가형', '오류 검출 달인', '논문 리뷰어 적성', '엄격한 방법론 추구', '품질 관리형 연구자'],
  '임': ['학제간 연구형', '다양한 방법론 시도', '유연한 연구 방향', '융합 연구 적합형', '해외 공동 연구형', '대담한 가설 수립', '자유로운 연구 스타일', '글로벌 관점형'],
  '계': ['직관적 가설 설정', '질적 연구 적합', '감성적 해석력', '창의적 연구 설계', '인문학적 통찰형', '영감 기반 가설형', '감각적 시각화 능력', '미세 패턴 발견형'],
};

const GRADUATION_KEYWORDS: Record<Cheongan, string[]> = {
  '갑': ['독립적 연구자', '강한 추진력', '주도적 성격', '마감 돌파형', '자기 동기 부여형', '독자 노선 관철형', '위기 극복력', '졸업 후 비전형'],
  '을': ['꾸준한 성격', '유연한 수정 능력', '높은 인내심', '피드백 수용력', '점진적 완성형', '교수 소통 원활형', '협업 논문 적합형', '포기 않는 끈기형'],
  '병': ['빠른 실행력', '뛰어난 발표력', '열정적 성격', '심사 대응 강자', '에너지 넘치는 마감형', '프레젠테이션 달인', '학회 발표 경험형', '긍정적 마인드형'],
  '정': ['심층 분석형', '치밀한 성격', '높은 완성도', '논문 퀄리티 집착형', '꼼꼼한 교정 능력', '참고문헌 정리 달인', '깊이 있는 고찰형', '완벽한 마무리형'],
  '무': ['체계적 사고', '안정적 진행력', '묵묵한 완주형', '계획적 마감형', '꾸준한 페이스형', '위기 상황 침착형', '장기 일정 관리형', '안정적 졸업 루트형'],
  '기': ['실용주의자', '꼼꼼한 성격', '성실한 마감형', '일정 관리 달인', '세부 사항 점검형', '행정 절차 완벽형', '실험 노트 정리형', '꾸준한 진행 보고형'],
  '경': ['효율적 진행력', '원칙주의', '단호한 결단력', '데드라인 엄수형', '빠른 의사결정형', '불필요한 것 제거형', '목표 집중형', '결과 지향형'],
  '신': ['정교한 논증력', '높은 기준', '디테일 중시형', '논리적 구조화 달인', '심사위원 설득형', '오류 없는 논문형', '높은 학술 기준', '완벽한 논증형'],
  '임': ['독창적 관점', '대담한 성격', '폭넓은 시야', '창의적 주제 선정형', '대담한 가설 도전형', '글로벌 관점형', '다양한 방법론 활용', '유연한 연구 전환형'],
  '계': ['창의적 구성력', '직관적 통찰력', '기획자 기질', '영감 기반 논문형', '감각적 구성력', '독특한 해석 능력', '몰입형 집필 스타일', '감성적 결론 도출형'],
};

function getInterpersonalDemographics(a: SajuAnalysis): InterpersonalDemographics {
  const dayMaster = a.fourPillars.day.ganJi.cheongan as Cheongan;
  const dayBranch = a.fourPillars.day.ganJi.jiji;
  return {
    kind: 'interpersonal',
    keywords: selectByJiji(INTERPERSONAL_KEYWORDS[dayMaster] || [], dayBranch),
    relationships: a.relationships.map((r: Relationship) => ({ name: r.name, type: r.type })),
  };
}

function getResearchPersonalityDemographics(a: SajuAnalysis): ResearchPersonalityDemographics {
  const dayMaster = a.fourPillars.day.ganJi.cheongan as Cheongan;
  const dayBranch = a.fourPillars.day.ganJi.jiji;
  // 식상(연구 산출), 인성(학습 흡수) 계열
  const tenGods = findTenGods(a, ['식신', '상관', '정인', '편인']);
  return {
    kind: 'researchPersonality',
    keywords: selectByJiji(RESEARCH_PERSONALITY_KEYWORDS[dayMaster] || [], dayBranch),
    tenGods,
  };
}

function getGraduationDemographics(a: SajuAnalysis): GraduationDemographics {
  const dayMaster = a.fourPillars.day.ganJi.cheongan as Cheongan;
  const dayBranch = a.fourPillars.day.ganJi.jiji;
  // 관성(목표 달성), 인성(학습 완성) 계열
  const tenGods = findTenGods(a, ['편관', '정관', '정인', '편인']);
  return {
    kind: 'graduation',
    keywords: selectByJiji(GRADUATION_KEYWORDS[dayMaster] || [], dayBranch),
    tenGods,
  };
}

// ===== 교수 궁합 전용 demographics =====

export interface ProfCompatResearchDemographics {
  kind: 'profCompatResearch';
  studentDayMaster: ElementBadge;
  professorDayMaster: ElementBadge;
  studentYongsin: ElementBadge;
  professorYongsin: ElementBadge;
  studentTenGods: TenGodBadge[]; // 식상/인성 계열
}

export interface ProfCompatCommDemographics {
  kind: 'profCompatComm';
  studentTenGods: TenGodBadge[]; // 관성/인성 계열
  relationships: RelationshipBadge[];
}

export type ProfCompatDemographics = ProfCompatResearchDemographics | ProfCompatCommDemographics;

export function getProfCompatResearchDemographics(student: SajuAnalysis, professor: SajuAnalysis): ProfCompatResearchDemographics {
  return {
    kind: 'profCompatResearch',
    studentDayMaster: makeElementBadge(student.fourPillars.day.cheonganElement, '학생 일간'),
    professorDayMaster: makeElementBadge(professor.fourPillars.day.cheonganElement, '교수 일간'),
    studentYongsin: makeElementBadge(student.yongsin.yongsin, '학생 용신'),
    professorYongsin: makeElementBadge(professor.yongsin.yongsin, '교수 용신'),
    studentTenGods: findTenGods(student, ['식신', '상관', '정인', '편인']),
  };
}

export function getProfCompatCommDemographics(student: SajuAnalysis): ProfCompatCommDemographics {
  return {
    kind: 'profCompatComm',
    studentTenGods: findTenGods(student, ['편관', '정관', '편인', '정인', '식신', '상관']),
    relationships: student.relationships.map((r: Relationship) => ({ name: r.name, type: r.type })),
  };
}

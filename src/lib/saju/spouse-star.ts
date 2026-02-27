import type { Gender, TenGod, FourPillars, MajorFortune, Jiji, FiveElement } from './types';
import { JIJI_ELEMENT, JIJI_HANJA } from './constants';

// ===== 배우자성 분석 =====

const PILLAR_NAMES = ['년주', '월주', '일주', '시주'] as const;

export interface SpouseStarAnalysis {
  spouseStars: TenGod[];           // 남: ['정재','편재'], 여: ['정관','편관']
  spouseStarCount: number;         // 사주 8궁(4천간+4지지) 중 배우자성 개수
  spouseStarPositions: string[];   // ['년주 천간', '월주 지지'] 등
  spousePalace: {
    jiji: Jiji;                    // 일지
    element: FiveElement;          // 일지 오행
    tenGod: TenGod | undefined;    // 일지 십신
    hasSpouseStar: boolean;        // 일지에 배우자성 존재 여부
  };
  marriageTimingWindows: {         // 대운 중 배우자성 출현 시기
    startAge: number;
    endAge: number;
    startYear: number;
    ganJi: string;                 // e.g. "갑오"
    position: '천간' | '지지' | '천간+지지';
    score: number;
    category: '적령기' | '가능기' | '참고';  // 현실적 결혼 적령기 구분
  }[];
}

export function analyzeSpouseStar(
  gender: Gender,
  fourPillars: FourPillars,
  majorFortunes: MajorFortune[],
): SpouseStarAnalysis {
  // 1. 성별로 배우자성 결정
  const spouseStars: TenGod[] = gender === '남'
    ? ['정재', '편재']
    : ['정관', '편관'];

  // 2. 4주의 천간십신 + 지지십신 순회 → 배우자성 매칭
  const pillars = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour];
  let spouseStarCount = 0;
  const spouseStarPositions: string[] = [];

  pillars.forEach((pillar, idx) => {
    const pillarName = PILLAR_NAMES[idx];
    if (pillar.cheonganTenGod && spouseStars.includes(pillar.cheonganTenGod)) {
      spouseStarCount++;
      spouseStarPositions.push(`${pillarName} 천간`);
    }
    if (pillar.jijiTenGod && spouseStars.includes(pillar.jijiTenGod)) {
      spouseStarCount++;
      spouseStarPositions.push(`${pillarName} 지지`);
    }
  });

  // 3. 배우자궁: 일지 분석
  const dayJiji = fourPillars.day.ganJi.jiji;
  const dayJijiElement = JIJI_ELEMENT[dayJiji];
  const dayJijiTenGod = fourPillars.day.jijiTenGod;
  const hasSpouseStar = dayJijiTenGod !== undefined && spouseStars.includes(dayJijiTenGod);

  // 4. 대운에서 배우자성 출현 시기 추출
  const marriageTimingWindows: SpouseStarAnalysis['marriageTimingWindows'] = [];

  for (const fortune of majorFortunes) {
    const cheonganMatch = spouseStars.includes(fortune.cheonganTenGod);
    const jijiMatch = spouseStars.includes(fortune.jijiTenGod);

    if (cheonganMatch || jijiMatch) {
      const ganJi = `${fortune.ganJi.cheongan}${fortune.ganJi.jiji}`;
      let position: '천간' | '지지' | '천간+지지';
      if (cheonganMatch && jijiMatch) {
        position = '천간+지지';
      } else if (cheonganMatch) {
        position = '천간';
      } else {
        position = '지지';
      }

      // 현실적 결혼 적령기 구분
      // 적령기: 대운 구간이 25~39세와 겹침
      // 가능기: 20~24 또는 40~45세 구간
      // 참고: 그 외 (너무 이르거나 늦음)
      let category: '적령기' | '가능기' | '참고';
      if (fortune.startAge <= 39 && fortune.endAge >= 25) {
        category = '적령기';
      } else if (fortune.startAge <= 45 && fortune.endAge >= 20) {
        category = '가능기';
      } else {
        category = '참고';
      }

      marriageTimingWindows.push({
        startAge: fortune.startAge,
        endAge: fortune.endAge,
        startYear: fortune.startYear,
        ganJi,
        position,
        score: fortune.score,
        category,
      });
    }
  }

  // 적령기 > 가능기 > 참고 순으로 정렬
  const categoryOrder = { '적령기': 0, '가능기': 1, '참고': 2 };
  marriageTimingWindows.sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]);

  return {
    spouseStars,
    spouseStarCount,
    spouseStarPositions,
    spousePalace: {
      jiji: dayJiji,
      element: dayJijiElement,
      tenGod: dayJijiTenGod,
      hasSpouseStar,
    },
    marriageTimingWindows,
  };
}

/** 배우자궁 간단 표시: e.g. '오(午)' */
export function formatSpousePalace(jiji: Jiji): string {
  return `${jiji}(${JIJI_HANJA[jiji]})`;
}

/** 결혼 적기 간단 표시: e.g. '[적령기] 32~41세 갑오(천간)' */
export function formatTimingWindow(
  window: SpouseStarAnalysis['marriageTimingWindows'][number],
): string {
  return `[${window.category}] ${window.startAge}~${window.endAge}세 ${window.ganJi}(${window.position})`;
}

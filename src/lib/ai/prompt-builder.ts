import type { SajuAnalysis } from '@/lib/saju/types';
import type { CompressedSajuData } from './types';
import { analyzeSpouseStar, formatSpousePalace, formatTimingWindow } from '@/lib/saju/spouse-star';

export function compressSajuData(analysis: SajuAnalysis): CompressedSajuData {
  const { fourPillars, fiveElements, yongsin, currentYearFortune, relationships, birthInput, majorFortunes } = analysis;

  const pillarStr = (p: typeof fourPillars.year) =>
    `${p.ganJi.cheongan}${p.ganJi.jiji}`;

  // 배우자성 분석
  const spouseAnalysis = analyzeSpouseStar(birthInput.gender, fourPillars, majorFortunes);

  return {
    사주: {
      년주: pillarStr(fourPillars.year),
      월주: pillarStr(fourPillars.month),
      일주: pillarStr(fourPillars.day),
      시주: pillarStr(fourPillars.hour),
    },
    일간: fourPillars.day.ganJi.cheongan,
    성별: birthInput.gender,
    생년: analysis.solarBirthDate.year,
    오행: {
      목: fiveElements.percentages.목,
      화: fiveElements.percentages.화,
      토: fiveElements.percentages.토,
      금: fiveElements.percentages.금,
      수: fiveElements.percentages.수,
    },
    강약: yongsin.dayMasterStrength,
    용신: yongsin.yongsin,
    희신: yongsin.huisin,
    올해운: {
      간지: `${currentYearFortune.ganJi.cheongan}${currentYearFortune.ganJi.jiji}`,
      점수: currentYearFortune.score,
      천간십신: currentYearFortune.cheonganTenGod,
      지지십신: currentYearFortune.jijiTenGod,
    },
    관계: relationships.map((r) => r.name),
    대운: majorFortunes.map((f) => ({
      간지: `${f.ganJi.cheongan}${f.ganJi.jiji}`,
      시작나이: f.startAge,
      끝나이: f.endAge,
      시작년: f.startYear,
      점수: f.score,
      천간십신: f.cheonganTenGod,
      지지십신: f.jijiTenGod,
    })),
    결혼분석: {
      배우자성: spouseAnalysis.spouseStars,
      배우자성개수: spouseAnalysis.spouseStarCount,
      배우자궁: formatSpousePalace(spouseAnalysis.spousePalace.jiji),
      배우자궁십신: spouseAnalysis.spousePalace.tenGod ?? '없음',
      배우자궁에배우자성: spouseAnalysis.spousePalace.hasSpouseStar,
      결혼적기: spouseAnalysis.marriageTimingWindows.map(formatTimingWindow),
    },
  };
}

export function buildSystemPrompt(): string {
  return `당신은 동양 명리학(사주팔자) 전문가입니다. 사주 데이터를 기반으로 깊이 있고 통찰력 있는 해석을 제공합니다.

규칙:
- 반드시 한국어로 작성하세요.
- 각 섹션은 반드시 "---SECTION:key---" 마커로 시작하세요.
- 마커 뒤에 바로 내용을 작성하세요.
- 8개 섹션을 순서대로 모두 작성하세요: overall, personality, wealth, career, love, marriage, health, yearAdvice
- 각 섹션은 2-4문단으로 작성하세요.
- 전문 용어는 괄호 안에 한자를 병기하세요 (예: 용신(用神)).
- 긍정적이면서도 현실적인 조언을 제공하세요.
- 올해 운세(yearAdvice)는 현재 연도 기준으로 작성하세요.
- 핵심 키워드와 중요한 조언은 **볼드 마커**로 감싸세요.
- 예: **재물운이 상승**하는 시기, **건강 관리**에 유의
- 대운(大運) 데이터를 활용하여 각 섹션에서 시기별 조언(좋은 시기/주의할 시기)을 구체적으로 포함하세요.`;
}

export function buildUserPrompt(data: CompressedSajuData): string {
  const currentYear = new Date().getFullYear();

  const spouseStarsStr = data.결혼분석.배우자성.join('/');
  // 적령기/가능기만 우선 표시, 참고는 생략
  const primaryTiming = data.결혼분석.결혼적기.filter(
    (t) => t.startsWith('[적령기]') || t.startsWith('[가능기]'),
  );
  const timingStr = primaryTiming.length > 0
    ? primaryTiming.join(', ')
    : data.결혼분석.결혼적기.length > 0
      ? data.결혼분석.결혼적기[0]
      : '해당 없음';

  return `다음 사주 데이터를 분석하여 8개 섹션으로 해석해 주세요.

${JSON.stringify(data, null, 2)}

각 섹션은 다음 마커로 시작해 주세요:

---SECTION:overall---
종합운: 이 사주의 전체적인 특징과 삶의 큰 흐름을 해석해 주세요.
대운 흐름에서 전체적으로 좋은 시기와 도전적인 시기를 언급해 주세요.

---SECTION:personality---
성격과 기질: 일간과 오행 분포를 기반으로 성격, 기질, 대인관계 성향을 분석해 주세요.

---SECTION:wealth---
재물운: 재성(편재/정재)과 오행 흐름을 기반으로 재물 운세를 해석해 주세요.
대운에서 재성(편재/정재)이 나타나는 시기를 재물 기회로 언급해 주세요.

---SECTION:career---
직업운: 관성(편관/정관)과 적성을 기반으로 직업과 사회적 성취를 분석해 주세요.
대운에서 관성(편관/정관)이 나타나는 시기를 승진/성취 시기로 언급해 주세요.

---SECTION:love---
연애운: 사주 구조를 기반으로 연애, 인연의 특성을 해석해 주세요.
대운 데이터를 참고하여 연애 인연이 좋은 시기를 언급해 주세요.

---SECTION:marriage---
결혼운: 배우자성(${spouseStarsStr}) 분석을 기반으로 배우자 성향, 결혼 생활의 특성을 해석해 주세요.
배우자궁(일지: ${data.결혼분석.배우자궁})과 배우자성 개수(${data.결혼분석.배우자성개수}개)를 분석하세요.
결혼 시기는 현실적인 적령기(25~39세) 구간의 대운을 중심으로 언급하세요. 적령기 대운: ${timingStr}.
40세 이후 시기만 있더라도 "늦은 인연"으로 자연스럽게 표현하되, 비현실적으로 느껴지지 않도록 주의하세요.

---SECTION:health---
건강운: 오행 불균형과 사주 구조를 기반으로 건강 유의사항을 분석해 주세요.
대운에서 기신이 강한 시기의 건강 유의사항을 언급해 주세요.

---SECTION:yearAdvice---
${currentYear}년 올해의 조언: 올해 세운(${data.올해운.간지})과 사주의 상호작용을 기반으로 구체적인 조언을 제공해 주세요. 현재 대운 시기도 참조하여 올해의 위치를 설명해 주세요.`;
}

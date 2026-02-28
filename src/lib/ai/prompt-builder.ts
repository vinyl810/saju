import type { SajuAnalysis, CompatibilityResult } from '@/lib/saju/types';
import type { CompressedSajuData } from './types';
import { analyzeSpouseStar, formatSpousePalace, formatTimingWindow } from '@/lib/saju/spouse-star';

export function compressSajuData(analysis: SajuAnalysis): CompressedSajuData {
  const { fourPillars, fiveElements, yongsin, currentYearFortune, todayFortune, relationships, birthInput, majorFortunes } = analysis;

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
    오늘운: {
      날짜: todayFortune.date,
      간지: `${todayFortune.ganJi.cheongan}${todayFortune.ganJi.jiji}`,
      점수: todayFortune.score,
      천간십신: todayFortune.cheonganTenGod,
      지지십신: todayFortune.jijiTenGod,
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
- 9개 섹션을 순서대로 모두 작성하세요: todayMessage, overall, personality, wealth, career, love, marriage, health, yearAdvice
- 각 섹션은 2-4문단으로 작성하세요.
- 전문 용어는 한글(한자) 형식으로 한자를 병기하세요 (예: 용신(用神)).
- 오행은 어떤 맥락에서든 반드시 한글(한자) 형태로 쓰세요: 목(木), 화(火), 토(土), 금(金), 수(水). 절대 木(목)처럼 한자를 앞에 쓰지 마세요.
- 천간/지지의 소속 오행을 언급할 때도 예외 없이 한자를 병기하세요. 올바른 예: "계(癸) 수(水)", "미(未) 토(土)", "갑(甲) 목(木)". 틀린 예: "계(癸)수", "미(未)토".
- 긍정적이면서도 현실적인 조언을 제공하세요.
- 올해 운세(yearAdvice)는 현재 연도 기준으로 작성하세요.
- 핵심 키워드와 중요한 조언은 **볼드 마커**로 감싸세요.
- 예: **재물운이 상승**하는 시기, **건강 관리**에 유의
- 대운(大運) 데이터를 활용하여 각 섹션에서 시기별 조언(좋은 시기/주의할 시기)을 구체적으로 포함하세요.
- 사주 전문 용어에는 {{용어}} 마크업을 적용하세요. 이 마크업은 독자에게 용어 설명 툴팁을 보여주는 데 사용됩니다.
- 마크업 대상: 사주·명리학 고유 용어 (예: {{용신}}, {{대운}}, {{편재}}, {{상관}}, {{도화살}}, {{삼합}}, {{신강}}, {{건록}}, {{천간}}, {{지지}}, {{십신}}, {{식상}}, {{비겁}}, {{인성}}, {{관성}}, {{재성}}, {{격국}}, {{배우자궁}}, {{일지}}, {{월지}} 등)
- 마크업 제외: 일반 한국어 단어, 오행 이름(목·화·토·금·수는 별도 색상 처리됨)
- 한자를 병기할 때는 {{용어}} 마크업 안에 넣고 한자는 바깥에 쓰세요: {{용신}}(用神), {{대운}}(大運)
- 개별 천간(갑·을·병·정·무·기·경·신·임·계)과 지지(자·축·인·묘·진·사·오·미·신·유·술·해)는 {{}}로 감싸지 말고 반드시 한글(한자) 형태로 쓰세요: 계(癸), 임(壬), 신(申) 등. 이들은 자동으로 오행 색상이 적용됩니다.
- 한 용어가 여러 번 등장하면 첫 1~2회만 마크업하세요.`;
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

  return `다음 사주 데이터를 분석하여 9개 섹션으로 해석해 주세요.

${JSON.stringify(data, null, 2)}

각 섹션은 다음 마커로 시작해 주세요:

---SECTION:todayMessage---
오늘을 위한 한마디: 오늘(${data.오늘운.날짜})은 ${data.오늘운.간지}일이고, 이 사주(일간: ${data.일간}, 용신: ${data.용신})에게 오늘의 십신은 ${data.오늘운.천간십신}/${data.오늘운.지지십신}입니다. 이 정보를 바탕으로 오늘 하루에 대한 구체적이고 실행 가능한 조언을 1-2문장으로 작성하세요. 예시처럼 구체적으로: "오늘은 새로운 사람과의 만남에 좋은 기운이 있으니, 모임이나 약속을 적극적으로 잡아보세요." {{용어}} 마크업, **볼드**, 한자 병기를 사용하지 마세요. 일반인이 바로 이해할 수 있는 쉬운 문장으로 쓰세요.

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

// ===== 궁합 AI 해석 프롬프트 =====

interface CompressedCompatData {
  사람1: CompressedSajuData;
  사람2: CompressedSajuData;
  궁합결과: {
    총점: number;
    등급: string;
    카테고리: { 이름: string; 점수: number; 가중치: number; 설명: string; 세부: string[] }[];
    강점: string[];
    약점: string[];
    조언: string;
  };
}

function compressSajuDataSimple(analysis: SajuAnalysis): CompressedSajuData {
  const { fourPillars, fiveElements, yongsin, currentYearFortune, todayFortune, relationships, birthInput, majorFortunes } = analysis;
  const pillarStr = (p: typeof fourPillars.year) => `${p.ganJi.cheongan}${p.ganJi.jiji}`;
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
    오늘운: {
      날짜: todayFortune.date,
      간지: `${todayFortune.ganJi.cheongan}${todayFortune.ganJi.jiji}`,
      점수: todayFortune.score,
      천간십신: todayFortune.cheonganTenGod,
      지지십신: todayFortune.jijiTenGod,
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

export function compressCompatibilityData(
  analysis1: SajuAnalysis,
  analysis2: SajuAnalysis,
  compatResult: CompatibilityResult,
): CompressedCompatData {
  return {
    사람1: compressSajuDataSimple(analysis1),
    사람2: compressSajuDataSimple(analysis2),
    궁합결과: {
      총점: compatResult.totalScore,
      등급: compatResult.grade,
      카테고리: compatResult.categories.map((c) => ({
        이름: c.name,
        점수: c.score,
        가중치: c.weight,
        설명: c.description,
        세부: c.details,
      })),
      강점: compatResult.strengths,
      약점: compatResult.weaknesses,
      조언: compatResult.advice,
    },
  };
}

export function buildCompatSystemPrompt(): string {
  return `당신은 동양 명리학(사주팔자) 궁합 전문가입니다. 두 사람의 사주 데이터와 궁합 분석 결과를 기반으로 깊이 있고 통찰력 있는 궁합 해석을 제공합니다.

규칙:
- 반드시 한국어로 작성하세요.
- 각 섹션은 반드시 "---SECTION:key---" 마커로 시작하세요.
- 마커 뒤에 바로 내용을 작성하세요.
- 8개 섹션을 순서대로 모두 작성하세요: shortAdvice, todayMessage, overview, dayMaster, elements, personality, fortune, advice
- shortAdvice 섹션은 반드시 한 문장(1줄)으로만 작성하세요. 나머지 섹션은 2-4문단으로 작성하세요.
- 전문 용어는 한글(한자) 형식으로 한자를 병기하세요 (예: 용신(用神)).
- 오행은 어떤 맥락에서든 반드시 한글(한자) 형태로 쓰세요: 목(木), 화(火), 토(土), 금(金), 수(水). 절대 木(목)처럼 한자를 앞에 쓰지 마세요.
- 천간/지지의 소속 오행을 언급할 때도 예외 없이 한자를 병기하세요. 올바른 예: "계(癸) 수(水)", "미(未) 토(土)", "갑(甲) 목(木)". 틀린 예: "계(癸)수", "미(未)토".
- 긍정적이면서도 현실적인 조언을 제공하세요.
- 핵심 키워드와 중요한 조언은 **볼드 마커**로 감싸세요.
- 예: **궁합이 좋은** 부분, **서로 보완**하는 관계
- 두 사람을 각각 "첫 번째 사람", "두 번째 사람"으로 지칭하세요.
- 사주 전문 용어에는 {{용어}} 마크업을 적용하세요. 이 마크업은 독자에게 용어 설명 툴팁을 보여주는 데 사용됩니다.
- 마크업 대상: 사주·명리학 고유 용어 (예: {{용신}}, {{대운}}, {{편재}}, {{상관}}, {{도화살}}, {{삼합}}, {{신강}}, {{건록}}, {{천간}}, {{지지}}, {{십신}}, {{식상}}, {{비겁}}, {{인성}}, {{관성}}, {{재성}}, {{격국}}, {{배우자궁}}, {{일지}}, {{월지}}, {{천간합}}, {{육합}}, {{육충}}, {{궁합}} 등)
- 마크업 제외: 일반 한국어 단어, 오행 이름(목·화·토·금·수는 별도 색상 처리됨)
- 한자를 병기할 때는 {{용어}} 마크업 안에 넣고 한자는 바깥에 쓰세요: {{용신}}(用神), {{대운}}(大運)
- 개별 천간(갑·을·병·정·무·기·경·신·임·계)과 지지(자·축·인·묘·진·사·오·미·신·유·술·해)는 {{}}로 감싸지 말고 반드시 한글(한자) 형태로 쓰세요: 계(癸), 임(壬), 신(申) 등. 이들은 자동으로 오행 색상이 적용됩니다.
- 한 용어가 여러 번 등장하면 첫 1~2회만 마크업하세요.`;
}

export function buildCompatUserPrompt(data: CompressedCompatData): string {
  return `다음 두 사람의 사주 데이터와 궁합 분석 결과를 기반으로 8개 섹션으로 궁합을 해석해 주세요.

${JSON.stringify(data, null, 2)}

각 섹션은 다음 마커로 시작해 주세요:

---SECTION:shortAdvice---
한줄 조언: 두 사람의 궁합 핵심을 담은 인상적인 조언을 정확히 한 문장으로 작성하세요. {{용어}} 마크업이나 **볼드**는 사용하지 마세요. 오행이나 천간/지지 한자 병기도 하지 마세요. 일반인이 바로 이해할 수 있는 쉬운 문장으로 쓰세요.

---SECTION:todayMessage---
오늘을 위한 한마디: 오늘(${data.사람1.오늘운.날짜})은 ${data.사람1.오늘운.간지}일입니다. 두 사람의 사주 관계와 오늘의 기운을 바탕으로, 두 사람의 관계를 위한 구체적이고 실행 가능한 조언을 1-2문장으로 작성하세요. 예시처럼 구체적으로: "오늘은 서로의 이야기에 귀 기울이기 좋은 날이니, 저녁 식사 자리에서 평소 못했던 대화를 나눠보세요." {{용어}} 마크업, **볼드**, 한자 병기를 사용하지 마세요. 일반인이 바로 이해할 수 있는 쉬운 문장으로 쓰세요.

---SECTION:overview---
종합 궁합 해석: 두 사람의 궁합 총점(${data.궁합결과.총점}점, ${data.궁합결과.등급}등급)을 바탕으로 전체적인 궁합의 특징과 관계의 큰 흐름을 해석해 주세요. 등급의 의미와 두 사주가 만났을 때 나타나는 전체적인 에너지 흐름을 설명해 주세요.

---SECTION:dayMaster---
일간 궁합: 첫 번째 사람의 일간(${data.사람1.일간})과 두 번째 사람의 일간(${data.사람2.일간})의 관계를 분석해 주세요. 천간합, 천간충, 상생, 상극 여부를 판단하고 두 일간의 조합이 관계에 미치는 영향을 해석해 주세요.

---SECTION:elements---
오행 조화: 두 사람의 오행 분포를 비교하여 서로 보완하는 부분과 충돌하는 부분을 분석해 주세요. 한 사람에게 부족한 오행을 상대가 채워주는지, 같은 오행이 과다한지 등을 살펴보세요.

---SECTION:personality---
성격 궁합: 두 사람의 사주 구조(일간, 오행 분포, 강약)를 기반으로 성격적 케미스트리를 분석해 주세요. 서로의 성격이 어떻게 상호작용하고, 어떤 부분에서 잘 맞고 어떤 부분에서 갈등이 생길 수 있는지 설명해 주세요.

---SECTION:fortune---
운세 궁합: 두 사람의 용신 호환성을 분석해 주세요. 첫 번째 사람의 용신(${data.사람1.용신})과 두 번째 사람의 용신(${data.사람2.용신})이 서로에게 어떤 영향을 미치는지, 대운의 타이밍이 어떻게 맞물리는지 설명해 주세요.

---SECTION:advice---
관계 조언: 궁합 분석 결과의 강점과 약점을 종합하여 두 사람이 더 좋은 관계를 유지하기 위한 구체적이고 실용적인 조언을 제공해 주세요. 서로 노력해야 할 점, 주의해야 할 상황, 관계를 강화하는 방법 등을 포함하세요.`;
}

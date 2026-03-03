import type { SajuAnalysis, CompatibilityResult } from '@/lib/saju/types';
import type { CompressedSajuData, AnalysisMode } from './types';
import { analyzeSpouseStar, formatSpousePalace, formatTimingWindow } from '@/lib/saju/spouse-star';
import { calculateMonthlyFortune } from '@/lib/saju/yearly-fortune';
import { interpretMonthlyFortune } from '@/lib/saju/interpretation';

export function compressSajuData(analysis: SajuAnalysis, mode: AnalysisMode = 'general'): CompressedSajuData {
  const { fourPillars, fiveElements, yongsin, currentYearFortune, todayFortune, relationships, birthInput, majorFortunes } = analysis;

  const pillarStr = (p: typeof fourPillars.year) =>
    `${p.ganJi.cheongan}${p.ganJi.jiji}`;

  // 배우자성 분석
  const spouseAnalysis = analyzeSpouseStar(birthInput.gender, fourPillars, majorFortunes);

  const base: CompressedSajuData = {
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

  if (mode === 'graduate') {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-based
    base.월별운 = Array.from({ length: 12 }, (_, i) => {
      const m = ((currentMonth - 1 + i) % 12) + 1;
      const y = currentYear + Math.floor((currentMonth - 1 + i) / 12);
      const raw = calculateMonthlyFortune(y, m, fourPillars);
      const interpreted = interpretMonthlyFortune(raw, yongsin);
      return {
        년: y,
        월: m,
        간지: `${interpreted.ganJi.cheongan}${interpreted.ganJi.jiji}`,
        점수: interpreted.score,
        천간십신: interpreted.cheonganTenGod,
        지지십신: interpreted.jijiTenGod,
      };
    });
    if (birthInput.degreeProgram) {
      base.학위과정 = birthInput.degreeProgram;
    }
    if (birthInput.semester) {
      base.재학학기 = birthInput.semester;
    }
  }

  return base;
}

export function buildSystemPrompt(mode: AnalysisMode = 'general'): string {
  const baseRules = `규칙:
- 반드시 한국어로 작성하세요.
- 각 섹션은 반드시 "---SECTION:key---" 마커로 시작하세요.
- 마커 뒤에 바로 내용을 작성하세요. 섹션 이름/라벨(예: "종합운:", "성격과 기질:", "연구 성향:")을 반복하지 마세요.
- 일반 모드는 9개, 대학원생 모드는 14개 섹션을 순서대로 모두 작성하세요.
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
- 한 용어가 여러 번 등장하면 첫 1~2회만 마크업하세요.
- todayMessage, monthlyFortune 섹션을 제외한 모든 섹션의 첫 줄에, 이 사람의 해당 운을 인상적으로 요약하는 한마디를 적으세요. 한마디 뒤에 빈 줄을 하나 넣고 본문을 시작하세요. 한마디에는 {{용어}} 마크업이나 **볼드**를 사용하지 마세요.
- 한마디 작성 규칙: 반드시 자연스러운 구어체 문장으로 끝내세요. 명사형 종결("~의 소유자", "~의 기운", "~하는 타입")은 절대 금지입니다. 좋은 예: "돈이 알아서 따라오는 팔자예요", "연구실에서 빛을 발할 사주입니다", "사람을 끌어당기는 매력이 있어요". 나쁜 예: "강한 재물 에너지의 소유자", "안정적 직업운의 기운". 친구에게 말하듯 편하게 쓰세요.

[핵심 — 일반적 이야기 금지]
- 누구에게나 해당되는 뻔한 말은 절대 쓰지 마세요. 모든 문장은 이 사람의 사주 데이터에서 직접 도출된 근거가 있어야 합니다.
- 금지 패턴 예시: "꾸준한 노력이 중요합니다", "건강에 유의하세요", "긍정적인 마인드가 필요합니다", "자기 관리가 중요합니다", "주변 사람들과 좋은 관계를 유지하세요", "무리하지 마세요", "계획적으로 준비하면 좋겠습니다".
- 조언을 쓸 때는 반드시 사주 근거를 먼저 제시하고 → 그에 따른 구체적 행동을 연결하세요. 예: "월주에 {{편관}}이 있어 상사와 마찰이 생기기 쉬우므로, 보고 전에 데이터를 한 번 더 검증하는 습관이 도움이 됩니다" (O). "직장에서 좋은 관계를 유지하세요" (X).
- 대운/세운 시기를 언급할 때는 반드시 "만 XX~XX세", "20XX년" 등 구체적 숫자를 포함하세요. "언젠가 좋은 시기가 올 것입니다" 같은 모호한 표현은 금지입니다.
- 오행 비율, 십신 배치, 용신/희신, 관계(합/충/형) 등 데이터에 있는 수치와 요소를 적극적으로 인용하여 해석의 근거를 보여주세요.`;

  if (mode === 'graduate') {
    return `당신은 동양 명리학(사주팔자) 전문가이자 대학원생 진로·학업 상담 전문가입니다. 사주 데이터를 기반으로 대학원생의 관점에서 깊이 있고 통찰력 있는 해석을 제공합니다.

${baseRules}
- 16개 섹션을 순서대로 모두 작성하세요: todayMessage, monthlyFortune, overall, characterTraits, personality, wealth, career, love, marriage, romance, marriageFortune, health, labLife, professorRelation, paperAcceptance, yearAdvice
- 모든 해석은 대학원생(석사/박사)의 맥락에 맞춰 작성하세요.
- 연구, 논문, 지도교수, 연구실, 학회, 졸업, 포닥, 취업 등 대학원 생활과 관련된 조언을 제공하세요.
- 대학원생이 공감할 수 있는 구체적인 상황과 예시를 활용하세요.
- 학위과정, 재학학기, 나이 정보가 제공된 경우, 반드시 이를 활용하여 현실적인 시기 판단을 하세요.
- [중요] 대운 시기를 언급할 때, 이 사용자의 현재 나이·학위과정·재학학기를 반드시 고려하세요. 졸업 후에는 더 이상 대학원생이 아닙니다. 예를 들어 석사 1학기(만 26세)인 사람에게 "36세에 장학금 운이 좋다"는 조언은 비현실적입니다. 학위과정 중에 해당하는 대운 시기만 학업·연구 맥락으로 해석하고, 졸업 이후 시기는 직장·커리어 맥락으로 전환하세요.`;
  }

  return `당신은 동양 명리학(사주팔자) 전문가입니다. 사주 데이터를 기반으로 깊이 있고 통찰력 있는 해석을 제공합니다.

${baseRules}
- 9개 섹션을 순서대로 모두 작성하세요: todayMessage, overall, personality, wealth, career, love, marriage, health, yearAdvice`;
}

function formatKoreanDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

export function buildUserPrompt(data: CompressedSajuData, mode: AnalysisMode = 'general'): string {
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

  if (mode === 'graduate') {
    const monthlyLines = data.월별운
      ? data.월별운.map((m) => {
          const yearTag = m.년 !== data.월별운![0].년 ? ` [${m.년}년]` : '';
          return `${m.월}월 (${m.간지})${yearTag} ← 점수${m.점수}, ${m.천간십신}/${m.지지십신} 참고하여 1-2문장 작성`;
        }).join('\n')
      : '';

    const currentAge = currentYear - data.생년;
    const remainingSemesters: Record<string, number> = { '석사': 4, '박사': 10, '석박통합': 12 };
    const totalSem = data.학위과정 ? (remainingSemesters[data.학위과정] ?? 8) : 8;
    const semNow = data.재학학기 ?? 1;
    const semLeft = Math.max(totalSem - semNow, 0);
    const gradAge = currentAge + Math.ceil(semLeft / 2);

    const degreeInfo = data.학위과정
      ? `이 사용자는 만 ${currentAge}세, ${data.학위과정} 과정${data.재학학기 ? ` ${data.재학학기}학기` : ''} 대학원생입니다. 예상 졸업 나이는 약 ${gradAge}세입니다. 대운에서 시기를 언급할 때, ${gradAge}세 이전은 학업·연구 맥락으로, 이후는 졸업 후 커리어 맥락으로 해석하세요. 장학금·연구비·논문 등 학업 관련 조언은 반드시 재학 기간(~${gradAge}세) 내의 대운만 참조하세요.\n\n`
      : `이 사용자는 만 ${currentAge}세 대학원생입니다.\n\n`;

    return `${degreeInfo}다음 사주 데이터를 대학원생의 관점에서 분석하여 16개 섹션으로 해석해 주세요.

${JSON.stringify(data, null, 2)}

섹션별 작성 지침 (이 지침 텍스트 자체를 출력에 포함하지 마세요):
- todayMessage: 반드시 "${formatKoreanDate(data.오늘운.날짜)} ${data.오늘운.간지}일은"으로 시작하세요. 그 뒤에 십신 ${data.오늘운.천간십신}/${data.오늘운.지지십신}을 바탕으로 대학원생의 하루에 대한 조언을 1-2문장으로 이어서 작성. 라벨 없이 바로 본문만. {{용어}} 마크업, **볼드**, 한자 병기 금지.
- monthlyFortune: 아래 템플릿의 "←" 이후를 삭제하고 운세 1-2문장을 채워 넣기. 줄 형식 유지. 콜론(:) 추가 금지. 연도 따로 쓰지 않기. {{용어}} 마크업, **볼드** 금지.
${monthlyLines}
- overall: 사주의 전체적인 특징과 대학원 생활·학업의 큰 흐름. 대운에서 학업·연구에 유리한/도전적인 시기 언급.
- characterTraits: 일간과 오행 분포 기반으로 성격, 기질, 대인관계 성향 분석.
- personality: 연구 적성, 학습 스타일, 지도교수와의 궁합 성향. 적합한 연구 분야나 방법론.
- wealth: 재성(편재/정재)과 오행 흐름 기반 학업 성취, 장학금·연구비 운. 대운에서 학업 성취 높은 시기.
- career: 관성(편관/정관)과 적성 기반 학계 vs 산업계 적합성, 포닥/취업 방향. 대운에서 진로 성취 유리한 시기.
- love: 연구실 동료 협업, 학회 네트워크 등 대학원 내 대인관계. 지도교수는 별도 섹션. 대운에서 인간관계 좋은 시기.
- marriage: 사주 구조와 대운 흐름 기반 졸업 시기, 학위 취득 흐름. 논문 완성, 심사 통과에 좋은 시기.
- romance: 연애 성향과 인연의 특성. 대학원생 맥락의 만남 장소. 대운에서 연애 인연 좋은 시기.
- marriageFortune: 배우자성(${spouseStarsStr}), 배우자궁(${data.결혼분석.배우자궁}), 배우자성 ${data.결혼분석.배우자성개수}개 기반 배우자 성향과 결혼 생활. [필수] 결혼 적령기를 반드시 구체적으로 제시하세요(대운 기반 "만 XX~XX세" 형태). 적령기 대운: ${timingStr}. 40세 이후만 있으면 "늦은 인연"으로 자연스럽게 표현.
- health: 오행 불균형 기반 번아웃, 스트레스 관리, 체력. 대운에서 멘탈 약해지는 시기 대처법.
- labLife: 비겁/인성/식상 배치 기반 연구실 적응력, 동료 관계. 강점과 주의점.
- professorRelation: 관성/인성 배치 기반 지도교수·상사 관계 성향. 갈등 시기와 팁.
- paperAcceptance: 식상/재성 흐름 기반 논문 투고·리뷰·억셉 시기. 대운과 세운에서 논문 성과 좋은 시기.
- yearAdvice: ${currentYear}년 세운(${data.올해운.간지})과 사주의 상호작용 기반 대학원 생활 조언. 현재 대운 시기 참조.

출력 형식 — 각 마커 뒤에 해당 섹션의 내용만 작성하세요:
---SECTION:todayMessage---
---SECTION:monthlyFortune---
---SECTION:overall---
---SECTION:characterTraits---
---SECTION:personality---
---SECTION:wealth---
---SECTION:career---
---SECTION:love---
---SECTION:marriage---
---SECTION:romance---
---SECTION:marriageFortune---
---SECTION:health---
---SECTION:labLife---
---SECTION:professorRelation---
---SECTION:paperAcceptance---
---SECTION:yearAdvice---`;
  }

  return `다음 사주 데이터를 분석하여 9개 섹션으로 해석해 주세요.

${JSON.stringify(data, null, 2)}

섹션별 작성 지침 (이 지침 텍스트 자체를 출력에 포함하지 마세요):
- todayMessage: 반드시 "${formatKoreanDate(data.오늘운.날짜)} ${data.오늘운.간지}일은"으로 시작하세요. 그 뒤에 십신 ${data.오늘운.천간십신}/${data.오늘운.지지십신}을 바탕으로 하루 조언 1-2문장 이어서 작성. 라벨 없이 바로 본문만. {{용어}} 마크업, **볼드**, 한자 병기 금지. 쉬운 문장.
- overall: 사주의 전체적인 특징과 삶의 큰 흐름. 대운에서 좋은/도전적인 시기.
- personality: 일간과 오행 분포 기반 성격, 기질, 대인관계 성향.
- wealth: 재성(편재/정재)과 오행 흐름 기반 재물 운세. 대운에서 재물 기회 시기.
- career: 관성(편관/정관)과 적성 기반 직업과 사회적 성취. 대운에서 승진/성취 시기.
- love: 사주 구조 기반 연애, 인연의 특성. 대운에서 연애 인연 좋은 시기.
- marriage: 배우자성(${spouseStarsStr}), 배우자궁(${data.결혼분석.배우자궁}), 배우자성 ${data.결혼분석.배우자성개수}개 기반 배우자 성향과 결혼 생활. 적령기 대운: ${timingStr}. 40세 이후만 있으면 "늦은 인연"으로 자연스럽게 표현.
- health: 오행 불균형 기반 건강 유의사항. 대운에서 기신이 강한 시기 주의점.
- yearAdvice: ${currentYear}년 세운(${data.올해운.간지})과 사주의 상호작용 기반 조언. 현재 대운 시기 참조.

출력 형식 — 각 마커 뒤에 해당 섹션의 내용만 작성하세요:
---SECTION:todayMessage---
---SECTION:overall---
---SECTION:personality---
---SECTION:wealth---
---SECTION:career---
---SECTION:love---
---SECTION:marriage---
---SECTION:health---
---SECTION:yearAdvice---`;
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
- 마커 뒤에 바로 내용을 작성하세요. 섹션 이름/라벨(예: "종합운:", "성격과 기질:", "연구 성향:")을 반복하지 마세요.
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
- 한 용어가 여러 번 등장하면 첫 1~2회만 마크업하세요.

[핵심 — 일반적 이야기 금지]
- 누구에게나 해당되는 뻔한 말은 절대 쓰지 마세요. 모든 문장은 두 사람의 사주 데이터에서 직접 도출된 근거가 있어야 합니다.
- 금지 패턴 예시: "서로를 이해하려고 노력하세요", "대화가 중요합니다", "서로 배려하면 좋겠습니다", "꾸준히 노력하면 좋은 결과가 있을 것입니다".
- 조언을 쓸 때는 반드시 사주 근거를 먼저 제시하고 → 그에 따른 구체적 행동을 연결하세요. 예: "첫 번째 사람의 {{편관}}이 두 번째 사람의 일간을 극하므로, 의견 충돌 시 첫 번째 사람이 한 발 양보하는 것이 효과적입니다" (O). "서로 양보하세요" (X).
- 오행 비율, 십신 배치, 용신 호환성, 합/충 관계 등 데이터에 있는 수치와 요소를 적극적으로 인용하여 해석의 근거를 보여주세요.`;
}

// ===== 교수-학생 궁합 AI 해석 프롬프트 =====

export function buildProfessorCompatSystemPrompt(): string {
  return `당신은 동양 명리학(사주팔자) 전문가이자 대학원 지도교수-학생 관계 분석 전문가입니다. 두 사람의 사주 데이터와 궁합 분석 결과를 기반으로 교수-학생 관계의 관점에서 깊이 있고 통찰력 있는 해석을 제공합니다.

규칙:
- 반드시 한국어로 작성하세요.
- 각 섹션은 반드시 "---SECTION:key---" 마커로 시작하세요.
- 마커 뒤에 바로 내용을 작성하세요. 섹션 이름/라벨을 반복하지 마세요.
- 3개 섹션을 순서대로 모두 작성하세요: overview, researchStyle, communication
- overview 섹션의 첫 줄은 반드시 한줄평(한 문장)으로 시작하세요. 한줄평 뒤에 빈 줄을 넣고 본문(2-3문단)을 작성하세요. 한줄평에는 {{용어}} 마크업, **볼드**, 한자 병기를 사용하지 마세요.
- researchStyle, communication 섹션은 각각 3-5문단으로 충실하게 작성하세요.
- 전문 용어는 한글(한자) 형식으로 한자를 병기하세요 (예: 용신(用神)).
- 오행은 어떤 맥락에서든 반드시 한글(한자) 형태로 쓰세요: 목(木), 화(火), 토(土), 금(金), 수(水). 절대 木(목)처럼 한자를 앞에 쓰지 마세요.
- 천간/지지의 소속 오행을 언급할 때도 예외 없이 한자를 병기하세요. 올바른 예: "계(癸) 수(水)", "미(未) 토(土)", "갑(甲) 목(木)". 틀린 예: "계(癸)수", "미(未)토".
- 긍정적이면서도 현실적인 조언을 제공하세요.
- 핵심 키워드와 중요한 조언은 **볼드 마커**로 감싸세요.
- "학생"과 "교수님"으로 지칭하세요.
- 사주 전문 용어에는 {{용어}} 마크업을 적용하세요.
- 마크업 대상: 사주·명리학 고유 용어 (예: {{용신}}, {{대운}}, {{편재}}, {{상관}}, {{삼합}}, {{신강}}, {{천간}}, {{지지}}, {{십신}}, {{식상}}, {{비겁}}, {{인성}}, {{관성}}, {{재성}} 등)
- 마크업 제외: 일반 한국어 단어, 오행 이름(목·화·토·금·수는 별도 색상 처리됨)
- 한자를 병기할 때는 {{용어}} 마크업 안에 넣고 한자는 바깥에 쓰세요: {{용신}}(用神), {{대운}}(大運)
- 개별 천간(갑·을·병·정·무·기·경·신·임·계)과 지지(자·축·인·묘·진·사·오·미·신·유·술·해)는 {{}}로 감싸지 말고 반드시 한글(한자) 형태로 쓰세요.
- 한 용어가 여러 번 등장하면 첫 1~2회만 마크업하세요.
- researchStyle, communication 섹션의 첫 줄에, 해당 관점을 인상적으로 요약하는 한마디를 적으세요. 한마디 뒤에 빈 줄을 하나 넣고 본문을 시작하세요. 한마디에는 {{용어}} 마크업이나 **볼드**를 사용하지 마세요.
- 한마디 작성 규칙: 반드시 자연스러운 구어체 문장으로 끝내세요. 명사형 종결("~의 소유자", "~의 기운")은 절대 금지입니다.

[핵심 — 일반적 이야기 금지]
- 누구에게나 해당되는 뻔한 말은 절대 쓰지 마세요. 모든 문장은 두 사람의 사주 데이터에서 직접 도출된 근거가 있어야 합니다.
- 금지 패턴 예시: "서로를 이해하려고 노력하세요", "대화가 중요합니다", "꾸준히 노력하면 좋은 결과가 있을 것입니다".
- 조언을 쓸 때는 반드시 사주 근거를 먼저 제시하고 → 그에 따른 구체적 행동을 연결하세요.
- 오행 비율, 십신 배치, 용신 호환성, 합/충 관계 등 데이터에 있는 수치와 요소를 적극적으로 인용하여 해석의 근거를 보여주세요.`;
}

export function buildProfessorCompatUserPrompt(data: CompressedCompatData): string {
  return `다음 학생과 교수님의 사주 데이터와 궁합 분석 결과를 기반으로 3개 섹션으로 교수-학생 궁합을 해석해 주세요.

학생 사주:
${JSON.stringify(data.사람1, null, 2)}

교수님 사주:
${JSON.stringify(data.사람2, null, 2)}

궁합 결과:
${JSON.stringify(data.궁합결과, null, 2)}

각 섹션은 다음 마커로 시작해 주세요:

---SECTION:overview---
종합 궁합: 첫 줄에 두 사람의 교수-학생 궁합 핵심을 담은 인상적인 한줄평을 한 문장으로 쓰세요. {{용어}} 마크업, **볼드**, 한자 병기를 사용하지 마세요. 자연스러운 구어체로 끝내세요 (예: "연구실에서 시너지가 폭발하는 조합이에요"). 한줄평 뒤에 빈 줄을 넣고 본문을 시작하세요. 본문에서는 궁합 총점(${data.궁합결과.총점}점, ${data.궁합결과.등급}등급)과 두 사람의 일간(학생 ${data.사람1.일간}, 교수님 ${data.사람2.일간}) 관계를 기반으로 교수-학생 궁합의 전체적인 특징과 흐름을 해석해 주세요.

---SECTION:researchStyle---
연구 스타일과 성장: 학생의 일간(${data.사람1.일간})과 교수님의 일간(${data.사람2.일간})의 오행 관계, 양쪽 오행 분포를 기반으로 연구 방향·방법론의 조화를 분석하세요. 학생의 연구 접근법과 교수님의 지도 스타일이 어떻게 맞물리는지 설명하세요. 또한 두 사람의 용신 호환성(학생 용신: ${data.사람1.용신}, 교수님 용신: ${data.사람2.용신})과 대운 타이밍을 기반으로 멘토링 효과와 성장 잠재력도 함께 분석하세요. 교수님 밑에서 학생이 어떤 시기에 가장 크게 성장할 수 있는지, 어떤 역량이 특히 개발되는지 구체적으로 설명하세요.

---SECTION:communication---
소통과 갈등 관리: 두 사람의 십신 배치(특히 식상, 인성, 관성 관계)를 기반으로 소통 패턴과 피드백 수용성을 분석하세요. 학생이 교수님의 피드백을 어떻게 받아들이는지, 미팅·세미나에서의 소통 스타일을 설명하세요. 또한 두 사람의 사주에서 충(沖)·극(剋) 관계, 상충하는 오행 배치를 기반으로 갈등이 생기기 쉬운 지점과 시기도 함께 분석하세요. 구체적인 갈등 상황(논문 방향 갈등, 연구 속도 차이, 소통 오해 등)과 사주 기반의 해결 전략을 제시하세요.`;
}

export function buildCompatUserPrompt(data: CompressedCompatData): string {
  return `다음 두 사람의 사주 데이터와 궁합 분석 결과를 기반으로 8개 섹션으로 궁합을 해석해 주세요.

${JSON.stringify(data, null, 2)}

각 섹션은 다음 마커로 시작해 주세요:

---SECTION:shortAdvice---
한줄 조언: 두 사람의 궁합 핵심을 담은 인상적인 조언을 정확히 한 문장으로 작성하세요. {{용어}} 마크업이나 **볼드**는 사용하지 마세요. 오행이나 천간/지지 한자 병기도 하지 마세요. 일반인이 바로 이해할 수 있는 쉬운 문장으로 쓰세요.

---SECTION:todayMessage---
반드시 "${formatKoreanDate(data.사람1.오늘운.날짜)} ${data.사람1.오늘운.간지}일은"으로 시작하세요. 그 뒤에 두 사람의 사주 관계와 오늘의 기운을 바탕으로, 두 사람의 관계를 위한 구체적이고 실행 가능한 조언을 1-2문장으로 이어서 작성하세요. "오늘을 위한 한마디:" 같은 라벨을 붙이지 말고 바로 본문만 쓰세요. {{용어}} 마크업, **볼드**, 한자 병기를 사용하지 마세요. 일반인이 바로 이해할 수 있는 쉬운 문장으로 쓰세요.

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

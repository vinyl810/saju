import type { Cheongan, Jiji, FiveElement, YinYang, HiddenStem, TenGod } from './types';

// ===== 천간 (天干) 10개 =====
export const CHEONGAN: Cheongan[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

export const CHEONGAN_HANJA: Record<Cheongan, string> = {
  '갑': '甲', '을': '乙', '병': '丙', '정': '丁', '무': '戊',
  '기': '己', '경': '庚', '신': '辛', '임': '壬', '계': '癸',
};

export const CHEONGAN_ELEMENT: Record<Cheongan, FiveElement> = {
  '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
  '기': '토', '경': '금', '신': '금', '임': '수', '계': '수',
};

export const CHEONGAN_YINYANG: Record<Cheongan, YinYang> = {
  '갑': '양', '을': '음', '병': '양', '정': '음', '무': '양',
  '기': '음', '경': '양', '신': '음', '임': '양', '계': '음',
};

// ===== 지지 (地支) 12개 =====
export const JIJI: Jiji[] = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

export const JIJI_HANJA: Record<Jiji, string> = {
  '자': '子', '축': '丑', '인': '寅', '묘': '卯', '진': '辰', '사': '巳',
  '오': '午', '미': '未', '신': '申', '유': '酉', '술': '戌', '해': '亥',
};

export const JIJI_ELEMENT: Record<Jiji, FiveElement> = {
  '자': '수', '축': '토', '인': '목', '묘': '목', '진': '토', '사': '화',
  '오': '화', '미': '토', '신': '금', '유': '금', '술': '토', '해': '수',
};

export const JIJI_YINYANG: Record<Jiji, YinYang> = {
  '자': '양', '축': '음', '인': '양', '묘': '음', '진': '양', '사': '음',
  '오': '양', '미': '음', '신': '양', '유': '음', '술': '양', '해': '음',
};

// ===== 60간지 =====
export const SIXTY_GANJI: Array<{ cheongan: Cheongan; jiji: Jiji }> = (() => {
  const result: Array<{ cheongan: Cheongan; jiji: Jiji }> = [];
  for (let i = 0; i < 60; i++) {
    result.push({
      cheongan: CHEONGAN[i % 10],
      jiji: JIJI[i % 12],
    });
  }
  return result;
})();

// ===== 지장간 (地藏干) =====
export const HIDDEN_STEMS: Record<Jiji, HiddenStem> = {
  '자': { main: '계' },
  '축': { main: '기', middle: '계', residual: '신' },
  '인': { main: '갑', middle: '병', residual: '무' },
  '묘': { main: '을' },
  '진': { main: '무', middle: '을', residual: '계' },
  '사': { main: '병', middle: '경', residual: '무' },
  '오': { main: '정', middle: '기' },
  '미': { main: '기', middle: '정', residual: '을' },
  '신': { main: '경', middle: '임', residual: '무' },
  '유': { main: '신' },
  '술': { main: '무', middle: '신', residual: '정' },
  '해': { main: '임', middle: '갑' },
};

// ===== 오행 상생/상극 =====
// 상생: 목→화→토→금→수→목
export const GENERATES: Record<FiveElement, FiveElement> = {
  '목': '화', '화': '토', '토': '금', '금': '수', '수': '목',
};

// 상극: 목→토, 토→수, 수→화, 화→금, 금→목
export const OVERCOMES: Record<FiveElement, FiveElement> = {
  '목': '토', '토': '수', '수': '화', '화': '금', '금': '목',
};

// 나를 생하는 오행
export const GENERATED_BY: Record<FiveElement, FiveElement> = {
  '목': '수', '화': '목', '토': '화', '금': '토', '수': '금',
};

// 나를 극하는 오행
export const OVERCOME_BY: Record<FiveElement, FiveElement> = {
  '목': '금', '화': '수', '토': '목', '금': '화', '수': '토',
};

// ===== 천간합 (天干合) 5쌍 =====
export const CHEONGAN_COMBINES: [Cheongan, Cheongan, FiveElement][] = [
  ['갑', '기', '토'],  // 갑기합토
  ['을', '경', '금'],  // 을경합금
  ['병', '신', '수'],  // 병신합수
  ['정', '임', '목'],  // 정임합목
  ['무', '계', '화'],  // 무계합화
];

// ===== 천간충 (天干沖) =====
export const CHEONGAN_CLASHES: [Cheongan, Cheongan][] = [
  ['갑', '경'], ['을', '신'], ['병', '임'], ['정', '계'],
];

// ===== 지지 육합 (六合) =====
export const YUKAP: [Jiji, Jiji, FiveElement][] = [
  ['자', '축', '토'],  // 자축합토
  ['인', '해', '목'],  // 인해합목
  ['묘', '술', '화'],  // 묘술합화
  ['진', '유', '금'],  // 진유합금
  ['사', '신', '수'],  // 사신합수
  ['오', '미', '토'],  // 오미합 (태양/태음)
];

// ===== 지지 삼합 (三合) =====
export const SAMHAP: [Jiji, Jiji, Jiji, FiveElement][] = [
  ['신', '자', '진', '수'],  // 신자진 수국
  ['해', '묘', '미', '목'],  // 해묘미 목국
  ['인', '오', '술', '화'],  // 인오술 화국
  ['사', '유', '축', '금'],  // 사유축 금국
];

// ===== 지지 방합 (方合) =====
export const BANGHAP: [Jiji, Jiji, Jiji, FiveElement][] = [
  ['인', '묘', '진', '목'],  // 동방 목국
  ['사', '오', '미', '화'],  // 남방 화국
  ['신', '유', '술', '금'],  // 서방 금국
  ['해', '자', '축', '수'],  // 북방 수국
];

// ===== 지지 육충 (六沖) =====
export const YUKCHUNG: [Jiji, Jiji][] = [
  ['자', '오'], ['축', '미'], ['인', '신'],
  ['묘', '유'], ['진', '술'], ['사', '해'],
];

// ===== 지지 형 (刑) =====
export const HYUNG: [Jiji, Jiji][] = [
  ['인', '사'], ['사', '신'], ['신', '인'],  // 삼형살 (무은지형)
  ['축', '술'], ['술', '미'], ['미', '축'],  // 삼형살 (지세지형)
  ['자', '묘'],                               // 무례지형
  ['진', '진'], ['오', '오'], ['유', '유'], ['해', '해'],  // 자형
];

// ===== 지지 파 (破) =====
export const PA: [Jiji, Jiji][] = [
  ['자', '유'], ['축', '진'], ['인', '해'],
  ['묘', '오'], ['사', '신'], ['미', '술'],
];

// ===== 지지 해 (害) =====
export const HAE: [Jiji, Jiji][] = [
  ['자', '미'], ['축', '오'], ['인', '사'],
  ['묘', '진'], ['신', '해'], ['유', '술'],
];

// ===== 십신 판정 매핑 =====
// [일간 오행과의 관계, 음양 일치 여부] → 십신
export function getTenGod(
  dayMasterElement: FiveElement,
  dayMasterYinYang: YinYang,
  targetElement: FiveElement,
  targetYinYang: YinYang
): TenGod {
  const sameYinYang = dayMasterYinYang === targetYinYang;

  if (dayMasterElement === targetElement) {
    return sameYinYang ? '비견' : '겁재';
  }
  if (GENERATES[dayMasterElement] === targetElement) {
    return sameYinYang ? '식신' : '상관';
  }
  if (OVERCOMES[dayMasterElement] === targetElement) {
    return sameYinYang ? '편재' : '정재';
  }
  if (OVERCOME_BY[dayMasterElement] === targetElement) {
    return sameYinYang ? '편관' : '정관';
  }
  // GENERATED_BY
  return sameYinYang ? '편인' : '정인';
}

// ===== 시간 → 지지 매핑 =====
// 23:00~00:59 자, 01:00~02:59 축, ...
export function hourToJiji(hour: number): Jiji {
  // 자시: 23~1, 축시: 1~3, 인시: 3~5, ...
  const idx = Math.floor(((hour + 1) % 24) / 2);
  return JIJI[idx];
}

// ===== 월간 시작 테이블 =====
// 년간 % 5 에 따라 인월(1월)의 천간 시작 인덱스
// 갑/기 → 병인월(2), 을/경 → 무인월(4), 병/신 → 경인월(6), 정/임 → 임인월(8), 무/계 → 갑인월(0)
export const MONTH_STEM_START: Record<number, number> = {
  0: 2,  // 갑, 기
  1: 4,  // 을, 경
  2: 6,  // 병, 신
  3: 8,  // 정, 임
  4: 0,  // 무, 계
};

// ===== 시간 천간 시작 테이블 =====
// 일간 % 5에 따라 자시의 천간 시작 인덱스
// 갑/기 → 갑자시(0), 을/경 → 병자시(2), 병/신 → 무자시(4), 정/임 → 경자시(6), 무/계 → 임자시(8)
export const HOUR_STEM_START: Record<number, number> = {
  0: 0,  // 갑, 기
  1: 2,  // 을, 경
  2: 4,  // 병, 신
  3: 6,  // 정, 임
  4: 8,  // 무, 계
};

// ===== 절(節) → 월지 매핑 =====
// 입춘→인(1), 경칩→묘(2), ...
export const JEOLGI_TO_MONTH: Record<string, number> = {
  '입춘': 1, '경칩': 2, '청명': 3, '입하': 4, '망종': 5, '소서': 6,
  '입추': 7, '백로': 8, '한로': 9, '입동': 10, '대설': 11, '소한': 12,
};

// 절기 순서 (절만, 중기 제외)
export const JEOLGI_ORDER: string[] = [
  '소한', '입춘', '경칩', '청명', '입하', '망종',
  '소서', '입추', '백로', '한로', '입동', '대설',
];

// ===== UI용 오행 색상 =====
export const ELEMENT_COLORS: Record<FiveElement, string> = {
  '목': '#22c55e',  // green
  '화': '#ef4444',  // red
  '토': '#eab308',  // yellow
  '금': '#9ca3af',  // gray (silver)
  '수': '#3b82f6',  // blue
};

export const ELEMENT_BG_COLORS: Record<FiveElement, string> = {
  '목': 'bg-green-500',
  '화': 'bg-red-500',
  '토': 'bg-yellow-500',
  '금': 'bg-gray-300',
  '수': 'bg-blue-500',
};

export const ELEMENT_TEXT_COLORS: Record<FiveElement, string> = {
  '목': 'text-green-600',
  '화': 'text-red-600',
  '토': 'text-yellow-600',
  '금': 'text-gray-600',
  '수': 'text-blue-600',
};

// 오행 한자
export const ELEMENT_HANJA: Record<FiveElement, string> = {
  '목': '木', '화': '火', '토': '土', '금': '金', '수': '水',
};

// 12지지 동물
export const JIJI_ANIMAL: Record<Jiji, string> = {
  '자': '쥐', '축': '소', '인': '호랑이', '묘': '토끼',
  '진': '용', '사': '뱀', '오': '말', '미': '양',
  '신': '원숭이', '유': '닭', '술': '개', '해': '돼지',
};

// 십신 한자
export const TEN_GOD_HANJA: Record<TenGod, string> = {
  '비견': '比肩', '겁재': '劫財',
  '식신': '食神', '상관': '傷官',
  '편재': '偏財', '정재': '正財',
  '편관': '偏官', '정관': '正官',
  '편인': '偏印', '정인': '正印',
};

// ===== AI 해석 섹션 정의 =====

export const AI_SECTIONS = [
  { key: 'overall', label: '종합운 (總合運)', icon: 'Sparkles', layout: 'full' },
  { key: 'personality', label: '성격과 기질', icon: 'User', layout: 'half' },
  { key: 'wealth', label: '재물운 (財物運)', icon: 'Coins', layout: 'half' },
  { key: 'career', label: '직업운 (職業運)', icon: 'Briefcase', layout: 'half' },
  { key: 'love', label: '연애운 (戀愛運)', icon: 'Heart', layout: 'half' },
  { key: 'marriage', label: '결혼운 (結婚運)', icon: 'Gem', layout: 'half' },
  { key: 'health', label: '건강운 (健康運)', icon: 'Activity', layout: 'half' },
  { key: 'yearAdvice', label: '올해의 조언', icon: 'Calendar', layout: 'full' },
] as const;

export type AISectionKey = (typeof AI_SECTIONS)[number]['key'];

export const SECTION_KEYS: AISectionKey[] = AI_SECTIONS.map((s) => s.key);

// ===== SSE 스트리밍 이벤트 =====

export interface SSEStartEvent {
  section: AISectionKey;
  status: 'start';
  label: string;
}

export interface SSEDeltaEvent {
  section: AISectionKey;
  status: 'delta';
  content: string;
}

export interface SSEDoneEvent {
  section: AISectionKey;
  status: 'done';
}

export interface SSECompleteEvent {
  status: 'complete';
}

export interface SSEErrorEvent {
  status: 'error';
  message: string;
}

export type SSEEvent =
  | SSEStartEvent
  | SSEDeltaEvent
  | SSEDoneEvent
  | SSECompleteEvent
  | SSEErrorEvent;

// ===== 섹션별 상태 =====

export type SectionStatus = 'idle' | 'streaming' | 'done';

export interface SectionState {
  content: string;
  status: SectionStatus;
}

export type SectionsMap = Record<AISectionKey, SectionState>;

export type StreamingStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

// ===== 프롬프트용 압축 데이터 =====

export interface CompressedSajuData {
  사주: {
    년주: string;
    월주: string;
    일주: string;
    시주: string;
  };
  일간: string;
  성별: string;
  생년: number;
  오행: Record<string, number>;
  강약: string;
  용신: string;
  희신: string;
  올해운: {
    간지: string;
    점수: number;
    천간십신: string;
    지지십신: string;
  };
  관계: string[];
  대운: {
    간지: string;
    시작나이: number;
    끝나이: number;
    시작년: number;
    점수: number;
    천간십신: string;
    지지십신: string;
  }[];
  결혼분석: {
    배우자성: string[];
    배우자성개수: number;
    배우자궁: string;
    배우자궁십신: string;
    배우자궁에배우자성: boolean;
    결혼적기: string[];
  };
}

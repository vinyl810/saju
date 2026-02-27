// ===== 기본 열거형 =====

export type Cheongan = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';
export type Jiji = '자' | '축' | '인' | '묘' | '진' | '사' | '오' | '미' | '신' | '유' | '술' | '해';
export type FiveElement = '목' | '화' | '토' | '금' | '수';
export type YinYang = '양' | '음';
export type Gender = '남' | '여';

export type TenGod =
  | '비견' | '겁재'   // 비화 (같은 오행)
  | '식신' | '상관'   // 내가 생하는
  | '편재' | '정재'   // 내가 극하는
  | '편관' | '정관'   // 나를 극하는
  | '편인' | '정인';  // 나를 생하는

export type SolarTermName =
  | '소한' | '대한' | '입춘' | '우수' | '경칩' | '춘분'
  | '청명' | '곡우' | '입하' | '소만' | '망종' | '하지'
  | '소서' | '대서' | '입추' | '처서' | '백로' | '추분'
  | '한로' | '상강' | '입동' | '소설' | '대설' | '동지';

// 절(節): 월 구분 기준이 되는 12절기
export type JeolgiName =
  | '입춘' | '경칩' | '청명' | '입하' | '망종' | '소서'
  | '입추' | '백로' | '한로' | '입동' | '대설' | '소한';

// ===== 핵심 구조체 =====

export interface GanJi {
  cheongan: Cheongan;
  jiji: Jiji;
}

export interface HiddenStem {
  main: Cheongan;          // 정기 (본기)
  middle?: Cheongan;       // 중기
  residual?: Cheongan;     // 여기
}

export interface Pillar {
  ganJi: GanJi;
  cheonganElement: FiveElement;
  jijiElement: FiveElement;
  cheonganYinYang: YinYang;
  jijiYinYang: YinYang;
  cheonganTenGod?: TenGod;  // 일간 기준 십신 (일주 천간은 자기 자신)
  jijiTenGod?: TenGod;      // 지지 정기 기준 십신
  hiddenStems: HiddenStem;
}

export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

// ===== 오행 분석 =====

export interface FiveElementCount {
  목: number;
  화: number;
  토: number;
  금: number;
  수: number;
}

export interface FiveElementAnalysis {
  counts: FiveElementCount;
  percentages: FiveElementCount;
  strongest: FiveElement;
  weakest: FiveElement;
  missing: FiveElement[];
  dayMasterElement: FiveElement;
  dayMasterStrength: 'strong' | 'weak' | 'neutral';
  strengthScore: number;  // 0-100
}

// ===== 용신 =====

export interface YongsinAnalysis {
  yongsin: FiveElement;        // 용신
  huisin: FiveElement;         // 희신
  gisin: FiveElement;          // 기신
  gusin: FiveElement;          // 구신
  hansin: FiveElement;         // 한신 (idle)
  method: 'suppression' | 'temperature';  // 억부 / 조후
  reasoning: string[];
  dayMasterStrength: 'strong' | 'weak' | 'neutral';
}

// ===== 운세 =====

export interface Fortune {
  ganJi: GanJi;
  cheonganElement: FiveElement;
  jijiElement: FiveElement;
  cheonganTenGod: TenGod;
  jijiTenGod: TenGod;
  interpretation: string;
  score: number;  // 1-100
}

export interface MajorFortune extends Fortune {
  startAge: number;
  endAge: number;
  startYear: number;
}

export interface YearlyFortune extends Fortune {
  year: number;
}

export interface MonthlyFortune extends Fortune {
  year: number;
  month: number;
}

export interface DailyFortune extends Fortune {
  date: string; // YYYY-MM-DD
}

// ===== 궁합 =====

export interface CompatibilityCategory {
  name: string;
  score: number;  // 0-100
  weight: number; // 가중치
  description: string;
  details: string[];
}

export interface CompatibilityResult {
  totalScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  categories: CompatibilityCategory[];
  summary: string;
  strengths: string[];
  weaknesses: string[];
  advice: string;
}

// ===== 성격/적성 =====

export interface PersonalityProfile {
  title: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  career: string[];
  relationships: string;
}

// ===== 합/충/형/파/해 관계 =====

export type RelationType = 'combine' | 'clash' | 'punishment' | 'destruction' | 'harm';

export type PillarPosition = 'year' | 'month' | 'day' | 'hour';

export const PILLAR_LABEL: Record<PillarPosition, string> = {
  year: '년',
  month: '월',
  day: '일',
  hour: '시',
};

export interface Relationship {
  type: RelationType;
  name: string;         // e.g., "자오충"
  elements: [string, string];
  positions: [PillarPosition, PillarPosition]; // 어느 기둥끼리의 관계인지
  description: string;
}

// ===== API 입출력 =====

export interface BirthInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: Gender;
  isLunar: boolean;
  isLeapMonth: boolean;
  useYajasi: boolean;   // 야자시 (23시 이후 다음날 적용)
  birthPlace?: string;  // 출생 도시 (진태양시 보정용)
  longitude?: number;   // 출생지 경도 (진태양시 보정용)
  utcOffset?: number;   // 출생지 UTC 오프셋 (진태양시 보정용)
}

export interface SolarTimeCorrectionInfo {
  applied: boolean;
  originalHour: number;
  originalMinute: number;
  correctedHour: number;
  correctedMinute: number;
  correctionMinutes: number;
  birthPlace?: string;
  longitude?: number;
}

export interface SajuAnalysis {
  fourPillars: FourPillars;
  fiveElements: FiveElementAnalysis;
  yongsin: YongsinAnalysis;
  majorFortunes: MajorFortune[];
  currentYearFortune: YearlyFortune;
  currentMonthFortune: MonthlyFortune;
  todayFortune: DailyFortune;
  personality: PersonalityProfile;
  relationships: Relationship[];
  birthInput: BirthInput;
  solarBirthDate: { year: number; month: number; day: number };
  solarTimeCorrection?: SolarTimeCorrectionInfo;
}

export interface CompatibilityInput {
  person1: BirthInput;
  person2: BirthInput;
}

// ===== 절기 =====

export interface SolarTermEntry {
  name: SolarTermName;
  date: string;  // YYYY-MM-DD
  month: number; // 절기가 속하는 음력 월 (1~12)
}

import type { SajuAnalysis } from '@/lib/saju/types';
import type { AnalysisMode } from './types';

const CACHE_PREFIX = 'ai-cache-v2:';
const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || 'dev';

function todayKST(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

/** 사주 계산에 영향을 주는 모든 입력 필드를 포함한 키 */
function inputKey(a: SajuAnalysis): string {
  const b = a.birthInput;
  const parts = [
    b.year, b.month, b.day, b.hour, b.minute,
    b.gender, b.isLunar ? 'L' : 'S',
    b.isLeapMonth ? 'lp' : '',
    b.useYajasi ? 'yj' : '',
    b.longitude != null ? b.longitude.toFixed(1) : '',
    b.utcOffset != null ? b.utcOffset.toString() : '',
  ];
  return parts.join(':');
}

/** 대학원생 모드에서 프롬프트에 영향을 주는 추가 필드 */
function graduateKey(a: SajuAnalysis): string {
  const b = a.birthInput;
  if (!b.degreeProgram) return '';
  return `:${b.degreeProgram}:${b.semester ?? 0}`;
}

export function buildSajuCacheKey(analysis: SajuAnalysis, mode: AnalysisMode = 'general'): string {
  const grad = mode === 'graduate' ? graduateKey(analysis) : '';
  return `${CACHE_PREFIX}saju:${mode}:${inputKey(analysis)}${grad}:${todayKST()}:${BUILD_ID}`;
}

export function buildCompatCacheKey(p1: SajuAnalysis, p2: SajuAnalysis): string {
  return `${CACHE_PREFIX}compat:${inputKey(p1)}|${inputKey(p2)}:${todayKST()}:${BUILD_ID}`;
}

export function buildProfCompatCacheKey(student: SajuAnalysis, professor: SajuAnalysis): string {
  return `${CACHE_PREFIX}profcompat:${inputKey(student)}|${inputKey(professor)}:${todayKST()}:${BUILD_ID}`;
}

export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    cleanStaleEntries();
  } catch {
    /* quota 초과 등 무시 */
  }
}

function cleanStaleEntries(): void {
  const suffix = `${todayKST()}:${BUILD_ID}`;
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (!k) continue;
    // v2 캐시: 오늘 날짜+빌드 아닌 것 삭제
    if (k.startsWith(CACHE_PREFIX) && !k.endsWith(suffix)) {
      localStorage.removeItem(k);
    }
    // v1 구버전 캐시 전부 삭제
    if (k.startsWith('ai-cache:')) {
      localStorage.removeItem(k);
    }
  }
}

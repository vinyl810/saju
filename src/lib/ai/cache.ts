import type { SajuAnalysis } from '@/lib/saju/types';

const CACHE_PREFIX = 'ai-cache:';
const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || 'dev';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function inputKey(a: SajuAnalysis): string {
  const b = a.birthInput;
  return `${b.year}-${b.month}-${b.day}-${b.hour}-${b.gender}-${b.isLunar}`;
}

export function buildSajuCacheKey(analysis: SajuAnalysis): string {
  return `${CACHE_PREFIX}saju:${inputKey(analysis)}:${today()}:${BUILD_ID}`;
}

export function buildCompatCacheKey(p1: SajuAnalysis, p2: SajuAnalysis): string {
  return `${CACHE_PREFIX}compat:${inputKey(p1)}|${inputKey(p2)}:${today()}:${BUILD_ID}`;
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
  const suffix = `${today()}:${BUILD_ID}`;
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k?.startsWith(CACHE_PREFIX) && !k.endsWith(suffix)) {
      localStorage.removeItem(k);
    }
  }
}

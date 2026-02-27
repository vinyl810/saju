'use client';

import { useState } from 'react';
import type { BirthInput, CompatibilityResult, SajuAnalysis } from '@/lib/saju/types';

interface CompatibilityResponse {
  result: CompatibilityResult;
  person1Analysis: SajuAnalysis;
  person2Analysis: SajuAnalysis;
}

export function useCompatibility() {
  const [result, setResult] = useState<CompatibilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (person1: BirthInput, person2: BirthInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person1, person2 }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '계산 중 오류가 발생했습니다.');
      }

      const data = await res.json();
      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, calculate };
}

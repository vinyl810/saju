'use client';

import { useState } from 'react';
import type { BirthInput, SajuAnalysis } from '@/lib/saju/types';

export function useSajuCalculation() {
  const [result, setResult] = useState<SajuAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (input: BirthInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/saju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
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

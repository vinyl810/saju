'use client';

import { BirthForm } from '@/components/saju/birth-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BirthInput } from '@/lib/saju/types';
import { useState } from 'react';

interface CompatibilityFormProps {
  onSubmit: (person1: BirthInput, person2: BirthInput) => void;
  loading?: boolean;
}

export function CompatibilityForm({ onSubmit, loading }: CompatibilityFormProps) {
  const [person1, setPerson1] = useState<BirthInput | null>(null);
  const [person2, setPerson2] = useState<BirthInput | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <BirthForm
            title="첫 번째 사람"
            compact
            onSubmit={(input) => setPerson1(input)}
          />
          {person1 && (
            <div className="mt-2 text-center text-sm text-green-600">입력 완료</div>
          )}
        </div>
        <div>
          <BirthForm
            title="두 번째 사람"
            compact
            onSubmit={(input) => setPerson2(input)}
          />
          {person2 && (
            <div className="mt-2 text-center text-sm text-green-600">입력 완료</div>
          )}
        </div>
      </div>

      <div className="text-center">
        <Button
          size="lg"
          disabled={!person1 || !person2 || loading}
          onClick={() => person1 && person2 && onSubmit(person1, person2)}
        >
          {loading ? '분석 중...' : '궁합 분석하기'}
        </Button>
      </div>
    </div>
  );
}

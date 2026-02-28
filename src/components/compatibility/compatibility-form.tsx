'use client';

import { useRef } from 'react';
import { BirthForm } from '@/components/saju/birth-form';
import { Button } from '@/components/ui/button';
import type { BirthInput } from '@/lib/saju/types';

interface CompatibilityFormProps {
  onSubmit: (person1: BirthInput, person2: BirthInput) => void;
  loading?: boolean;
}

export function CompatibilityForm({ onSubmit, loading }: CompatibilityFormProps) {
  const person1Ref = useRef<BirthInput | null>(null);
  const person2Ref = useRef<BirthInput | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <BirthForm
          title="첫 번째 사람"
          compact
          hideSubmit
          onChange={(input) => { person1Ref.current = input; }}
        />
        <BirthForm
          title="두 번째 사람"
          compact
          hideSubmit
          onChange={(input) => { person2Ref.current = input; }}
        />
      </div>

      <div className="text-center">
        <Button
          size="lg"
          disabled={loading}
          onClick={() => {
            if (person1Ref.current && person2Ref.current) {
              onSubmit(person1Ref.current, person2Ref.current);
            }
          }}
        >
          {loading ? '분석 중...' : '궁합 분석하기'}
        </Button>
      </div>
    </div>
  );
}

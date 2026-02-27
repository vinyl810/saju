'use client';

import { useCompatibility } from '@/hooks/use-compatibility';
import { CompatibilityForm } from '@/components/compatibility/compatibility-form';
import { CompatibilityResultDisplay } from '@/components/compatibility/compatibility-result';
import { ElementComparison } from '@/components/compatibility/element-comparison';
import { FourPillarsDisplay } from '@/components/saju/four-pillars-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/motion';
import { TermTooltip } from '@/components/ui/term-tooltip';

export default function CompatibilityPage() {
  const { result, loading, error, calculate } = useCompatibility();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <FadeIn>
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl font-bold sm:text-3xl"><TermTooltip termKey="궁합">궁합</TermTooltip> 분석</h1>
          <p className="mt-2 text-muted-foreground">
            두 사람의 생년월일시를 입력하면 <TermTooltip termKey="사주">사주</TermTooltip> <TermTooltip termKey="궁합">궁합</TermTooltip>을 분석합니다.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <CompatibilityForm
          onSubmit={(person1, person2) => calculate(person1, person2)}
          loading={loading}
        />
      </FadeIn>

      {error && (
        <FadeIn>
          <div className="mt-6 text-center text-destructive">
            <p>{error}</p>
          </div>
        </FadeIn>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <CompatibilityResultDisplay result={result.result} />

          <FadeIn delay={0.3}>
            <ElementComparison
              analysis1={result.person1Analysis.fiveElements}
              analysis2={result.person2Analysis.fiveElements}
            />
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-2">
            <FadeIn delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-base">첫 번째 사람 <TermTooltip termKey="사주">사주</TermTooltip></CardTitle>
                </CardHeader>
                <CardContent>
                  <FourPillarsDisplay fourPillars={result.person1Analysis.fourPillars} />
                </CardContent>
              </Card>
            </FadeIn>
            <FadeIn delay={0.5}>
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-base">두 번째 사람 <TermTooltip termKey="사주">사주</TermTooltip></CardTitle>
                </CardHeader>
                <CardContent>
                  <FourPillarsDisplay fourPillars={result.person2Analysis.fourPillars} />
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/motion';
import { useAiInterpretation } from '@/hooks/use-ai-interpretation';
import { AISectionCard } from './ai-section-card';
import { SatisfactionSurvey } from '@/components/ui/satisfaction-survey';
import { AI_SECTIONS, type SectionsMap, type StreamingStatus } from '@/lib/ai/types';
import type { SajuAnalysis } from '@/lib/saju/types';

interface AiInterpretationProps {
  analysis: SajuAnalysis;
  onSectionsChange?: (sections: SectionsMap, status: StreamingStatus) => void;
}

function ShimmerBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-lg animate-shimmer opacity-20 ${className}`} />
  );
}

function ShimmerSkeleton() {
  return (
    <div className="space-y-4">
      {/* Full-width shimmer card */}
      <Card className="overflow-hidden border-primary/10">
        <div className="p-6 space-y-3">
          <ShimmerBlock className="h-4 w-32" />
          <ShimmerBlock className="h-3 w-full" />
          <ShimmerBlock className="h-3 w-5/6" />
          <ShimmerBlock className="h-3 w-4/6" />
        </div>
      </Card>

      {/* 2-col shimmer grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden border-primary/10">
            <div className="p-6 space-y-3">
              <ShimmerBlock className="h-4 w-24" />
              <ShimmerBlock className="h-3 w-full" />
              <ShimmerBlock className="h-3 w-3/4" />
            </div>
          </Card>
        ))}
      </div>

      {/* Full-width shimmer card */}
      <Card className="overflow-hidden border-primary/10">
        <div className="p-6 space-y-3">
          <ShimmerBlock className="h-4 w-28" />
          <ShimmerBlock className="h-3 w-full" />
          <ShimmerBlock className="h-3 w-5/6" />
          <ShimmerBlock className="h-3 w-3/6" />
        </div>
      </Card>

      <p className="text-center text-sm text-muted-foreground animate-pulse">
        AI가 사주를 분석하고 있습니다...
      </p>
    </div>
  );
}

export function AiInterpretation({ analysis, onSectionsChange }: AiInterpretationProps) {
  const { sections, status, error, start } = useAiInterpretation();
  const startedRef = useRef(false);

  // 컴포넌트 마운트 시 자동으로 AI 해석 시작
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      start(analysis);
    }
  }, [analysis, start]);

  // 부모에게 sections/status 변경 알림
  useEffect(() => {
    onSectionsChange?.(sections, status);
  }, [sections, status]);

  const fullWidthSections = AI_SECTIONS.filter((s) => s.layout === 'full');
  const halfWidthSections = AI_SECTIONS.filter((s) => s.layout === 'half');

  return (
    <section className="mt-12">
      {/* Section header */}
      <FadeIn>
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            AI 사주 해석
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>
      </FadeIn>

      {/* Loading state - Shimmer skeleton */}
      {(status === 'idle' || status === 'loading') && (
        <FadeIn>
          <ShimmerSkeleton />
        </FadeIn>
      )}

      {/* Streaming / Done / Error states */}
      {(status === 'streaming' || status === 'done' || status === 'error') && (
        <div className="space-y-4">
          {/* 오늘을 위한 한마디 배너 */}
          {sections.todayMessage.status !== 'idle' && (
            <FadeIn>
              <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 shadow-sm shadow-primary/5">
                <div className="absolute top-3 left-4 font-serif text-4xl leading-none text-primary/15 select-none" aria-hidden="true">&ldquo;</div>
                <CardContent className="relative px-10 py-6 text-center">
                  <p className="font-serif text-base leading-relaxed sm:text-lg">
                    {sections.todayMessage.content}
                    {sections.todayMessage.status === 'streaming' && (
                      <span className="inline-block w-0.5 h-4 ml-0.5 align-text-bottom animate-pulse bg-primary" />
                    )}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span className="h-px w-6 bg-primary/20" />
                    오늘을 위한 한마디
                    <span className="h-px w-6 bg-primary/20" />
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Error banner */}
          {status === 'error' && error && (
            <FadeIn>
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="flex items-center gap-3 py-4">
                  <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto shrink-0"
                    onClick={() => start(analysis)}
                  >
                    다시 시도
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* First full-width section (overall) */}
          {fullWidthSections[0] && (
            <AISectionCard
              sectionKey={fullWidthSections[0].key}
              state={sections[fullWidthSections[0].key]}
              analysis={analysis}
            />
          )}

          {/* 2-column grid for half-width sections */}
          <div className="grid gap-4 md:grid-cols-2">
            {halfWidthSections.map((s) => (
              <AISectionCard key={s.key} sectionKey={s.key} state={sections[s.key]} analysis={analysis} />
            ))}
          </div>

          {/* Last full-width section (yearAdvice) */}
          {fullWidthSections[1] && (
            <AISectionCard
              sectionKey={fullWidthSections[1].key}
              state={sections[fullWidthSections[1].key]}
              analysis={analysis}
            />
          )}

          {/* Completion indicator */}
          {status === 'done' && (
            <>
              <FadeIn>
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  AI 분석 완료
                </div>
              </FadeIn>
              <SatisfactionSurvey type="saju" />
            </>
          )}
        </div>
      )}
    </section>
  );
}

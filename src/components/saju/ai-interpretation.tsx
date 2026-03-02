'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/motion';
import { useAiInterpretation } from '@/hooks/use-ai-interpretation';
import { AISectionCard } from './ai-section-card';
import { SatisfactionSurvey } from '@/components/ui/satisfaction-survey';
import { getAiSections, type AnalysisMode, type SectionsMap, type StreamingStatus } from '@/lib/ai/types';
import type { SajuAnalysis } from '@/lib/saju/types';

interface AiInterpretationProps {
  analysis: SajuAnalysis;
  mode?: AnalysisMode;
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
      <Card className="overflow-hidden border-primary/10">
        <div className="p-6 space-y-3">
          <ShimmerBlock className="h-4 w-32" />
          <ShimmerBlock className="h-3 w-full" />
          <ShimmerBlock className="h-3 w-5/6" />
          <ShimmerBlock className="h-3 w-4/6" />
        </div>
      </Card>
      <LoadingMessages />
    </div>
  );
}

const SAJU_LOADING_MESSAGES = [
  '사주 팔자 해석 중',
  '오행 분석 중',
  '운세 흐름 파악 중',
  '조언 준비 중',
];

function LoadingMessages() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SAJU_LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div key={index} className="flex items-center gap-2 animate-fade-in-up">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-sm text-muted-foreground">
          {SAJU_LOADING_MESSAGES[index]}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce-dot"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function AiInterpretation({ analysis, mode = 'graduate', onSectionsChange }: AiInterpretationProps) {
  const { sections, status, error, start } = useAiInterpretation();
  const startedRef = useRef(false);

  // 컴포넌트 마운트 시 자동으로 AI 해석 시작
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      start(analysis, mode);
    }
  }, [analysis, mode, start]);

  // 부모에게 sections/status 변경 알림
  useEffect(() => {
    onSectionsChange?.(sections, status);
  }, [sections, status]);

  const aiSections = getAiSections(mode);
  // banner 제외, 나머지 섹션을 배열 순서대로 그룹화 (연속 half → grid, full → 개별)
  const nonBannerSections = aiSections.filter((s) => s.layout !== 'banner');
  const renderGroups: { type: 'full' | 'half'; sections: typeof nonBannerSections }[] = [];
  for (const s of nonBannerSections) {
    if (s.layout === 'half') {
      const last = renderGroups[renderGroups.length - 1];
      if (last && last.type === 'half') {
        last.sections.push(s);
      } else {
        renderGroups.push({ type: 'half', sections: [s] });
      }
    } else {
      renderGroups.push({ type: 'full', sections: [s] });
    }
  }

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
          {sections.todayMessage?.status !== 'idle' && (
            <FadeIn>
              <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 shadow-sm shadow-primary/5">
                <div className="absolute top-3 left-4 font-serif text-4xl leading-none text-primary/15 select-none" aria-hidden="true">&ldquo;</div>
                <CardContent className="relative px-10 py-6 text-center">
                  <p className="font-serif text-base leading-relaxed sm:text-lg">
                    {sections.todayMessage.content.replace(/^오늘을 위한 한마디:\s*/, '')}
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
                    onClick={() => start(analysis, mode)}
                  >
                    다시 시도
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* 배열 순서 보존 렌더링: full → 개별, 연속 half → 2-col grid */}
          {renderGroups.map((group, gi) =>
            group.type === 'half' ? (
              <div key={gi} className="grid gap-4 md:grid-cols-2">
                {group.sections.map((s) => (
                  <AISectionCard key={s.key} sectionKey={s.key} state={sections[s.key]} analysis={analysis} mode={mode} />
                ))}
              </div>
            ) : (
              <AISectionCard
                key={group.sections[0].key}
                sectionKey={group.sections[0].key}
                state={sections[group.sections[0].key]}
                analysis={analysis}
                mode={mode}
              />
            ),
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

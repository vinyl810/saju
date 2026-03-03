'use client';

import { useState, useCallback, useEffect } from 'react';
import { FlaskConical, MessageCircle, GraduationCap, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/motion';
import { BirthForm } from './birth-form';
import { SatisfactionSurvey } from '@/components/ui/satisfaction-survey';
import { useSajuCalculation } from '@/hooks/use-saju-calculation';
import { useProfessorCompat } from '@/hooks/use-professor-compat';
import { AI_PROF_COMPAT_SECTIONS, type AIProfCompatSectionKey, type SectionState } from '@/lib/ai/types';
import { ELEMENT_COLORS } from '@/lib/saju/constants';
import { renderRichText } from '@/lib/ai/rich-text';
import {
  getProfCompatResearchDemographics,
  getProfCompatCommDemographics,
  type ProfCompatResearchDemographics,
  type ProfCompatCommDemographics,
  type ElementBadge,
} from '@/lib/ai/section-demographics';
import type { SajuAnalysis, BirthInput, CompatibilityResult, FiveElement } from '@/lib/saju/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  FlaskConical,
  MessageCircle,
  GraduationCap,
};

type Phase = 'idle' | 'form' | 'calculating' | 'streaming' | 'done' | 'error';

interface ProfessorCompatProps {
  analysis: SajuAnalysis;
}

// ===== 뱃지 렌더링 헬퍼 =====

function ElementBadgeUI({ label, element }: { label: string; element: FiveElement }) {
  return (
    <Badge
      variant="secondary"
      className="text-white text-xs"
      style={{ backgroundColor: ELEMENT_COLORS[element] }}
    >
      {label}
    </Badge>
  );
}

function ResearchHeader({ data }: { data: ProfCompatResearchDemographics }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ElementBadgeUI label={data.studentDayMaster.label} element={data.studentDayMaster.element} />
      <ElementBadgeUI label={data.professorDayMaster.label} element={data.professorDayMaster.element} />
      <ElementBadgeUI label={data.studentYongsin.label} element={data.studentYongsin.element} />
      <ElementBadgeUI label={data.professorYongsin.label} element={data.professorYongsin.element} />
      {data.studentTenGods.map((tg, i) => (
        <Badge key={i} variant="secondary" className="text-xs">
          {tg.label} ({tg.hanja})
        </Badge>
      ))}
    </div>
  );
}

function CommHeader({ data }: { data: ProfCompatCommDemographics }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {data.studentTenGods.map((tg, i) => (
        <Badge key={i} variant="secondary" className="text-xs">
          {tg.label} ({tg.hanja})
        </Badge>
      ))}
      {data.relationships.map((r, i) => (
        <Badge
          key={`r-${i}`}
          variant={r.type === 'combine' ? 'default' : 'destructive'}
          className="text-xs"
        >
          {r.name}
        </Badge>
      ))}
    </div>
  );
}

// ===== 한마디 파싱 =====

function parseSummaryAndBody(raw: string): { summary: string | null; body: string } {
  const idx = raw.indexOf('\n\n');
  if (idx === -1) return { summary: null, body: raw };
  const firstLine = raw.slice(0, idx).trim();
  if (firstLine.length > 100) return { summary: null, body: raw };
  return { summary: firstLine, body: raw.slice(idx + 2) };
}

// ===== 섹션 카드 =====

interface ProfCompatSectionCardProps {
  sectionKey: AIProfCompatSectionKey;
  state: SectionState;
  researchDemo?: ProfCompatResearchDemographics | null;
  commDemo?: ProfCompatCommDemographics | null;
}

function ProfCompatSectionCard({ sectionKey, state, researchDemo, commDemo }: ProfCompatSectionCardProps) {
  const section = AI_PROF_COMPAT_SECTIONS.find((s) => s.key === sectionKey);
  if (!section || state.status === 'idle') return null;

  const Icon = ICON_MAP[section.icon];

  // 모든 섹션: 첫 줄을 한마디로 분리
  const { summary, body } = parseSummaryAndBody(state.content);

  return (
    <FadeIn className={`${section.layout === 'full' ? 'col-span-full' : ''} h-full`}>
      <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {Icon && <Icon className="h-4 w-4 text-primary" />}
            <span className="font-serif">{section.label}</span>
            {state.status === 'streaming' && (
              <span className="ml-auto flex items-center gap-1 text-xs font-normal text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                작성 중
              </span>
            )}
          </CardTitle>
          {/* 뱃지 헤더 */}
          {sectionKey === 'researchStyle' && researchDemo && (
            <div className="mt-2"><ResearchHeader data={researchDemo} /></div>
          )}
          {sectionKey === 'communication' && commDemo && (
            <div className="mt-2"><CommHeader data={commDemo} /></div>
          )}
        </CardHeader>
        {/* 한마디 배너 */}
        {summary && (
          <div className="relative mx-6 mb-1 rounded-md bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 px-8 py-3 text-center">
            <span className="absolute left-3 top-1.5 font-serif text-2xl leading-none text-primary/20 select-none" aria-hidden="true">&ldquo;</span>
            <p className="font-serif text-base leading-relaxed text-foreground/70">{summary}</p>
            <span className="absolute right-3 bottom-1.5 font-serif text-2xl leading-none text-primary/20 select-none" aria-hidden="true">&rdquo;</span>
          </div>
        )}
        <CardContent>
          <div className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-muted-foreground">
            {renderRichText(summary ? body : state.content)}
            {state.status === 'streaming' && (
              <span className="inline-block w-0.5 h-4 ml-0.5 align-text-bottom animate-pulse bg-primary" />
            )}
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

// ===== 로딩 =====

const LOADING_MESSAGES = [
  '교수님 사주 분석 중',
  '궁합 데이터 계산 중',
  'AI 해석 준비 중',
  '결과 생성 중',
];

function LoadingSpinner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div key={index} className="flex items-center gap-2 animate-fade-in-up">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-sm text-muted-foreground">
          {LOADING_MESSAGES[index]}
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

// ===== 메인 컴포넌트 =====

export function ProfessorCompat({ analysis }: ProfessorCompatProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [professorInput, setProfessorInput] = useState<BirthInput | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [profAnalysisState, setProfAnalysisState] = useState<SajuAnalysis | null>(null);

  const sajuCalc = useSajuCalculation();
  const { sections, status: aiStatus, error: aiError, start: startAi } = useProfessorCompat();

  // AI 스트리밍 상태 → phase 동기화
  useEffect(() => {
    if (phase === 'streaming' && aiStatus === 'done') {
      setPhase('done');
    }
    if (phase === 'streaming' && aiStatus === 'error') {
      setPhase('error');
    }
  }, [phase, aiStatus]);

  const handleStartForm = useCallback(() => {
    setPhase('form');
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!professorInput) return;

    setPhase('calculating');
    setCalcError(null);

    try {
      const profAnalysis = await sajuCalc.calculate(professorInput);
      if (!profAnalysis) {
        throw new Error(sajuCalc.error || '교수님 사주 계산에 실패했습니다.');
      }
      setProfAnalysisState(profAnalysis);

      const compatRes = await fetch('/api/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1: analysis.birthInput,
          person2: professorInput,
        }),
      });

      if (!compatRes.ok) {
        const errData = await compatRes.json().catch(() => null);
        throw new Error(errData?.error || '궁합 계산에 실패했습니다.');
      }

      const compatData = await compatRes.json();
      const compatResult: CompatibilityResult = compatData.result;

      setPhase('streaming');
      await startAi(analysis, profAnalysis, compatResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.';
      setCalcError(message);
      setPhase('error');
    }
  }, [professorInput, analysis, sajuCalc, startAi]);

  const handleRetry = useCallback(() => {
    setCalcError(null);
    setPhase('form');
  }, []);

  // Demographics 계산 (교수 분석 완료 시)
  const researchDemo = profAnalysisState ? getProfCompatResearchDemographics(analysis, profAnalysisState) : null;
  const commDemo = getProfCompatCommDemographics(analysis);

  // idle: CTA 카드
  if (phase === 'idle') {
    return (
      <FadeIn>
        <Card
          className="mt-8 cursor-pointer border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 transition-all hover:border-primary/40 hover:shadow-md"
          onClick={handleStartForm}
        >
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-serif text-base font-semibold">지도교수님과의 궁합을 알아보세요</p>
              <p className="mt-1 text-sm text-muted-foreground">
                교수님의 생년월일을 입력하면 연구 스타일, 소통, 성장 시너지를 분석해 드려요
              </p>
            </div>
            <Sparkles className="h-5 w-5 shrink-0 text-primary/60" />
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  // form
  if (phase === 'form') {
    return (
      <FadeIn>
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <h3 className="flex items-center gap-2 font-serif text-base font-semibold">
              <GraduationCap className="h-4 w-4 text-primary" />
              교수님 정보 입력
            </h3>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <BirthForm
                compact
                hideSubmit
                hideAnalysisMode
                title="교수님 생년월일"
                onChange={setProfessorInput}
              />
              <Button
                className="mt-4 w-full"
                onClick={handleAnalyze}
                disabled={!professorInput}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                궁합 분석 시작
              </Button>
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    );
  }

  // error
  if (phase === 'error') {
    const errorMsg = calcError || aiError || '분석 중 오류가 발생했습니다.';
    return (
      <FadeIn>
        <div className="mt-8 space-y-4">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{errorMsg}</p>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto shrink-0"
                onClick={handleRetry}
              >
                다시 시도
              </Button>
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    );
  }

  // calculating / streaming 초기: 로딩
  const hasAnySection = AI_PROF_COMPAT_SECTIONS.some((s) => sections[s.key].status !== 'idle');

  if (phase === 'calculating' || (phase === 'streaming' && !hasAnySection)) {
    return (
      <FadeIn>
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <h3 className="flex items-center gap-2 font-serif text-base font-semibold">
              <GraduationCap className="h-4 w-4 text-primary" />
              교수님과의 궁합 분석
            </h3>
            <div className="h-px flex-1 bg-border" />
          </div>
          <LoadingSpinner />
        </div>
      </FadeIn>
    );
  }

  // streaming / done: 3개 섹션 카드
  return (
    <FadeIn>
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <h3 className="flex items-center gap-2 font-serif text-base font-semibold">
            <GraduationCap className="h-4 w-4 text-primary" />
            교수님과의 궁합 분석
          </h3>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* overview: full width */}
        <ProfCompatSectionCard
          sectionKey="overview"
          state={sections.overview}
        />

        {/* researchStyle + communication: 2-col grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <ProfCompatSectionCard
            sectionKey="researchStyle"
            state={sections.researchStyle}
            researchDemo={researchDemo}
          />
          <ProfCompatSectionCard
            sectionKey="communication"
            state={sections.communication}
            commDemo={commDemo}
          />
        </div>

        {phase === 'done' && (
          <>
            <FadeIn>
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4 text-green-500" />
                교수님 궁합 분석 완료
              </div>
            </FadeIn>
            <SatisfactionSurvey type="professor-compat" metadata={{
              student: `${analysis.birthInput.year}-${analysis.birthInput.month}-${analysis.birthInput.day} ${analysis.birthInput.hour}:${analysis.birthInput.minute} ${analysis.birthInput.gender}`,
              professor: profAnalysisState ? `${profAnalysisState.birthInput.year}-${profAnalysisState.birthInput.month}-${profAnalysisState.birthInput.day} ${profAnalysisState.birthInput.hour}:${profAnalysisState.birthInput.minute} ${profAnalysisState.birthInput.gender}` : null,
              studentDayMaster: analysis.fourPillars.day.ganJi.cheongan,
              professorDayMaster: profAnalysisState?.fourPillars.day.ganJi.cheongan || null,
            }} />
          </>
        )}
      </div>
    </FadeIn>
  );
}

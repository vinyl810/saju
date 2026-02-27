'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useSajuCalculation } from '@/hooks/use-saju-calculation';
import { FourPillarsDisplay } from '@/components/saju/four-pillars-display';
import { ElementChart } from '@/components/saju/element-chart';
import { TenGodsTable } from '@/components/saju/ten-gods-table';
import { YongsinCard } from '@/components/saju/yongsin-card';
import { PersonalitySection } from '@/components/saju/personality-section';
import { MajorFortuneTimeline } from '@/components/fortune/major-fortune-timeline';
import { YearlyFortuneCard } from '@/components/fortune/yearly-fortune-card';
import { MonthlyFortuneCard } from '@/components/fortune/monthly-fortune-card';
import { DailyFortuneCard } from '@/components/fortune/daily-fortune-card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FadeIn, motion, scaleIn, staggerContainer } from '@/components/ui/motion';
import { ResultSkeleton } from '@/components/saju/result-skeleton';
import type { BirthInput, Gender } from '@/lib/saju/types';
import { TermTooltip } from '@/components/ui/term-tooltip';
import { generateRelationshipDef } from '@/lib/saju/terminology';
import { PILLAR_LABEL } from '@/lib/saju/types';
import { AiInterpretation } from '@/components/saju/ai-interpretation';

const HOUR_LABELS: Record<number, string> = {
  0: '자시(00시)', 1: '축시(01시)', 3: '인시(03시)', 5: '묘시(05시)',
  7: '진시(07시)', 9: '사시(09시)', 11: '오시(11시)', 13: '미시(13시)',
  15: '신시(15시)', 17: '유시(17시)', 19: '술시(19시)', 21: '해시(21시)',
  23: '야자시(23시)',
};

function ResultContent() {
  const searchParams = useSearchParams();
  const { result, loading, error, calculate } = useSajuCalculation();

  useEffect(() => {
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const day = searchParams.get('day');
    const hour = searchParams.get('hour');
    const gender = searchParams.get('gender');

    if (year && month && day && hour && gender) {
      const birthPlace = searchParams.get('birthPlace') || undefined;
      const longitudeStr = searchParams.get('longitude');
      const longitude = longitudeStr ? parseFloat(longitudeStr) : undefined;
      const utcOffsetStr = searchParams.get('utcOffset');
      const utcOffset = utcOffsetStr ? parseFloat(utcOffsetStr) : undefined;

      const input: BirthInput = {
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        hour: parseInt(hour),
        minute: 0,
        gender: gender as Gender,
        isLunar: searchParams.get('isLunar') === 'true',
        isLeapMonth: searchParams.get('isLeapMonth') === 'true',
        useYajasi: searchParams.get('useYajasi') === 'true',
        birthPlace,
        longitude,
        utcOffset,
      };
      calculate(input);
    }
  }, [searchParams]);

  if (loading) {
    return <ResultSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <FadeIn className="text-center text-destructive">
          <div className="text-xl font-bold">오류 발생</div>
          <p className="mt-2">{error}</p>
        </FadeIn>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <FadeIn className="text-center text-muted-foreground">
          <div className="text-xl">입력 정보가 없습니다.</div>
          <p className="mt-2">홈에서 생년월일시를 입력해 주세요.</p>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <FadeIn>
        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl font-bold sm:text-3xl"><TermTooltip termKey="사주팔자">사주팔자</TermTooltip> 분석 결과</h1>
          <motion.div
            className="mt-3 flex flex-wrap justify-center gap-2"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={scaleIn}>
              <Badge variant="outline">
                {result.solarBirthDate.year}년 {result.solarBirthDate.month}월 {result.solarBirthDate.day}일
              </Badge>
            </motion.div>
            <motion.div variants={scaleIn}>
              <Badge variant="outline">
                {HOUR_LABELS[result.birthInput.hour] ?? `${result.birthInput.hour}시`}
              </Badge>
            </motion.div>
            <motion.div variants={scaleIn}>
              <Badge variant="outline">{result.birthInput.gender}성</Badge>
            </motion.div>
            {result.birthInput.isLunar && (
              <motion.div variants={scaleIn}>
                <Badge variant="secondary">음력</Badge>
              </motion.div>
            )}
            {result.solarTimeCorrection?.applied && (
              <motion.div variants={scaleIn}>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <TermTooltip termKey="진태양시">진태양시</TermTooltip> 보정: {String(result.solarTimeCorrection.originalHour).padStart(2, '0')}:{String(result.solarTimeCorrection.originalMinute).padStart(2, '0')} → {String(result.solarTimeCorrection.correctedHour).padStart(2, '0')}:{String(result.solarTimeCorrection.correctedMinute).padStart(2, '0')}
                  {result.solarTimeCorrection.birthPlace && ` (${result.solarTimeCorrection.birthPlace})`}
                </Badge>
              </motion.div>
            )}
          </motion.div>
        </div>
      </FadeIn>

      {/* Four Pillars */}
      <FadeIn delay={0.2}>
        <FourPillarsDisplay fourPillars={result.fourPillars} />
      </FadeIn>

      {/* Relationship badges */}
      {result.relationships.length > 0 && (
        <FadeIn delay={0.4}>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {result.relationships.map((rel, i) => {
              const relDef = generateRelationshipDef(rel.name);
              const posLabel = rel.positions ? `${PILLAR_LABEL[rel.positions[0]]}주↔${PILLAR_LABEL[rel.positions[1]]}주` : null;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Badge variant={rel.type === 'combine' ? 'default' : 'destructive'}>
                    {relDef ? <TermTooltip termDef={relDef}>{rel.name}</TermTooltip> : rel.name}
                  </Badge>
                  {posLabel && (
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[9px] font-medium tracking-wide ${
                      rel.type === 'combine'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {posLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </FadeIn>
      )}

      {/* Tabs */}
      <FadeIn delay={0.5}>
        <Tabs defaultValue="elements" className="mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="elements"><TermTooltip termKey="오행">오행</TermTooltip></TabsTrigger>
            <TabsTrigger value="yongsin"><TermTooltip termKey="용신">용신</TermTooltip></TabsTrigger>
            <TabsTrigger value="tengods"><TermTooltip termKey="십신">십신</TermTooltip></TabsTrigger>
            <TabsTrigger value="personality">성격</TabsTrigger>
            <TabsTrigger value="fortune">운세</TabsTrigger>
          </TabsList>

          <TabsContent value="elements" className="mt-4">
            <ElementChart analysis={result.fiveElements} />
          </TabsContent>

          <TabsContent value="yongsin" className="mt-4">
            <YongsinCard yongsin={result.yongsin} />
          </TabsContent>

          <TabsContent value="tengods" className="mt-4">
            <TenGodsTable fourPillars={result.fourPillars} />
          </TabsContent>

          <TabsContent value="personality" className="mt-4">
            <PersonalitySection personality={result.personality} />
          </TabsContent>

          <TabsContent value="fortune" className="mt-4 space-y-4">
            <MajorFortuneTimeline
              fortunes={result.majorFortunes}
              birthYear={result.solarBirthDate.year}
            />
            <div className="grid gap-4 md:grid-cols-3">
              <YearlyFortuneCard fortune={result.currentYearFortune} />
              <MonthlyFortuneCard fortune={result.currentMonthFortune} />
              <DailyFortuneCard fortune={result.todayFortune} />
            </div>
          </TabsContent>

        </Tabs>
      </FadeIn>

      {/* AI Interpretation Section */}
      <AiInterpretation analysis={result} />
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<ResultSkeleton />}>
      <ResultContent />
    </Suspense>
  );
}

'use client';

import { forwardRef } from 'react';
import { PdfModeProvider } from './pdf-mode-context';
import { PillarCard } from './pillar-card';
import { YongsinCard } from './yongsin-card';
import { TenGodsTable } from './ten-gods-table';
import { PersonalitySection } from './personality-section';
import { MajorFortuneTimeline } from '@/components/fortune/major-fortune-timeline';
import { YearlyFortuneCard } from '@/components/fortune/yearly-fortune-card';
import { MonthlyFortuneCard } from '@/components/fortune/monthly-fortune-card';
import { DailyFortuneCard } from '@/components/fortune/daily-fortune-card';
import { AISectionCard } from './ai-section-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AI_SECTIONS, type SectionsMap, type StreamingStatus } from '@/lib/ai/types';
import { ELEMENT_HANJA, ELEMENT_COLORS } from '@/lib/saju/constants';
import { TermTooltip } from '@/components/ui/term-tooltip';
import { generateRelationshipDef } from '@/lib/saju/terminology';
import { PILLAR_LABEL } from '@/lib/saju/types';
import type { SajuAnalysis, FiveElement } from '@/lib/saju/types';

const HOUR_LABELS: Record<number, string> = {
  0: '자시(00시)', 1: '축시(01시)', 3: '인시(03시)', 5: '묘시(05시)',
  7: '진시(07시)', 9: '사시(09시)', 11: '오시(11시)', 13: '미시(13시)',
  15: '신시(15시)', 17: '유시(17시)', 19: '술시(19시)', 21: '해시(21시)',
  23: '야자시(23시)',
};

interface PdfContentProps {
  result: SajuAnalysis;
  aiSections: SectionsMap | null;
  aiStatus: StreamingStatus;
}

// 오행 바 차트 (레이더 차트 대신 PDF용)
function ElementBarChart({ analysis }: { analysis: SajuAnalysis['fiveElements'] }) {
  const elements: FiveElement[] = ['목', '화', '토', '금', '수'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-base">
          <TermTooltip termKey="오행">오행 분포</TermTooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 바 차트 */}
        <div className="space-y-2">
          {elements.map((el) => (
            <div key={el} className="flex items-center gap-2">
              <span className="w-12 text-sm font-medium">
                {el} {ELEMENT_HANJA[el]}
              </span>
              <div className="flex-1 rounded-full bg-muted h-4 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(analysis.percentages[el], 100)}%`,
                    backgroundColor: ELEMENT_COLORS[el],
                  }}
                />
              </div>
              <span className="w-10 text-right text-sm text-muted-foreground">
                {analysis.percentages[el]}%
              </span>
            </div>
          ))}
        </div>

        {/* 요약 */}
        <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
          <p>
            <strong>가장 강한 오행:</strong> {analysis.strongest} {ELEMENT_HANJA[analysis.strongest]} ({analysis.percentages[analysis.strongest]}%)
          </p>
          <p>
            <strong>가장 약한 오행:</strong> {analysis.weakest} {ELEMENT_HANJA[analysis.weakest]} ({analysis.percentages[analysis.weakest]}%)
          </p>
          {analysis.missing.length > 0 && (
            <p className="text-destructive">
              <strong>결여 오행:</strong> {analysis.missing.map(e => `${e} ${ELEMENT_HANJA[e]}`).join(', ')}
            </p>
          )}
          <p className="mt-1">
            <strong>일간 강약:</strong>{' '}
            {analysis.dayMasterStrength === 'strong' ? '신강 (身強)' :
             analysis.dayMasterStrength === 'weak' ? '신약 (身弱)' : '중화 (中和)'}
            {' '}({analysis.strengthScore}점)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export const PdfContent = forwardRef<HTMLDivElement, PdfContentProps>(
  function PdfContent({ result, aiSections, aiStatus }, ref) {
    const fullWidthSections = AI_SECTIONS.filter((s) => s.layout === 'full');
    const halfWidthSections = AI_SECTIONS.filter((s) => s.layout === 'half');

    const pillars = [
      { pillar: result.fourPillars.year, label: '년주 (年柱)', isDayMaster: false },
      { pillar: result.fourPillars.month, label: '월주 (月柱)', isDayMaster: false },
      { pillar: result.fourPillars.day, label: '일주 (日柱)', isDayMaster: true },
      { pillar: result.fourPillars.hour, label: '시주 (時柱)', isDayMaster: false },
    ];

    // oklch → hex 근사값 (라이트 테마 강제 적용)
    const lightThemeVars: Record<string, string> = {
      '--background': '#faf8fd',
      '--foreground': '#1e1a2b',
      '--card': '#fdfcfe',
      '--card-foreground': '#1e1a2b',
      '--popover': '#fdfcfe',
      '--popover-foreground': '#1e1a2b',
      '--primary': '#4826b0',
      '--primary-foreground': '#f8f6fc',
      '--secondary': '#ece8f3',
      '--secondary-foreground': '#332b4d',
      '--muted': '#f0edf5',
      '--muted-foreground': '#6e6385',
      '--accent': '#f0e6d2',
      '--accent-foreground': '#332b4d',
      '--destructive': '#e53e30',
      '--border': '#e4dfed',
      '--input': '#e4dfed',
      '--ring': '#6b4ecc',
    };

    return (
      <PdfModeProvider value={true}>
      <div
        ref={ref}
        data-pdf-capture
        style={{
          width: 800,
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: -9999,
          pointerEvents: 'none',
          backgroundColor: '#ffffff',
          color: '#1e1a2b',
          padding: '32px',
          opacity: 0,
          overflow: 'hidden',
          // 라이트 테마 CSS 변수 강제 적용 (다크모드 상관없이)
          ...lightThemeVars,
        } as React.CSSProperties}
        className="pdf-capture-root [&_.line-clamp-2]:line-clamp-none"
      >
        {/* ===== 헤더 ===== */}
        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl font-bold">사주팔자 분석 결과</h1>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Badge variant="outline">
              {result.solarBirthDate.year}년 {result.solarBirthDate.month}월 {result.solarBirthDate.day}일
            </Badge>
            <Badge variant="outline">
              {HOUR_LABELS[result.birthInput.hour] ?? `${result.birthInput.hour}시`}
            </Badge>
            <Badge variant="outline">{result.birthInput.gender}성</Badge>
            {result.birthInput.isLunar && (
              <Badge variant="secondary">음력</Badge>
            )}
            {result.solarTimeCorrection?.applied && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                진태양시 보정: {String(result.solarTimeCorrection.originalHour).padStart(2, '0')}:{String(result.solarTimeCorrection.originalMinute).padStart(2, '0')} → {String(result.solarTimeCorrection.correctedHour).padStart(2, '0')}:{String(result.solarTimeCorrection.correctedMinute).padStart(2, '0')}
                {result.solarTimeCorrection.birthPlace && ` (${result.solarTimeCorrection.birthPlace})`}
              </Badge>
            )}
          </div>
        </div>

        {/* ===== 사주팔자 ===== */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {pillars.map((p, i) => (
            <PillarCard key={i} pillar={p.pillar} label={p.label} isDayMaster={p.isDayMaster} />
          ))}
        </div>

        {/* ===== 관계 배지 ===== */}
        {result.relationships.length > 0 && (
          <div className="mb-6 flex flex-wrap justify-center gap-3">
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
        )}

        {/* ===== 섹션 1: 오행 분포 ===== */}
        <div className="mb-6">
          <h2 className="mb-3 font-serif text-lg font-semibold border-b pb-2">1. 오행 분포</h2>
          <ElementBarChart analysis={result.fiveElements} />
        </div>

        {/* ===== 섹션 2: 용신 ===== */}
        <div className="mb-6">
          <h2 className="mb-3 font-serif text-lg font-semibold border-b pb-2">2. 용신 분석</h2>
          <YongsinCard yongsin={result.yongsin} />
        </div>

        {/* ===== 섹션 3: 십신 ===== */}
        <div className="mb-6">
          <h2 className="mb-3 font-serif text-lg font-semibold border-b pb-2">3. 십신 배치도</h2>
          <TenGodsTable fourPillars={result.fourPillars} />
        </div>

        {/* ===== 섹션 4: 성격 ===== */}
        <div className="mb-6">
          <h2 className="mb-3 font-serif text-lg font-semibold border-b pb-2">4. 성격 분석</h2>
          <PersonalitySection personality={result.personality} />
        </div>

        {/* ===== 섹션 5: 운세 ===== */}
        <div className="mb-6">
          <h2 className="mb-3 font-serif text-lg font-semibold border-b pb-2">5. 운세</h2>
          <div className="space-y-4">
            <MajorFortuneTimeline
              fortunes={result.majorFortunes}
              birthYear={result.solarBirthDate.year}
              forPdf
            />
            <div className="grid grid-cols-3 gap-4">
              <YearlyFortuneCard fortune={result.currentYearFortune} />
              <MonthlyFortuneCard fortune={result.currentMonthFortune} />
              <DailyFortuneCard fortune={result.todayFortune} />
            </div>
          </div>
        </div>

        {/* ===== AI 해석 섹션 ===== */}
        {aiSections && (aiStatus === 'done' || aiStatus === 'streaming') && (
          <div className="mb-6">
            <h2 className="mb-3 font-serif text-lg font-semibold border-b pb-2">6. AI 사주 해석</h2>
            <div className="space-y-4">
              {/* Full-width: overall */}
              {fullWidthSections[0] && (
                <AISectionCard
                  sectionKey={fullWidthSections[0].key}
                  state={aiSections[fullWidthSections[0].key]}
                  analysis={result}
                />
              )}

              {/* 2-col grid for half-width sections */}
              <div className="grid grid-cols-2 gap-4">
                {halfWidthSections.map((s) => (
                  <AISectionCard
                    key={s.key}
                    sectionKey={s.key}
                    state={aiSections[s.key]}
                    analysis={result}
                  />
                ))}
              </div>

              {/* Full-width: yearAdvice */}
              {fullWidthSections[1] && (
                <AISectionCard
                  sectionKey={fullWidthSections[1].key}
                  state={aiSections[fullWidthSections[1].key]}
                  analysis={result}
                />
              )}
            </div>
          </div>
        )}
      </div>
      </PdfModeProvider>
    );
  }
);

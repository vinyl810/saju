'use client';

import React from 'react';
import { Sparkles, User, Coins, Briefcase, Heart, Gem, Activity, Calendar, MessageCircle, FlaskConical, GraduationCap, FileCheck, HeartHandshake, ScrollText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/ui/motion';
import { ScoreGauge } from '@/components/fortune/score-gauge';
import type { AISectionKey, AnalysisMode, SectionState } from '@/lib/ai/types';
import { getAiSections } from '@/lib/ai/types';
import { ELEMENT_COLORS } from '@/lib/saju/constants';
import type { SajuAnalysis, FiveElement } from '@/lib/saju/types';
import {
  getSectionDemographics,
  getSectionSummary,
  type SectionDemographics,
  type OverallDemographics,
  type PersonalityDemographics,
  type WealthDemographics,
  type CareerDemographics,
  type LoveDemographics,
  type MarriageDemographics,
  type HealthDemographics,
  type YearAdviceDemographics,
  type MonthlyFortuneDemographics,
  type LabLifeDemographics,
  type ProfessorRelationDemographics,
  type PaperAcceptanceDemographics,
  type RomanceDemographics,
  type InterpersonalDemographics,
  type GraduationDemographics,
  type ResearchPersonalityDemographics,
} from '@/lib/ai/section-demographics';
import { renderRichText } from '@/lib/ai/rich-text';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  User,
  Coins,
  Briefcase,
  Heart,
  Gem,
  Activity,
  Calendar,
  MessageCircle,
  FlaskConical,
  GraduationCap,
  FileCheck,
  HeartHandshake,
  ScrollText,
};

// ===== 데모그래픽 헤더 렌더링 =====

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

function OverallHeader({ data }: { data: OverallDemographics }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {data.pillars.map((p, i) => (
        <Badge
          key={i}
          variant="outline"
          className="font-mono text-xs"
          style={{ borderColor: ELEMENT_COLORS[p.element], color: ELEMENT_COLORS[p.element] }}
        >
          {p.label} {p.hanja}
        </Badge>
      ))}
      <ElementBadgeUI label={data.dayMaster.label} element={data.dayMaster.element} />
      <Badge variant="secondary" className="text-xs">
        {data.strength}
      </Badge>
      <ElementBadgeUI label={data.yongsin.label} element={data.yongsin.element} />
      <ElementBadgeUI label={data.huisin.label} element={data.huisin.element} />
    </div>
  );
}

function PersonalityHeader({ data }: { data: PersonalityDemographics }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {data.strengths.map((s) => (
        <Badge key={s} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 text-xs">
          {s}
        </Badge>
      ))}
      {data.weaknesses.map((w) => (
        <Badge key={w} variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200 text-xs">
          {w}
        </Badge>
      ))}
      {data.tenGods.map((tg, i) => (
        <Badge key={i} variant="secondary" className="text-xs">
          {tg.label} ({tg.hanja})
        </Badge>
      ))}
    </div>
  );
}

function WealthHeader({ data }: { data: WealthDemographics }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {data.keywords.map((kw) => (
        <Badge key={kw} variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200 text-xs">
          {kw}
        </Badge>
      ))}
      {data.tenGods.map((tg, i) => (
        <Badge key={i} variant="secondary" className="text-xs">
          {tg.label} ({tg.hanja})
        </Badge>
      ))}
      <ElementBadgeUI label={data.yongsin.label} element={data.yongsin.element} />
    </div>
  );
}

function CareerHeader({ data }: { data: CareerDemographics }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {data.careers.map((c) => (
        <Badge key={c} variant="outline" className="text-xs">
          {c}
        </Badge>
      ))}
      {data.tenGods.map((tg, i) => (
        <Badge key={i} variant="secondary" className="text-xs">
          {tg.label} ({tg.hanja})
        </Badge>
      ))}
    </div>
  );
}

function LoveHeader({ data }: { data: LoveDemographics }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {data.keywords.map((kw) => (
        <Badge key={kw} variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-200 text-xs">
          {kw}
        </Badge>
      ))}
      {data.relationships.map((r, i) => (
        <Badge
          key={i}
          variant={r.type === 'combine' ? 'default' : 'destructive'}
          className="text-xs"
        >
          {r.name}
        </Badge>
      ))}
    </div>
  );
}

function MarriageHeader({ data }: { data: MarriageDemographics }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {data.spouseStars.map((tg, i) => (
        <Badge key={i} variant="secondary" className="text-xs">
          {tg.label} ({tg.hanja})
        </Badge>
      ))}
      <Badge
        variant="outline"
        className="font-mono text-xs"
        style={{ borderColor: ELEMENT_COLORS[data.spousePalace.element], color: ELEMENT_COLORS[data.spousePalace.element] }}
      >
        배우자궁: {data.spousePalace.label} {data.spousePalace.hanja}
      </Badge>
      <Badge variant={data.hasSpouseStarInPalace ? 'default' : 'secondary'} className="text-xs">
        배우자성 {data.spouseStarCount}개
      </Badge>
      {data.timingWindows.length > 0 && (
        <Badge variant="outline" className="text-xs border-primary text-primary">
          적기: {data.timingWindows[0].replace(/\[.*?\]\s*/, '')}
        </Badge>
      )}
    </div>
  );
}

function HealthHeader({ data }: { data: HealthDemographics }) {
  return (
    <div className="space-y-1.5">
      {data.bars.map((bar) => (
        <div key={bar.element} className="flex items-center gap-2">
          <span
            className="w-14 text-xs font-medium text-right"
            style={{ color: ELEMENT_COLORS[bar.element] }}
          >
            {bar.element}({bar.hanja})
          </span>
          <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${bar.percentage}%`,
                backgroundColor: ELEMENT_COLORS[bar.element],
              }}
            />
          </div>
          <span className="w-8 text-xs text-muted-foreground text-right">
            {bar.percentage}%
          </span>
        </div>
      ))}
      {data.missing.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 mt-2 pt-2 border-t border-dashed border-muted">
          <span className="text-[11px] text-muted-foreground/70">부족한 기운</span>
          {data.missing.map((el) => (
            <span
              key={el}
              className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                color: ELEMENT_COLORS[el],
                backgroundColor: `${ELEMENT_COLORS[el]}12`,
              }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ELEMENT_COLORS[el] }} />
              {el}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function YearAdviceHeader({ data }: { data: YearAdviceDemographics }) {
  return (
    <div className="flex items-center gap-3">
      <ScoreGauge score={data.score} size={60} strokeWidth={5} label="점" />
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge
          variant="outline"
          className="font-mono text-xs"
          style={{ borderColor: ELEMENT_COLORS[data.ganJi.element], color: ELEMENT_COLORS[data.ganJi.element] }}
        >
          {data.ganJi.label} {data.ganJi.hanja}
        </Badge>
        {data.tenGods.map((tg, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {tg.label} ({tg.hanja})
          </Badge>
        ))}
      </div>
    </div>
  );
}

function LabLifeHeader({ data }: { data: LabLifeDemographics }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {data.keywords.map((kw) => (
        <Badge key={kw} variant="secondary" className="bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-200 text-xs">
          {kw}
        </Badge>
      ))}
      {data.tenGods.map((tg, i) => (
        <Badge key={i} variant="secondary" className="text-xs">
          {tg.label} ({tg.hanja})
        </Badge>
      ))}
    </div>
  );
}

function ProfessorRelationHeader({ data }: { data: ProfessorRelationDemographics }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {data.keywords.map((kw) => (
        <Badge key={kw} variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200 text-xs">
          {kw}
        </Badge>
      ))}
      {data.tenGods.map((tg, i) => (
        <Badge key={i} variant="secondary" className="text-xs">
          {tg.label} ({tg.hanja})
        </Badge>
      ))}
    </div>
  );
}

function PaperAcceptanceHeader({ data }: { data: PaperAcceptanceDemographics }) {
  return (
    <div className="flex items-center gap-3">
      <ScoreGauge score={data.yearScore} size={60} strokeWidth={5} label="점" />
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge
          variant="outline"
          className="font-mono text-xs"
          style={{ borderColor: ELEMENT_COLORS[data.yearGanJi.element], color: ELEMENT_COLORS[data.yearGanJi.element] }}
        >
          {data.yearGanJi.label} {data.yearGanJi.hanja}
        </Badge>
        {data.tenGods.map((tg, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {tg.label} ({tg.hanja})
          </Badge>
        ))}
      </div>
    </div>
  );
}

function InterpersonalHeader({ data }: { data: InterpersonalDemographics }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {data.keywords.map((kw) => (
        <Badge key={kw} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 text-xs">
          {kw}
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

function ResearchPersonalityHeader({ data }: { data: ResearchPersonalityDemographics }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {data.keywords.map((kw) => (
        <Badge key={kw} variant="secondary" className="bg-cyan-100 text-cyan-800 dark:bg-cyan-800 dark:text-cyan-200 text-xs">
          {kw}
        </Badge>
      ))}
      {data.tenGods.map((tg, i) => (
        <Badge key={i} variant="secondary" className="text-xs">
          {tg.label} ({tg.hanja})
        </Badge>
      ))}
    </div>
  );
}

function GraduationHeader({ data }: { data: GraduationDemographics }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {data.keywords.map((kw) => (
        <Badge key={kw} variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200 text-xs">
          {kw}
        </Badge>
      ))}
      {data.tenGods.map((tg, i) => (
        <Badge key={i} variant="secondary" className="text-xs">
          {tg.label} ({tg.hanja})
        </Badge>
      ))}
    </div>
  );
}

function RomanceHeader({ data }: { data: RomanceDemographics }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {data.keywords.map((kw) => (
        <Badge key={kw} variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-200 text-xs">
          {kw}
        </Badge>
      ))}
      {data.spouseStars.map((tg, i) => (
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

function MonthlyFortuneHeader({ data }: { data: MonthlyFortuneDemographics }) {
  const maxScore = Math.max(...data.months.map((m) => m.score), 1);
  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-12 sm:gap-1.5">
      {data.months.map((m) => {
        const ratio = m.score / maxScore;
        const height = Math.round(ratio * 72);
        const barColor =
          m.score >= 70
            ? 'from-green-400 to-green-600'
            : m.score >= 50
              ? 'from-yellow-400 to-yellow-500'
              : 'from-red-400 to-red-500';
        return (
          <div key={m.month} className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold tabular-nums text-foreground">{m.score}</span>
            <div className="w-full flex items-end justify-center" style={{ height: '72px' }}>
              <div
                className={`w-full rounded-t-md bg-gradient-to-t ${barColor}`}
                style={{ height: `${Math.max(height, 6)}px` }}
              />
            </div>
            <span className="text-xs font-semibold text-foreground">{m.month}월</span>
            <span
              className="rounded-sm px-1 py-px text-[11px] font-mono font-semibold leading-tight"
              style={{
                color: ELEMENT_COLORS[m.ganJi.element],
                backgroundColor: `${ELEMENT_COLORS[m.ganJi.element]}15`,
              }}
            >
              {m.ganJi.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DemographicHeader({ demographics }: { demographics: SectionDemographics }) {
  switch (demographics.kind) {
    case 'overall':
      return <OverallHeader data={demographics} />;
    case 'personality':
      return <PersonalityHeader data={demographics} />;
    case 'wealth':
      return <WealthHeader data={demographics} />;
    case 'career':
      return <CareerHeader data={demographics} />;
    case 'love':
      return <LoveHeader data={demographics} />;
    case 'marriage':
      return <MarriageHeader data={demographics} />;
    case 'health':
      return <HealthHeader data={demographics} />;
    case 'yearAdvice':
      return <YearAdviceHeader data={demographics} />;
    case 'monthlyFortune':
      return <MonthlyFortuneHeader data={demographics} />;
    case 'labLife':
      return <LabLifeHeader data={demographics} />;
    case 'professorRelation':
      return <ProfessorRelationHeader data={demographics} />;
    case 'paperAcceptance':
      return <PaperAcceptanceHeader data={demographics} />;
    case 'romance':
      return <RomanceHeader data={demographics} />;
    case 'interpersonal':
      return <InterpersonalHeader data={demographics} />;
    case 'graduation':
      return <GraduationHeader data={demographics} />;
    case 'researchPersonality':
      return <ResearchPersonalityHeader data={demographics} />;
    default:
      return null;
  }
}

// ===== 메인 컴포넌트 =====

interface AISectionCardProps {
  sectionKey: AISectionKey;
  state: SectionState;
  analysis?: SajuAnalysis;
  mode?: AnalysisMode;
}

const NO_SUMMARY_SECTIONS = new Set(['todayMessage', 'monthlyFortune']);

function parseSummaryAndBody(raw: string, sectionKey: string): { aiSummary: string | null; body: string } {
  if (NO_SUMMARY_SECTIONS.has(sectionKey)) return { aiSummary: null, body: raw };
  const idx = raw.indexOf('\n\n');
  if (idx === -1) return { aiSummary: null, body: raw };
  const firstLine = raw.slice(0, idx).trim();
  // 한마디는 짧아야 함 (100자 이하), 길면 본문의 첫 문단일 가능성
  if (firstLine.length > 100) return { aiSummary: null, body: raw };
  return { aiSummary: firstLine, body: raw.slice(idx + 2) };
}

export function AISectionCard({ sectionKey, state, analysis, mode = 'general' }: AISectionCardProps) {
  const sections = getAiSections(mode);
  const section = sections.find((s) => s.key === sectionKey);
  if (!section || !state || state.status === 'idle') return null;

  const Icon = ICON_MAP[section.icon];
  const demographics = analysis ? getSectionDemographics(sectionKey, analysis, mode) : null;
  const fallbackSummary = demographics ? getSectionSummary(demographics) : null;

  // AI가 섹션 라벨을 반복 출력하는 경우 제거 (e.g. "2026년 올해의 조언:", "종합운:" 등)
  const label = section.label.replace(/\s*\(.*\)$/, ''); // "종합 분석", "연구 성향" 등
  const labelPattern = `^\\s*(?:\\d{4}년\\s*)?${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:：]\\s*`;
  const cleaned = state.content.replace(new RegExp(labelPattern), '');

  const { aiSummary, body } = parseSummaryAndBody(cleaned, sectionKey);
  // AI 한마디가 파싱되면 사용, 아직 스트리밍 중이면 fallback
  const summary = aiSummary ?? fallbackSummary;
  const content = aiSummary ? body : cleaned;

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
          {demographics && (
            <div className="mt-2">
              <DemographicHeader demographics={demographics} />
            </div>
          )}
        </CardHeader>
        {summary && (
          <div className="relative mx-6 mb-1 rounded-md bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 px-8 py-3 text-center">
            <span className="absolute left-3 top-1.5 font-serif text-2xl leading-none text-primary/20 select-none" aria-hidden="true">&ldquo;</span>
            <p className="font-serif text-base leading-relaxed text-foreground/70">{summary}</p>
            <span className="absolute right-3 bottom-1.5 font-serif text-2xl leading-none text-primary/20 select-none" aria-hidden="true">&rdquo;</span>
          </div>
        )}
        <CardContent>
          <div className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-muted-foreground">
            {renderRichText(content, sectionKey === 'monthlyFortune' ? { monthlyFortune: true } : undefined)}
            {state.status === 'streaming' && (
              <span className="inline-block w-0.5 h-4 ml-0.5 align-text-bottom animate-pulse bg-primary" />
            )}
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

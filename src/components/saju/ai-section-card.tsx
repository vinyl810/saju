'use client';

import React from 'react';
import { Sparkles, User, Coins, Briefcase, Heart, Gem, Activity, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/ui/motion';
import { ScoreGauge } from '@/components/fortune/score-gauge';
import type { AISectionKey, SectionState } from '@/lib/ai/types';
import { AI_SECTIONS } from '@/lib/ai/types';
import { ELEMENT_COLORS } from '@/lib/saju/constants';
import type { SajuAnalysis, FiveElement } from '@/lib/saju/types';
import {
  getSectionDemographics,
  type SectionDemographics,
  type OverallDemographics,
  type PersonalityDemographics,
  type WealthDemographics,
  type CareerDemographics,
  type LoveDemographics,
  type MarriageDemographics,
  type HealthDemographics,
  type YearAdviceDemographics,
} from '@/lib/ai/section-demographics';
import { SAJU_TERMS } from '@/lib/saju/terminology';
import { TermTooltip } from '@/components/ui/term-tooltip';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  User,
  Coins,
  Briefcase,
  Heart,
  Gem,
  Activity,
  Calendar,
};

// ===== 리치 텍스트 렌더링 =====

// 오행 이름 색상 매핑
const KEYWORD_ELEMENT_MAP: Record<string, FiveElement> = {
  '목(木)': '목', '화(火)': '화', '토(土)': '토', '금(金)': '금', '수(水)': '수',
  '木(목)': '목', '火(화)': '화', '土(토)': '토', '金(금)': '금', '水(수)': '수',
};

// 천간/지지 개별 글자 → 오행 색상 매핑 (한글(한자) 형태)
const GANJI_ELEMENT_MAP: Record<string, FiveElement> = {
  // 10천간
  '갑(甲)': '목', '을(乙)': '목', '병(丙)': '화', '정(丁)': '화', '무(戊)': '토',
  '기(己)': '토', '경(庚)': '금', '신(辛)': '금', '임(壬)': '수', '계(癸)': '수',
  // 12지지
  '자(子)': '수', '축(丑)': '토', '인(寅)': '목', '묘(卯)': '목', '진(辰)': '토', '사(巳)': '화',
  '오(午)': '화', '미(未)': '토', '신(申)': '금', '유(酉)': '금', '술(戌)': '토', '해(亥)': '수',
};

// 1단계: {{term}} 마크업을 파싱하여 TermTooltip 노드로 변환
const TERM_RE = /\{\{(.+?)\}\}/g;

function parseTermMarkup(text: string, baseKey: number): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  TERM_RE.lastIndex = 0;

  while ((match = TERM_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const termKey = match[1];
    if (SAJU_TERMS[termKey]) {
      nodes.push(
        <TermTooltip key={baseKey + match.index} termKey={termKey}>
          <span className="underline decoration-dotted decoration-primary/40 underline-offset-2">{termKey}</span>
        </TermTooltip>,
      );
    } else {
      nodes.push(termKey);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

// 2단계: **bold**, 오행 키워드, 천간/지지 글자를 파싱 (내부 텍스트는 1단계로 재귀)
// Group 1+2: **bold**, Group 3: 오행 이름, Group 4: 천간/지지 개별 글자
const GANJI_CHARS = Object.keys(GANJI_ELEMENT_MAP).map((k) => k.replace(/[()]/g, '\\$&')).join('|');
const OUTER_RE = new RegExp(
  `(\\*\\*(.+?)\\*\\*)|(목\\(木\\)|화\\(火\\)|토\\(土\\)|금\\(金\\)|수\\(水\\)|木\\(목\\)|火\\(화\\)|土\\(토\\)|金\\(금\\)|水\\(수\\))|(${GANJI_CHARS})`,
  'g',
);

function renderRichText(content: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  OUTER_RE.lastIndex = 0;

  while ((match = OUTER_RE.exec(content)) !== null) {
    // Plain text before match — parse {{term}} in it
    if (match.index > lastIndex) {
      nodes.push(...parseTermMarkup(content.slice(lastIndex, match.index), lastIndex));
    }

    if (match[1]) {
      // Bold: **text** — parse {{term}} inside bold too
      nodes.push(
        <strong key={match.index} className="text-foreground font-semibold">
          {parseTermMarkup(match[2], match.index)}
        </strong>,
      );
    } else if (match[3]) {
      // Element keyword (목(木) etc.)
      const el = KEYWORD_ELEMENT_MAP[match[3]];
      nodes.push(
        <span key={match.index} style={{ color: el ? ELEMENT_COLORS[el] : undefined, fontWeight: 600 }}>
          {match[3]}
        </span>,
      );
    } else if (match[4]) {
      // 천간/지지 개별 글자 (계(癸), 임(壬), 신(申) etc.) — 오행 색상
      const el = GANJI_ELEMENT_MAP[match[4]];
      nodes.push(
        <span key={match.index} style={{ color: el ? ELEMENT_COLORS[el] : undefined, fontWeight: 500 }}>
          {match[4]}
        </span>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text — parse {{term}} in it
  if (lastIndex < content.length) {
    nodes.push(...parseTermMarkup(content.slice(lastIndex), lastIndex));
  }

  return nodes;
}

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
    </div>
  );
}

function WealthHeader({ data }: { data: WealthDemographics }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
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
  if (data.relationships.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
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
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">부족:</span>
          {data.missing.map((el) => (
            <Badge key={el} variant="outline" className="text-xs px-1.5 py-0" style={{ borderColor: ELEMENT_COLORS[el], color: ELEMENT_COLORS[el] }}>
              {el}
            </Badge>
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
    default:
      return null;
  }
}

// ===== 메인 컴포넌트 =====

interface AISectionCardProps {
  sectionKey: AISectionKey;
  state: SectionState;
  analysis?: SajuAnalysis;
}

export function AISectionCard({ sectionKey, state, analysis }: AISectionCardProps) {
  const section = AI_SECTIONS.find((s) => s.key === sectionKey);
  if (!section || state.status === 'idle') return null;

  const Icon = ICON_MAP[section.icon];
  const demographics = analysis ? getSectionDemographics(sectionKey, analysis) : null;

  return (
    <FadeIn className={section.layout === 'full' ? 'col-span-full' : ''}>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
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
        <CardContent>
          <div className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-muted-foreground">
            {renderRichText(state.content)}
            {state.status === 'streaming' && (
              <span className="inline-block w-0.5 h-4 ml-0.5 align-text-bottom animate-pulse bg-primary" />
            )}
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

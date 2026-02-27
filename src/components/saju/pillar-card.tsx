'use client';

import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import type { Pillar } from '@/lib/saju/types';
import { CHEONGAN_HANJA, JIJI_HANJA, ELEMENT_HANJA, TEN_GOD_HANJA, JIJI_ANIMAL } from '@/lib/saju/constants';
import { TermTooltip } from '@/components/ui/term-tooltip';

const ELEMENT_BG: Record<string, string> = {
  '목': 'bg-green-100 dark:bg-green-900/30',
  '화': 'bg-red-100 dark:bg-red-900/30',
  '토': 'bg-yellow-100 dark:bg-yellow-900/30',
  '금': 'bg-gray-100 dark:bg-gray-800/30',
  '수': 'bg-blue-100 dark:bg-blue-900/30',
};

const ELEMENT_TEXT: Record<string, string> = {
  '목': 'text-green-700 dark:text-green-400',
  '화': 'text-red-700 dark:text-red-400',
  '토': 'text-yellow-700 dark:text-yellow-400',
  '금': 'text-gray-700 dark:text-gray-400',
  '수': 'text-blue-700 dark:text-blue-400',
};

const ELEMENT_BORDER: Record<string, string> = {
  '목': 'border-green-300 dark:border-green-700',
  '화': 'border-red-300 dark:border-red-700',
  '토': 'border-yellow-300 dark:border-yellow-700',
  '금': 'border-gray-300 dark:border-gray-600',
  '수': 'border-blue-300 dark:border-blue-700',
};

const ELEMENT_GLOW: Record<string, string> = {
  '목': 'shadow-green-300/50 dark:shadow-green-500/20',
  '화': 'shadow-red-300/50 dark:shadow-red-500/20',
  '토': 'shadow-yellow-300/50 dark:shadow-yellow-500/20',
  '금': 'shadow-gray-300/50 dark:shadow-gray-500/20',
  '수': 'shadow-blue-300/50 dark:shadow-blue-500/20',
};

interface PillarCardProps {
  pillar: Pillar;
  label: ReactNode;
  isDayMaster?: boolean;
}

export function PillarCard({ pillar, label, isDayMaster = false }: PillarCardProps) {
  const { ganJi, cheonganElement, jijiElement, cheonganTenGod, jijiTenGod, cheonganYinYang } = pillar;

  return (
    <Card className={`overflow-hidden text-center transition-shadow hover:shadow-lg ${
      isDayMaster
        ? `ring-2 ring-primary shadow-lg ${ELEMENT_GLOW[cheonganElement]}`
        : 'hover:shadow-md'
    }`}>
      {/* Label */}
      <div className={`px-2 py-1.5 text-xs font-medium ${
        isDayMaster
          ? 'bg-primary/10 text-primary'
          : 'bg-muted text-muted-foreground'
      }`}>
        {label}
      </div>

      {/* Cheongan ten god */}
      <div className="px-2 py-1 text-xs text-muted-foreground">
        {cheonganTenGod ? (
          <><span className="text-[10px] opacity-60">나와의 관계</span>{' '}<TermTooltip termKey={cheonganTenGod}>{cheonganTenGod} {TEN_GOD_HANJA[cheonganTenGod]}</TermTooltip></>
        ) : (
          <TermTooltip termKey="일간">일간 (나 자신)</TermTooltip>
        )}
      </div>

      {/* Cheongan */}
      <div className={`mx-2 rounded-lg border-2 p-2.5 sm:p-3 ${ELEMENT_BG[cheonganElement]} ${ELEMENT_BORDER[cheonganElement]}`}>
        <div className="mb-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
          <TermTooltip termKey="천간" iconSize={9}>천간</TermTooltip> · 하늘
        </div>
        <div className={`font-serif text-xl font-bold sm:text-2xl ${ELEMENT_TEXT[cheonganElement]}`}>
          {ganJi.cheongan}
        </div>
        <div className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
          {CHEONGAN_HANJA[ganJi.cheongan]} · {cheonganElement}{ELEMENT_HANJA[cheonganElement]} · {cheonganYinYang}
        </div>
      </div>

      {/* Jiji */}
      <div className={`mx-2 mt-1.5 mb-1.5 rounded-lg border-2 p-2.5 sm:p-3 ${ELEMENT_BG[jijiElement]} ${ELEMENT_BORDER[jijiElement]}`}>
        <div className="mb-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
          <TermTooltip termKey="지지" iconSize={9}>지지</TermTooltip> · 땅
        </div>
        <div className={`font-serif text-xl font-bold sm:text-2xl ${ELEMENT_TEXT[jijiElement]}`}>
          {ganJi.jiji}
        </div>
        <div className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
          {JIJI_HANJA[ganJi.jiji]} · {jijiElement}{ELEMENT_HANJA[jijiElement]} · {JIJI_ANIMAL[ganJi.jiji]}
        </div>
      </div>

      {/* Jiji ten god */}
      <div className="px-2 pb-2 text-xs text-muted-foreground">
        {jijiTenGod && (
          <><span className="text-[10px] opacity-60">나와의 관계</span>{' '}<TermTooltip termKey={jijiTenGod}>{jijiTenGod} {TEN_GOD_HANJA[jijiTenGod]}</TermTooltip></>
        )}
      </div>
    </Card>
  );
}

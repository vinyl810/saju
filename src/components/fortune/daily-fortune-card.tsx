'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScoreGauge } from './score-gauge';
import type { DailyFortune } from '@/lib/saju/types';
import { CHEONGAN_HANJA, JIJI_HANJA, ELEMENT_HANJA } from '@/lib/saju/constants';
import { TermTooltip } from '@/components/ui/term-tooltip';

interface DailyFortuneCardProps {
  fortune: DailyFortune;
}

export function DailyFortuneCard({ fortune }: DailyFortuneCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className="bg-muted/30 cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => setExpanded(!expanded)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-serif text-lg text-foreground">{fortune.date}</span>
          <TermTooltip termKey="일운">일운 (日運)</TermTooltip>
          <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <ScoreGauge score={fortune.score} size={64} strokeWidth={5} label="점" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-lg font-bold">
                {fortune.ganJi.cheongan}{fortune.ganJi.jiji}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {CHEONGAN_HANJA[fortune.ganJi.cheongan]}{JIJI_HANJA[fortune.ganJi.jiji]}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px]"><TermTooltip termKey={fortune.cheonganTenGod}>{fortune.cheonganTenGod}</TermTooltip></Badge>
              <Badge variant="secondary" className="text-[10px]"><TermTooltip termKey={fortune.jijiTenGod}>{fortune.jijiTenGod}</TermTooltip></Badge>
              <Badge variant="outline" className="text-[10px]">
                {fortune.cheonganElement}{ELEMENT_HANJA[fortune.cheonganElement]}/{fortune.jijiElement}{ELEMENT_HANJA[fortune.jijiElement]}
              </Badge>
            </div>
            <p className={`mt-1.5 text-xs text-muted-foreground ${expanded ? '' : 'line-clamp-2'}`}>{fortune.interpretation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

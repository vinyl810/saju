'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MajorFortune } from '@/lib/saju/types';
import { CHEONGAN_HANJA, JIJI_HANJA, ELEMENT_HANJA } from '@/lib/saju/constants';
import { TermTooltip } from '@/components/ui/term-tooltip';

function getScoreColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-gradient-to-t from-green-500 to-green-400';
  if (score >= 50) return 'bg-gradient-to-t from-yellow-500 to-yellow-400';
  return 'bg-gradient-to-t from-red-500 to-red-400';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return '대길';
  if (score >= 65) return '길';
  if (score >= 50) return '평';
  if (score >= 35) return '흉';
  return '대흉';
}

interface MajorFortuneTimelineProps {
  fortunes: MajorFortune[];
  birthYear: number;
  forPdf?: boolean;
}

export function MajorFortuneTimeline({ fortunes, birthYear, forPdf }: MajorFortuneTimelineProps) {
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-base"><TermTooltip termKey="대운">대운 (大運) 타임라인</TermTooltip></CardTitle>
      </CardHeader>
      <CardContent>
        <div className={forPdf ? 'flex flex-wrap gap-2' : 'overflow-x-auto pb-2'}>
          <div className={forPdf ? 'flex flex-wrap gap-2' : 'flex gap-2'} style={forPdf ? undefined : { minWidth: 'max-content' }}>
            {fortunes.map((fortune, idx) => {
              const isCurrent = currentAge >= fortune.startAge && currentAge <= fortune.endAge;

              return (
                <div
                  key={idx}
                  className={`group flex-shrink-0 rounded-xl border p-3 text-center transition-all ${
                    isCurrent
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 ring-2 ring-primary/50'
                      : 'hover:bg-muted/50 hover:shadow-sm'
                  }`}
                  style={{ width: '116px' }}
                >
                  {isCurrent && (
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
                      현재
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {fortune.startAge}~{fortune.endAge}세
                  </div>
                  <div className="mt-1 font-serif text-lg font-bold">
                    {fortune.ganJi.cheongan}{fortune.ganJi.jiji}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {CHEONGAN_HANJA[fortune.ganJi.cheongan]}{JIJI_HANJA[fortune.ganJi.jiji]}
                  </div>

                  {/* Score bar */}
                  <div className="mx-auto mt-2 h-12 w-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`w-full rounded-full transition-all duration-500 ${getScoreBarColor(fortune.score)}`}
                      style={{ height: `${fortune.score}%`, marginTop: `${100 - fortune.score}%` }}
                    />
                  </div>

                  <div className="mt-1 flex items-center justify-center gap-0.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${getScoreColor(fortune.score)}`} />
                    <span className="text-xs font-medium">{getScoreLabel(fortune.score)}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    <TermTooltip termKey={fortune.cheonganTenGod} iconSize={10}>{fortune.cheonganTenGod}</TermTooltip>/<TermTooltip termKey={fortune.jijiTenGod} iconSize={10}>{fortune.jijiTenGod}</TermTooltip>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

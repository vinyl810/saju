'use client';

import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FiveElementAnalysis } from '@/lib/saju/types';
import { ELEMENT_HANJA, ELEMENT_COLORS } from '@/lib/saju/constants';
import type { FiveElement } from '@/lib/saju/types';
import { TermTooltip } from '@/components/ui/term-tooltip';

interface ElementChartProps {
  analysis: FiveElementAnalysis;
  title?: string;
}

export function ElementChart({ analysis, title = '오행 분포' }: ElementChartProps) {
  const elements: FiveElement[] = ['목', '화', '토', '금', '수'];

  const data = elements.map((el) => ({
    name: `${el} ${ELEMENT_HANJA[el]}`,
    value: analysis.counts[el],
    percentage: analysis.percentages[el],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-base"><TermTooltip termKey="오행">{title}</TermTooltip></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" className="text-xs" />
              <PolarRadiusAxis angle={90} domain={[0, 'auto']} />
              <Radar
                name="오행"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.3}
              />
              <Tooltip
                formatter={(value) => [`${value}점`]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 오행 바 차트 */}
        <div className="mt-4 space-y-2">
          {elements.map((el) => (
            <div key={el} className="flex items-center gap-2">
              <span className="w-12 text-sm font-medium">
                {el} {ELEMENT_HANJA[el]}
              </span>
              <div className="flex-1 rounded-full bg-muted h-4 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
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
              <strong><TermTooltip termKey="결여오행">결여 오행</TermTooltip>:</strong> {analysis.missing.map(e => `${e} ${ELEMENT_HANJA[e]}`).join(', ')}
            </p>
          )}
          <p className="mt-1">
            <strong><TermTooltip termKey="일간강약">일간 강약</TermTooltip>:</strong>{' '}
            {analysis.dayMasterStrength === 'strong' ? <TermTooltip termKey="신강">신강 (身強)</TermTooltip> :
             analysis.dayMasterStrength === 'weak' ? <TermTooltip termKey="신약">신약 (身弱)</TermTooltip> : <TermTooltip termKey="중화">중화 (中和)</TermTooltip>}
            {' '}({analysis.strengthScore}점)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

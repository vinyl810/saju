'use client';

import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FiveElementAnalysis, FiveElement } from '@/lib/saju/types';
import { ELEMENT_HANJA } from '@/lib/saju/constants';
import { TermTooltip } from '@/components/ui/term-tooltip';

interface ElementComparisonProps {
  analysis1: FiveElementAnalysis;
  analysis2: FiveElementAnalysis;
  label1?: string;
  label2?: string;
}

export function ElementComparison({
  analysis1,
  analysis2,
  label1 = '첫 번째',
  label2 = '두 번째',
}: ElementComparisonProps) {
  const elements: FiveElement[] = ['목', '화', '토', '금', '수'];

  const data = elements.map((el) => ({
    name: `${el} ${ELEMENT_HANJA[el]}`,
    person1: analysis1.counts[el],
    person2: analysis2.counts[el],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-base"><TermTooltip termKey="오행비교">오행 비교</TermTooltip></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" className="text-xs" />
              <PolarRadiusAxis angle={90} domain={[0, 'auto']} />
              <Radar
                name={label1}
                dataKey="person1"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.2}
              />
              <Radar
                name={label2}
                dataKey="person2"
                stroke="#ec4899"
                fill="#ec4899"
                fillOpacity={0.2}
              />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { YongsinAnalysis, FiveElement } from '@/lib/saju/types';
import { ELEMENT_HANJA } from '@/lib/saju/constants';
import { TermTooltip } from '@/components/ui/term-tooltip';

const ELEMENT_BADGE: Record<FiveElement, string> = {
  '목': 'bg-green-500 text-white',
  '화': 'bg-red-500 text-white',
  '토': 'bg-yellow-500 text-black',
  '금': 'bg-gray-400 text-black',
  '수': 'bg-blue-500 text-white',
};

interface YongsinCardProps {
  yongsin: YongsinAnalysis;
}

export function YongsinCard({ yongsin }: YongsinCardProps) {
  const strengthLabel = yongsin.dayMasterStrength === 'strong' ? '신강 (身強)' :
    yongsin.dayMasterStrength === 'weak' ? '신약 (身弱)' : '중화 (中和)';

  const methodKey = yongsin.method === 'suppression' ? '억부법' : '조후법';
  const methodLabel = yongsin.method === 'suppression' ? '억부법 (抑扶法)' : '조후법 (調候法)';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-base"><TermTooltip termKey="용신">용신 분석 (用神)</TermTooltip></CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 일간 강약 */}
        <div className="rounded-lg bg-muted p-3">
          <div className="text-sm text-muted-foreground"><TermTooltip termKey="일간강약">일간 강약</TermTooltip></div>
          <div className="mt-1 text-lg font-bold">{strengthLabel}</div>
          <div className="text-xs text-muted-foreground">판단법: <TermTooltip termKey={methodKey}>{methodLabel}</TermTooltip></div>
        </div>

        {/* 용신/희신/기신 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: '용신 (用神)', termKey: '용신', element: yongsin.yongsin, desc: '가장 필요한 오행' },
            { label: '희신 (喜神)', termKey: '희신', element: yongsin.huisin, desc: '용신을 돕는 오행' },
            { label: '기신 (忌神)', termKey: '기신', element: yongsin.gisin, desc: '해로운 오행' },
            { label: '구신 (仇神)', termKey: '구신', element: yongsin.gusin, desc: '기신을 돕는 오행' },
            { label: '한신 (閑神)', termKey: '한신', element: yongsin.hansin, desc: '중립 오행' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border p-3 text-center">
              <div className="text-xs text-muted-foreground"><TermTooltip termKey={item.termKey}>{item.label}</TermTooltip></div>
              <Badge className={`mt-2 text-sm ${ELEMENT_BADGE[item.element]}`}>
                {item.element} {ELEMENT_HANJA[item.element]}
              </Badge>
              <div className="mt-1 text-xs text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* 판단 근거 */}
        <div className="rounded-lg border p-3">
          <div className="mb-2 text-sm font-medium">판단 근거</div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {yongsin.reasoning.map((reason, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">-</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

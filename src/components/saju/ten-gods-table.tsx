'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FourPillars, TenGod } from '@/lib/saju/types';
import { TEN_GOD_HANJA, CHEONGAN_HANJA, JIJI_HANJA } from '@/lib/saju/constants';
import { TermTooltip } from '@/components/ui/term-tooltip';

const TEN_GOD_COLORS: Record<TenGod, string> = {
  '비견': 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  '겁재': 'bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
  '식신': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  '상관': 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
  '편재': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  '정재': 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
  '편관': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  '정관': 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
  '편인': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  '정인': 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200',
};

interface TenGodsTableProps {
  fourPillars: FourPillars;
}

export function TenGodsTable({ fourPillars }: TenGodsTableProps) {
  const pillars = [
    { key: 'year', label: '년주', pillar: fourPillars.year },
    { key: 'month', label: '월주', pillar: fourPillars.month },
    { key: 'day', label: '일주', pillar: fourPillars.day },
    { key: 'hour', label: '시주', pillar: fourPillars.hour },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-base"><TermTooltip termKey="십신">십신 배치도 (十神)</TermTooltip></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-muted-foreground">위치</th>
                {pillars.map((p) => (
                  <th key={p.key} className="py-2 font-medium">
                    {p.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* 천간 십신 */}
              <tr className="border-b">
                <td className="py-2 text-muted-foreground"><TermTooltip termKey="천간십신">천간 십신</TermTooltip></td>
                {pillars.map((p) => (
                  <td key={p.key} className="py-2">
                    {p.pillar.cheonganTenGod ? (
                      <Badge variant="secondary" className={TEN_GOD_COLORS[p.pillar.cheonganTenGod]}>
                        <TermTooltip termKey={p.pillar.cheonganTenGod}>{p.pillar.cheonganTenGod}</TermTooltip>
                      </Badge>
                    ) : (
                      <Badge variant="outline"><TermTooltip termKey="일간">일간</TermTooltip></Badge>
                    )}
                  </td>
                ))}
              </tr>
              {/* 천간 */}
              <tr className="border-b bg-muted/50">
                <td className="py-3 text-muted-foreground"><TermTooltip termKey="천간">천간</TermTooltip></td>
                {pillars.map((p) => (
                  <td key={p.key} className="py-3 text-lg font-bold">
                    {p.pillar.ganJi.cheongan}
                    <span className="ml-1 text-xs text-muted-foreground">
                      {CHEONGAN_HANJA[p.pillar.ganJi.cheongan]}
                    </span>
                  </td>
                ))}
              </tr>
              {/* 지지 */}
              <tr className="border-b bg-muted/50">
                <td className="py-3 text-muted-foreground"><TermTooltip termKey="지지">지지</TermTooltip></td>
                {pillars.map((p) => (
                  <td key={p.key} className="py-3 text-lg font-bold">
                    {p.pillar.ganJi.jiji}
                    <span className="ml-1 text-xs text-muted-foreground">
                      {JIJI_HANJA[p.pillar.ganJi.jiji]}
                    </span>
                  </td>
                ))}
              </tr>
              {/* 지지 십신 */}
              <tr className="border-b">
                <td className="py-2 text-muted-foreground"><TermTooltip termKey="지지십신">지지 십신</TermTooltip></td>
                {pillars.map((p) => (
                  <td key={p.key} className="py-2">
                    {p.pillar.jijiTenGod && (
                      <Badge variant="secondary" className={TEN_GOD_COLORS[p.pillar.jijiTenGod]}>
                        <TermTooltip termKey={p.pillar.jijiTenGod}>{p.pillar.jijiTenGod}</TermTooltip>
                      </Badge>
                    )}
                  </td>
                ))}
              </tr>
              {/* 지장간 */}
              <tr>
                <td className="py-2 text-muted-foreground"><TermTooltip termKey="지장간">지장간</TermTooltip></td>
                {pillars.map((p) => (
                  <td key={p.key} className="py-2 text-xs text-muted-foreground">
                    <div>{p.pillar.hiddenStems.main} (<TermTooltip termKey="정기">정기</TermTooltip>)</div>
                    {p.pillar.hiddenStems.middle && <div>{p.pillar.hiddenStems.middle} (<TermTooltip termKey="중기">중기</TermTooltip>)</div>}
                    {p.pillar.hiddenStems.residual && <div>{p.pillar.hiddenStems.residual} (<TermTooltip termKey="여기">여기</TermTooltip>)</div>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

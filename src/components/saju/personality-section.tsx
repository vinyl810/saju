'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PersonalityProfile } from '@/lib/saju/types';

interface PersonalitySectionProps {
  personality: PersonalityProfile;
}

export function PersonalitySection({ personality }: PersonalitySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-base">{personality.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{personality.summary}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* 강점 */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
            <div className="mb-2 text-sm font-medium text-green-700 dark:text-green-400">
              강점
            </div>
            <div className="flex flex-wrap gap-1">
              {personality.strengths.map((s) => (
                <Badge key={s} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          {/* 약점 */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <div className="mb-2 text-sm font-medium text-red-700 dark:text-red-400">
              약점
            </div>
            <div className="flex flex-wrap gap-1">
              {personality.weaknesses.map((w) => (
                <Badge key={w} variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200">
                  {w}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* 적성 직업 */}
        <div className="rounded-lg border p-3">
          <div className="mb-2 text-sm font-medium">적성 직업</div>
          <div className="flex flex-wrap gap-1">
            {personality.career.map((c) => (
              <Badge key={c} variant="outline">
                {c}
              </Badge>
            ))}
          </div>
        </div>

        {/* 대인관계 */}
        <div className="rounded-lg bg-muted p-3">
          <div className="mb-1 text-sm font-medium">대인관계/배우자운</div>
          <p className="text-sm text-muted-foreground">{personality.relationships}</p>
        </div>
      </CardContent>
    </Card>
  );
}

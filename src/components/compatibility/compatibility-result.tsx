'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FadeIn, motion, staggerContainer, staggerItem } from '@/components/ui/motion';
import type { CompatibilityResult } from '@/lib/saju/types';
import { TermTooltip } from '@/components/ui/term-tooltip';

const GRADE_COLORS: Record<string, string> = {
  S: '#a855f7',
  A: '#22c55e',
  B: '#3b82f6',
  C: '#eab308',
  D: '#ef4444',
};

const GRADE_BG: Record<string, string> = {
  S: 'from-purple-500/20 to-purple-500/5',
  A: 'from-green-500/20 to-green-500/5',
  B: 'from-blue-500/20 to-blue-500/5',
  C: 'from-yellow-500/20 to-yellow-500/5',
  D: 'from-red-500/20 to-red-500/5',
};

const GRADE_TEXT: Record<string, string> = {
  S: 'text-purple-600 dark:text-purple-400',
  A: 'text-green-600 dark:text-green-400',
  B: 'text-blue-600 dark:text-blue-400',
  C: 'text-yellow-600 dark:text-yellow-400',
  D: 'text-red-600 dark:text-red-400',
};

function getBarColor(score: number): string {
  if (score >= 70) return 'bg-gradient-to-r from-green-500 to-green-400';
  if (score >= 50) return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
  return 'bg-gradient-to-r from-red-500 to-red-400';
}

interface CompatibilityResultProps {
  result: CompatibilityResult;
}

export function CompatibilityResultDisplay({ result }: CompatibilityResultProps) {
  const color = GRADE_COLORS[result.grade];
  const size = 160;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (result.totalScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Total score with circular progress */}
      <FadeIn>
        <Card className={`bg-gradient-to-br ${GRADE_BG[result.grade]} border-0 shadow-lg`}>
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                <svg width={size} height={size} className="-rotate-90">
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    className="stroke-background/50"
                    strokeWidth={strokeWidth}
                  />
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`font-serif text-4xl font-bold ${GRADE_TEXT[result.grade]}`}>
                    {result.totalScore}
                  </span>
                  <span className={`text-lg font-bold ${GRADE_TEXT[result.grade]}`}>
                    {result.grade}등급
                  </span>
                </div>
              </div>
              <p className="mt-5 max-w-md text-center text-sm text-muted-foreground">{result.summary}</p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Categories */}
      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base"><TermTooltip termKey="궁합">카테고리별 분석</TermTooltip></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.categories.map((cat, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{cat.name}</span>
                  <span className="text-sm font-bold">{cat.score}점</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(cat.score)}`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <div className="mt-1 space-y-0.5">
                  {cat.details.map((detail, j) => (
                    <p key={j} className="text-xs text-muted-foreground">- {detail}</p>
                  ))}
                </div>
                {i < result.categories.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Strengths / Weaknesses */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {result.strengths.length > 0 && (
          <motion.div variants={staggerItem}>
            <Card className="border-green-200 dark:border-green-800/50">
              <CardHeader>
                <CardTitle className="text-base text-green-600 dark:text-green-400">강점</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-green-500">+</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {result.weaknesses.length > 0 && (
          <motion.div variants={staggerItem}>
            <Card className="border-red-200 dark:border-red-800/50">
              <CardHeader>
                <CardTitle className="text-base text-red-600 dark:text-red-400">약점</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {result.weaknesses.map((w, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-red-500">-</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Advice */}
      <FadeIn delay={0.4}>
        <Card className="bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="rounded-lg border border-primary/10 bg-background/50 p-4 text-center">
              <div className="font-serif text-sm font-medium text-primary">조언</div>
              <p className="mt-2 text-sm text-muted-foreground">{result.advice}</p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}

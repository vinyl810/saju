'use client';

import { usePdfMode } from '@/components/saju/pdf-mode-context';

function getScoreColor(score: number): string {
  if (score >= 70) return '#22c55e'; // green
  if (score >= 50) return '#eab308'; // yellow
  return '#ef4444'; // red
}

function getScoreGradient(score: number): [string, string] {
  if (score >= 70) return ['#22c55e', '#16a34a'];
  if (score >= 50) return ['#eab308', '#ca8a04'];
  return ['#ef4444', '#dc2626'];
}

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ScoreGauge({ score, size = 64, strokeWidth = 5, label }: ScoreGaugeProps) {
  const isPdf = usePdfMode();

  // PDF 모드: SVG gradient가 html2canvas에서 깨지므로 순수 div로 대체
  if (isPdf) {
    const color = getScoreColor(score);
    return (
      <div
        className="flex flex-col items-center justify-center rounded-full border-4 shrink-0"
        style={{
          width: size,
          height: size,
          borderColor: color,
        }}
      >
        <span className="text-lg font-bold leading-none" style={{ color }}>
          {score}
        </span>
        {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const [colorStart, colorEnd] = getScoreGradient(score);
  const gradientId = `gauge-${score}-${size}`;

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={strokeWidth}
        />
        <defs>
          <linearGradient id={gradientId}>
            <stop offset="0%" stopColor={colorStart} />
            <stop offset="100%" stopColor={colorEnd} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none" style={{ color: getScoreColor(score) }}>
          {score}
        </span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

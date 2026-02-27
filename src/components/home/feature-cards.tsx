'use client';

import type { ReactNode } from 'react';
import { Columns3, Sparkles, TrendingUp } from 'lucide-react';
import { motion, staggerContainer, staggerItem } from '@/components/ui/motion';
import { TermTooltip } from '@/components/ui/term-tooltip';

const features: { icon: typeof Columns3; hanja: string; title: ReactNode; description: ReactNode; gradient: string; iconColor: string }[] = [
  {
    icon: Columns3,
    hanja: '四柱八字',
    title: <><TermTooltip termKey="사주팔자">사주팔자</TermTooltip> 분석</>,
    description: <><TermTooltip termKey="년주">년주</TermTooltip>, <TermTooltip termKey="월주">월주</TermTooltip>, <TermTooltip termKey="일주">일주</TermTooltip>, <TermTooltip termKey="시주">시주</TermTooltip> 네 기둥의 <TermTooltip termKey="천간">천간</TermTooltip>과 <TermTooltip termKey="지지">지지</TermTooltip>를 정확하게 계산합니다.</>,
    gradient: 'from-blue-500/10 to-indigo-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Sparkles,
    hanja: '五行用神',
    title: <><TermTooltip termKey="오행">오행</TermTooltip> & <TermTooltip termKey="용신">용신</TermTooltip></>,
    description: <><TermTooltip termKey="오행">오행</TermTooltip> 분포를 분석하고 <TermTooltip termKey="억부법">억부법</TermTooltip>/<TermTooltip termKey="조후법">조후법</TermTooltip>으로 <TermTooltip termKey="용신">용신</TermTooltip>을 판단합니다.</>,
    gradient: 'from-amber-500/10 to-orange-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: TrendingUp,
    hanja: '大運歲運',
    title: <><TermTooltip termKey="대운">대운</TermTooltip> & 운세</>,
    description: <><TermTooltip termKey="대운">대운</TermTooltip>, <TermTooltip termKey="세운">세운</TermTooltip>, <TermTooltip termKey="월운">월운</TermTooltip>, <TermTooltip termKey="일운">일운</TermTooltip>까지 10년 단위의 운세를 확인하세요.</>,
    gradient: 'from-emerald-500/10 to-teal-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
];

export function FeatureCards() {
  return (
    <motion.div
      className="mt-16 grid gap-4 sm:grid-cols-3"
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
    >
      {features.map((f, i) => (
        <motion.div
          key={i}
          variants={staggerItem}
          className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br ${f.gradient} p-5 transition-shadow hover:shadow-lg`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-lg bg-background p-2 shadow-sm ${f.iconColor}`}>
              <f.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-serif text-xs text-muted-foreground">{f.hanja}</div>
              <div className="text-sm font-semibold">{f.title}</div>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {f.description}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

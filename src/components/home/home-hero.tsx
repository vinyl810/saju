'use client';

import { FadeIn } from '@/components/ui/motion';
import { TermTooltip } from '@/components/ui/term-tooltip';

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/8 via-primary/3 to-transparent pb-16 pt-12 sm:pt-20">
      {/* Decorative background pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute -left-4 top-8 font-serif text-[12rem] font-black leading-none tracking-tighter text-primary">
          四柱
        </div>
        <div className="absolute -right-4 bottom-0 font-serif text-[10rem] font-black leading-none tracking-tighter text-primary">
          八字
        </div>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 text-center">
        <FadeIn>
          <div className="mb-3 inline-flex items-center rounded-full border bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
            정통 <TermTooltip termKey="사주">사주</TermTooltip> 알고리즘 기반
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-serif text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            <TermTooltip termKey="사주팔자">사주팔자</TermTooltip>
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            생년월일시를 입력하면 <TermTooltip termKey="사주팔자">사주팔자</TermTooltip>, <TermTooltip termKey="오행">오행</TermTooltip>분석, <TermTooltip termKey="용신">용신</TermTooltip>, <TermTooltip termKey="대운">대운</TermTooltip>까지
            <br className="hidden sm:inline" />
            종합 분석해 드립니다.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

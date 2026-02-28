'use client';

import React from 'react';
import { Sparkles, User, Coins, Briefcase, Heart, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/motion';
import type { AICompatSectionKey, SectionState } from '@/lib/ai/types';
import { AI_COMPAT_SECTIONS } from '@/lib/ai/types';
import { renderRichText } from '@/lib/ai/rich-text';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  User,
  Coins,
  Briefcase,
  Heart,
  Calendar,
};

interface AICompatSectionCardProps {
  sectionKey: AICompatSectionKey;
  state: SectionState;
}

export function AICompatSectionCard({ sectionKey, state }: AICompatSectionCardProps) {
  const section = AI_COMPAT_SECTIONS.find((s) => s.key === sectionKey);
  if (!section || state.status === 'idle') return null;

  const Icon = ICON_MAP[section.icon];

  return (
    <FadeIn className={`${section.layout === 'full' ? 'col-span-full' : ''} h-full`}>
      <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {Icon && <Icon className="h-4 w-4 text-primary" />}
            <span className="font-serif">{section.label}</span>
            {state.status === 'streaming' && (
              <span className="ml-auto flex items-center gap-1 text-xs font-normal text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                작성 중
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-muted-foreground">
            {renderRichText(state.content)}
            {state.status === 'streaming' && (
              <span className="inline-block w-0.5 h-4 ml-0.5 align-text-bottom animate-pulse bg-primary" />
            )}
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

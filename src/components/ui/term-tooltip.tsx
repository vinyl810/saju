'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { SAJU_TERMS, type TermDefinition } from '@/lib/saju/terminology';

interface TermTooltipProps {
  termKey?: string;
  termDef?: TermDefinition;
  children: React.ReactNode;
  iconSize?: number;
}

export function TermTooltip({ termKey, termDef, children, iconSize = 12 }: TermTooltipProps) {
  const def = termDef || (termKey ? SAJU_TERMS[termKey] : undefined);
  if (!def) {
    return <>{children}</>;
  }

  return (
    <PopoverPrimitive.Root>
      <span className="inline-flex items-center gap-0.5">
        {children}
        <PopoverPrimitive.Trigger asChild>
          <span
            role="button"
            tabIndex={0}
            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-current/10 p-0.5 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label={`${def.term} 용어 설명`}
            onClick={(e) => e.stopPropagation()}
          >
            <Search style={{ width: iconSize, height: iconSize }} />
          </span>
        </PopoverPrimitive.Trigger>
      </span>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="z-50 w-64 rounded-lg border bg-popover p-3 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          sideOffset={4}
          align="center"
          collisionPadding={8}
        >
          <div className="space-y-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-sm">{def.term}</span>
              {def.hanja && (
                <span className="text-xs text-muted-foreground/60">{def.hanja}</span>
              )}
            </div>
            {def.easy && (
              <p className="text-[13px] leading-relaxed text-foreground/85">{def.easy}</p>
            )}
            <div className="border-t border-border/50 pt-1.5 space-y-0.5">
              <p className="text-xs text-muted-foreground">{def.short}</p>
              {def.detail && (
                <p className="text-xs leading-relaxed text-muted-foreground/60">{def.detail}</p>
              )}
            </div>
          </div>
          <PopoverPrimitive.Arrow className="fill-popover" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

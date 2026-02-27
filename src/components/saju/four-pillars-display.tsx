'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { PillarCard } from './pillar-card';
import { motion, staggerContainer, staggerItem } from '@/components/ui/motion';
import { TermTooltip } from '@/components/ui/term-tooltip';
import type { FourPillars } from '@/lib/saju/types';

interface FourPillarsDisplayProps {
  fourPillars: FourPillars;
}

export function FourPillarsDisplay({ fourPillars }: FourPillarsDisplayProps) {
  const [guideOpen, setGuideOpen] = useState(false);

  const pillars: { pillar: FourPillars[keyof FourPillars]; label: ReactNode; isDayMaster: boolean }[] = [
    { pillar: fourPillars.year, label: <><TermTooltip termKey="년주">년주</TermTooltip> (年柱)</>, isDayMaster: false },
    { pillar: fourPillars.month, label: <><TermTooltip termKey="월주">월주</TermTooltip> (月柱)</>, isDayMaster: false },
    { pillar: fourPillars.day, label: <><TermTooltip termKey="일주">일주</TermTooltip> (日柱)</>, isDayMaster: true },
    { pillar: fourPillars.hour, label: <><TermTooltip termKey="시주">시주</TermTooltip> (時柱)</>, isDayMaster: false },
  ];

  return (
    <div>
      {/* Reading guide */}
      <div className="mb-3">
        <button
          onClick={() => setGuideOpen(!guideOpen)}
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <span>사주 카드 읽는 법</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${guideOpen ? 'rotate-180' : ''}`} />
        </button>
        {guideOpen && (
          <div className="mt-2 rounded-lg border bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            <p className="mb-2 font-medium text-foreground">각 카드는 위에서 아래로 읽습니다:</p>
            <ol className="space-y-1 pl-4">
              <li className="list-decimal"><strong>나와의 관계</strong> — 윗칸 글자가 나(일간)와 어떤 관계인지 (<TermTooltip termKey="십신">십신</TermTooltip>)</li>
              <li className="list-decimal"><strong><TermTooltip termKey="천간">천간</TermTooltip>(하늘)</strong> — 하늘의 기운. 외적 성향과 드러나는 모습</li>
              <li className="list-decimal"><strong><TermTooltip termKey="지지">지지</TermTooltip>(땅)</strong> — 땅의 기운. 내면의 성향과 숨겨진 모습</li>
              <li className="list-decimal"><strong>나와의 관계</strong> — 아랫칸 글자가 나(일간)와 어떤 관계인지 (<TermTooltip termKey="십신">십신</TermTooltip>)</li>
            </ol>
            <p className="mt-2">테두리가 강조된 <strong>일주(日柱)</strong> 카드의 천간이 바로 <TermTooltip termKey="일간">일간</TermTooltip> — <strong>나 자신</strong>을 대표하는 글자입니다.</p>
          </div>
        )}
      </div>

      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {pillars.map((p, i) => (
          <motion.div key={i} variants={staggerItem}>
            <PillarCard pillar={p.pillar} label={p.label} isDayMaster={p.isDayMaster} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

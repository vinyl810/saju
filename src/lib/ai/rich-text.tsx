import React from 'react';
import { ELEMENT_COLORS } from '@/lib/saju/constants';
import type { FiveElement } from '@/lib/saju/types';
import { SAJU_TERMS } from '@/lib/saju/terminology';
import { TermTooltip } from '@/components/ui/term-tooltip';

// ===== 리치 텍스트 렌더링 (공용 모듈) =====

// 오행 이름 색상 매핑
const KEYWORD_ELEMENT_MAP: Record<string, FiveElement> = {
  '목(木)': '목', '화(火)': '화', '토(土)': '토', '금(金)': '금', '수(水)': '수',
  '木(목)': '목', '火(화)': '화', '土(토)': '토', '金(금)': '금', '水(수)': '수',
};

// 천간 bare 글자 → 오행 매핑 (간지 두 글자 조합용)
const CHEONGAN_BARE_ELEMENT: Record<string, FiveElement> = {
  '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
  '기': '토', '경': '금', '신': '금', '임': '수', '계': '수',
};

// 천간/지지 개별 글자 → 오행 색상 매핑 (한글(한자) 형태)
const GANJI_ELEMENT_MAP: Record<string, FiveElement> = {
  // 10천간
  '갑(甲)': '목', '을(乙)': '목', '병(丙)': '화', '정(丁)': '화', '무(戊)': '토',
  '기(己)': '토', '경(庚)': '금', '신(辛)': '금', '임(壬)': '수', '계(癸)': '수',
  // 12지지
  '자(子)': '수', '축(丑)': '토', '인(寅)': '목', '묘(卯)': '목', '진(辰)': '토', '사(巳)': '화',
  '오(午)': '화', '미(未)': '토', '신(申)': '금', '유(酉)': '금', '술(戌)': '토', '해(亥)': '수',
};

// 1단계: {{term}} 마크업을 파싱하여 TermTooltip 노드로 변환
const TERM_RE = /\{\{(.+?)\}\}/g;

export function parseTermMarkup(text: string, baseKey: number): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  TERM_RE.lastIndex = 0;

  while ((match = TERM_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const termKey = match[1];
    if (SAJU_TERMS[termKey]) {
      nodes.push(
        <TermTooltip key={baseKey + match.index} termKey={termKey}>
          <span className="underline decoration-dotted decoration-primary/40 underline-offset-2">{termKey}</span>
        </TermTooltip>,
      );
    } else {
      nodes.push(termKey);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

// 2단계: **bold**, 오행 키워드, 천간/지지 글자를 파싱 (내부 텍스트는 1단계로 재귀)
// 간지 패턴: "계(癸)수" 같이 뒤에 bare 오행 이름이 바로 붙는 경우도 매칭
// 단, "계(癸)수(水)" 처럼 오행에 한자가 붙으면 오행 키워드 그룹에서 별도 매칭하도록 제외
const ELEMENT_HANGUL: Record<FiveElement, string> = { '목': '목', '화': '화', '토': '토', '금': '금', '수': '수' };
const GANJI_CHARS = Object.entries(GANJI_ELEMENT_MAP).map(([k, el]) => {
  const escaped = k.replace(/[()]/g, '\\$&');
  const suffix = ELEMENT_HANGUL[el];
  return `${escaped}(?:${suffix}(?!\\())?`;
}).join('|');
const MONTH_GANJI = `(\\d{1,2}월)\\s*\\(?([갑을병정무기경신임계][자축인묘진사오미신유술해])\\)?\\s*(?:\\[(\\d{4})년\\])?\\s*:?`;
const BASE_PATTERN = `(\\*\\*(.+?)\\*\\*)|(목\\(木\\)|화\\(火\\)|토\\(土\\)|금\\(金\\)|수\\(水\\)|木\\(목\\)|火\\(화\\)|土\\(토\\)|金\\(금\\)|水\\(수\\))|(${GANJI_CHARS})`;
const OUTER_RE = new RegExp(BASE_PATTERN, 'g');
const OUTER_RE_MONTHLY = new RegExp(`${BASE_PATTERN}|${MONTH_GANJI}`, 'g');

// 전처리: {{금(金)}} 처럼 SAJU_TERMS에 없는 내용이 {{}}로 감싸진 경우 중괄호 제거
// SAJU_TERMS에 있는 유효한 용어(예: {{용신}})는 보존
function stripInvalidTermMarkup(text: string): string {
  return text.replace(/\{\{(.+?)\}\}/g, (full, inner) => {
    return SAJU_TERMS[inner] ? full : inner;
  });
}

export function renderRichText(content: string, options?: { monthlyFortune?: boolean }): React.ReactNode[] {
  content = stripInvalidTermMarkup(content);

  const re = options?.monthlyFortune ? OUTER_RE_MONTHLY : OUTER_RE;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  re.lastIndex = 0;

  while ((match = re.exec(content)) !== null) {
    // Plain text before match — parse {{term}} in it
    if (match.index > lastIndex) {
      nodes.push(...parseTermMarkup(content.slice(lastIndex, match.index), lastIndex));
    }

    if (match[1]) {
      // Bold: **text** — parse {{term}} inside bold too
      nodes.push(
        <strong key={match.index} className="text-foreground font-semibold">
          {parseTermMarkup(match[2], match.index)}
        </strong>,
      );
    } else if (match[3]) {
      // Element keyword (목(木) etc.)
      const el = KEYWORD_ELEMENT_MAP[match[3]];
      nodes.push(
        <span key={match.index} style={{ color: el ? ELEMENT_COLORS[el] : undefined, fontWeight: 600 }}>
          {match[3]}
        </span>,
      );
    } else if (match[4]) {
      // 천간/지지 개별 글자 (계(癸), 임(壬), 신(申) etc.) — 오행 색상
      // "계(癸)수" 처럼 trailing 오행 이름이 포함될 수 있으므로 base 키로 lookup
      const baseGanji = match[4].replace(/[목화토금수]$/, '');
      const el = GANJI_ELEMENT_MAP[baseGanji] || GANJI_ELEMENT_MAP[match[4]];
      nodes.push(
        <span key={match.index} style={{ color: el ? ELEMENT_COLORS[el] : undefined, fontWeight: 500 }}>
          {match[4]}
        </span>,
      );
    } else if (match[5]) {
      // 월별 간지 패턴: "3월 (신묘)" or "1월 (경인) [2027년]" → 뱃지 렌더링
      const monthLabel = match[5];
      const ganji = match[6];
      const yearLabel = match[7]; // optional [YYYY년] capture
      const el = CHEONGAN_BARE_ELEMENT[ganji[0]];
      nodes.push(
        <span key={`sep-${match.index}`} className="block mt-2 first:mt-0" />,
        <span key={match.index} className="inline-flex items-center gap-1 mr-1 align-baseline">
          <span className="inline-block rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
            {monthLabel}
          </span>
          <span
            className="inline-block rounded-md px-1.5 py-0.5 text-xs font-mono font-semibold"
            style={{
              color: el ? ELEMENT_COLORS[el] : undefined,
              backgroundColor: el ? `${ELEMENT_COLORS[el]}15` : undefined,
              border: el ? `1px solid ${ELEMENT_COLORS[el]}40` : undefined,
            }}
          >
            {ganji}
          </span>
          {yearLabel && (
            <span className="inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {yearLabel}년
            </span>
          )}
          <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
        </span>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text — parse {{term}} in it
  if (lastIndex < content.length) {
    nodes.push(...parseTermMarkup(content.slice(lastIndex), lastIndex));
  }

  return nodes;
}

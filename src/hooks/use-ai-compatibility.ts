'use client';

import { useCallback, useRef, useState } from 'react';
import {
  COMPAT_SECTION_KEYS,
  type AICompatSectionKey,
  type CompatSectionsMap,
  type SectionState,
  type StreamingStatus,
  type SSEEvent,
} from '@/lib/ai/types';
import type { SajuAnalysis, CompatibilityResult } from '@/lib/saju/types';

function createInitialSections(): CompatSectionsMap {
  const map = {} as CompatSectionsMap;
  for (const key of COMPAT_SECTION_KEYS) {
    map[key] = { content: '', status: 'idle' };
  }
  return map;
}

export function useAiCompatibility() {
  const [sections, setSections] = useState<CompatSectionsMap>(createInitialSections);
  const [status, setStatus] = useState<StreamingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const updateSection = useCallback(
    (key: AICompatSectionKey, updater: (prev: SectionState) => SectionState) => {
      setSections((prev) => ({
        ...prev,
        [key]: updater(prev[key]),
      }));
    },
    [],
  );

  const start = useCallback(async (
    person1Analysis: SajuAnalysis,
    person2Analysis: SajuAnalysis,
    compatResult: CompatibilityResult,
  ) => {
    // Abort any ongoing request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Reset state
    setSections(createInitialSections());
    setError(null);
    setStatus('loading');

    try {
      const response = await fetch('/api/ai-compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person1Analysis, person2Analysis, compatResult }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `API 오류 (${response.status})`);
      }

      if (!response.body) {
        throw new Error('스트리밍 응답을 받지 못했습니다.');
      }

      setStatus('streaming');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Process any remaining data in buffer
          buffer += decoder.decode();
          if (buffer.trim()) {
            processSSELines(buffer.split('\n'));
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        processSSELines(lines);
      }

      function processSSELines(lines: string[]) {
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const event: SSEEvent = JSON.parse(trimmed.slice(6));

            if ('section' in event) {
              const sectionKey = event.section as AICompatSectionKey;

              switch (event.status) {
                case 'start':
                  updateSection(sectionKey, () => ({
                    content: '',
                    status: 'streaming',
                  }));
                  break;

                case 'delta':
                  updateSection(sectionKey, (prev) => ({
                    ...prev,
                    content: prev.content + event.content,
                  }));
                  break;

                case 'done':
                  updateSection(sectionKey, (prev) => ({
                    ...prev,
                    status: 'done',
                  }));
                  break;
              }
            } else if (event.status === 'complete') {
              setStatus('done');
            } else if (event.status === 'error') {
              setError(event.message);
              setStatus('error');
            }
          } catch {
            // skip malformed events
          }
        }
      }

      // If we haven't received a complete event, mark as done
      setStatus((prev) => (prev === 'streaming' ? 'done' : prev));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const message = err instanceof Error ? err.message : 'AI 궁합 해석 중 오류가 발생했습니다.';
      setError(message);
      setStatus('error');
    }
  }, [updateSection]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setStatus((prev) => (prev === 'streaming' || prev === 'loading' ? 'idle' : prev));
  }, []);

  return { sections, status, error, start, abort };
}

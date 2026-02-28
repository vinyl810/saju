'use client';

import { useCallback, useRef, useState } from 'react';
import {
  SECTION_KEYS,
  type AISectionKey,
  type SectionsMap,
  type SectionState,
  type StreamingStatus,
  type SSEEvent,
} from '@/lib/ai/types';
import type { SajuAnalysis } from '@/lib/saju/types';
import { buildSajuCacheKey, getCache, setCache } from '@/lib/ai/cache';

function createInitialSections(): SectionsMap {
  const map = {} as SectionsMap;
  for (const key of SECTION_KEYS) {
    map[key] = { content: '', status: 'idle' };
  }
  return map;
}

export function useAiInterpretation() {
  const [sections, setSections] = useState<SectionsMap>(createInitialSections);
  const [status, setStatus] = useState<StreamingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const updateSection = useCallback(
    (key: AISectionKey, updater: (prev: SectionState) => SectionState) => {
      setSections((prev) => ({
        ...prev,
        [key]: updater(prev[key]),
      }));
    },
    [],
  );

  const start = useCallback(async (sajuAnalysis: SajuAnalysis) => {
    // Check cache first
    const cacheKey = buildSajuCacheKey(sajuAnalysis);
    const cached = getCache<SectionsMap>(cacheKey);
    if (cached) {
      setSections(cached);
      setError(null);
      setStatus('done');
      return;
    }

    // Abort any ongoing request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Reset state
    setSections(createInitialSections());
    setError(null);
    setStatus('loading');

    try {
      const response = await fetch('/api/ai-interpretation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sajuAnalysis }),
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
              const sectionKey = event.section as AISectionKey;

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
              setSections((final) => {
                setCache(cacheKey, final);
                return final;
              });
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
      const message = err instanceof Error ? err.message : 'AI 해석 중 오류가 발생했습니다.';
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

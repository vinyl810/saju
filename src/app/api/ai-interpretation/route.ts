import { NextRequest } from 'next/server';
import { compressSajuData, buildSystemPrompt, buildUserPrompt } from '@/lib/ai/prompt-builder';
import { createGeminiStream, parseGeminiStream } from '@/lib/ai/gemini-stream';
import { getAiSections, type AISectionKey, type AnalysisMode } from '@/lib/ai/types';
import type { SajuAnalysis } from '@/lib/saju/types';
import { logger } from '@/lib/logger';

const MODULE = 'api-ai-interpretation';
const SECTION_MARKER_REGEX = /---SECTION:(\w+)---/;

function sseEncode(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  if (!apiKey || apiKey === 'your-api-key-here') {
    logger.error(MODULE, 'Gemini API 키 미설정');
    return new Response(
      JSON.stringify({ error: 'Gemini API 키가 설정되지 않았습니다. .env.local 파일을 확인해 주세요.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let sajuAnalysis: SajuAnalysis;
  let mode: AnalysisMode = 'graduate';
  try {
    const body = await request.json();
    sajuAnalysis = body.sajuAnalysis;
    if (body.mode === 'general' || body.mode === 'graduate') {
      mode = body.mode;
    }
    if (!sajuAnalysis?.fourPillars) {
      throw new Error('Invalid saju analysis data');
    }
  } catch {
    logger.warn(MODULE, '잘못된 요청 데이터');
    return new Response(
      JSON.stringify({ error: '잘못된 요청 데이터입니다.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const compressed = compressSajuData(sajuAnalysis, mode);
  const systemPrompt = buildSystemPrompt(mode);
  const userPrompt = buildUserPrompt(compressed, mode);

  const birthInfo = sajuAnalysis.birthInput;
  logger.info(MODULE, 'AI 해석 스트리밍 시작', {
    model,
    mode,
    birth: `${birthInfo.year}-${birthInfo.month}-${birthInfo.day} ${birthInfo.hour}:${birthInfo.minute}`,
    gender: birthInfo.gender,
    lunar: birthInfo.isLunar,
    degree: birthInfo.degreeProgram || null,
    semester: birthInfo.semester || null,
    systemPromptLen: systemPrompt.length,
    userPromptLen: userPrompt.length,
  });

  const sections = getAiSections(mode);
  const sectionLabels = Object.fromEntries(
    sections.map((s) => [s.key, s.label]),
  ) as Record<AISectionKey, string>;

  const encoder = new TextEncoder();
  const startTime = Date.now();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const geminiStream = await createGeminiStream({
          apiKey,
          model,
          systemPrompt,
          userPrompt,
          ...(mode === 'graduate' && { maxTokens: 20480 }),
        });

        let currentSection: AISectionKey | null = null;
        let textBuffer = '';
        let chunkCount = 0;
        const emittedSections: AISectionKey[] = [];
        const sectionLengths: Record<string, number> = {};
        let totalContentLength = 0;

        for await (const chunk of parseGeminiStream(geminiStream)) {
          chunkCount++;
          textBuffer += chunk;

          // Process buffer for section markers
          while (true) {
            const markerMatch = textBuffer.match(SECTION_MARKER_REGEX);
            if (!markerMatch) break;

            const markerIndex = markerMatch.index!;
            const sectionKey = markerMatch[1] as AISectionKey;

            // Emit any content before this marker for the current section
            if (currentSection && markerIndex > 0) {
              const content = textBuffer.slice(0, markerIndex).trim();
              if (content) {
                sectionLengths[currentSection] = (sectionLengths[currentSection] || 0) + content.length;
                totalContentLength += content.length;
                controller.enqueue(
                  encoder.encode(sseEncode({ section: currentSection, status: 'delta', content })),
                );
              }
              controller.enqueue(
                encoder.encode(sseEncode({ section: currentSection, status: 'done' })),
              );
            }

            // Start new section
            currentSection = sectionKey;
            emittedSections.push(sectionKey);
            controller.enqueue(
              encoder.encode(
                sseEncode({ section: sectionKey, status: 'start', label: sectionLabels[sectionKey] || sectionKey }),
              ),
            );

            // Remove processed part from buffer
            textBuffer = textBuffer.slice(markerIndex + markerMatch[0].length);
          }

          // Emit remaining buffer content as delta for current section
          if (currentSection && textBuffer.length > 0) {
            // Keep a small buffer to avoid splitting markers (longest: ---SECTION:professorRelation--- = 33 chars)
            const safeLength = textBuffer.length - 40;
            if (safeLength > 0) {
              const content = textBuffer.slice(0, safeLength);
              textBuffer = textBuffer.slice(safeLength);
              if (content) {
                sectionLengths[currentSection] = (sectionLengths[currentSection] || 0) + content.length;
                totalContentLength += content.length;
                controller.enqueue(
                  encoder.encode(sseEncode({ section: currentSection, status: 'delta', content })),
                );
              }
            }
          }
        }

        // Flush remaining content
        if (currentSection && textBuffer.trim()) {
          const content = textBuffer.trim();
          sectionLengths[currentSection] = (sectionLengths[currentSection] || 0) + content.length;
          totalContentLength += content.length;
          controller.enqueue(
            encoder.encode(sseEncode({ section: currentSection, status: 'delta', content })),
          );
          controller.enqueue(
            encoder.encode(sseEncode({ section: currentSection, status: 'done' })),
          );
        }

        const durationMs = Date.now() - startTime;
        logger.info(MODULE, 'AI 해석 스트리밍 완료', {
          durationMs,
          durationSec: (durationMs / 1000).toFixed(1),
          chunkCount,
          totalSections: emittedSections.length,
          emittedSections,
          totalContentLength,
          sectionLengths,
        });

        // Signal completion
        controller.enqueue(encoder.encode(sseEncode({ status: 'complete' })));
        controller.close();
      } catch (err) {
        const durationMs = Date.now() - startTime;
        const message = err instanceof Error ? err.message : 'AI 해석 중 오류가 발생했습니다.';
        logger.error(MODULE, 'AI 해석 스트리밍 오류', { error: message, durationMs });
        controller.enqueue(
          encoder.encode(sseEncode({ status: 'error', message })),
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

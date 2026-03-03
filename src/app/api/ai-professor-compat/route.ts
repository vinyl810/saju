import { NextRequest } from 'next/server';
import { compressCompatibilityData, buildProfessorCompatSystemPrompt, buildProfessorCompatUserPrompt } from '@/lib/ai/prompt-builder';
import { createGeminiStream, parseGeminiStream } from '@/lib/ai/gemini-stream';
import { AI_PROF_COMPAT_SECTIONS, type AIProfCompatSectionKey } from '@/lib/ai/types';
import type { SajuAnalysis, CompatibilityResult } from '@/lib/saju/types';
import { logger } from '@/lib/logger';
import { logProfCompatSearch } from '@/lib/db/search-log';

const MODULE = 'api-ai-professor-compat';
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

  let studentAnalysis: SajuAnalysis;
  let professorAnalysis: SajuAnalysis;
  let compatResult: CompatibilityResult;
  try {
    const body = await request.json();
    studentAnalysis = body.studentAnalysis;
    professorAnalysis = body.professorAnalysis;
    compatResult = body.compatResult;
    if (!studentAnalysis?.fourPillars || !professorAnalysis?.fourPillars || !compatResult?.totalScore) {
      throw new Error('Invalid professor compatibility data');
    }
  } catch {
    logger.warn(MODULE, '잘못된 요청 데이터');
    return new Response(
      JSON.stringify({ error: '잘못된 요청 데이터입니다.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const compressed = compressCompatibilityData(studentAnalysis, professorAnalysis, compatResult);
  const systemPrompt = buildProfessorCompatSystemPrompt();
  const userPrompt = buildProfessorCompatUserPrompt(compressed);

  const studentBirth = studentAnalysis.birthInput;
  const profBirth = professorAnalysis.birthInput;
  logger.info(MODULE, 'AI 교수 궁합 해석 스트리밍 시작', {
    model,
    student: `${studentBirth.year}-${studentBirth.month}-${studentBirth.day} ${studentBirth.hour}:${studentBirth.minute}`,
    studentGender: studentBirth.gender,
    professor: `${profBirth.year}-${profBirth.month}-${profBirth.day} ${profBirth.hour}:${profBirth.minute}`,
    professorGender: profBirth.gender,
    totalScore: compatResult.totalScore,
    systemPromptLen: systemPrompt.length,
    userPromptLen: userPrompt.length,
  });

  await logProfCompatSearch(studentBirth, profBirth);

  const sectionLabels = Object.fromEntries(
    AI_PROF_COMPAT_SECTIONS.map((s) => [s.key, s.label]),
  ) as Record<AIProfCompatSectionKey, string>;

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
        });

        let currentSection: AIProfCompatSectionKey | null = null;
        let textBuffer = '';
        let chunkCount = 0;
        const emittedSections: AIProfCompatSectionKey[] = [];
        const sectionLengths: Record<string, number> = {};
        let totalContentLength = 0;

        for await (const chunk of parseGeminiStream(geminiStream)) {
          chunkCount++;
          textBuffer += chunk;

          while (true) {
            const markerMatch = textBuffer.match(SECTION_MARKER_REGEX);
            if (!markerMatch) break;

            const markerIndex = markerMatch.index!;
            const sectionKey = markerMatch[1] as AIProfCompatSectionKey;

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

            currentSection = sectionKey;
            emittedSections.push(sectionKey);
            controller.enqueue(
              encoder.encode(
                sseEncode({ section: sectionKey, status: 'start', label: sectionLabels[sectionKey] || sectionKey }),
              ),
            );

            textBuffer = textBuffer.slice(markerIndex + markerMatch[0].length);
          }

          if (currentSection && textBuffer.length > 0) {
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
        logger.info(MODULE, 'AI 교수 궁합 해석 스트리밍 완료', {
          durationMs,
          durationSec: (durationMs / 1000).toFixed(1),
          chunkCount,
          totalSections: emittedSections.length,
          emittedSections,
          totalContentLength,
          sectionLengths,
        });

        controller.enqueue(encoder.encode(sseEncode({ status: 'complete' })));
        controller.close();
      } catch (err) {
        const durationMs = Date.now() - startTime;
        const message = err instanceof Error ? err.message : 'AI 교수 궁합 해석 중 오류가 발생했습니다.';
        logger.error(MODULE, 'AI 교수 궁합 해석 스트리밍 오류', { error: message, durationMs });
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

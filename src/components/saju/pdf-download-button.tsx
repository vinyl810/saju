'use client';

import { useCallback, useRef, useState } from 'react';
import { ImageDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PdfContent } from './pdf-content';
import type { SajuAnalysis } from '@/lib/saju/types';
import type { SectionsMap, StreamingStatus } from '@/lib/ai/types';

interface PdfDownloadButtonProps {
  result: SajuAnalysis;
  aiSections: SectionsMap | null;
  aiStatus: StreamingStatus;
}

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export function PdfDownloadButton({ result, aiSections, aiStatus }: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    const el = pdfRef.current;
    if (!el) return;
    setLoading(true);

    try {
      await document.fonts.ready;

      // 캡처 전 visible 전환
      el.style.opacity = '1';
      el.style.overflow = 'visible';
      el.style.height = 'auto';

      await waitForPaint();

      const { default: html2canvas } = await import('html2canvas-pro');

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 800,
      });

      // 복원
      el.style.opacity = '0';
      el.style.overflow = 'hidden';
      el.style.height = '';

      // PNG 다운로드
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const birthDate = `${result.solarBirthDate.year}${result.solarBirthDate.month}${result.solarBirthDate.day}`;
        a.href = url;
        a.download = `사주분석결과_${birthDate}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (err) {
      console.error('이미지 생성 오류:', err);
      if (el) {
        el.style.opacity = '0';
        el.style.overflow = 'hidden';
        el.style.height = '';
      }
    } finally {
      setLoading(false);
    }
  }, [result]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={loading}
        className="gap-1.5"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            이미지 생성 중...
          </>
        ) : (
          <>
            <ImageDown className="h-4 w-4" />
            이미지 저장
          </>
        )}
      </Button>

      <PdfContent
        ref={pdfRef}
        result={result}
        aiSections={aiSections}
        aiStatus={aiStatus}
      />
    </>
  );
}

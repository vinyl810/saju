'use client';

import { useState } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FadeIn, motion } from '@/components/ui/motion';

interface SatisfactionSurveyProps {
  type: 'saju' | 'compatibility';
}

export function SatisfactionSurvey({ type }: SatisfactionSurveyProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const displayRating = hoveredRating || rating;
  const needsFeedback = rating >= 1 && rating <= 2;

  async function submit() {
    if (submitting || rating === 0) return;
    setSubmitting(true);
    try {
      await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          rating,
          feedback: feedback || undefined,
        }),
      });
    } catch {
      // 실패해도 감사 메시지 표시
    }
    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <FadeIn>
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="flex flex-col items-center gap-1 py-5">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <p className="text-sm font-medium">소중한 의견 감사합니다!</p>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <Card className="border-primary/10">
        <CardContent className="flex flex-col items-center gap-4 py-5">
          <p className="text-sm font-medium">
            {type === 'saju' ? '사주' : '궁합'} 결과가 마음에 드시나요?
          </p>

          {/* Star rating */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 focus:outline-none"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    star <= displayRating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </motion.button>
            ))}
          </div>

          {/* Feedback textarea for low ratings */}
          {needsFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full space-y-3 overflow-hidden"
            >
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="어떤 부분이 아쉬우셨나요? (선택사항)"
                maxLength={1000}
                rows={3}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => submit()}
                  disabled={submitting}
                >
                  보내기
                </Button>
              </div>
            </motion.div>
          )}

          {/* Submit button for 3-5 ratings */}
          {rating >= 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="sm"
                onClick={() => submit()}
                disabled={submitting}
              >
                제출
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
}

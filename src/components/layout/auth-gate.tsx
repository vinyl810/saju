'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

const SESSION_KEY = 'saju_authenticated';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      setAuthenticated(true);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();

      if (data.ok) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        setAuthenticated(true);
      } else {
        setError(data.error || '잘못된 코드입니다.');
        setCode('');
      }
    } catch {
      setError('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // SSR/hydration flash 방지
  if (!mounted) return null;

  if (authenticated) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-serif text-xl">접속 코드 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="코드를 입력하세요"
              className="w-full rounded-lg border bg-background px-4 py-3 text-center font-sans text-lg tracking-[0.3em] outline-none focus:ring-2 focus:ring-primary placeholder:tracking-normal placeholder:text-sm placeholder:text-muted-foreground"
            />
            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading || !code.trim()}>
              {loading ? '확인 중...' : '입장'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

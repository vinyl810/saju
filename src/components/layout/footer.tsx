export function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-8">
      <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
        <p>사주팔자 분석은 참고용이며, 개인의 운명을 결정짓지 않습니다.</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} 사주팔자</p>
      </div>
    </footer>
  );
}

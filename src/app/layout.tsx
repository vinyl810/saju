import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AuthGate } from "@/components/layout/auth-gate";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

const notoSerifKR = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "사주팔자 - 四柱八字",
  description: "생년월일시로 사주팔자, 오행분석, 용신, 대운, 궁합까지 종합 분석합니다.",
  keywords: ["사주", "팔자", "사주팔자", "오행", "용신", "대운", "궁합", "만세력"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${pretendard.variable} ${notoSerifKR.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthGate>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </AuthGate>
        </ThemeProvider>
      </body>
    </html>
  );
}

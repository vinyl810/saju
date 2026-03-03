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

const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "대학원생 사주 - 四柱八字",
  description: "대학원생을 위한 사주풀이. 연구운, 지도교수 궁합, 졸업운까지 AI가 분석해 드립니다.",
  keywords: ["사주", "팔자", "사주팔자", "오행", "용신", "대운", "궁합", "만세력", "대학원생"],
  openGraph: {
    title: "대학원생 사주",
    description: "대학원생을 위한 사주풀이. 연구운, 지도교수 궁합, 졸업운까지 AI가 분석해 드립니다.",
  },
  twitter: {
    card: "summary_large_image",
    title: "대학원생 사주",
    description: "대학원생을 위한 사주풀이. 연구운, 지도교수 궁합, 졸업운까지 AI가 분석해 드립니다.",
  },
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

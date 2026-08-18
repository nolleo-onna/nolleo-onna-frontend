import type { Metadata } from "next";
import { MotionConfig } from "motion/react";

import Header from "@/components/layout/Header";
import QueryProvider from "@/providers/QueryProvider";
import PageTransition from "@/providers/PageTransition";
import "@/styles/globals.css";
import "@/styles/font.css";

export const metadata: Metadata = {
  title: "놀러온나",
  description: "부산 여행 추천 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <MotionConfig reducedMotion="user">
          <QueryProvider>
            <Header />
            <PageTransition>{children}</PageTransition>
          </QueryProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
import type { Metadata } from "next";

import Header from "@/components/layout/Header";
import QueryProvider from "@/providers/QueryProvider";
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
        <QueryProvider>
          <Header />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
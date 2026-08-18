import type { Metadata } from "next";

import MyPageContent from "@/features/mypage/components/MyPageContent";

export const metadata: Metadata = {
  title: "마이페이지 | 놀러온나",
};

export default function MyPage() {
  return <MyPageContent />;
}
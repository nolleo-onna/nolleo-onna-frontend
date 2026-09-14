import HeroSection from "@/features/home/components/HeroSection";
import CourseSection from "@/features/home/components/CourseSection";
import TodayStrip from "@/features/home/components/TodayStrip";
import CrowdRankingSection from "@/features/home/components/CrowdRankingSection";
import EventSection from "@/features/home/components/EventSection";
import PopularCourseSection from "@/features/home/components/PopularCourseSection";
import PopularSpotsSection from "@/features/home/components/PopularSpotsSection";
import ServiceIntroSection from "@/features/home/components/ServiceIntroSection";
import AIChatFAB from "@/components/ui/Chat/AIChatFAB";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import AIChatProvider from "@/providers/AIChatProvider";

// 홈은 "오늘 부산에서 어떻게 놀지" 정하는 흐름으로 이어진다:
// 오늘 상황(날씨 → 어디가 붐비는지 → 지금 열리는 행사) → 그걸 보고 내 하루 문장 완성(AI 코스)
// → 다른 사람들이 만든 코스 → 가볼 만한 스팟 → 서비스 소개.
// 모양도 섹션마다 달리해 카드 줄이 반복되지 않게 했다: 한 줄 요약 → 사진+순위표 → 어두운 포스터 띠
// → 문장 패널 → 넘기는 카드 → 티켓 카드 → 줄글.
export default function HomePage() {
  return (
    <AIChatProvider>
      <main>
        <HeroSection />
        <Container>
          <TodayStrip />
          <CrowdRankingSection />
        </Container>
        {/* 행사 띠는 화면 끝까지 채우려고 Container 밖에 둔다 */}
        <EventSection />
        <Container>
          <CourseSection />
          <PopularCourseSection />
          <PopularSpotsSection />
          <ServiceIntroSection />
        </Container>
        <Footer />
        <AIChatFAB />
      </main>
    </AIChatProvider>
  );
}

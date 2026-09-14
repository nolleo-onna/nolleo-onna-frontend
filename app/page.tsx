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

// 섹션마다 모양을 다르게 둬서 카드 줄이 반복되지 않게 한다:
// 한 줄 요약(오늘의 부산) → 엇갈린 타일(AI 코스) → 사진 + 순위표(혼잡도) → 화면 끝까지 차는 어두운 포스터 띠(행사)
// → 넘기는 카드(인기 코스) → 티켓 카드(스팟) → 줄글 소개
export default function HomePage() {
  return (
    <AIChatProvider>
      <main>
        <HeroSection />
        <Container>
          <TodayStrip />
          <CourseSection />
          <CrowdRankingSection />
        </Container>
        {/* 행사 띠는 화면 끝까지 채우려고 Container 밖에 둔다 */}
        <EventSection />
        <Container>
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

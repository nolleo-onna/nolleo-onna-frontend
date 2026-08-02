import HeroSection from "@/features/home/components/HeroSection";
import SearchBar from "@/features/home/components/SearchBar";
import CourseCarousel from "@/features/home/components/CourseSection";
import WeatherSection from "@/features/home/components/WeatherSection";
import SpotsPreviewSection from "@/features/home/components/SpotsPreviewSection";
import TourCourseSection from "@/features/home/components/TourCourseSection";
import PopularSpotsSection from "@/features/home/components/PopularSpotsSection";
import ServiceIntroSection from "@/features/home/components/ServiceIntroSection";
import AIChatFAB from "@/components/ui/Chat/AIChatFAB";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <Container>
        <div id="search-bar">
          <SearchBar />
        </div>
        <CourseCarousel />
        <WeatherSection />
        <SpotsPreviewSection type="crowd" />
        <SpotsPreviewSection type="relaxed" />
        <TourCourseSection />
        <PopularSpotsSection />
        <ServiceIntroSection />
      </Container>
      <Footer />
      <AIChatFAB />
    </main>
  );
}
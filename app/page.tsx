import HeroSection from "@/features/home/components/HeroSection";
import SearchBar from "@/features/home/components/SearchBar";
import CourseCarousel from "@/features/home/components/CourseSection";
import WeatherSection from "@/features/home/components/WeatherSection";
import Container from "@/components/layout/Container";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <Container>
        <SearchBar />
        <CourseCarousel />
        <WeatherSection />
      </Container>
    </main>
  );
}
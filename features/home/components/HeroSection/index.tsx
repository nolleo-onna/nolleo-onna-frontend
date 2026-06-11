export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center py-16 md:py-24 lg:py-32 text-center">
      <span className="text-sm font-medium text-lime-500 mb-4">
        부산 여행 코스
      </span>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy-900 mb-6">
        오늘 부산,{" "}
        <span className="text-pink-400">뭐하지?</span>
      </h1>
      <p className="text-sm md:text-base text-gray-500 leading-relaxed">
        예산·날씨·동행마지 반영한 AI 맞춤 코스.
        <br />
        관광공사 코스 대비 평균 70% 절약.
      </p>
    </section>
  );
}
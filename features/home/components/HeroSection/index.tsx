export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center py-16 md:py-24 text-center overflow-hidden">
      {/* 배경 그라디언트 블롭 */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-pink-200 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-sky-200 rounded-full blur-3xl opacity-30 pointer-events-none" />

      {/* 상단 태그 */}
      <div className="flex items-center gap-2 mb-5">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-100 text-lime-600 text-xs font-semibold">
          ✦ AI 맞춤 코스
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-500 text-xs font-semibold">
          🌊 부산 여행
        </span>
      </div>

      {/* 메인 타이틀 */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy-900 mb-4 leading-tight">
        오늘 부산,{" "}
        <span className="relative inline-block">
          <span className="text-pink-400">뭐하지?</span>
          <svg
            className="absolute -bottom-1 left-0 w-full"
            viewBox="0 0 200 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 6 Q50 2 100 5 Q150 8 198 4"
              stroke="#f472b6"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
          </svg>
        </span>
      </h1>

      {/* 서브 카피 */}
      <p className="text-sm md:text-base text-gray-400 leading-relaxed mb-8">
        예산·날씨·동행마지 반영한 AI 맞춤 코스.
        <br />
        <span className="text-navy-500 font-medium">관광공사 코스 대비 평균 70% 절약.</span>
      </p>

      {/* 키워드 태그 */}
      <div className="flex flex-wrap justify-center gap-2">
        {["🏖️ 해운대", "🌉 광안리", "☕ 카페 투어", "🍜 먹방 코스", "🌙 야경 투어", "🌿 자연 힐링"].map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-600 shadow-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}
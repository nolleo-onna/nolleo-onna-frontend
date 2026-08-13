import { Sparkles, TrendingUp, PiggyBank } from "lucide-react";

const features = [
  {
    icon: <Sparkles className="w-5 h-5 text-ocean-400" />,
    title: "AI 코스 추천",
    description: '"영도 조용한 데이트" 한 마디면\nAI가 맞춤 코스를 만들어요',
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-ocean-400" />,
    title: "날씨·혼잡도 예측",
    description: "관광공사·기상청 데이터로\n오늘 어디가 좋을지 예측",
  },
  {
    icon: <PiggyBank className="w-5 h-5 text-ocean-400" />,
    title: "예산 남는 코스",
    description: "잔액 + 인당까지 표시\n예산 안에서 즐기는 코스",
  },
];

export default function ServiceIntroSection() {
  return (
    <section
        className="my-10 rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d0d14 0%, #0a1a2e 100%)" }}
    >
      <div className="px-8 md:px-16 py-16 md:py-20">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-ocean-400 tracking-widest uppercase block mb-3">
            왜 놀러온나인가요
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            왜 <span className="text-ocean-400">놀러온나</span>인가요?
          </h2>
        </div>

        {/* 피처 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center gap-4"
            >
              {/* 아이콘 */}
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                {feature.icon}
              </div>
              {/* 텍스트 */}
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-bold text-white">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed whitespace-pre-line">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
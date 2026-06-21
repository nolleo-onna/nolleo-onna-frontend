import { dustColorMap, crowdColorMap, WeatherData } from "@/types/weather";

const mockData: WeatherData = {
  date: "5월 3일 일요일",
  weather: { high: 22, low: 14, description: "맑음 · 오후 한때 흐림" },
  dust: { grade: "좋음", pm: 23, recommendation: "야외활동 적합" },
  crowd: { grade: "약간혼잡", description: "주말 · 오후 피크 예상" },
};

type Props = {
  data?: WeatherData;
};

export default function WeatherSection({ data = mockData }: Props) {
  const d = data;
  return (
    <section className="py-6 md:py-10">
      <p className="text-xs text-gray-400 mb-4">오늘의 부산 · {d.date}</p>

      <div className="grid grid-cols-3 gap-3">
        {/* 날씨 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 p-4 md:p-5 text-white">
          <div className="absolute -right-3 -top-3 text-6xl opacity-20 select-none">☀️</div>
          <p className="text-xs font-medium opacity-70 mb-2">오늘 날씨</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight">
            {d.weather.high}°
            <span className="text-lg md:text-xl font-normal opacity-60 ml-1">/ {d.weather.low}°</span>
          </p>
          <p className="text-xs opacity-70 mt-1.5">{d.weather.description}</p>
        </div>

        {/* 미세먼지 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-4 md:p-5 text-white">
          <div className="absolute -right-3 -top-3 text-6xl opacity-20 select-none">🌿</div>
          <p className="text-xs font-medium opacity-70 mb-2">미세먼지</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight">
            {d.dust.grade}
            <span className="text-sm font-normal opacity-70 ml-2">PM {d.dust.pm}</span>
          </p>
          <p className="text-xs opacity-70 mt-1.5">{d.dust.recommendation}</p>
        </div>

        {/* 혼잡도 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 p-4 md:p-5 text-white">
          <div className="absolute -right-3 -top-3 text-6xl opacity-20 select-none">🗺️</div>
          <p className="text-xs font-medium opacity-70 mb-2">관광지 혼잡</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight">
            {d.crowd.grade}
          </p>
          <p className="text-xs opacity-70 mt-1.5">{d.crowd.description}</p>
        </div>
      </div>
    </section>
  );
}
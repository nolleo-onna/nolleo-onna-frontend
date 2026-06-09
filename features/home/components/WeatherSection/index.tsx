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
      <div className="border border-gray-200 rounded-2xl p-4 md:p-6 flex flex-row divide-x divide-gray-200">
        {/* 날씨 */}
        <div className="flex flex-col gap-1 flex-1 pr-3 md:pr-6">
          <span className="text-xs text-gray-400">오늘 날씨</span>
          <p className="text-lg md:text-2xl font-bold text-navy-900">
            {d.weather.high}° /{" "}
            <span className="text-gray-400">{d.weather.low}°</span>
          </p>
          <span className="text-xs text-gray-500">{d.weather.description}</span>
        </div>
        {/* 미세먼지 */}
        <div className="flex flex-col gap-1 flex-1 px-3 md:px-6">
          <span className="text-xs text-gray-400">미세먼지</span>
          <p className={`text-lg md:text-2xl font-bold ${dustColorMap[d.dust.grade] ?? "text-gray-500"}`}>
            {d.dust.grade}{" "}
            <span className="text-sm md:text-base">PM {d.dust.pm}</span>
          </p>
          <span className="text-xs text-gray-500">{d.dust.recommendation}</span>
        </div>
        {/* 혼잡도 */}
        <div className="flex flex-col gap-1 flex-1 pl-3 md:pl-6">
          <span className="text-xs text-gray-400">관광지 혼잡</span>
          <p className={`text-lg md:text-2xl font-bold ${crowdColorMap[d.crowd.grade] ?? "text-gray-500"}`}>
            {d.crowd.grade}
          </p>
          <span className="text-xs text-gray-500">{d.crowd.description}</span>
        </div>
      </div>
    </section>
  );
}
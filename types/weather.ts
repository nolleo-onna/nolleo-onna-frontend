export type DustGrade = "좋음" | "보통" | "나쁨" | "매우나쁨";
export type CrowdGrade = "여유" | "보통" | "약간혼잡" | "혼잡" | "매우혼잡";

export const dustColorMap: Record<DustGrade, string> = {
  좋음: "text-lime-500",
  보통: "text-yellow-400",
  나쁨: "text-orange-400",
  매우나쁨: "text-red-500",
};

export const crowdColorMap: Record<CrowdGrade, string> = {
  여유: "text-lime-500",
  보통: "text-yellow-400",
  약간혼잡: "text-orange-400",
  혼잡: "text-red-400",
  매우혼잡: "text-red-600",
};

export type WeatherData = {
  date: string;
  weather: { high: number; low: number; description: string };
  dust: { grade: DustGrade; pm: number; recommendation: string };
  crowd: { grade: CrowdGrade; description: string };
};
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

// GET /api/v1/weather 응답 (기상청 초단기실황 기반 필드)
// pty: 0 없음, 1 비, 2 비/눈, 3 눈
export type PtyCode = 0 | 1 | 2 | 3;

export const ptyLabelMap: Record<PtyCode, string> = {
  0: "맑음",
  1: "비",
  2: "비/눈",
  3: "눈",
};

export const ptyEmojiMap: Record<PtyCode, string> = {
  0: "☀️",
  1: "🌧️",
  2: "🌨️",
  3: "❄️",
};

// 실제 백엔드 응답: data가 구별 배열이고 각 필드가 문자열로 내려옴
export type WeatherApiItem = {
  district: string;
  tmp: string; // 기온 (°C, T1H)
  pty: string; // 강수형태 (PTY, "0"~"3")
  reh: string; // 습도 (%, REH)
  wsd: string; // 풍속 (m/s, WSD)
  rn1: string; // 1시간 강수량 (mm, RN1)
};

// 프론트에서 쓰기 좋게 숫자로 변환한 형태
// 백엔드가 외부 기상청 API 응답을 못 받아오면 "-"를 내려주기도 해서, 그 경우엔 null로 처리
export type WeatherObservation = {
  district: string;
  tmp: number | null;
  pty: PtyCode;
  reh: number | null;
  wsd: number | null;
  rn1: number | null;
};
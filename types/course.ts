export type WeatherInfo = {
  condition: string;
  temperature: number;
  precipitation: number;
};

export type CourseItem = {
  serialNum: number;
  spotContentId: string;
  spotTitle: string;
  firstImage: string;
  distanceFromPrevM: number;
  durationMinutes: number;
  expectedCost: number | null;
  hasWeatherWarning: boolean;
  warningMessage: string;
};

export type Course = {
  id: number;
  parentCourseId: number | null;
  generationMode: "GENERATED" | "REGENERATED";
  title: string;
  description: string;
  totalCost: number | null;
  totalMinutes: number;
  items: CourseItem[];
};

export type CoursePairResponse = {
  pairId: string;
  weather?: WeatherInfo;
  courses: Course[];
};

// POST /api/v1/courses/generate 요청 바디
export type CourseGenerateRequest = {
  signgu: string;
  budget: number;
  duration: "HALF_DAY" | "ONE_DAY" | "TWO_DAYS";
  companion: "SOLO" | "COUPLE" | "FRIENDS" | "FAMILY";
};

// 공통 API 응답 래퍼
export type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};
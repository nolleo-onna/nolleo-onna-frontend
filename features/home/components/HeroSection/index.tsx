import HeroChatCenter from "./aiFirst/HeroChatCenter";
import CourseSearchBarForm from "./aiFirst/courseForm/CourseSearchBarForm";

/**
 * 홈 히어로 — 1순위 온나 채팅(가운데 큰 입력창), 2순위 조건 골라 내 코스 만들기(한 줄 검색 바).
 * 피드백: 채팅이 메인인데 검색 카드 구석 버튼이라 안 보였다. 스토리북 "AI 채팅 우선 시안"에서 A + A-2로 결정.
 */
export default function HeroSection() {
  return <HeroChatCenter courseForm={<CourseSearchBarForm />} dividerLabel="또는" />;
}

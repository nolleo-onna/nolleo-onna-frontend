"use client";

import { type RefObject, useEffect, useState } from "react";

import { COURSE_INCLUDE_SPOTS_MAX } from "@/constants/course";
import {
  useDebouncedValue,
  useFestivalSuggestions,
  useSpotSuggestions,
} from "@/features/home/hooks/useCourseFormSuggestions";
import { useGenerateCourse } from "@/features/home/hooks/useGenerateCourse";
import type { Suggestion } from "@/features/home/components/SearchBar/SuggestField";
import type { CourseBudgetTier } from "@/types/course";

export type CourseSlot = "area" | "budget" | "festival" | "spot";

/**
 * 조건 폼 시안들이 같이 쓰는 상태 — 지역·예산(필수), 행사·꼭 갈 곳(선택), 열린 칸, 생성.
 * 시안끼리 생김새만 다르고 동작은 같게 하려고 한곳에 모았다.
 *
 * @param rootRef 이 요소 바깥을 누르면 열린 칸을 닫는다
 */
export function useCourseFormState(rootRef: RefObject<HTMLElement | null>) {
  const [area, setArea] = useState<string>("광안리");
  const [budget, setBudget] = useState<CourseBudgetTier>("UNDER_50K");
  const [festival, setFestival] = useState<string | null>(null);
  const [includeSpots, setIncludeSpots] = useState<string[]>([]);
  const [openSlot, setOpenSlot] = useState<CourseSlot | null>(null);

  const [festivalQuery, setFestivalQuery] = useState("");
  const [spotQuery, setSpotQuery] = useState("");
  const festivalSuggest = useFestivalSuggestions(useDebouncedValue(festivalQuery));
  const spotSuggest = useSpotSuggestions(useDebouncedValue(spotQuery));

  const { generate, isGenerating, error } = useGenerateCourse();

  useEffect(() => {
    if (!openSlot) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (target.isConnected && !rootRef.current?.contains(target)) setOpenSlot(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openSlot, rootRef]);

  const toggleSlot = (slot: CourseSlot) => setOpenSlot((prev) => (prev === slot ? null : slot));

  const pickFestival = (s: Suggestion) => {
    setFestival(s.title);
    setFestivalQuery("");
  };

  const toggleSpot = (s: Suggestion) => {
    setSpotQuery("");
    setIncludeSpots((prev) =>
      prev.includes(s.title)
        ? prev.filter((n) => n !== s.title)
        : prev.length >= COURSE_INCLUDE_SPOTS_MAX
          ? prev
          : [...prev, s.title],
    );
  };

  const removeSpot = (name: string) => setIncludeSpots((prev) => prev.filter((n) => n !== name));

  return {
    area,
    setArea,
    budget,
    setBudget,
    festival,
    setFestival,
    includeSpots,
    removeSpot,
    spotsFull: includeSpots.length >= COURSE_INCLUDE_SPOTS_MAX,
    openSlot,
    setOpenSlot,
    toggleSlot,
    festivalQuery,
    setFestivalQuery,
    festivalSuggest,
    pickFestival,
    spotQuery,
    setSpotQuery,
    spotSuggest,
    toggleSpot,
    isGenerating,
    error,
    submit: () => generate({ startArea: area, budget, includeSpots, festival }),
  };
}

export type CourseFormState = ReturnType<typeof useCourseFormState>;

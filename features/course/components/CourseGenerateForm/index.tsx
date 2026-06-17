"use client";

import { useState } from "react";
import { useCourseGenerate } from "@/features/course/hooks/useCourseGenerate";
import type { CourseGenerateRequest } from "@/types/course";

const DURATION_OPTIONS: { label: string; value: CourseGenerateRequest["duration"] }[] = [
  { label: "반나절", value: "HALF_DAY" },
  { label: "하루", value: "ONE_DAY" },
  { label: "1박 2일", value: "TWO_DAYS" },
];

const COMPANION_OPTIONS: { label: string; value: CourseGenerateRequest["companion"] }[] = [
  { label: "혼자", value: "SOLO" },
  { label: "연인", value: "COUPLE" },
  { label: "친구", value: "FRIENDS" },
  { label: "가족", value: "FAMILY" },
];

export default function CourseGenerateForm() {
  const { mutate, isPending, isError, error } = useCourseGenerate();

  const [form, setForm] = useState<CourseGenerateRequest>({
    signgu: "",
    budget: 50000,
    duration: "HALF_DAY",
    companion: "COUPLE",
  });

  const handleSubmit = () => {
    if (!form.signgu.trim()) return;
    mutate(form);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
      {/* 지역 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">어디로 갈까요?</label>
        <input
          type="text"
          placeholder="예: 광안리, 해운대"
          value={form.signgu}
          onChange={(e) => setForm((prev) => ({ ...prev, signgu: e.target.value }))}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-navy-400"
        />
      </div>

      {/* 예산 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          예산 <span className="text-navy-500 font-semibold">{form.budget.toLocaleString()}원</span>
        </label>
        <input
          type="range"
          min={10000}
          max={200000}
          step={10000}
          value={form.budget}
          onChange={(e) => setForm((prev) => ({ ...prev, budget: Number(e.target.value) }))}
          className="w-full accent-navy-500"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>1만원</span>
          <span>20만원</span>
        </div>
      </div>

      {/* 여행 시간 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">여행 시간</label>
        <div className="flex gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setForm((prev) => ({ ...prev, duration: opt.value }))}
              className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
                form.duration === opt.value
                  ? "bg-navy-500 text-white"
                  : "border border-gray-200 text-gray-600 hover:border-navy-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 동행 유형 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">누구와 함께?</label>
        <div className="flex gap-2">
          {COMPANION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setForm((prev) => ({ ...prev, companion: opt.value }))}
              className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
                form.companion === opt.value
                  ? "bg-navy-500 text-white"
                  : "border border-gray-200 text-gray-600 hover:border-navy-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 에러 */}
      {isError && (
        <p className="text-xs text-red-500">
          코스 생성에 실패했어요. 다시 시도해주세요.
        </p>
      )}

      {/* 제출 */}
      <button
        onClick={handleSubmit}
        disabled={isPending || !form.signgu.trim()}
        className="mt-2 w-full rounded-xl bg-navy-500 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isPending ? "AI가 코스를 짜고 있어요..." : "코스 추천받기"}
      </button>
    </div>
  );
}
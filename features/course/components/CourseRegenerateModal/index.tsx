"use client";

import { useState } from "react";
import { X, MapPin, Wallet, Clock, Users, Sparkles } from "lucide-react";
import RegionModal from "@/components/ui/Modal/RegionModal";
import { useCourseGenerate } from "@/features/course/hooks/useCourseGenerate";
import type { CourseGenerateRequest } from "@/types/course";

const BUDGET_OPTIONS = ["무지출", "1만원", "3만원", "5만원", "제한 없음"];
const TIME_OPTIONS = ["오전", "오후", "반나절"];
const COMPANION_OPTIONS = ["혼자", "연인", "친구", "가족", "단체"];

const BUDGET_MAP: Record<string, number> = {
  "무지출": 0,
  "1만원": 10000,
  "3만원": 30000,
  "5만원": 50000,
  "제한 없음": 200000,
};

const TIME_MAP: Record<string, CourseGenerateRequest["duration"]> = {
  "오전": "HALF_DAY",
  "오후": "HALF_DAY",
  "반나절": "HALF_DAY",
};

const COMPANION_MAP: Record<string, CourseGenerateRequest["companion"]> = {
  "혼자": "SOLO",
  "연인": "COUPLE",
  "친구": "FRIENDS",
  "가족": "FAMILY",
  "단체": "FRIENDS",
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialRegion?: string;
};

export default function CourseRegenerateModal({ isOpen, onClose, initialRegion = "광안리" }: Props) {
  const { mutate, isPending } = useCourseGenerate();

  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedBudget, setSelectedBudget] = useState("5만원");
  const [selectedTime, setSelectedTime] = useState("반나절");
  const [selectedCompanion, setSelectedCompanion] = useState("연인");

  if (!isOpen) return null;

  const handleGenerate = () => {
    mutate(
      {
        signgu: selectedRegion,
        budget: BUDGET_MAP[selectedBudget] ?? 50000,
        duration: TIME_MAP[selectedTime] ?? "HALF_DAY",
        companion: COMPANION_MAP[selectedCompanion] ?? "COUPLE",
      },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50">
              <Sparkles className="w-4 h-4 text-pink-400" />
            </span>
            <h2 className="text-lg font-bold text-gray-900">코스 다시 만들기</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">조건을 바꿔서 새로운 코스를 추천받아 보세요</p>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-5">
          {/* 어디로 */}
          <div>
            <span className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <MapPin className="w-3.5 h-3.5 text-pink-400" /> 어디로
            </span>
            <button
              onClick={() => setIsRegionModalOpen(true)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-800 hover:border-navy-300 transition-colors"
            >
              {selectedRegion}
            </button>
          </div>

          {/* 예산 */}
          <div>
            <span className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <Wallet className="w-3.5 h-3.5 text-pink-400" /> 예산
            </span>
            <div className="flex flex-wrap gap-2">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedBudget(opt)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    selectedBudget === opt
                      ? "bg-navy-400 text-white"
                      : "border border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 시간 */}
          <div>
            <span className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5 text-pink-400" /> 시간
            </span>
            <div className="flex gap-2">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedTime(opt)}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    selectedTime === opt
                      ? "bg-navy-400 text-white"
                      : "border border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 동행 */}
          <div>
            <span className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <Users className="w-3.5 h-3.5 text-pink-400" /> 동행
            </span>
            <div className="flex flex-wrap gap-2">
              {COMPANION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedCompanion(opt)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    selectedCompanion === opt
                      ? "bg-navy-400 text-white"
                      : "border border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="mt-1 w-full rounded-xl bg-pink-400 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-pink-500 disabled:opacity-60 transition-colors"
          >
            {isPending ? "코스 생성 중..." : "✨ 새 코스 만들기"}
          </button>
        </div>
      </div>

      <RegionModal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        selectedRegion={selectedRegion}
        onSelect={(region) => {
          setSelectedRegion(region);
          setIsRegionModalOpen(false);
        }}
      />
    </>
  );
}
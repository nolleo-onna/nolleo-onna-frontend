"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, MapPin, Wallet, Clock, Users, Search } from "lucide-react";
import RegionModal from "@/components/ui/Modal/RegionModal";
import { useCourseGenerate } from "@/features/course/hooks/useCourseGenerate";
import type { CourseGenerateRequest } from "@/types/course";

type Tab = "course" | "spot" | "ai";

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
  "저녁": "HALF_DAY",
  "하루": "ONE_DAY",
  "반나절": "HALF_DAY",
};

const COMPANION_MAP: Record<string, CourseGenerateRequest["companion"]> = {
  "혼자": "SOLO",
  "연인": "COUPLE",
  "친구": "FRIENDS",
  "가족": "FAMILY",
  "단체": "FRIENDS",
};

// 홈 <-> 스팟 페이지를 오가도 검색 조건이 유지되도록 sessionStorage에 저장
const STORAGE_KEY = "searchbar-selection";

type StoredSelection = {
  activeTab: Tab;
  selectedRegion: string;
  selectedBudget: string;
  selectedTime: string;
  selectedCompanion: string;
  hasInteracted: boolean;
};

const DEFAULT_SELECTION: StoredSelection = {
  activeTab: "course",
  selectedRegion: "광안리",
  selectedBudget: "5만원",
  selectedTime: "반나절",
  selectedCompanion: "연인",
  hasInteracted: false,
};

function Chevron({ isOpen }: { isOpen: boolean }) {
  return isOpen ? (
    <ChevronUp className="w-3 h-3 inline-block ml-0.5" />
  ) : (
    <ChevronDown className="w-3 h-3 inline-block ml-0.5" />
  );
}

export default function SearchBar() {
  const router = useRouter();
  const { mutate, isPending } = useCourseGenerate();

  const [activeTab, setActiveTab] = useState<Tab>(DEFAULT_SELECTION.activeTab);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(DEFAULT_SELECTION.selectedRegion);
  const [selectedBudget, setSelectedBudget] = useState(DEFAULT_SELECTION.selectedBudget);
  const [selectedTime, setSelectedTime] = useState(DEFAULT_SELECTION.selectedTime);
  const [selectedCompanion, setSelectedCompanion] = useState(DEFAULT_SELECTION.selectedCompanion);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(DEFAULT_SELECTION.hasInteracted);
  const [isHydrated, setIsHydrated] = useState(false);

  // 최초 마운트 시 sessionStorage에 저장된 값이 있으면 복원
  // (SSR과의 hydration mismatch를 피하기 위해 useEffect에서 처리)
  useEffect(() => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<StoredSelection>;
      /* eslint-disable react-hooks/set-state-in-effect */
      if (saved.activeTab) setActiveTab(saved.activeTab);
      if (saved.selectedRegion) setSelectedRegion(saved.selectedRegion);
      if (saved.selectedBudget) setSelectedBudget(saved.selectedBudget);
      if (saved.selectedTime) setSelectedTime(saved.selectedTime);
      if (saved.selectedCompanion) setSelectedCompanion(saved.selectedCompanion);
      if (saved.hasInteracted) setHasInteracted(saved.hasInteracted);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  } catch {
    // sessionStorage 접근 실패 시 기본값 그대로 사용
  } finally {
    setIsHydrated(true);
  }
}, []);

  // 선택값이 바뀔 때마다 sessionStorage에 저장 (복원 이전에는 저장하지 않음)
  useEffect(() => {
    if (!isHydrated) return;
    const toSave: StoredSelection = {
      activeTab,
      selectedRegion,
      selectedBudget,
      selectedTime,
      selectedCompanion,
      hasInteracted,
    };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // 저장 실패는 무시 (사파리 시크릿 모드 등)
    }
  }, [isHydrated, activeTab, selectedRegion, selectedBudget, selectedTime, selectedCompanion, hasInteracted]);

  const handleTabClick = (tab: Tab) => {
    if (tab === "spot") {
      router.push("/spot");
      return;
    }
    setActiveTab(tab);
  };

  const toggleDropdown = (key: string) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const handleSearch = () => {
    mutate({
      signgu: selectedRegion,
      budget: BUDGET_MAP[selectedBudget] ?? 50000,
      duration: TIME_MAP[selectedTime] ?? "HALF_DAY",
      companion: COMPANION_MAP[selectedCompanion] ?? "COUPLE",
    });
  };

  const handleInteract = () => {
    setHasInteracted(true);
  };

  return (
    <>
      <div
        onClick={handleInteract}
        className={`w-full max-w-3xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col gap-4 ${
          !hasInteracted ? "animate-wiggle" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabClick("course")}
            className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === "course"
                ? "bg-navy-400 text-white"
                : "border border-gray-300 text-gray-600"
            }`}
          >
            코스 추천
          </button>
          <button
            onClick={() => handleTabClick("spot")}
            className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-gray-300 text-gray-600"
          >
            스팟 검색
          </button>
          <button
            onClick={() => handleTabClick("ai")}
            className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-pink-400 text-pink-400"
          >
            ✨ AI 에게 말하기
          </button>
        </div>

        {/* 필드 */}
        {(activeTab === "course" || activeTab === "ai") && (
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:divide-x sm:divide-gray-200 sm:gap-0">
            {/* 어디로 */}
            <button
              onClick={() => setIsRegionModalOpen(true)}
              className="flex flex-col gap-0.5 px-3 py-2 text-left border border-gray-100 rounded-xl
                         sm:flex-1 sm:px-4 sm:py-0 sm:border-0 sm:rounded-none"
            >
              <span className="text-xs text-gray-400">어디로</span>
              <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-pink-400" />
                {selectedRegion}
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </span>
            </button>

            {/* 예산 */}
            <div className="relative px-3 py-2 border border-gray-100 rounded-xl
                            sm:flex-1 sm:px-4 sm:py-0 sm:border-0 sm:rounded-none">
              <button
                onClick={() => toggleDropdown("budget")}
                className="flex flex-col gap-0.5 w-full text-left"
              >
                <span className="text-xs text-gray-400">예산</span>
                <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-pink-400" />
                  {selectedBudget}
                  <Chevron isOpen={openDropdown === "budget"} />
                </span>
              </button>
              {openDropdown === "budget" && (
                <ul className="absolute top-full left-0 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-md z-20 overflow-hidden">
                  {BUDGET_OPTIONS.map((opt) => (
                    <li
                      key={opt}
                      onClick={() => { setSelectedBudget(opt); setOpenDropdown(null); }}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 시간 */}
            <div className="relative px-3 py-2 border border-gray-100 rounded-xl
                            sm:flex-1 sm:px-4 sm:py-0 sm:border-0 sm:rounded-none">
              <button
                onClick={() => toggleDropdown("time")}
                className="flex flex-col gap-0.5 w-full text-left"
              >
                <span className="text-xs text-gray-400">시간</span>
                <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-pink-400" />
                  {selectedTime}
                  <Chevron isOpen={openDropdown === "time"} />
                </span>
              </button>
              {openDropdown === "time" && (
                <ul className="absolute top-full left-0 mt-2 w-32 bg-white border border-gray-200 rounded-xl shadow-md z-20 overflow-hidden">
                  {TIME_OPTIONS.map((opt) => (
                    <li
                      key={opt}
                      onClick={() => { setSelectedTime(opt); setOpenDropdown(null); }}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 동행 */}
            <div className="relative px-3 py-2 border border-gray-100 rounded-xl
                            sm:flex-1 sm:px-4 sm:py-0 sm:border-0 sm:rounded-none">
              <button
                onClick={() => toggleDropdown("companion")}
                className="flex flex-col gap-0.5 w-full text-left"
              >
                <span className="text-xs text-gray-400">동행</span>
                <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-pink-400" />
                  {selectedCompanion}
                  <Chevron isOpen={openDropdown === "companion"} />
                </span>
              </button>
              {openDropdown === "companion" && (
                <ul className="absolute top-full left-0 mt-2 w-32 bg-white border border-gray-200 rounded-xl shadow-md z-20 overflow-hidden">
                  {COMPANION_OPTIONS.map((opt) => (
                    <li
                      key={opt}
                      onClick={() => { setSelectedCompanion(opt); setOpenDropdown(null); }}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 검색 버튼 */}
            <div className="col-span-2 sm:col-auto sm:pl-4">
              <button
                onClick={handleSearch}
                disabled={isPending}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5
                           px-6 py-3 rounded-xl bg-pink-400 text-white text-sm font-semibold
                           whitespace-nowrap disabled:opacity-60"
              >
                <Search className="w-4 h-4" />
                {isPending ? "생성 중..." : "검색"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 지역 모달 */}
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, MapPin, PartyPopper, Sparkles, Star, Wallet, X } from "lucide-react";
import RegionModal from "@/components/ui/Modal/RegionModal";
import { ASSISTANT_NAME } from "@/constants/assistant";
import {
  COURSE_BUDGET_LABEL,
  COURSE_BUDGET_OPTIONS,
  COURSE_INCLUDE_SPOTS_MAX,
  COURSE_PLACE_NAME_MAX,
  courseBudgetAmount,
  normalizeStartArea,
} from "@/constants/course";
import { useAIChatContext } from "@/providers/AIChatProvider";
import { SEARCHBAR_SELECTION_KEY } from "@/features/home/utils/searchBarSelection";
import { CourseGenerateError, generateCourse } from "@/libs/api/course";
import { saveCourseBudget } from "@/features/course/utils/budgetStorage";
import { buildCourseNotices, saveCourseNotices } from "@/features/course/utils/courseNotices";
import SuggestField, { type Suggestion } from "@/features/home/components/SearchBar/SuggestField";
import {
  useDebouncedValue,
  useFestivalSuggestions,
  useSpotSuggestions,
} from "@/features/home/hooks/useCourseFormSuggestions";
import type { CourseBudgetTier } from "@/types/course";

type Tab = "course" | "spot";

const STORAGE_KEY = SEARCHBAR_SELECTION_KEY;

// 지역·예산만 저장한다. 꼭 갈 곳·행사는 그때그때 다른 조건이라 남겨두면 오히려 방해된다.
type StoredSelection = {
  activeTab: Tab;
  selectedRegion: string;
  budgetTier: CourseBudgetTier;
  hasInteracted: boolean;
};

const DEFAULT_SELECTION: StoredSelection = {
  activeTab: "course",
  selectedRegion: "광안리",
  budgetTier: "UNDER_50K",
  hasInteracted: false,
};

function isBudgetTier(value: unknown): value is CourseBudgetTier {
  return COURSE_BUDGET_OPTIONS.some((o) => o.tier === value);
}

// ── 필드 카드 ────────────────────────────────────────────────────────────────
type FieldCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
};

function FieldCard({ icon, iconBg, label, value, onClick, disabled = false, children }: FieldCardProps) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full flex items-center gap-3 rounded-2xl bg-gray-50 p-3.5
                   hover:bg-gray-100 active:scale-[0.98] transition-all duration-150 text-left
                   disabled:cursor-not-allowed disabled:bg-gray-50/60 disabled:hover:bg-gray-50/60 disabled:active:scale-100"
      >
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${disabled ? "opacity-40" : ""}`}
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-gray-400 leading-none mb-1">{label}</p>
          <p className={`text-[15px] font-semibold truncate ${disabled ? "text-gray-400" : "text-gray-800"}`}>
            {value}
          </p>
        </div>
        {!disabled && <ChevronDown className="w-4 h-4 text-gray-300 flex-shrink-0" />}
      </button>
      {children}
    </div>
  );
}

// ── 드롭다운 ──────────────────────────────────────────────────────────────────
function Dropdown({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <ul className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100
                   rounded-2xl shadow-[0_8px_24px_rgba(13,48,128,0.12)] z-30 overflow-hidden py-1">
      {options.map((opt) => (
        <li
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
            selected === opt.value
              ? "text-ocean-600 font-semibold bg-ocean-50/60"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {opt.label}
        </li>
      ))}
    </ul>
  );
}

// ── 고른 장소 칩 ──────────────────────────────────────────────────────────────
function SpotChips({ spots, onRemove }: { spots: string[]; onRemove: (name: string) => void }) {
  if (spots.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {spots.map((name) => (
        <span
          key={name}
          className="inline-flex max-w-full items-center gap-1 rounded-full bg-ocean-50 py-1 pl-3 pr-1.5
                     text-[13px] font-medium text-ocean-600"
        >
          <span className="min-w-0 truncate">{name}</span>
          <button
            type="button"
            onClick={() => onRemove(name)}
            aria-label={`${name} 빼기`}
            className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full
                       text-ocean-400 transition-colors hover:bg-ocean-100 hover:text-ocean-600"
          >
            <X className="h-3 w-3" strokeWidth={2.5} />
          </button>
        </span>
      ))}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
interface SearchBarProps {
  /**
   * formOnly — 탭·"온나에게 물어보기" 헤더와 카드 테두리를 빼고 코스 조건 폼만 그린다.
   * 채팅을 따로 크게 보여주는 히어로 안에 폼을 보조로 넣을 때 쓴다.
   */
  variant?: "default" | "formOnly";
}

export default function SearchBar({ variant = "default" }: SearchBarProps) {
  const formOnly = variant === "formOnly";
  const router = useRouter();
  const { openChat } = useAIChatContext();

  const [activeTab, setActiveTab] = useState<Tab>(DEFAULT_SELECTION.activeTab);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(DEFAULT_SELECTION.selectedRegion);
  const [budgetTier, setBudgetTier] = useState<CourseBudgetTier>(DEFAULT_SELECTION.budgetTier);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(DEFAULT_SELECTION.hasInteracted);
  const [isHydrated, setIsHydrated] = useState(false);

  // 꼭 갈 곳 · 행사 (둘 다 선택)
  const [spotQuery, setSpotQuery] = useState("");
  const [includeSpots, setIncludeSpots] = useState<string[]>([]);
  const [festivalQuery, setFestivalQuery] = useState("");
  const [festival, setFestival] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSpotQuery = useDebouncedValue(spotQuery);
  const debouncedFestivalQuery = useDebouncedValue(festivalQuery);
  const spotSuggest = useSpotSuggestions(debouncedSpotQuery);
  const festivalSuggest = useFestivalSuggestions(debouncedFestivalQuery);

  // sessionStorage 복원
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<StoredSelection>;
        /* eslint-disable react-hooks/set-state-in-effect */
        if (saved.activeTab) setActiveTab(saved.activeTab);
        // 혼잡도 화면에서 "해운대구"처럼 행정구역명으로 프리셋될 수 있어 지원 지역으로 맞춘다
        const region = normalizeStartArea(saved.selectedRegion);
        if (region) setSelectedRegion(region);
        if (isBudgetTier(saved.budgetTier)) setBudgetTier(saved.budgetTier);
        if (saved.hasInteracted) setHasInteracted(saved.hasInteracted);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      // sessionStorage 접근 실패 시 기본값 사용
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // sessionStorage 저장
  useEffect(() => {
    if (!isHydrated) return;
    const toSave: StoredSelection = { activeTab, selectedRegion, budgetTier, hasInteracted };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // 저장 실패 무시
    }
  }, [isHydrated, activeTab, selectedRegion, budgetTier, hasInteracted]);

  const toggleDropdown = (key: string) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const handleTabClick = (tab: Tab) => {
    if (tab === "spot") {
      router.push("/spot");
      return;
    }
    setActiveTab(tab);
  };

  const pickSpot = (s: Suggestion) => {
    setSpotQuery("");
    setIncludeSpots((prev) =>
      prev.includes(s.title) || prev.length >= COURSE_INCLUDE_SPOTS_MAX ? prev : [...prev, s.title],
    );
  };

  const pickFestival = (s: Suggestion) => {
    setFestival(s.title);
    setFestivalQuery(s.title);
  };

  const clearFestival = () => {
    setFestival(null);
    setFestivalQuery("");
  };

  // 검색 버튼 → 폼 그대로 코스 생성 (AI 호출 없음, 보통 1초 안에 끝난다)
  const handleSearch = async () => {
    if (isGenerating) return;
    setError(null);
    setIsGenerating(true);

    try {
      const result = await generateCourse({
        startArea: selectedRegion,
        budget: budgetTier,
        ...(includeSpots.length > 0 ? { includeSpots } : {}),
        ...(festival ? { festival } : {}),
      });

      const budget = courseBudgetAmount(result.applied.budget.tier);
      if (budget !== undefined) saveCourseBudget(result.pairId, budget);

      // 요청과 다르게 적용된 조건(축제 위치로 바뀐 지역, 못 찾은 장소 등)은
      // 결과 화면에서 알려준다.
      saveCourseNotices(
        result.pairId,
        buildCourseNotices({
          requestedArea: selectedRegion,
          applied: result.applied,
          unmatched: result.unmatched,
        }),
      );

      const budgetParam = budget !== undefined ? `&budget=${budget}` : "";
      router.push(`/course/result?pairId=${result.pairId}${budgetParam}`);
    } catch (err) {
      // 401은 clientFetch가 이미 로그인 페이지로 보내는 중이라 여기서 더 알리지 않는다
      setError(
        err instanceof CourseGenerateError && err.status !== 401
          ? err.message
          : "코스를 만들지 못했어요. 잠시 후 다시 시도해주세요",
      );
      setIsGenerating(false);
    }
  };

  const handleInteract = () => setHasInteracted(true);
  const spotsFull = includeSpots.length >= COURSE_INCLUDE_SPOTS_MAX;

  return (
    <>
      <div
        id="search-bar"
        onClick={handleInteract}
        className={
          formOnly
            ? "w-full"
            : `w-full max-w-3xl mx-auto rounded-3xl border border-gray-100 bg-white
                    shadow-[0_4px_24px_rgba(13,48,128,0.06)] p-5 ${
                      !hasInteracted ? "animate-wiggle" : ""
                    }`
        }
      >
        {/* ── 상단: 탭 + AI 버튼 ── */}
        {!formOnly && (
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="inline-flex bg-gray-50 rounded-xl p-1 gap-0.5">
            <button
              onClick={() => handleTabClick("course")}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-semibold transition-all ${
                activeTab === "course"
                  ? "bg-white text-[#0d3080] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              코스 추천
            </button>
            <button
              onClick={() => handleTabClick("spot")}
              className="px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-semibold text-gray-500 hover:text-gray-700 transition-all"
            >
              스팟 검색
            </button>
          </div>

          <button
            onClick={() => openChat()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-ocean-50
                       text-ocean-600 text-xs sm:text-[13px] font-semibold
                       hover:bg-ocean-100 active:scale-95 transition-all whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {ASSISTANT_NAME}에게 물어보기
          </button>
        </div>
        )}

        {/* ── 필드 ── */}
        {(formOnly || activeTab === "course") && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <FieldCard
                icon={<MapPin className="w-[19px] h-[19px]" style={{ color: "#185FA5" }} />}
                iconBg="#E6F1FB"
                label="어디로"
                // 축제를 고르면 서버가 지역을 축제 위치로 바꾸므로, 고를 수 있는 것처럼 두지 않는다
                value={festival ? "축제 위치 기준" : selectedRegion}
                disabled={!!festival}
                onClick={() => setIsRegionModalOpen(true)}
              />

              <FieldCard
                icon={<Wallet className="w-[19px] h-[19px]" style={{ color: "#3B6D11" }} />}
                iconBg="#EAF3DE"
                label="예산"
                value={COURSE_BUDGET_LABEL[budgetTier]}
                onClick={() => toggleDropdown("budget")}
              >
                {openDropdown === "budget" && (
                  <Dropdown
                    options={COURSE_BUDGET_OPTIONS.map((o) => ({ value: o.tier, label: o.label }))}
                    selected={budgetTier}
                    onSelect={(v) => {
                      if (isBudgetTier(v)) setBudgetTier(v);
                      setOpenDropdown(null);
                    }}
                  />
                )}
              </FieldCard>
            </div>

            {/* ── 행사 (선택) ── */}
            <div className="mb-3">
              <SuggestField
                icon={<PartyPopper className="w-[19px] h-[19px]" style={{ color: "#993556" }} />}
                iconBg="#FBEAF0"
                label="행사 · 축제 (선택)"
                placeholder="불꽃축제, 드론쇼처럼 가고 싶은 행사"
                query={festivalQuery}
                onQueryChange={(v) => {
                  setFestivalQuery(v);
                  if (festival) setFestival(null);
                }}
                suggestions={festivalSuggest.suggestions}
                isLoading={festivalSuggest.isLoading}
                onPick={pickFestival}
                maxLength={COURSE_PLACE_NAME_MAX}
              />
              {festival && (
                <div className="mt-2 flex items-center gap-2 px-1">
                  <p className="min-w-0 flex-1 truncate text-[12px] text-ocean-600">
                    {festival} 근처로 코스를 만들어요 — 지역은 축제 위치를 따라가요
                  </p>
                  <button
                    type="button"
                    onClick={clearFestival}
                    className="flex-shrink-0 text-[12px] font-medium text-gray-400 transition-colors hover:text-gray-600"
                  >
                    지우기
                  </button>
                </div>
              )}
            </div>

            {/* ── 꼭 갈 곳 (선택) ── */}
            <div className="mb-4">
              <SuggestField
                icon={<Star className="w-[19px] h-[19px]" style={{ color: "#854F0B" }} />}
                iconBg="#FAEEDA"
                label={`꼭 갈 곳 (선택 · ${includeSpots.length}/${COURSE_INCLUDE_SPOTS_MAX})`}
                placeholder={spotsFull ? "5곳까지 담을 수 있어요" : "이재모피자처럼 꼭 들를 곳"}
                query={spotQuery}
                onQueryChange={setSpotQuery}
                suggestions={spotSuggest.suggestions}
                isLoading={spotSuggest.isLoading}
                onPick={pickSpot}
                maxLength={COURSE_PLACE_NAME_MAX}
                disabled={spotsFull}
                disabledHint={`${COURSE_INCLUDE_SPOTS_MAX}곳까지 담을 수 있어요`}
              >
                <SpotChips
                  spots={includeSpots}
                  onRemove={(name) => setIncludeSpots((prev) => prev.filter((n) => n !== name))}
                />
              </SuggestField>
            </div>

            {error && (
              <p role="alert" className="mb-3 px-1 text-[13px] font-medium text-red-500">
                {error}
              </p>
            )}

            {/* ── 검색 버튼 ── */}
            <button
              onClick={handleSearch}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-4
                         bg-gradient-to-r from-[#34a6ff] to-[#0a84ff] text-white
                         text-[15px] font-bold
                         shadow-[0_4px_16px_rgba(10,132,255,0.35)]
                         hover:shadow-[0_6px_22px_rgba(10,132,255,0.45)]
                         hover:brightness-105 active:scale-[0.98]
                         disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:brightness-100 disabled:active:scale-100
                         transition-all duration-150"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-[18px] h-[18px] animate-spin" />
                  코스 만드는 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-[18px] h-[18px]" />
                  내 코스 만들기
                </>
              )}
            </button>
          </>
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

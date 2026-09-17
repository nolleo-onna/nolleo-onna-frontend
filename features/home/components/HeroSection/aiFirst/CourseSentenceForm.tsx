"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Loader2, MapPin, PartyPopper, Plus, Search, Star, Wallet, X } from "lucide-react";

import {
  COURSE_BUDGET_LABEL,
  COURSE_BUDGET_OPTIONS,
  COURSE_INCLUDE_SPOTS_MAX,
  COURSE_PLACE_NAME_MAX,
  COURSE_START_AREAS,
} from "@/constants/course";
import {
  useDebouncedValue,
  useFestivalSuggestions,
  useSpotSuggestions,
} from "@/features/home/hooks/useCourseFormSuggestions";
import { useGenerateCourse } from "@/features/home/hooks/useGenerateCourse";
import type { Suggestion } from "@/features/home/components/SearchBar/SuggestField";
import type { CourseBudgetTier } from "@/types/course";

type Slot = "area" | "budget" | "festival" | "spot";

const PANEL_TITLE: Record<Slot, string> = {
  area: "어디서 놀까요?",
  budget: "예산은 얼마 안으로?",
  festival: "가고 싶은 행사가 있나요?",
  spot: "꼭 들를 곳을 담아주세요",
};

// ── 문장 속 빈칸 ────────────────────────────────────────────────────────────
interface BlankProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
  /** 선택 칸인데 아직 비어 있으면 점선으로 그린다 */
  isEmpty?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function Blank({ icon, children, isActive, isEmpty = false, disabled = false, onClick }: BlankProps) {
  const tone = disabled
    ? "border-white/15 bg-white/10 text-white/50 cursor-not-allowed"
    : isEmpty
      ? "border-dashed border-white/50 text-white/75 hover:bg-white/10 hover:text-white"
      : "border-transparent bg-white text-navy-900 shadow-[0_8px_20px_-10px_rgba(5,12,26,0.8)] hover:-translate-y-0.5";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-expanded={isActive}
      className={`relative mx-0.5 inline-flex max-w-full translate-y-[-2px] items-center gap-1.5 rounded-2xl border-[1.5px] px-3 py-1 align-middle text-[0.8em] font-bold transition-all ${tone} ${
        isActive ? "outline outline-[3px] outline-offset-2 outline-lime-300" : ""
      }`}
    >
      <span className="shrink-0 [&>svg]:h-[0.95em] [&>svg]:w-[0.95em]">{icon}</span>
      <span className="min-w-0 truncate">{children}</span>
    </button>
  );
}

// ── 검색해서 고르는 패널 (행사 · 꼭 갈 곳) ────────────────────────────────────
interface SearchPickerProps {
  placeholder: string;
  suggestions: Suggestion[];
  isLoading: boolean;
  query: string;
  onQueryChange: (v: string) => void;
  onPick: (s: Suggestion) => void;
  isPicked: (s: Suggestion) => boolean;
  disabled?: boolean;
}

function SearchPicker({
  placeholder,
  suggestions,
  isLoading,
  query,
  onQueryChange,
  onPick,
  isPicked,
  disabled = false,
}: SearchPickerProps) {
  const hasQuery = query.trim().length > 0;

  return (
    <div>
      <label className="flex items-center gap-2.5 rounded-2xl bg-gray-100 px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-ocean-300">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            // 한글 조합 중 Enter는 글자 확정이라 고르지 않는다
            if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
            e.preventDefault();
            if (suggestions[0]) onPick(suggestions[0]);
          }}
          placeholder={placeholder}
          maxLength={COURSE_PLACE_NAME_MAX}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
        />
        {isLoading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-300" />}
      </label>

      {hasQuery && !isLoading && suggestions.length === 0 && (
        <p className="px-1 pt-3 text-[13px] text-gray-400">검색 결과가 없어요</p>
      )}
      {suggestions.length > 0 && (
        <ul className="mt-2 grid max-h-56 gap-1 overflow-y-auto sm:grid-cols-2">
          {suggestions.map((s) => {
            const picked = isPicked(s);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onPick(s)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors ${
                    picked ? "bg-ocean-50 text-ocean-600" : "text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate font-semibold">{s.title}</span>
                  {s.meta && <span className="shrink-0 text-[12px] text-gray-400">{s.meta}</span>}
                  {picked && <Check className="h-4 w-4 shrink-0" strokeWidth={3} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * 조건 골라 내 코스 만들기 — 입력칸 대신 "빈칸 채우기 문장".
 * "[광안리]에서 [5만원] 안으로 놀래요" 처럼 말하듯 읽히게 해서, 채팅이 메인인 히어로 안에서도
 * 같은 결로 보인다. 빈칸을 누르면 문장 아래로 고르는 판이 열린다.
 */
export default function CourseSentenceForm() {
  const [area, setArea] = useState<string>("광안리");
  const [budget, setBudget] = useState<CourseBudgetTier>("UNDER_50K");
  const [festival, setFestival] = useState<string | null>(null);
  const [includeSpots, setIncludeSpots] = useState<string[]>([]);
  const [openSlot, setOpenSlot] = useState<Slot | null>(null);

  const [festivalQuery, setFestivalQuery] = useState("");
  const [spotQuery, setSpotQuery] = useState("");
  const festivalSuggest = useFestivalSuggestions(useDebouncedValue(festivalQuery));
  const spotSuggest = useSpotSuggestions(useDebouncedValue(spotQuery));

  const { generate, isGenerating, error } = useGenerateCourse();
  const cardRef = useRef<HTMLDivElement>(null);

  // 카드 바깥을 누르면 고르는 판을 닫는다
  useEffect(() => {
    if (!openSlot) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (target.isConnected && !cardRef.current?.contains(target)) setOpenSlot(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openSlot]);

  const toggle = (slot: Slot) => setOpenSlot((prev) => (prev === slot ? null : slot));
  const spotsFull = includeSpots.length >= COURSE_INCLUDE_SPOTS_MAX;

  const pickFestival = (s: Suggestion) => {
    setFestival(s.title);
    setFestivalQuery("");
    setOpenSlot(null);
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

  return (
    <div
      ref={cardRef}
      className="relative w-full overflow-hidden rounded-[32px] bg-navy-900/45 p-6 text-left shadow-[0_30px_80px_-40px_rgba(5,12,26,0.9)] ring-1 ring-inset ring-white/15 backdrop-blur-xl md:p-9"
    >
      <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-ocean-400/20 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-white/60">대화 없이 조건만 골라서</p>
        <span className="rounded-full bg-lime-300/15 px-2.5 py-1 text-[11px] font-semibold text-lime-300">
          횟수 제한 없음 · 약 1초
        </span>
      </div>

      {/* ── 빈칸 채우기 문장 ── */}
      <p className="relative mt-4 text-[22px] font-semibold leading-[2.1] tracking-tight text-white break-keep md:text-[30px]">
        <Blank
          icon={<MapPin />}
          isActive={openSlot === "area"}
          // 축제를 고르면 서버가 지역을 축제 위치로 바꾸므로 고를 수 있는 것처럼 두지 않는다
          disabled={!!festival}
          onClick={() => toggle("area")}
        >
          {festival ? "축제 근처" : area}
        </Blank>
        에서{" "}
        <Blank icon={<Wallet />} isActive={openSlot === "budget"} onClick={() => toggle("budget")}>
          {COURSE_BUDGET_LABEL[budget]}
        </Blank>
        {budget === "UNLIMITED" ? " 넉넉하게 놀래요." : budget === "NONE" ? "로 놀래요." : " 안으로 놀래요."}
        <br />
        <Blank
          icon={<PartyPopper />}
          isActive={openSlot === "festival"}
          isEmpty={!festival}
          onClick={() => toggle("festival")}
        >
          {festival ?? "행사"}
        </Blank>
        도 보고,{" "}
        {includeSpots.map((name) => (
          <Blank key={name} icon={<Star />} isActive={openSlot === "spot"} onClick={() => toggle("spot")}>
            {name}
          </Blank>
        ))}
        {!spotsFull && (
          <Blank
            icon={includeSpots.length > 0 ? <Plus /> : <Star />}
            isActive={openSlot === "spot" && includeSpots.length === 0}
            isEmpty
            onClick={() => toggle("spot")}
          >
            {includeSpots.length > 0 ? "더" : "꼭 갈 곳"}
          </Blank>
        )}
        엔 꼭 들를래요.
      </p>

      {/* ── 빈칸을 고르는 판 ── */}
      <AnimatePresence initial={false}>
        {openSlot && (
          <motion.div
            key="picker"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden"
          >
            <div className="mt-5 rounded-3xl bg-white p-4 shadow-[0_24px_60px_-24px_rgba(5,12,26,0.8)] md:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[15px] font-bold text-gray-900">
                  {PANEL_TITLE[openSlot]}
                  {(openSlot === "festival" || openSlot === "spot") && (
                    <span className="ml-1.5 text-[12px] font-medium text-gray-400">
                      선택{openSlot === "spot" && ` · ${includeSpots.length}/${COURSE_INCLUDE_SPOTS_MAX}`}
                    </span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setOpenSlot(null)}
                  aria-label="닫기"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {openSlot === "area" && (
                <div className="flex flex-wrap gap-2">
                  {COURSE_START_AREAS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setArea(name);
                        setOpenSlot("budget");
                      }}
                      className={`rounded-full px-4 py-2 text-[14px] font-semibold transition-colors ${
                        area === name ? "bg-navy-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}

              {openSlot === "budget" && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {COURSE_BUDGET_OPTIONS.map((o, i) => (
                    <button
                      key={o.tier}
                      type="button"
                      onClick={() => {
                        setBudget(o.tier);
                        setOpenSlot(null);
                      }}
                      className={`flex flex-col items-start gap-2 rounded-2xl p-3 text-left transition-colors ${
                        budget === o.tier ? "bg-navy-900 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {/* 동전 개수로 예산 크기를 한눈에 */}
                      <span className="flex h-3 items-end gap-0.5" aria-hidden>
                        {Array.from({ length: COURSE_BUDGET_OPTIONS.length - 1 }, (_, n) => (
                          <span
                            key={n}
                            className={`w-1.5 rounded-full ${n < i ? (budget === o.tier ? "bg-lime-300" : "bg-ocean-400") : budget === o.tier ? "bg-white/20" : "bg-gray-300"}`}
                            style={{ height: `${40 + n * 20}%` }}
                          />
                        ))}
                      </span>
                      <span className="text-[15px] font-bold">{o.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {openSlot === "festival" && (
                <>
                  <SearchPicker
                    placeholder="불꽃축제, 드론쇼처럼 가고 싶은 행사"
                    query={festivalQuery}
                    onQueryChange={setFestivalQuery}
                    suggestions={festivalSuggest.suggestions}
                    isLoading={festivalSuggest.isLoading}
                    onPick={pickFestival}
                    isPicked={(s) => s.title === festival}
                  />
                  {festival && (
                    <div className="mt-3 flex items-center gap-2 rounded-2xl bg-ocean-50 px-4 py-2.5">
                      <p className="min-w-0 flex-1 truncate text-[13px] text-ocean-600">
                        <b>{festival}</b> 근처로 짜요 — 지역은 축제 위치를 따라가요
                      </p>
                      <button
                        type="button"
                        onClick={() => setFestival(null)}
                        className="shrink-0 text-[13px] font-semibold text-gray-500 hover:text-gray-800"
                      >
                        빼기
                      </button>
                    </div>
                  )}
                </>
              )}

              {openSlot === "spot" && (
                <>
                  {includeSpots.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {includeSpots.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setIncludeSpots((prev) => prev.filter((n) => n !== name))}
                          className="inline-flex items-center gap-1 rounded-full bg-navy-900 py-1.5 pl-3 pr-2 text-[13px] font-semibold text-white"
                          aria-label={`${name} 빼기`}
                        >
                          {name}
                          <X className="h-3.5 w-3.5 text-white/60" />
                        </button>
                      ))}
                    </div>
                  )}
                  <SearchPicker
                    placeholder={spotsFull ? `${COURSE_INCLUDE_SPOTS_MAX}곳까지 담을 수 있어요` : "이재모피자처럼 꼭 들를 곳"}
                    query={spotQuery}
                    onQueryChange={setSpotQuery}
                    suggestions={spotSuggest.suggestions}
                    isLoading={spotSuggest.isLoading}
                    onPick={toggleSpot}
                    isPicked={(s) => includeSpots.includes(s.title)}
                    disabled={spotsFull}
                  />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 만들기 ── */}
      <div className="relative mt-7 flex flex-col-reverse items-stretch gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-white/50 break-keep">
          {error ? (
            <span role="alert" className="font-semibold text-rose-300">
              {error}
            </span>
          ) : (
            "점선 칸은 비워 둬도 돼요"
          )}
        </p>
        <button
          type="button"
          onClick={() => generate({ startArea: area, budget, includeSpots, festival })}
          disabled={isGenerating}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-bold text-navy-900 transition-all hover:bg-lime-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
              코스 만드는 중...
            </>
          ) : (
            <>
              이 문장으로 코스 만들기
              <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

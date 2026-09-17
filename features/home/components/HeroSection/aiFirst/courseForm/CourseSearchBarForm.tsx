"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, MapPin, PartyPopper, Search, Sparkles, Star, Wallet, X } from "lucide-react";

import { COURSE_BUDGET_LABEL, COURSE_INCLUDE_SPOTS_MAX, COURSE_PLACE_NAME_MAX } from "@/constants/course";
import type { Suggestion } from "@/features/home/components/SearchBar/SuggestField";
import { AreaPicker, BudgetPicker } from "./Pickers";
import { useCourseFormState, type CourseSlot } from "./useCourseFormState";

const SLOT_META: Record<CourseSlot, { label: string; icon: React.ReactNode; tint: string }> = {
  area: { label: "어디서", icon: <MapPin />, tint: "bg-ocean-50 text-ocean-500" },
  budget: { label: "예산", icon: <Wallet />, tint: "bg-lime-100 text-lime-700" },
  festival: { label: "행사", icon: <PartyPopper />, tint: "bg-pink-50 text-pink-500" },
  spot: { label: "꼭 갈 곳", icon: <Star />, tint: "bg-amber-50 text-amber-500" },
};

/** 검색어와 겹치는 부분을 굵게 — "이재" → **이재**모피자 본점 */
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  const at = needle ? text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-[4px] bg-lime-200/80 px-0.5 text-gray-900">{text.slice(at, at + needle.length)}</mark>
      {text.slice(at + needle.length)}
    </>
  );
}

interface ResultListProps {
  id: string;
  query: string;
  suggestions: Suggestion[];
  isLoading: boolean;
  activeIndex: number;
  onHover: (i: number) => void;
  onPick: (s: Suggestion) => void;
  isPicked: (s: Suggestion) => boolean;
  emptyHint: React.ReactNode;
  fallbackIcon: React.ReactNode;
}

function ResultList({ id, query, suggestions, isLoading, activeIndex, onHover, onPick, isPicked, emptyHint, fallbackIcon }: ResultListProps) {
  if (!query.trim()) return <div className="px-2 py-3 text-[13px] text-gray-400">{emptyHint}</div>;

  if (suggestions.length === 0) {
    return (
      <div className="flex items-center gap-2 px-2 py-3 text-[13px] text-gray-400">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> 찾는 중...
          </>
        ) : (
          <>&lsquo;{query.trim()}&rsquo;와 비슷한 곳이 없어요 — 이름 일부만 쳐보세요</>
        )}
      </div>
    );
  }

  return (
    <ul id={id} role="listbox" className="grid max-h-[288px] gap-1 overflow-y-auto sm:grid-cols-2">
      {suggestions.map((s, i) => {
        const picked = isPicked(s);
        return (
          <li key={s.id} role="option" aria-selected={i === activeIndex}>
            <button
              type="button"
              // onMouseDown이어야 입력칸 blur보다 먼저 잡힌다
              onMouseDown={(e) => {
                e.preventDefault();
                onPick(s);
              }}
              onMouseEnter={() => onHover(i)}
              className={`flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors ${
                i === activeIndex ? "bg-gray-100" : ""
              }`}
            >
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 text-gray-400 [&>svg]:h-5 [&>svg]:w-5">
                {s.imageUrl ? <Image src={s.imageUrl} alt="" fill sizes="48px" className="object-cover" /> : fallbackIcon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-gray-900">
                  <Highlight text={s.title} query={query} />
                </span>
                <span className="mt-0.5 block truncate text-[12px] text-gray-400">
                  {[s.meta, s.badge].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                  picked ? "bg-navy-900 text-white" : "text-gray-300"
                }`}
              >
                {picked ? <Check className="h-4 w-4" strokeWidth={3} /> : <PlusDot />}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

const PlusDot = () => <span className="text-[18px] leading-none">+</span>;

/**
 * 조건 폼 시안 · 한 줄 검색 바
 * 지역 | 예산 | 행사 | 꼭 갈 곳을 한 줄에. 행사·꼭 갈 곳은 칸 안에서 바로 쳐서 찾는다 —
 * 스팟 장소 이름 일부("이재")만 쳐도 아래로 사진과 함께 후보("이재모피자 본점")가 뜬다.
 */
export default function CourseSearchBarForm() {
  const rootRef = useRef<HTMLDivElement>(null);
  const form = useCourseFormState(rootRef);
  const { area, budget, festival, includeSpots, openSlot, spotsFull, isGenerating, error } = form;

  // 판 위 꼬리 위치(px) — 누른 칸 가운데를 가리킨다
  const [caretX, setCaretX] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();

  const open = (slot: CourseSlot, el: HTMLElement) => {
    setCaretX(el.offsetLeft + el.offsetWidth / 2);
    setActiveIndex(-1);
    form.setOpenSlot(slot);
  };

  const isSearchSlot = openSlot === "festival" || openSlot === "spot";
  const query = openSlot === "festival" ? form.festivalQuery : form.spotQuery;
  const suggest = openSlot === "festival" ? form.festivalSuggest : form.spotSuggest;

  const pick = (s: Suggestion) => {
    setActiveIndex(-1);
    if (openSlot === "festival") {
      form.pickFestival(s);
      form.setOpenSlot(null);
    } else {
      form.toggleSpot(s);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const list = suggest.suggestions;
    if (e.key === "Escape") {
      form.setOpenSlot(null);
    } else if (e.key === "ArrowDown" && list.length > 0) {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % list.length);
    } else if (e.key === "ArrowUp" && list.length > 0) {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? list.length - 1 : i - 1));
    } else if (e.key === "Enter" && !e.nativeEvent.isComposing && list.length > 0) {
      e.preventDefault();
      pick(list[activeIndex >= 0 ? activeIndex : 0]);
    } else if (e.key === "Backspace" && openSlot === "spot" && !form.spotQuery && includeSpots.length > 0) {
      form.removeSpot(includeSpots[includeSpots.length - 1]);
    }
  };

  const summaryOf = (slot: CourseSlot): { text: string; empty: boolean } => {
    switch (slot) {
      case "area":
        return { text: festival ? "축제 근처" : area, empty: false };
      case "budget":
        return { text: COURSE_BUDGET_LABEL[budget], empty: false };
      case "festival":
        return { text: festival ?? "행사 검색", empty: !festival };
      case "spot":
        return {
          text:
            includeSpots.length === 0
              ? "장소 검색"
              : includeSpots.length === 1
                ? includeSpots[0]
                : `${includeSpots[0]} 외 ${includeSpots.length - 1}곳`,
          empty: includeSpots.length === 0,
        };
    }
  };

  const renderSegment = (slot: CourseSlot) => {
    const meta = SLOT_META[slot];
    const isActive = openSlot === slot;
    const disabled = slot === "area" && !!festival;
    const summary = summaryOf(slot);
    const typing = isActive && (slot === "festival" || slot === "spot");

    return (
      <div
        key={slot}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isActive}
        aria-disabled={disabled}
        onClick={(e) => !disabled && !isActive && open(slot, e.currentTarget)}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled && !isActive && e.target === e.currentTarget) {
            e.preventDefault();
            open(slot, e.currentTarget);
          }
        }}
        className={`group flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[22px] px-3 py-2.5 transition-all md:rounded-full md:py-2 ${
          isActive
            ? "bg-white shadow-[0_10px_30px_-10px_rgba(5,12,26,0.35)]"
            : openSlot
              ? "hover:bg-white/60"
              : "hover:bg-gray-100"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full [&>svg]:h-[18px] [&>svg]:w-[18px] ${meta.tint}`}>
          {meta.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 whitespace-nowrap text-[11px] font-bold text-gray-500">
            {meta.label}
            {slot === "festival" && <span className="font-medium text-gray-400">· 선택</span>}
            {slot === "spot" && (
              <span className="font-medium text-gray-400">
                · 선택 {includeSpots.length > 0 && `${includeSpots.length}/${COURSE_INCLUDE_SPOTS_MAX}`}
              </span>
            )}
          </span>
          {typing ? (
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setActiveIndex(-1);
                if (slot === "festival") form.setFestivalQuery(e.target.value);
                else form.setSpotQuery(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              maxLength={COURSE_PLACE_NAME_MAX}
              disabled={slot === "spot" && spotsFull}
              placeholder={slot === "festival" ? "불꽃축제, 드론쇼…" : spotsFull ? "5곳 다 담았어요" : "이재모피자…"}
              role="combobox"
              aria-expanded={true}
              aria-controls={listId}
              aria-autocomplete="list"
              className="block w-full bg-transparent text-[15px] font-semibold text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400"
            />
          ) : (
            <span className={`block truncate text-[15px] ${summary.empty ? "text-gray-400" : "font-semibold text-gray-900"}`}>
              {summary.text}
            </span>
          )}
        </span>
      </div>
    );
  };

  return (
    // 칸 네 개 + 버튼이 한 줄에 들어가도록 넓은 화면에선 채팅 입력창보다 넓게 편다
    <div
      ref={rootRef}
      className="relative w-full text-left md:left-1/2 md:w-[min(calc(100vw-4rem),60rem)] md:-translate-x-1/2"
    >
      {/* ── 바 ── */}
      <div
        className={`relative flex flex-col gap-1 rounded-[30px] p-2 shadow-[0_24px_60px_-24px_rgba(5,12,26,0.7)] ring-1 ring-inset transition-colors md:flex-row md:items-center md:gap-1 md:rounded-full ${
          openSlot ? "bg-gray-100 ring-gray-200" : "bg-white ring-white"
        }`}
      >
        {renderSegment("area")}
        {renderSegment("budget")}
        {renderSegment("festival")}
        {renderSegment("spot")}

        <button
          type="button"
          onClick={form.submit}
          disabled={isGenerating}
          className="mt-1 flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-lime-300 to-lime-400 px-6 text-[15px] font-bold text-navy-900 shadow-[0_10px_24px_-10px_rgba(171,204,26,0.9)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 md:mt-0"
        >
          {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          {isGenerating ? "만드는 중" : "코스 만들기"}
        </button>
      </div>

      {/* ── 고르는 판 ── */}
      <AnimatePresence initial={false}>
        {openSlot && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative mt-4"
          >
            {caretX !== null && (
              <span
                aria-hidden
                className="absolute -top-1.5 hidden h-4 w-4 -translate-x-1/2 rotate-45 rounded-[3px] bg-white md:block"
                style={{ left: caretX }}
              />
            )}
            <div className="relative rounded-[28px] bg-white p-3 shadow-[0_24px_60px_-24px_rgba(5,12,26,0.7)] md:p-4">
              <div className="flex items-center justify-between gap-3 px-2 pb-2">
                <p className="flex items-center gap-1.5 text-[13px] font-bold text-gray-900">
                  {isSearchSlot && <Search className="h-3.5 w-3.5 text-gray-400" />}
                  {openSlot === "area" && "어디서 놀까요?"}
                  {openSlot === "budget" && "예산은 얼마 안으로?"}
                  {openSlot === "festival" && "행사 · 축제 찾기"}
                  {openSlot === "spot" && "스팟 장소 찾기"}
                </p>
                <button
                  type="button"
                  onClick={() => form.setOpenSlot(null)}
                  aria-label="닫기"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {openSlot === "area" && (
                <div className="px-2 pb-2">
                  <AreaPicker
                    value={area}
                    onPick={(name) => {
                      form.setArea(name);
                      setCaretX(null);
                      form.setOpenSlot("budget");
                    }}
                  />
                </div>
              )}
              {openSlot === "budget" && (
                <div className="px-2 pb-2">
                  <BudgetPicker
                    value={budget}
                    onPick={(tier) => {
                      form.setBudget(tier);
                      form.setOpenSlot(null);
                    }}
                  />
                </div>
              )}

              {openSlot === "spot" && includeSpots.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                  {includeSpots.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        form.removeSpot(name);
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-50 py-1 pl-3 pr-1.5 text-[13px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200 hover:bg-amber-100"
                      aria-label={`${name} 빼기`}
                    >
                      {name}
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              )}

              {openSlot === "festival" && festival && !form.festivalQuery && (
                <div className="mx-2 mb-2 flex items-center gap-2 rounded-2xl bg-pink-50 px-3 py-2">
                  <p className="min-w-0 flex-1 truncate text-[13px] text-pink-700">
                    <b>{festival}</b> 근처로 짜요 — 지역은 축제 위치를 따라가요
                  </p>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      form.setFestival(null);
                    }}
                    className="shrink-0 text-[12px] font-semibold text-gray-500 hover:text-gray-800"
                  >
                    빼기
                  </button>
                </div>
              )}

              {isSearchSlot && (
                <ResultList
                  id={listId}
                  query={query}
                  suggestions={suggest.suggestions}
                  isLoading={suggest.isLoading}
                  activeIndex={activeIndex}
                  onHover={setActiveIndex}
                  onPick={pick}
                  isPicked={(s) => (openSlot === "festival" ? s.title === festival : includeSpots.includes(s.title))}
                  fallbackIcon={SLOT_META[openSlot].icon}
                  emptyHint={
                    openSlot === "spot" ? (
                      <>
                        스팟에 있는 장소를 찾아요. 이름 일부만 쳐도 돼요 — 예) <b className="text-gray-600">이재</b> → 이재모피자 본점
                      </>
                    ) : (
                      <>진행 중이거나 다가오는 부산 행사를 찾아요 — 예) 불꽃, 드론</>
                    )
                  }
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-3 px-3 text-[12px] text-white/70">
        {error ? (
          <span role="alert" className="font-semibold text-rose-200">
            {error}
          </span>
        ) : (
          "지역·예산만 골라도 돼요 · 대화 없이 만들어 횟수 제한 없음"
        )}
      </p>
    </div>
  );
}

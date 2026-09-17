"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Check, Flame, Loader2, MapPin, PartyPopper, Plus, Search, Sparkles, Star, Wallet, X } from "lucide-react";

import {
  COURSE_BUDGET_LABEL,
  COURSE_INCLUDE_SPOTS_MAX,
  COURSE_PLACE_NAME_MAX,
  type CourseStartArea,
} from "@/constants/course";
import type { Suggestion } from "@/features/home/components/SearchBar/SuggestField";
import { useActiveFestivalPicks, useSpotPicks } from "@/features/home/hooks/useCourseFormSuggestions";
import { CATEGORY_META } from "@/features/spot/constants/categoryMap";
import { readCourseSelection, saveCourseSelection } from "@/features/home/utils/searchBarSelection";
import { AreaTilePicker, BudgetPicker } from "./Pickers";
import { useCourseFormState, type CourseSlot } from "./useCourseFormState";

const SLOT_META: Record<CourseSlot, { label: string; icon: React.ReactNode; tint: string }> = {
  area: { label: "어디서", icon: <MapPin />, tint: "bg-ocean-50 text-ocean-500" },
  budget: { label: "예산", icon: <Wallet />, tint: "bg-lime-100 text-lime-700" },
  festival: { label: "행사", icon: <PartyPopper />, tint: "bg-pink-50 text-pink-500" },
  spot: { label: "꼭 갈 곳", icon: <Star />, tint: "bg-amber-50 text-amber-500" },
};

// 꼭 갈 곳 추천의 분류 탭 — 코스에 자주 넣는 것만
const PICK_CATEGORIES = [undefined, "FD", "NA", "VE"] as const;

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
  items: Suggestion[];
  isLoading: boolean;
  activeIndex: number;
  onHover: (i: number) => void;
  onPick: (s: Suggestion) => void;
  isPicked: (s: Suggestion) => boolean;
  fallbackIcon: React.ReactNode;
  /** 결과가 없을 때 한 줄 */
  emptyMessage: string;
}

function ResultList({ id, query, items, isLoading, activeIndex, onHover, onPick, isPicked, fallbackIcon, emptyMessage }: ResultListProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 px-2 py-4 text-[13px] text-gray-400">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> 찾는 중...
          </>
        ) : (
          emptyMessage
        )}
      </div>
    );
  }

  return (
    <ul id={id} role="listbox" className="grid max-h-[300px] gap-1 overflow-y-auto sm:grid-cols-2">
      {items.map((s, i) => {
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
                picked ? "bg-ocean-50" : i === activeIndex ? "bg-gray-100" : ""
              }`}
            >
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 text-gray-400 [&>svg]:h-5 [&>svg]:w-5">
                {s.imageUrl ? <Image src={s.imageUrl} alt="" fill sizes="56px" className="object-cover" /> : fallbackIcon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-gray-900">
                  <Highlight text={s.title} query={query} />
                </span>
                <span className="mt-1 flex min-w-0 items-center gap-1.5 text-[12px] text-gray-400">
                  {s.badge && (
                    <span className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-600">
                      {s.badge}
                    </span>
                  )}
                  {s.meta && <span className="truncate">{s.meta}</span>}
                </span>
              </span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                  picked ? "bg-ocean-500 text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {picked ? <Check className="h-4 w-4" strokeWidth={3} /> : <Plus className="h-4 w-4" strokeWidth={2.5} />}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * 홈 히어로 2순위 · 조건 골라 내 코스 만들기 (한 줄 검색 바)
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

  /** 하나 고르고 나서 다음 칸으로 — 칸 요소를 찾아 꼬리 위치까지 같이 옮긴다 */
  const advanceTo = (slot: CourseSlot) => {
    const el = segmentEls.current[slot];
    if (el) open(slot, el);
    else form.setOpenSlot(slot);
  };

  const [pickCategory, setPickCategory] = useState<(typeof PICK_CATEGORIES)[number]>(undefined);

  // 필수(지역·예산)는 미리 채워 두지 않고 직접 고르게 한다. 축제를 고르면 지역은 축제 위치를 따라가 필수에서 빠진다.
  const [areaChosen, setAreaChosen] = useState(false);
  const [budgetChosen, setBudgetChosen] = useState(false);

  // 전에 고른 지역·예산, 혼잡도 화면에서 "이 동네로 코스 짜기"로 넘겨준 지역을 되살린다.
  // sessionStorage는 브라우저에만 있어 서버 렌더와 어긋나지 않게 마운트 뒤에 읽는다.
  const { setArea, setBudget } = form;
  useEffect(() => {
    const saved = readCourseSelection();
    /* eslint-disable react-hooks/set-state-in-effect */
    if (saved.region) {
      setArea(saved.region);
      setAreaChosen(true);
    }
    if (saved.budget) {
      setBudget(saved.budget);
      setBudgetChosen(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [setArea, setBudget]);
  const [showMissing, setShowMissing] = useState(false);
  const segmentEls = useRef<Partial<Record<CourseSlot, HTMLDivElement | null>>>({});

  const missing: CourseSlot[] = [
    ...(!areaChosen && !festival ? (["area"] as const) : []),
    ...(!budgetChosen ? (["budget"] as const) : []),
  ];

  const submit = () => {
    if (missing.length > 0) {
      setShowMissing(true);
      const el = segmentEls.current[missing[0]];
      if (el) open(missing[0], el);
      return;
    }
    form.submit();
  };

  const isSearchSlot = openSlot === "festival" || openSlot === "spot";
  const query = openSlot === "festival" ? form.festivalQuery : form.spotQuery;
  const suggest = openSlot === "festival" ? form.festivalSuggest : form.spotSuggest;
  const isTyping = query.trim().length > 0;

  // 치기 전엔 추천 — 행사는 지금·곧 열리는 것, 꼭 갈 곳은 지역과 상관없이 부산 전체 (다른 동네 곳도 자유롭게 넣게)
  const festivalPicks = useActiveFestivalPicks();
  const spotPicks = useSpotPicks(pickCategory, openSlot === "spot");
  const picks = openSlot === "festival" ? festivalPicks : spotPicks;

  // 화면에 보이는 목록 하나로 방향키·Enter를 맞춘다
  const shownItems = isTyping ? suggest.suggestions : picks.picks;

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
    const list = shownItems;
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
        if (festival) return { text: "축제 근처", empty: false };
        return areaChosen ? { text: area, empty: false } : { text: "지역 선택", empty: true };
      case "budget":
        return budgetChosen ? { text: COURSE_BUDGET_LABEL[budget], empty: false } : { text: "예산 선택", empty: true };
      case "festival":
        return { text: festival ?? "추가하기", empty: !festival };
      case "spot":
        return {
          text:
            includeSpots.length === 0
              ? "추가하기"
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
    const required = slot === "area" || slot === "budget";
    const isMissing = showMissing && missing.includes(slot) && !isActive;

    return (
      <div
        key={slot}
        ref={(el) => {
          segmentEls.current[slot] = el;
        }}
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
            : isMissing
              ? "bg-rose-50 ring-2 ring-inset ring-rose-300"
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
            {required ? (
              <span className="rounded-[5px] bg-ocean-500 px-1 py-px text-[10px] font-bold leading-tight text-white">필수</span>
            ) : (
              <span className="rounded-[5px] bg-gray-200 px-1 py-px text-[10px] font-semibold leading-tight text-gray-500">선택</span>
            )}
            {slot === "spot" && includeSpots.length > 0 && (
              <span className="font-medium text-gray-400">
                {includeSpots.length}/{COURSE_INCLUDE_SPOTS_MAX}
              </span>
            )}
          </span>
          <span
            className={`block truncate text-[15px] ${
              isMissing
                ? "font-semibold text-rose-500"
                : summary.empty
                  ? required
                    ? "font-semibold text-ocean-500"
                    : "text-gray-400"
                  : "font-semibold text-gray-900"
            }`}
          >
            {summary.text}
          </span>
        </span>
      </div>
    );
  };

  return (
    // 칸 네 개 + 버튼이 한 줄에 들어가도록 넓은 화면에선 채팅 입력창보다 넓게 편다
    <div
      ref={rootRef}
      // CourseSection의 "코스 짜러 가기"가 이 id로 스크롤한다
      id="search-bar"
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
        {renderSegment("spot")}
        {renderSegment("festival")}

        <button
          type="button"
          onClick={submit}
          disabled={isGenerating}
          className="mt-1 flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#34a6ff] to-[#0a84ff] px-6 text-[15px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(10,132,255,0.8)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 md:mt-0"
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
                className="absolute -top-1.5 hidden h-4 w-4 -translate-x-1/2 rotate-45 rounded-[3px] bg-white transition-[left] duration-300 ease-out md:block"
                style={{ left: caretX }}
              />
            )}
            <div className="relative rounded-[28px] bg-white p-3 shadow-[0_24px_60px_-24px_rgba(5,12,26,0.7)] md:p-4">
              <motion.div
                key={openSlot}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
              <div className="flex items-center justify-between gap-3 px-2 pb-2">
                <p className="flex min-w-0 items-center gap-1.5 truncate text-[13px] font-bold text-gray-900">
                  {openSlot === "area" && "어디서 놀까요?"}
                  {openSlot === "budget" && "예산은 얼마 안으로?"}
                  {openSlot === "festival" &&
                    (isTyping ? (
                      `'${query.trim()}' 검색 결과`
                    ) : (
                      <>
                        <Flame className="h-4 w-4 text-pink-500" /> 지금 · 곧 열리는 행사
                      </>
                    ))}
                  {openSlot === "spot" &&
                    (isTyping ? (
                      `'${query.trim()}' 검색 결과`
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 text-ocean-500" />
                        부산 가볼 만한 곳
                      </>
                    ))}
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
                  <AreaTilePicker
                    value={areaChosen ? area : ""}
                    onPick={(name) => {
                      form.setArea(name);
                      setAreaChosen(true);
                      saveCourseSelection({ region: name as CourseStartArea });
                      advanceTo("budget");
                    }}
                  />
                </div>
              )}
              {openSlot === "budget" && (
                <div className="px-2 pb-2">
                  <BudgetPicker
                    value={budgetChosen ? budget : null}
                    onPick={(tier) => {
                      form.setBudget(tier);
                      setBudgetChosen(true);
                      saveCourseSelection({ budget: tier });
                      advanceTo("spot");
                    }}
                  />
                </div>
              )}

              {isSearchSlot && (
                <div className="px-2 pb-3">
                  <label className="flex items-center gap-2.5 rounded-2xl bg-gray-100 px-4 py-3 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-ocean-300">
                    <Search className="h-[18px] w-[18px] shrink-0 text-gray-400" />
                    <input
                      // 칸을 바꿔 열면 새 검색창에 바로 커서가 가게
                      key={openSlot}
                      autoFocus
                      value={query}
                      onChange={(e) => {
                        setActiveIndex(-1);
                        if (openSlot === "festival") form.setFestivalQuery(e.target.value);
                        else form.setSpotQuery(e.target.value);
                      }}
                      onKeyDown={handleKeyDown}
                      maxLength={COURSE_PLACE_NAME_MAX}
                      disabled={openSlot === "spot" && spotsFull}
                      placeholder={
                        openSlot === "festival"
                          ? "행사 이름으로 검색"
                          : spotsFull
                            ? `${COURSE_INCLUDE_SPOTS_MAX}곳까지 담았어요`
                            : "장소 이름으로 검색"
                      }
                      role="combobox"
                      aria-expanded={true}
                      aria-controls={listId}
                      aria-autocomplete="list"
                      className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                    />
                    {suggest.isLoading && isTyping && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-300" />}
                    {query && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setActiveIndex(-1);
                          if (openSlot === "festival") form.setFestivalQuery("");
                          else form.setSpotQuery("");
                        }}
                        aria-label="검색어 지우기"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-300 text-white hover:bg-gray-400"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={3} />
                      </button>
                    )}
                  </label>
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

              {openSlot === "spot" && !isTyping && (
                <div className="flex gap-1.5 overflow-x-auto px-2 pb-3">
                  {PICK_CATEGORIES.map((code) => {
                    const selected = pickCategory === code;
                    return (
                      <button
                        key={code ?? "ALL"}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setActiveIndex(-1);
                          setPickCategory(code);
                        }}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                          selected ? "bg-navy-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {code ? `${CATEGORY_META[code].emoji} ${CATEGORY_META[code].label}` : "전체"}
                      </button>
                    );
                  })}
                </div>
              )}

              {isSearchSlot && (
                <ResultList
                  id={listId}
                  query={isTyping ? query : ""}
                  items={shownItems}
                  isLoading={isTyping ? suggest.isLoading : picks.isLoading}
                  activeIndex={activeIndex}
                  onHover={setActiveIndex}
                  onPick={pick}
                  isPicked={(s) => (openSlot === "festival" ? s.title === festival : includeSpots.includes(s.title))}
                  fallbackIcon={SLOT_META[openSlot].icon}
                  emptyMessage={
                    isTyping
                      ? `'${query.trim()}'와 비슷한 곳이 없어요 — 이름 일부만 쳐보세요`
                      : openSlot === "festival"
                        ? "지금 열리고 있는 행사가 없어요"
                        : "이 분류엔 아직 장소가 없어요"
                  }
                />
              )}
              </motion.div>
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
          <>
            {showMissing && missing.length > 0 ? (
              <span role="alert" className="font-semibold text-rose-100">
                {missing.map((m) => (m === "area" ? "지역" : "예산")).join("과 ")}을 골라야 코스를 만들 수 있어요
              </span>
            ) : (
              <>
                <b className="font-semibold text-white">어디서 · 예산은 필수</b>, 꼭 갈 곳 · 행사는 비워 둬도 돼요 · 대화 없이 만들어 횟수 제한 없음
              </>
            )}
          </>
        )}
      </p>
    </div>
  );
}

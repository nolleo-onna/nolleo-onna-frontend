"use client";

import { Check, Loader2, Search, X } from "lucide-react";

import {
  COURSE_BUDGET_OPTIONS,
  COURSE_INCLUDE_SPOTS_MAX,
  COURSE_PLACE_NAME_MAX,
  COURSE_START_AREAS,
} from "@/constants/course";
import type { Suggestion } from "@/features/home/components/SearchBar/SuggestField";
import type { CourseBudgetTier } from "@/types/course";
import { AREA_GROUPS } from "./areaGuide";
import type { CourseFormState } from "./useCourseFormState";

// 흰 배경 위에 놓이는 고르기 판들 — 조건 폼 시안 네 가지가 같이 쓴다.

interface AreaPickerProps {
  value: string;
  onPick: (area: string) => void;
  size?: "md" | "lg";
}

export function AreaPicker({ value, onPick, size = "md" }: AreaPickerProps) {
  return (
    <div className={`flex flex-wrap ${size === "lg" ? "gap-2.5" : "gap-2"}`}>
      {COURSE_START_AREAS.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => onPick(name)}
          className={`rounded-full font-semibold transition-colors ${
            size === "lg" ? "px-5 py-2.5 text-[15px]" : "px-4 py-2 text-[14px]"
          } ${value === name ? "bg-navy-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

/**
 * 지역 고르기 — 대표 동네는 이모지·한 줄 소개가 붙은 카드로, 구 단위는 작은 칩으로.
 * 이름만 나열하면 어디가 뭐 하는 곳인지 몰라 고르기 어렵다는 피드백으로 만들었다.
 */
export function AreaTilePicker({ value, onPick }: Pick<AreaPickerProps, "value" | "onPick">) {
  return (
    <div className="space-y-4">
      {AREA_GROUPS.map((group) => (
        <section key={group.title}>
          <p className="mb-2 text-[12px] font-semibold text-gray-400">{group.title}</p>
          {group.variant === "card" ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {group.areas.map((guide) => {
                const selected = value === guide.area;
                return (
                  <button
                    key={guide.area}
                    type="button"
                    onClick={() => onPick(guide.area)}
                    aria-pressed={selected}
                    className={`group relative flex items-center gap-3 rounded-2xl p-3 text-left transition-all ${
                      selected
                        ? "bg-navy-900 text-white shadow-[0_10px_24px_-12px_rgba(5,12,26,0.9)]"
                        : "bg-gray-50 ring-1 ring-inset ring-gray-100 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_24px_-14px_rgba(13,48,128,0.45)]"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[22px] transition-transform group-hover:scale-110 ${
                        selected ? "bg-white/10" : "bg-white shadow-sm"
                      }`}
                    >
                      {guide.emoji}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-bold leading-tight">{guide.area}</span>
                      <span className={`mt-0.5 block truncate text-[11px] ${selected ? "text-white/60" : "text-gray-400"}`}>
                        {guide.tagline}
                      </span>
                    </span>
                    {selected && (
                      <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ocean-400">
                        <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {group.areas.map((guide) => (
                <button
                  key={guide.area}
                  type="button"
                  onClick={() => onPick(guide.area)}
                  aria-pressed={value === guide.area}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                    value === guide.area
                      ? "bg-navy-900 text-white"
                      : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:ring-gray-300"
                  }`}
                >
                  {guide.area}
                </button>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

interface BudgetPickerProps {
  /** null — 아직 안 골랐다 */
  value: CourseBudgetTier | null;
  onPick: (tier: CourseBudgetTier) => void;
}

export function BudgetPicker({ value, onPick }: BudgetPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {COURSE_BUDGET_OPTIONS.map((o, i) => {
        const selected = value === o.tier;
        return (
          <button
            key={o.tier}
            type="button"
            onClick={() => onPick(o.tier)}
            className={`flex flex-col items-start gap-2 rounded-2xl p-3 text-left transition-colors ${
              selected ? "bg-navy-900 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {/* 막대 개수로 예산 크기를 한눈에 */}
            <span className="flex h-3 items-end gap-0.5" aria-hidden>
              {Array.from({ length: COURSE_BUDGET_OPTIONS.length - 1 }, (_, n) => (
                <span
                  key={n}
                  className={`w-1.5 rounded-full ${
                    n < i ? (selected ? "bg-lime-300" : "bg-ocean-400") : selected ? "bg-white/20" : "bg-gray-300"
                  }`}
                  style={{ height: `${40 + n * 20}%` }}
                />
              ))}
            </span>
            <span className="text-[15px] font-bold">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface SearchListProps {
  placeholder: string;
  suggestions: Suggestion[];
  isLoading: boolean;
  query: string;
  onQueryChange: (v: string) => void;
  onPick: (s: Suggestion) => void;
  isPicked: (s: Suggestion) => boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

function SearchList({
  placeholder,
  suggestions,
  isLoading,
  query,
  onQueryChange,
  onPick,
  isPicked,
  disabled = false,
  autoFocus = true,
}: SearchListProps) {
  const hasQuery = query.trim().length > 0;

  return (
    <div>
      <label className="flex items-center gap-2.5 rounded-2xl bg-gray-100 px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-ocean-300">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          autoFocus={autoFocus}
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

interface FormPickerProps {
  form: CourseFormState;
  /** 하나 고른 뒤 할 일 — 판 닫기, 다음 단계로 넘기기 등 */
  onPicked?: () => void;
  autoFocus?: boolean;
}

export function FestivalPicker({ form, onPicked, autoFocus }: FormPickerProps) {
  return (
    <>
      <SearchList
        placeholder="불꽃축제, 드론쇼처럼 가고 싶은 행사"
        query={form.festivalQuery}
        onQueryChange={form.setFestivalQuery}
        suggestions={form.festivalSuggest.suggestions}
        isLoading={form.festivalSuggest.isLoading}
        onPick={(s) => {
          form.pickFestival(s);
          onPicked?.();
        }}
        isPicked={(s) => s.title === form.festival}
        autoFocus={autoFocus}
      />
      {form.festival && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-ocean-50 px-4 py-2.5">
          <p className="min-w-0 flex-1 truncate text-[13px] text-ocean-600">
            <b>{form.festival}</b> 근처로 짜요 — 지역은 축제 위치를 따라가요
          </p>
          <button
            type="button"
            onClick={() => form.setFestival(null)}
            className="shrink-0 text-[13px] font-semibold text-gray-500 hover:text-gray-800"
          >
            빼기
          </button>
        </div>
      )}
    </>
  );
}

export function SpotPicker({ form, autoFocus }: FormPickerProps) {
  return (
    <>
      {form.includeSpots.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {form.includeSpots.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => form.removeSpot(name)}
              className="inline-flex items-center gap-1 rounded-full bg-navy-900 py-1.5 pl-3 pr-2 text-[13px] font-semibold text-white"
              aria-label={`${name} 빼기`}
            >
              {name}
              <X className="h-3.5 w-3.5 text-white/60" />
            </button>
          ))}
        </div>
      )}
      <SearchList
        placeholder={form.spotsFull ? `${COURSE_INCLUDE_SPOTS_MAX}곳까지 담을 수 있어요` : "이재모피자처럼 꼭 들를 곳"}
        query={form.spotQuery}
        onQueryChange={form.setSpotQuery}
        suggestions={form.spotSuggest.suggestions}
        isLoading={form.spotSuggest.isLoading}
        onPick={form.toggleSpot}
        isPicked={(s) => form.includeSpots.includes(s.title)}
        disabled={form.spotsFull}
        autoFocus={autoFocus}
      />
    </>
  );
}

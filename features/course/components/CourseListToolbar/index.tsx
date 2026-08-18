"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";

import {
  COST_FILTERS,
  SORT_OPTIONS,
  parseCostFilter,
  parseSortKey,
} from "@/features/course/utils/courseListFilters";

export default function CourseListToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sort = parseSortKey(searchParams.get("sort"));
  const cost = parseCostFilter(searchParams.get("cost"));

  const setParam = useCallback(
    (key: "sort" | "cost", value: string, defaultValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === defaultValue) params.delete(key);
      else params.set(key, value);
      const query = params.toString();
      router.replace(query ? `?${query}` : "?", { scroll: false });
    },
    [router, searchParams],
  );

  const selectedSort =
    SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      {/* 비용 필터 칩 */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="비용 필터">
        {COST_FILTERS.map(({ value, label }) => {
          const active = cost === value;
          return (
            <button
              key={value}
              onClick={() => setParam("cost", value, "all")}
              aria-pressed={active}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-navy-900 text-lime-300"
                  : "border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 정렬 드롭다운 */}
      <Listbox
        value={sort}
        onChange={(value: string) => setParam("sort", value, "latest")}
      >
        <div className="relative">
          <ListboxButton className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-gray-700 outline-none transition-colors hover:border-gray-300 focus-visible:ring-2 focus-visible:ring-ocean-400">
            <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
            {selectedSort.label}
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </ListboxButton>

          <ListboxOptions
            anchor="bottom end"
            className="z-20 mt-1 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg outline-none"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <ListboxOption
                key={value}
                value={value}
                className="flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-[13px] text-gray-700 not-last:border-b not-last:border-gray-50 data-[focus]:bg-gray-50"
              >
                {label}
                {sort === value && <Check className="h-3.5 w-3.5 text-ocean-500" />}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  );
}

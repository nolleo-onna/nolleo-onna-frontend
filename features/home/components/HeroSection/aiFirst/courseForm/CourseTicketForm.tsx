"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, Ticket, X } from "lucide-react";

import { COURSE_BUDGET_LABEL, COURSE_INCLUDE_SPOTS_MAX } from "@/constants/course";
import { AreaPicker, BudgetPicker, FestivalPicker, SpotPicker } from "./Pickers";
import { useCourseFormState, type CourseSlot } from "./useCourseFormState";

const PANEL_TITLE: Record<CourseSlot, string> = {
  area: "출발 지역",
  budget: "예산",
  festival: "행사 · 선택",
  spot: `꼭 갈 곳 · 선택 (최대 ${COURSE_INCLUDE_SPOTS_MAX}곳)`,
};

// 바코드 느낌의 줄 굵기 — 매 렌더 무작위면 깜빡이므로 고정값
const BARCODE = [3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2];

interface FieldProps {
  code: string;
  label: string;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

function Field({ code, label, isActive, disabled = false, onClick, children, className = "" }: FieldProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-expanded={isActive}
      className={`group min-w-0 rounded-2xl p-3 text-left transition-colors disabled:cursor-not-allowed ${
        isActive ? "bg-ocean-50 ring-2 ring-inset ring-ocean-400" : "hover:bg-gray-50"
      } ${className}`}
    >
      <p className="flex items-baseline gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
        {code}
        <span className="font-semibold normal-case tracking-normal text-gray-400">{label}</span>
      </p>
      <div className="mt-1">{children}</div>
    </button>
  );
}

/**
 * 조건 폼 시안 · 코스 탑승권
 * 고른 조건이 표 한 장에 인쇄되고, 오른쪽 떼는 쪽의 "발권"을 누르면 코스가 나온다.
 * 지역은 공항 코드처럼 크게 — 한눈에 "어디로 가는 표"인지 보인다.
 */
export default function CourseTicketForm() {
  const rootRef = useRef<HTMLDivElement>(null);
  const form = useCourseFormState(rootRef);
  const { area, budget, festival, includeSpots, openSlot, isGenerating, error } = form;

  const field = (slot: CourseSlot) => ({ isActive: openSlot === slot, onClick: () => form.toggleSlot(slot) });
  const dash = <span className="text-[20px] font-bold text-gray-300">— —</span>;

  return (
    <div ref={rootRef} className="w-full text-left">
      <motion.div
        whileHover={{ rotate: -0.4 }}
        className="relative flex flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_70px_-30px_rgba(5,12,26,0.85)] md:flex-row"
      >
        {/* ── 본문 ── */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between bg-navy-900 px-6 py-3 text-white">
            <p className="flex items-center gap-2 text-[12px] font-bold tracking-[0.18em]">
              <Ticket className="h-4 w-4 text-lime-300" />
              BUSAN COURSE PASS
            </p>
            <p className="text-[11px] text-white/60">대화 없이 조건만 · 횟수 제한 없음</p>
          </div>

          <div className="grid grid-cols-2 gap-1 p-3 md:grid-cols-[1.2fr_1fr] md:p-4">
            <Field code="From" label="출발 지역" disabled={!!festival} {...field("area")}>
              <p className={`text-[34px] font-black leading-none tracking-tight md:text-[44px] ${festival ? "text-gray-300" : "text-navy-900"}`}>
                {festival ? "축제 근처" : area}
              </p>
            </Field>
            <Field code="Budget" label="예산" {...field("budget")}>
              <p className="text-[34px] font-black leading-none tracking-tight text-navy-900 md:text-[44px]">
                {COURSE_BUDGET_LABEL[budget]}
              </p>
            </Field>

            <div aria-hidden className="col-span-2 mx-3 my-1 border-t border-dashed border-gray-200" />

            <Field code="Event" label="행사 · 선택" {...field("festival")}>
              {festival ? <p className="truncate text-[16px] font-bold text-gray-900">{festival}</p> : dash}
            </Field>
            <Field code="Must" label={`꼭 갈 곳 · ${includeSpots.length}/${COURSE_INCLUDE_SPOTS_MAX}`} {...field("spot")}>
              {includeSpots.length > 0 ? (
                <p className="truncate text-[16px] font-bold text-gray-900">{includeSpots.join(" · ")}</p>
              ) : (
                dash
              )}
            </Field>
          </div>
        </div>

        {/* ── 떼는 쪽 ── */}
        <div className="relative flex shrink-0 flex-row items-center gap-4 border-t-2 border-dashed border-gray-200 bg-lime-300 p-4 md:w-[188px] md:flex-col md:justify-between md:border-l-2 md:border-t-0 md:p-5">
          <div className="hidden text-center md:block">
            <p className="text-[10px] font-bold tracking-[0.2em] text-navy-900/60">ADMIT ONE</p>
            <p className="mt-1 text-[22px] font-black leading-none text-navy-900">오늘</p>
          </div>
          <div aria-hidden className="flex h-10 flex-1 items-stretch justify-center gap-[2px] md:h-14 md:w-full md:flex-none">
            {BARCODE.map((w, i) => (
              <span key={i} className="bg-navy-900" style={{ width: w }} />
            ))}
          </div>
          <button
            type="button"
            onClick={form.submit}
            disabled={isGenerating}
            className="flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-navy-900 px-5 py-3 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 md:w-full"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isGenerating ? "발권 중" : "코스 발권"}
          </button>
        </div>
      </motion.div>

      <AnimatePresence initial={false}>
        {openSlot && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-[28px] bg-white p-5 shadow-[0_24px_60px_-24px_rgba(5,12,26,0.7)] md:p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[14px] font-bold text-gray-900">{PANEL_TITLE[openSlot]}</p>
                <button
                  type="button"
                  onClick={() => form.setOpenSlot(null)}
                  aria-label="닫기"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {openSlot === "area" && (
                <AreaPicker
                  value={area}
                  onPick={(name) => {
                    form.setArea(name);
                    form.setOpenSlot(null);
                  }}
                />
              )}
              {openSlot === "budget" && (
                <BudgetPicker
                  value={budget}
                  onPick={(tier) => {
                    form.setBudget(tier);
                    form.setOpenSlot(null);
                  }}
                />
              )}
              {openSlot === "festival" && <FestivalPicker form={form} onPicked={() => form.setOpenSlot(null)} autoFocus />}
              {openSlot === "spot" && <SpotPicker form={form} autoFocus />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p role="alert" className="mt-3 px-2 text-[13px] font-semibold text-rose-200">
          {error}
        </p>
      )}
    </div>
  );
}

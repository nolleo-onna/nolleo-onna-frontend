"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Loader2 } from "lucide-react";

import { COURSE_BUDGET_LABEL, COURSE_INCLUDE_SPOTS_MAX } from "@/constants/course";
import { AreaPicker, BudgetPicker, FestivalPicker, SpotPicker } from "./Pickers";
import { useCourseFormState, type CourseSlot } from "./useCourseFormState";

interface SegmentProps {
  label: string;
  value: string;
  isPlaceholder?: boolean;
  isActive: boolean;
  /** 다른 칸이 열려 있어 이 칸은 한 단계 가라앉힌다 */
  isDimmed: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function Segment({ label, value, isPlaceholder = false, isActive, isDimmed, disabled = false, onClick }: SegmentProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-expanded={isActive}
      className={`min-w-0 flex-1 rounded-full px-5 py-3 text-left transition-all md:px-6 md:py-3.5 ${
        isActive
          ? "bg-white shadow-[0_8px_28px_-8px_rgba(5,12,26,0.35)]"
          : isDimmed
            ? "hover:bg-gray-200/70"
            : "hover:bg-gray-100"
      } disabled:cursor-not-allowed`}
    >
      <p className="text-[11px] font-bold tracking-wide text-gray-900">{label}</p>
      <p
        className={`mt-0.5 truncate text-[15px] ${
          isPlaceholder || disabled ? "text-gray-400" : "font-semibold text-gray-800"
        }`}
      >
        {value}
      </p>
    </button>
  );
}

const Divider = () => <span aria-hidden className="hidden h-8 w-px shrink-0 bg-gray-200 md:block" />;

/**
 * 조건 폼 시안 · 한 줄 검색 바
 * 숙소 검색처럼 익숙한 한 줄 — 지역 | 예산 | 행사 | 꼭 갈 곳을 한 알약에 나란히 두고,
 * 누른 칸만 떠오르며 바로 아래로 고르는 판이 펼쳐진다. 채팅 입력창과 모양이 닮아 한 쌍으로 읽힌다.
 */
export default function CourseSearchBarForm() {
  const rootRef = useRef<HTMLDivElement>(null);
  const form = useCourseFormState(rootRef);
  const { area, budget, festival, includeSpots, openSlot, isGenerating, error } = form;

  const segment = (slot: CourseSlot) => ({
    isActive: openSlot === slot,
    isDimmed: openSlot !== null && openSlot !== slot,
    onClick: () => form.toggleSlot(slot),
  });

  return (
    <div ref={rootRef} className="w-full text-left">
      <div className="mb-3 flex items-center justify-between gap-2 px-2">
        <p className="text-[14px] font-semibold text-white">조건만 골라서 바로 만들기</p>
        <span className="text-[12px] text-white/60">횟수 제한 없음 · 약 1초</span>
      </div>

      <div
        className={`flex flex-col gap-1 rounded-[32px] p-2 shadow-[0_24px_60px_-24px_rgba(5,12,26,0.7)] transition-colors md:flex-row md:items-center md:gap-0 md:rounded-full ${
          openSlot ? "bg-gray-100" : "bg-white"
        }`}
      >
        <Segment
          label="어디서"
          // 축제를 고르면 서버가 지역을 축제 위치로 바꾸므로 고를 수 있는 것처럼 두지 않는다
          value={festival ? "축제 근처" : area}
          disabled={!!festival}
          {...segment("area")}
        />
        <Divider />
        <Segment label="예산" value={`${COURSE_BUDGET_LABEL[budget]}`} {...segment("budget")} />
        <Divider />
        <Segment
          label="행사 · 선택"
          value={festival ?? "행사 추가"}
          isPlaceholder={!festival}
          {...segment("festival")}
        />
        <Divider />
        <Segment
          label={`꼭 갈 곳 · ${includeSpots.length}/${COURSE_INCLUDE_SPOTS_MAX}`}
          value={
            includeSpots.length === 0
              ? "장소 추가"
              : includeSpots.length === 1
                ? includeSpots[0]
                : `${includeSpots[0]} 외 ${includeSpots.length - 1}곳`
          }
          isPlaceholder={includeSpots.length === 0}
          {...segment("spot")}
        />

        <button
          type="button"
          onClick={form.submit}
          disabled={isGenerating}
          aria-label="내 코스 만들기"
          className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-navy-900 px-6 text-[15px] font-bold text-white transition-colors hover:bg-ocean-600 disabled:opacity-70 md:ml-2 md:h-16"
        >
          {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
          <span>{isGenerating ? "만드는 중" : "만들기"}</span>
        </button>
      </div>

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
              {openSlot === "area" && (
                <AreaPicker
                  value={area}
                  onPick={(name) => {
                    form.setArea(name);
                    form.setOpenSlot("budget");
                  }}
                />
              )}
              {openSlot === "budget" && (
                <BudgetPicker
                  value={budget}
                  onPick={(tier) => {
                    form.setBudget(tier);
                    form.setOpenSlot("festival");
                  }}
                />
              )}
              {openSlot === "festival" && (
                <FestivalPicker form={form} onPicked={() => form.setOpenSlot("spot")} autoFocus />
              )}
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

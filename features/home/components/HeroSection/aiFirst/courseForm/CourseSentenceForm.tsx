"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Loader2, MapPin, PartyPopper, Plus, Star, Wallet, X } from "lucide-react";

import { COURSE_BUDGET_LABEL, COURSE_INCLUDE_SPOTS_MAX } from "@/constants/course";
import { AreaPicker, BudgetPicker, FestivalPicker, SpotPicker } from "./Pickers";
import { useCourseFormState, type CourseSlot } from "./useCourseFormState";

const PANEL_TITLE: Record<CourseSlot, string> = {
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

/**
 * 조건 골라 내 코스 만들기 — 입력칸 대신 "빈칸 채우기 문장".
 * "[광안리]에서 [5만원] 안으로 놀래요" 처럼 말하듯 읽히게 해서, 채팅이 메인인 히어로 안에서도
 * 같은 결로 보인다. 빈칸을 누르면 문장 아래로 고르는 판이 열린다.
 */
export default function CourseSentenceForm() {
  const rootRef = useRef<HTMLDivElement>(null);
  const form = useCourseFormState(rootRef);
  const { area, budget, festival, includeSpots, openSlot, spotsFull, isGenerating, error } = form;
  const toggle = form.toggleSlot;

  return (
    <div
      ref={rootRef}
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
                  onClick={() => form.setOpenSlot(null)}
                  aria-label="닫기"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

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
          onClick={form.submit}
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

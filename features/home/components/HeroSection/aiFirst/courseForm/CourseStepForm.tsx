"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Loader2, Pencil } from "lucide-react";

import { COURSE_BUDGET_LABEL } from "@/constants/course";
import { AreaPicker, BudgetPicker, FestivalPicker, SpotPicker } from "./Pickers";
import { useCourseFormState } from "./useCourseFormState";

const STEPS = [
  { key: "area", question: "어디서 놀까요?", hint: "출발할 동네를 골라주세요" },
  { key: "budget", question: "예산은 얼마 안으로?", hint: "대략 이 정도면 돼요" },
  { key: "festival", question: "가고 싶은 행사가 있나요?", hint: "없으면 건너뛰어도 돼요" },
  { key: "spot", question: "꼭 들를 곳이 있나요?", hint: "최대 5곳 · 없으면 건너뛰어도 돼요" },
] as const;

const SUMMARY = STEPS.length;

/**
 * 조건 폼 시안 · 한 번에 하나씩
 * 칸 네 개를 한꺼번에 보여주지 않고, 온나가 묻듯 질문을 한 장씩 넘긴다.
 * 필수(지역·예산)는 고르면 바로 다음으로, 선택은 건너뛸 수 있고, 마지막에 한눈에 보고 만든다.
 */
export default function CourseStepForm() {
  const rootRef = useRef<HTMLDivElement>(null);
  const form = useCourseFormState(rootRef);
  const { area, budget, festival, includeSpots, isGenerating, error } = form;
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const current = STEPS[step];
  const isOptional = step === 2 || step === 3;
  const hasOptionalValue = (step === 2 && !!festival) || (step === 3 && includeSpots.length > 0);

  const summaryRows = [
    { label: "지역", value: festival ? "축제 근처" : area, step: 0 },
    { label: "예산", value: COURSE_BUDGET_LABEL[budget], step: 1 },
    { label: "행사", value: festival ?? "없음", step: 2, empty: !festival },
    { label: "꼭 갈 곳", value: includeSpots.length > 0 ? includeSpots.join(", ") : "없음", step: 3, empty: includeSpots.length === 0 },
  ];

  return (
    <div
      ref={rootRef}
      className="w-full overflow-hidden rounded-[32px] bg-white text-left shadow-[0_30px_70px_-30px_rgba(5,12,26,0.85)]"
    >
      {/* ── 진행 표시 ── */}
      <div className="flex items-center gap-3 px-6 pt-5 md:px-8 md:pt-6">
        <button
          type="button"
          onClick={() => go(step - 1)}
          disabled={step === 0}
          aria-label="이전"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 disabled:invisible"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-1 gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s.key}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < step || step === SUMMARY ? "bg-navy-900" : i === step ? "bg-ocean-400" : "bg-gray-200"}`}
            />
          ))}
        </div>
        <span className="shrink-0 text-[12px] font-semibold tabular-nums text-gray-400">
          {step === SUMMARY ? "확인" : `${step + 1} / ${STEPS.length}`}
        </span>
      </div>

      {/* ── 질문 카드 ── */}
      <div className="relative min-h-[300px] px-6 pb-6 pt-5 md:px-8 md:pb-8">
        {/* 나가는 장면은 두지 않는다 — 들어오는 장면만 방향에 맞춰 밀려 들어온다 */}
        <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 * direction }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {step < SUMMARY ? (
              <>
                <p className="text-[12px] font-semibold text-ocean-500">
                  조건 골라 내 코스 만들기 {isOptional && <span className="text-gray-400">· 선택</span>}
                </p>
                <h3 className="mt-1 text-[26px] font-bold leading-tight tracking-tight text-gray-900 md:text-[32px]">
                  {current.question}
                </h3>
                <p className="mt-1 text-[13px] text-gray-400">{current.hint}</p>

                <div className="mt-5">
                  {step === 0 && (
                    <AreaPicker
                      size="lg"
                      value={area}
                      onPick={(name) => {
                        form.setArea(name);
                        go(1);
                      }}
                    />
                  )}
                  {step === 1 && (
                    <BudgetPicker
                      value={budget}
                      onPick={(tier) => {
                        form.setBudget(tier);
                        go(2);
                      }}
                    />
                  )}
                  {step === 2 && <FestivalPicker form={form} />}
                  {step === 3 && <SpotPicker form={form} />}
                </div>

                {isOptional && (
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => go(SUMMARY)}
                      className="text-[13px] font-semibold text-gray-400 transition-colors hover:text-gray-700"
                    >
                      이대로 바로 확인
                    </button>
                    <button
                      type="button"
                      onClick={() => go(step + 1)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-5 py-2.5 text-[14px] font-bold text-gray-800 transition-colors hover:bg-gray-200"
                    >
                      {hasOptionalValue ? "다음" : "건너뛰기"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-[12px] font-semibold text-ocean-500">이렇게 만들어요</p>
                <h3 className="mt-1 text-[26px] font-bold leading-tight tracking-tight text-gray-900 md:text-[32px]">
                  좋아요, 코스 짜볼게요
                </h3>
                <ul className="mt-5 divide-y divide-gray-100 rounded-2xl bg-gray-50 px-4">
                  {summaryRows.map((row) => (
                    <li key={row.label} className="flex items-center gap-3 py-3">
                      <span className="w-16 shrink-0 text-[13px] text-gray-400">{row.label}</span>
                      <span className={`min-w-0 flex-1 truncate text-[15px] font-semibold ${row.empty ? "text-gray-300" : "text-gray-900"}`}>
                        {row.value}
                      </span>
                      <button
                        type="button"
                        onClick={() => go(row.step)}
                        aria-label={`${row.label} 바꾸기`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white hover:text-gray-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
                {error && (
                  <p role="alert" className="mt-3 text-[13px] font-semibold text-red-500">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={form.submit}
                  disabled={isGenerating}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-navy-900 py-4 text-[16px] font-bold text-white transition-colors hover:bg-ocean-600 disabled:opacity-70"
                >
                  {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  {isGenerating ? "코스 만드는 중..." : "내 코스 만들기"}
                  {!isGenerating && <ArrowRight className="h-5 w-5" />}
                </button>
                <p className="mt-2 text-center text-[12px] text-gray-400">대화 없이 만들어 횟수 제한 없음 · 약 1초</p>
              </>
            )}
          </motion.div>
      </div>
    </div>
  );
}

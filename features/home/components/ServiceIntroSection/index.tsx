"use client";

import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ASSISTANT_NAME } from "@/constants/assistant";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const POINTS = [
  {
    no: "01",
    title: "한 마디면 코스가 나와요",
    description: `“영도 조용한 데이트”처럼 말하면 ${ASSISTANT_NAME}가 동선까지 짜드려요.`,
  },
  {
    no: "02",
    title: "붐비는 곳은 미리 피해요",
    description: "관광공사 혼잡도 예측과 기상청 날씨로 오늘 갈 만한 곳을 골라요.",
  },
  {
    no: "03",
    title: "예산 안에서 끝나요",
    description: "코스마다 남는 예산과 1인당 금액까지 함께 보여드려요.",
  },
];

/**
 * 서비스 소개 — 아이콘 3개를 가운데 정렬하던 소개 블록 대신, 왼쪽 큰 문장 + 오른쪽 번호 매긴 줄글로
 * 잡지 기사처럼 읽히게 했다. 홈의 마지막 섹션이라 코스 만들기로 이어지는 버튼을 둔다.
 */
export default function ServiceIntroSection() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="my-10 border-t border-navy-900/10 pt-12 md:my-16 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <h2 className="text-3xl font-bold leading-[1.2] tracking-tight text-navy-900 break-keep md:text-[40px]">
              부산 여행,
              <br />
              덜 붐비게
              <br />
              <span className="text-ocean-600">예산 안에서.</span>
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-gray-500 break-keep">
              놀러온나는 부산 여행자를 위한 예산 맞춤형 여행 플래너예요.
            </p>
            <Link
              href="/course"
              className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-5 py-3 text-sm font-bold text-lime-300 transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              코스 만들러 가기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <ol className="border-t border-gray-200">
            {POINTS.map((point, i) => (
              <motion.li
                key={point.no}
                className="grid grid-cols-[56px_minmax(0,1fr)] gap-4 border-b border-gray-200 py-6 md:grid-cols-[96px_minmax(0,1fr)] md:py-8"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.08 }}
              >
                <span className="text-3xl font-bold leading-none tabular-nums text-gray-200 md:text-5xl">{point.no}</span>
                <div>
                  <h3 className="text-lg font-bold text-navy-900 md:text-xl">{point.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-500 break-keep">{point.description}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>
    </MotionConfig>
  );
}

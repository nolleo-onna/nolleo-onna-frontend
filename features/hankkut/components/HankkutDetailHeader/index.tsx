"use client";

import Image from "next/image";
import { type Variants, MotionConfig, motion } from "motion/react";
import { Clock, MapPin, Ticket } from "lucide-react";

import TiltCard from "@/components/ui/TiltCard";
import BackButton from "@/features/hankkut/components/HankkutDetailHeader/BackButton";
import SaveButton from "@/features/hankkut/components/HankkutDetailHeader/SaveButton";

import type { LucideIcon } from "lucide-react";
import type { HankkutDetail } from "@/features/hankkut/data/hankkutDetail";

const CATEGORY_BADGE_STYLES: Record<HankkutDetail["category"], string> = {
  "오늘 행사": "bg-pink-500 text-white",
  "무료로 즐기기": "bg-lime-300 text-navy-900",
  "할인 혜택 팁": "bg-navy-900 text-lime-300 ring-1 ring-inset ring-white/20",
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
};

function HeroFact({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 gap-3 ${className}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/10">
        <Icon className="h-4 w-4 text-lime-300" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold tracking-wider text-white/45">{label}</dt>
        <dd className="mt-0.5 line-clamp-2 text-sm font-semibold text-white/90 break-keep" title={value}>
          {value}
        </dd>
      </div>
    </div>
  );
}

interface HankkutDetailHeaderProps {
  hankkut: HankkutDetail;
}

/** 한끗 상세 첫 화면 — 행사 상세처럼 사진이 흐린 배경 위로 떠오르고, 제목·위치·운영시간·요금이 차례로 올라온다 */
export default function HankkutDetailHeader({ hankkut }: HankkutDetailHeaderProps) {
  return (
    <MotionConfig reducedMotion="user">
      <section className="relative isolate overflow-hidden bg-navy-900 text-white">
        <motion.div
          aria-hidden
          className="absolute inset-0 -z-20"
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 0.55, scale: 1.08 }}
          transition={{ duration: 1.4, ease: EASE_OUT }}
        >
          <Image src={hankkut.imageUrl} alt="" fill priority quality={30} sizes="100vw" className="object-cover blur-3xl saturate-150" />
        </motion.div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-900/40 via-navy-900/75 to-navy-900" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-ocean-500/20 blur-3xl"
        />

        <div className="mx-auto max-w-[1180px] px-5 pb-12 pt-6 md:px-10 md:pb-16 md:pt-8">
          <div className="flex items-center justify-between">
            <BackButton />
            <SaveButton id={hankkut.id} />
          </div>

          <div className="mt-6 grid items-center gap-8 md:mt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,480px)] md:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 3, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 110, damping: 18, delay: 0.05 }}
              className="md:order-last"
            >
              <TiltCard>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-navy-800 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
                  <Image
                    src={hankkut.imageUrl}
                    alt={hankkut.title}
                    fill
                    priority
                    quality={90}
                    sizes="(max-width: 768px) 100vw, 480px"
                    className="object-cover"
                  />
                </div>
              </TiltCard>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" animate="visible" className="min-w-0">
              <motion.div variants={rise} className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${CATEGORY_BADGE_STYLES[hankkut.category]}`}>
                  {hankkut.category}
                </span>
                <span className="text-xs font-medium text-white/60">
                  {hankkut.region} · {hankkut.date}
                </span>
              </motion.div>
              <motion.h1
                variants={rise}
                className="mt-4 text-3xl font-bold leading-tight tracking-tight text-balance break-keep md:text-[40px]"
              >
                {hankkut.title}
              </motion.h1>
              <motion.p variants={rise} className="mt-4 text-[15px] leading-relaxed text-white/70 break-keep">
                {hankkut.summary}
              </motion.p>
              <motion.dl variants={rise} className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
                <HeroFact icon={MapPin} label="위치" value={hankkut.address} className="sm:col-span-2" />
                <HeroFact icon={Clock} label="운영시간" value={hankkut.hours} />
                <HeroFact icon={Ticket} label="요금" value={hankkut.fee} />
              </motion.dl>
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

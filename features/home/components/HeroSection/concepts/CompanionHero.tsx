"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Baby, Heart, User, Users } from "lucide-react";

import ConceptShell from "./ConceptShell";

import type { LucideIcon } from "lucide-react";

const T = "https://tong.visitkorea.or.kr/cms/resource/";
const COMPANIONS: { key: string; icon: LucideIcon; photo: string; mood: string[]; route: string[]; price: string }[] = [
  {
    key: "연인",
    icon: Heart,
    photo: `${T}11/3413711_image2_1.jpg`,
    mood: ["노을", "야경", "바다뷰"],
    route: ["송도 케이블카", "암남공원", "조개구이"],
    price: "1인 4.2만원",
  },
  {
    key: "친구",
    icon: Users,
    photo: `${T}60/3496960_image2_1.jpg`,
    mood: ["핫플", "카페", "먹방"],
    route: ["전포카페거리", "서면 먹자골목", "부산진시장"],
    price: "1인 2.9만원",
  },
  {
    key: "가족",
    icon: Baby,
    photo: `${T}74/3495874_image2_1.jpg`,
    mood: ["산책", "여유", "사진"],
    route: ["흰여울문화마을", "태종대", "영도 해물칼국수"],
    price: "1인 2.4만원",
  },
  {
    key: "혼자",
    icon: User,
    photo: `${T}02/3496802_image2_1.jpg`,
    mood: ["힐링", "걷기", "조용한"],
    route: ["이기대 해안길", "오륙도 스카이워크", "용호동 국밥"],
    price: "1인 1.6만원",
  },
];

/** 시안 G — "누구랑 가요?" 하나만 물어보고, 고르면 그 동행에 맞는 코스 미리보기가 바로 바뀐다 */
export default function CompanionHero() {
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  // 사용자가 직접 고르기 전까지는 알아서 넘겨 보여준다
  useEffect(() => {
    if (touched) return;
    const timer = setInterval(() => setActive((a) => (a + 1) % COMPANIONS.length), 3200);
    return () => clearInterval(timer);
  }, [touched]);

  const current = COMPANIONS[active];

  return (
    <ConceptShell
      headline={
        <>
          이번 부산, <span className="text-lime-300">누구랑 가요?</span>
        </>
      }
    >
      <div className="mx-auto w-full max-w-[560px] px-5">
        <div role="tablist" className="mx-auto flex w-fit gap-1 rounded-full bg-navy-900/40 p-1 ring-1 ring-inset ring-white/20 backdrop-blur-xl">
          {COMPANIONS.map(({ key, icon: Icon }, i) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => {
                setTouched(true);
                setActive(i);
              }}
              className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-bold transition-colors md:px-5 ${
                i === active ? "text-navy-900" : "text-white/80 hover:text-white"
              }`}
            >
              {i === active && (
                <motion.span layoutId="companion-pill" className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
              )}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{key}</span>
            </button>
          ))}
        </div>

        <div className="relative mt-5 h-[168px] md:h-[184px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={current.key}
              className="absolute inset-0 flex overflow-hidden rounded-[26px] bg-white text-left shadow-[0_24px_50px_-22px_rgba(5,12,26,0.6)]"
              initial={{ opacity: 0, y: 18, rotate: 2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: -12, rotate: -2 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <div className="relative w-[38%] shrink-0">
                <Image src={current.photo} alt="" fill sizes="220px" className="object-cover" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col p-4">
                <div className="flex flex-wrap gap-1">
                  {current.mood.map((m) => (
                    <span key={m} className="rounded-full bg-ocean-50 px-2 py-0.5 text-[11px] font-bold text-ocean-600">
                      #{m}
                    </span>
                  ))}
                </div>
                <ol className="mt-3 space-y-1">
                  {current.route.map((stop, i) => (
                    <motion.li
                      key={stop}
                      className="flex items-center gap-2 text-[13px] font-semibold text-navy-900 md:text-[14px]"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + i * 0.1 }}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-900 text-[10px] font-bold text-lime-300">{i + 1}</span>
                      <span className="truncate">{stop}</span>
                    </motion.li>
                  ))}
                </ol>
                <p className="mt-auto text-[12px] tabular-nums text-gray-500">{current.price} · 온나 추천 예시</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ConceptShell>
  );
}

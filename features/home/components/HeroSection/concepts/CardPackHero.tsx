"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  CalendarDays,
  ChevronsRight,
  Coffee,
  Flame,
  MoonStar,
  RotateCcw,
  Sparkles,
  Sun,
  Users,
  UtensilsCrossed,
  Waves,
  Wind,
} from "lucide-react";

import AssistantAvatar from "@/components/ui/Chat/AssistantAvatar";
import ConceptShell from "./ConceptShell";

import type { LucideIcon } from "lucide-react";
import type { PanInfo } from "motion/react";

const T = "https://tong.visitkorea.or.kr/cms/resource/";

type KindKey = "cafe" | "food" | "sea" | "night";
/**
 * 카드 종류별 색.
 * frame은 카드 테두리(실제 카드처럼 진하게), chip은 가격 배지, caption은 코스 설명 띠.
 * 파스텔로 흐리게 두면 흰 카드 위에서 테두리인지 얼룩인지 구분이 안 돼서 채도를 올렸다.
 */
const KINDS: Record<
  KindKey,
  { icon: LucideIcon; frame: string; ring: string; energy: string; chip: string; caption: string }
> = {
  cafe: {
    icon: Coffee,
    frame: "from-amber-400 via-amber-200 to-orange-500",
    ring: "ring-amber-400",
    energy: "bg-amber-500",
    chip: "bg-amber-500 text-white",
    caption: "bg-amber-100 text-amber-900",
  },
  food: {
    icon: UtensilsCrossed,
    frame: "from-rose-400 via-rose-200 to-red-500",
    ring: "ring-rose-400",
    energy: "bg-rose-500",
    chip: "bg-rose-500 text-white",
    caption: "bg-rose-100 text-rose-900",
  },
  sea: {
    icon: Waves,
    frame: "from-sky-400 via-cyan-200 to-blue-500",
    ring: "ring-sky-400",
    energy: "bg-sky-500",
    chip: "bg-sky-500 text-white",
    caption: "bg-sky-100 text-sky-900",
  },
  night: {
    icon: MoonStar,
    frame: "from-indigo-400 via-violet-300 to-indigo-600",
    ring: "ring-indigo-400",
    energy: "bg-indigo-500",
    chip: "bg-indigo-500 text-white",
    caption: "bg-indigo-100 text-indigo-900",
  },
};

interface CourseCard {
  no: string;
  kind: KindKey | "rare";
  title: string;
  area: string;
  caption: string;
  price: string;
  photo: string;
  stops: [string, string][];
  with: string;
  distance: string;
  crowd: string;
  rarity: 1 | 2 | 3 | "rare";
}

// 한 팩 5장 — 마지막 장은 레어 확정. 코스 내용은 시연용 예시
const CARDS: CourseCard[] = [
  {
    no: "001", kind: "cafe", title: "전포 카페 골목", area: "부산진구 · 전포동", caption: "카페 코스 · 반나절", price: "2.9만",
    photo: `${T}60/3496960_image2_1.jpg`, stops: [["브런치 카페", "50분"], ["전포공구길 산책", "30분"], ["디저트 카페", "40분"]],
    with: "친구", distance: "1.8km", crowd: "여유", rarity: 1,
  },
  {
    no: "002", kind: "food", title: "국제시장 먹방", area: "중구 · 신창동", caption: "먹방 코스 · 반나절", price: "2.2만",
    photo: `${T}30/3476830_image2_1.jpg`, stops: [["비빔당면", "20분"], ["유부주머니", "20분"], ["씨앗호떡", "15분"]],
    with: "친구", distance: "1.2km", crowd: "보통", rarity: 1,
  },
  {
    no: "003", kind: "sea", title: "흰여울 바다 산책", area: "영도구 · 영선동", caption: "바다 코스 · 반나절", price: "1.5만",
    photo: `${T}74/3495874_image2_1.jpg`, stops: [["흰여울 해안터널", "30분"], ["절벽 카페", "50분"], ["바다 전망 광장", "20분"]],
    with: "가족", distance: "2.4km", crowd: "여유", rarity: 2,
  },
  {
    no: "004", kind: "night", title: "황령산 야경", area: "남구 · 대연동", caption: "야경 코스 · 저녁", price: "3.1만",
    photo: `${T}50/2732750_image2_1.jpg`, stops: [["문현동 곱창골목", "60분"], ["황령산 전망쉼터", "40분"], ["봉수대 야경", "30분"]],
    with: "연인", distance: "6.5km", crowd: "여유", rarity: 3,
  },
  {
    no: "005", kind: "rare", title: "송도 노을 케이블카", area: "서구 · 암남동", caption: "오늘의 레어 코스", price: "4.2만",
    photo: `${T}11/3413711_image2_1.jpg`, stops: [["송도 구름산책로", "30분"], ["해상케이블카", "40분"], ["조개구이 골목", "60분"]],
    with: "연인", distance: "3.0km", crowd: "여유", rarity: "rare",
  },
];
const RARITY_MARK = { 1: "◆", 2: "◆◆", 3: "◆◆◆", rare: "★" } as const;

const LIVE_CHIPS = [
  { icon: Sun, text: "지금 26° 맑음" },
  { icon: Users, text: "광안리 지금 여유" },
  { icon: CalendarDays, text: "진행 중인 행사 14개" },
  { icon: Flame, text: "송도 노을 코스 오늘 인기" },
  { icon: Wind, text: "바람 약함 · 산책하기 좋아요" },
  { icon: Coffee, text: "전포 카페거리 한산" },
];

/** 카드 디자인 원본 크기 — 실제 트레이딩 카드 비율(63:88) */
const CARD_NATIVE = "h-[336px] w-[240px]";
/** 원본을 통째로 키우는 배율 — 내부 px 값을 건드리지 않아 카드 안 비율이 그대로 유지된다 */
const CARD_SCALE = "scale-[1.08] md:scale-[1.32]";
/** 배율까지 반영한 실제 카드 박스 (240×336 × 배율) */
const CARD_BOX = "h-[363px] w-[259px] md:h-[444px] md:w-[317px]";

function Marquee() {
  const chips = [...LIVE_CHIPS, ...LIVE_CHIPS];
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <motion.div className="flex w-max gap-2" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}>
        {chips.map(({ icon: Icon, text }, i) => (
          <span
            key={`${text}-${i}`}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/12 px-3 py-1.5 text-[12px] font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur-md"
          >
            <Icon className="h-3.5 w-3.5 text-lime-300" />
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/**
 * 홀로그램 광택 — 무지개 띠가 카드 위를 천천히 오간다.
 * 어두운 면 위에서는 color-dodge가 확 타서 면 전체가 보라로 물든다.
 * 그럴 땐 opacity로 세기를 직접 낮춰 "쓸고 지나가는 광택"으로 보이게 한다.
 */
function HoloSheen({ strong = false, opacity }: { strong?: boolean; opacity?: number }) {
  const reduceMotion = useReducedMotion();
  const pos = useMotionValue(30);
  const backgroundPosition = useMotionTemplate`${pos}% ${pos}%`;

  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(pos, [0, 100], { duration: strong ? 2.4 : 3.6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" });
    return () => controls.stop();
  }, [pos, strong, reduceMotion]);

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 20%, rgba(255,119,198,0.6) 36%, rgba(120,224,255,0.6) 50%, rgba(255,236,120,0.6) 64%, transparent 80%)",
          backgroundSize: "260% 260%",
          backgroundPosition,
          mixBlendMode: "color-dodge",
          opacity: opacity ?? (strong ? 0.85 : 0.45),
        }}
      />
      {strong && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.95) 0.8px, transparent 1.3px)", backgroundSize: "9px 9px" }}
        />
      )}
    </>
  );
}

function NormalCard({ card }: { card: CourseCard }) {
  const kind = KINDS[card.kind as KindKey];
  const Icon = kind.icon;
  return (
    <div
      className={`h-full w-full rounded-[18px] bg-gradient-to-br p-[6px] shadow-[0_20px_44px_-18px_rgba(5,12,26,0.7)] ring-1 ring-inset ring-white/50 ${kind.frame}`}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[13px] bg-[#fcfcfe] px-2.5 pb-2 pt-2 text-left ring-1 ring-inset ring-black/[0.07]">
        {/* 레어도 — 예전엔 맨 아래 줄에 파묻혀 안 보였다. 카드 모서리로 올린다 */}
        <span className="absolute right-2 top-1.5 text-[9px] font-black tracking-tighter text-navy-900/25">
          {RARITY_MARK[card.rarity]}
        </span>

        <div className="flex items-end justify-between gap-1.5 pr-4">
          <div className="min-w-0">
            <p className="text-[8.5px] font-bold tracking-[0.08em] text-gray-400">{card.area}</p>
            <p className="truncate text-[16px] font-extrabold leading-tight tracking-tight text-navy-900">
              {card.title}
            </p>
          </div>
          {/* 가격·종류를 배지 하나로 합쳤다 — 예전엔 "1인"·금액·아이콘이 따로 놀았다 */}
          <div className={`flex shrink-0 items-center gap-1 rounded-full px-1.5 py-[3px] ${kind.chip}`}>
            <Icon className="h-3 w-3" />
            <span className="text-[12.5px] font-extrabold tabular-nums">{card.price}</span>
          </div>
        </div>

        <div className={`relative mt-2 h-[104px] shrink-0 overflow-hidden rounded-[9px] ring-2 md:h-[120px] ${kind.ring}`}>
          <Image src={card.photo} alt="" fill sizes="360px" draggable={false} className="object-cover" />
          {/* 사진이 프레임 안에 들어앉아 보이게 하는 안쪽 그림자 */}
          <div aria-hidden className="absolute inset-0 shadow-[inset_0_2px_10px_rgba(0,0,0,0.28)]" />
          {card.rarity === 3 && <HoloSheen />}
        </div>

        <p className={`mt-1.5 rounded-[5px] px-2 py-[3px] text-center text-[9px] font-bold tracking-wide ${kind.caption}`}>
          No.{card.no} · {card.caption}
        </p>

        {/* 행마다 flex-1 — 남는 세로 공간을 고르게 나눠 가져서 마지막 줄 아래가 휑해지지 않는다 */}
        <ul className="mt-1 flex min-h-0 flex-1 flex-col">
          {card.stops.map(([name, time]) => (
            <li key={name} className="flex flex-1 items-center gap-1.5 border-b border-gray-100 last:border-0">
              <span className={`h-[7px] w-[7px] shrink-0 rounded-full ${kind.energy}`} />
              <span className="flex-1 truncate text-[11.5px] font-bold text-navy-900">{name}</span>
              <span className="text-[10.5px] font-extrabold tabular-nums text-gray-400">{time}</span>
            </li>
          ))}
        </ul>

        {/* 예전엔 3칸 표 + 별도 하단 줄로 두 겹이었다. 한 줄로 합쳐 카드가 스펙시트처럼 안 보이게 */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-1.5 text-[9px] font-bold text-gray-500">
          <span className="truncate">
            {card.with} · {card.distance} · {card.crowd}
          </span>
          <span className="shrink-0 tabular-nums text-gray-300">{card.no}/005</span>
        </div>
      </div>
    </div>
  );
}

/** 레어 카드 — 사진이 카드 전체를 채우는 풀아트 + 강한 홀로 */
function RareCard({ card }: { card: CourseCard }) {
  return (
    <div className="h-full w-full rounded-[18px] bg-gradient-to-br from-amber-300 via-yellow-100 to-amber-500 p-[6px] shadow-[0_26px_64px_-16px_rgba(245,175,60,0.9)] ring-1 ring-inset ring-white/60">
      <div className="relative h-full w-full overflow-hidden rounded-[13px] ring-1 ring-inset ring-black/20">
        <Image src={card.photo} alt="" fill sizes="360px" draggable={false} className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/85" />
        <HoloSheen strong />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5 text-left text-white">
          <div className="min-w-0">
            <p className="text-[8.5px] font-bold tracking-[0.08em] text-white/75">{card.area}</p>
            <p className="text-[17px] font-black leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              {card.title}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-400 px-1.5 py-[3px] text-navy-900">
            <Sparkles className="h-3 w-3" />
            <span className="text-[12.5px] font-extrabold tabular-nums">{card.price}</span>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-2.5 text-left text-white">
          <p className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-300 to-pink-300 px-2 py-0.5 text-[10px] font-extrabold text-navy-900">
            <Sparkles className="h-3 w-3" />
            {card.caption}
          </p>
          <ul className="space-y-1">
            {card.stops.map(([name, time]) => (
              <li key={name} className="flex items-center justify-between rounded-md bg-white/15 px-2 py-1 text-[11px] font-bold backdrop-blur-sm">
                <span className="truncate">{name}</span>
                <span className="tabular-nums">{time}</span>
              </li>
            ))}
          </ul>
          <div className="mt-1.5 flex justify-between text-[9px] font-bold text-white/80">
            <span className="tabular-nums">
              {card.no}/005 · {card.with} · {card.distance}
            </span>
            <span className="text-amber-300">★</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseCardFace({ card }: { card: CourseCard }) {
  // 원본(240×336)으로 그린 카드를 통째로 확대한다 — 안쪽 px 값을 그대로 둬도 비율이 안 깨진다
  return (
    <div className="h-full w-full">
      <div className={`origin-top-left ${CARD_NATIVE} ${CARD_SCALE}`}>
        {card.rarity === "rare" ? <RareCard card={card} /> : <NormalCard card={card} />}
      </div>
    </div>
  );
}

/** 1단계 — 둥실 떠 있는 팩. 옆으로 밀면 뜯는 선이 따라 빛나고, 끝까지 밀거나 누르면 뜯긴다 */
function Pack({ onOpen }: { onOpen: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const cut = useMotionValue(0);
  const cutWidth = useTransform(cut, (v) => `calc(${v * 100}% - ${v * 16}px)`);
  const [torn, setTorn] = useState(false);

  // torn은 애니메이션이 끝나야 true가 돼서, 그 사이에 tear()가 또 불리면
  // onOpen 타이머가 두 번 걸린다. 시작 시점에 바로 잠근다.
  const tearingRef = useRef(false);

  const tear = () => {
    if (torn || tearingRef.current) return;
    tearingRef.current = true;
    animate(cut, 1, {
      duration: 0.22,
      ease: "easeOut",
      onComplete: () => {
        setTorn(true);
        setTimeout(onOpen, 650);
      },
    });
  };

  const handlePan = (_: PointerEvent, info: PanInfo) => {
    if (torn) return;
    const width = ref.current?.offsetWidth ?? 240;
    cut.set(Math.min(1, Math.abs(info.offset.x) / (width * 0.8)));
  };

  const handlePanEnd = () => {
    if (torn) return;
    if (cut.get() > 0.6) tear();
    else animate(cut, 0, { type: "spring", stiffness: 300, damping: 28 });
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-label="카드팩 뜯기"
        className={`relative cursor-pointer select-none ${CARD_BOX}`}
        style={{ touchAction: "pan-y" }}
        animate={torn ? { y: 0, rotate: 0 } : { y: [0, -10, 0], rotate: [-2, 2, -2] }}
        transition={torn ? { duration: 0.2 } : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        whileHover={torn ? undefined : { scale: 1.03 }}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        // 예전엔 cut이 0에 가까울 때만 뜯었는데, 클릭이 미세한 pan으로 잡히면
        // cut이 남아 있어서 눌러도 안 뜯겼다. 이제 누르면 항상 뜯긴다(중복은 tear가 막는다).
        onTap={() => tear()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && tear()}
      >
        {/* 뜯겨 나가는 윗부분 */}
        <motion.div
          className="absolute inset-x-0 top-0 z-10 flex h-[16%] items-center justify-center overflow-hidden rounded-t-[16px] bg-gradient-to-b from-[#1c2745] to-[#0e1628] ring-1 ring-inset ring-white/10"
          animate={torn ? { y: -110, x: 70, rotate: 24, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          {/* 포일을 접어 눌러 붙인 윗단 — 가는 밝은 선 + 압착 자국 */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-white/45 to-transparent" />
          <div
            aria-hidden
            className="absolute inset-x-0 top-[7px] h-1.5 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.22)_0_2px,transparent_2px_7px)]"
          />
          <span className="mt-1.5 text-[11px] font-extrabold tracking-[0.34em] text-lime-300/85">TEAR HERE</span>
        </motion.div>

        {/* 팩 몸통 */}
        <motion.div
          className="absolute inset-x-0 bottom-0 top-[16%] overflow-hidden rounded-b-[16px] bg-gradient-to-b from-[#17223f] via-[#0a1123] to-[#111b33] shadow-[0_34px_72px_-26px_rgba(3,8,20,0.95)] ring-1 ring-inset ring-white/10"
          animate={torn ? { y: 80, opacity: 0, scale: 0.94 } : { y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: torn ? 0.18 : 0 }}
        >
          {/* 포일 결 — 반투명 사진을 깔면 탁해 보여서, 결이 있는 어두운 면으로 바꿨다 */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "repeating-linear-gradient(115deg, rgba(255,255,255,0.9) 0 1px, transparent 1px 7px)" }}
          />
          {/* 엠블럼 뒤에서 번지는 라임 발광 */}
          <div aria-hidden className="absolute left-1/2 top-[38%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-300/20 blur-3xl" />
          {/* 어두운 남색 위라 기본 세기(0.85)면 면 전체가 보라로 타버린다 */}
          <HoloSheen strong opacity={0.3} />
          {/* 왼쪽 위에서 들어오는 빛 — 평평한 사각형이 아니라 물체로 보이게 */}
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_42%)]" />

          <div className="relative flex h-full flex-col items-center justify-between px-5 pb-6 pt-6 text-center text-white">
            <p className="text-[11px] font-extrabold tracking-[0.36em] text-white/55">NOLLEO ONNA</p>
            <div>
              <div className="mx-auto flex h-[84px] w-[84px] items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25 backdrop-blur-sm">
                <AssistantAvatar size={58} />
              </div>
              <p className="mt-5 text-[30px] font-black leading-[1.15] tracking-tight break-keep drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
                오늘의
                <br />
                부산 코스 팩
              </p>
            </div>
            {/* 아이콘 4개를 늘어놓는 대신 한 줄 배지로 — 앞면 글자를 줄인다 */}
            <p className="inline-flex items-center gap-1.5 rounded-full bg-lime-300/15 px-3 py-1 text-[12px] font-bold text-lime-300 ring-1 ring-inset ring-lime-300/30">
              <Sparkles className="h-3.5 w-3.5" />5장 · 레어 1장 확정
            </p>
          </div>
          {/* 아래쪽 포일 압착선 */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1.5 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.2)_0_2px,transparent_2px_7px)]"
          />
        </motion.div>

        {/* 뜯는 선 — 민 만큼 빛난다 */}
        {!torn && (
          <>
            <div className="absolute inset-x-2 top-[16%] z-20 border-t-2 border-dashed border-white/35" />
            <motion.div
              className="absolute left-2 top-[16%] z-20 h-[3px] -translate-y-[2px] rounded-full bg-lime-300 shadow-[0_0_14px_4px_rgba(200,241,53,0.9)]"
              style={{ width: cutWidth }}
            />
          </>
        )}

        {/* 뜯는 순간 번쩍 */}
        {torn && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[16%] z-30 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-2xl"
            initial={{ opacity: 0.9, scale: 0.3 }}
            animate={{ opacity: 0, scale: 2.2 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.div>

      <motion.p
        className="mt-6 flex items-center gap-1 text-[13px] font-semibold text-white/90"
        animate={torn ? { opacity: 0 } : { x: [0, 6, 0] }}
        transition={torn ? { duration: 0.2 } : { duration: 1.4, repeat: Infinity }}
      >
        옆으로 밀거나 눌러서 팩 뜯기
        <ChevronsRight className="h-4 w-4 text-lime-300" />
      </motion.p>
    </div>
  );
}

const SPARKS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  const radius = 150 + (i % 3) * 22;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius * 1.15, delay: (i % 5) * 0.18 };
});

/** 레어 카드 차례에 뒤에서 도는 빛줄기 + 반짝이 */
function RareBurst() {
  return (
    <motion.div className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      <motion.div
        className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: "repeating-conic-gradient(from 0deg, rgba(255,236,140,0.45) 0deg 7deg, transparent 7deg 20deg)",
          maskImage: "radial-gradient(circle, black 18%, transparent 62%)",
          WebkitMaskImage: "radial-gradient(circle, black 18%, transparent 62%)",
        }}
        initial={{ scale: 0.3 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ scale: { duration: 0.5, ease: "easeOut" }, rotate: { duration: 16, repeat: Infinity, ease: "linear" } }}
      />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/40 blur-3xl" />
      {SPARKS.map((spark, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 text-amber-200"
          style={{ x: spark.x, y: spark.y }}
          animate={{ scale: [0, 1, 0], rotate: [0, 90] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: spark.delay }}
        >
          <Sparkles className="h-4 w-4 -translate-x-1/2 -translate-y-1/2" />
        </motion.span>
      ))}
    </motion.div>
  );
}

function SwipeCard({ card, depth, dir, onSwipe }: { card: CourseCard; depth: number; dir: number; onSwipe: (dir: number) => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-22, 22]);
  const dragged = useRef(false);
  const isTop = depth === 0;

  return (
    <motion.div
      className={`absolute inset-0 ${isTop ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={{ x, rotate, zIndex: 10 - depth, touchAction: "pan-y" }}
      custom={dir}
      variants={{
        exit: (d: number) => ({ x: d * 480, y: -30, rotate: d * 32, opacity: 0, transition: { duration: 0.42, ease: "easeIn" } }),
      }}
      initial={{ y: 140, opacity: 0, scale: 0.85 }}
      animate={{ y: depth * 9, scale: 1 - depth * 0.05, opacity: depth > 2 ? 0 : 1 }}
      exit="exit"
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: depth * 0.06 }}
      drag={isTop ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.85}
      whileDrag={{ scale: 1.04 }}
      onTapStart={() => {
        dragged.current = false;
      }}
      onDragStart={() => {
        dragged.current = true;
      }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) onSwipe(info.offset.x > 0 ? 1 : -1);
      }}
      onTap={() => {
        if (isTop && !dragged.current) onSwipe(-1);
      }}
    >
      <CourseCardFace card={card} />
    </motion.div>
  );
}

/** 2단계 — 쌓인 카드를 한 장씩 옆으로 넘긴다. 마지막은 레어 */
function CardStack({ onDone }: { onDone: () => void }) {
  const [top, setTop] = useState(0);
  const [dir, setDir] = useState(-1);
  const rareOnTop = CARDS[top]?.rarity === "rare";

  useEffect(() => {
    if (top < CARDS.length) return;
    const timer = setTimeout(onDone, 380);
    return () => clearTimeout(timer);
  }, [top, onDone]);

  const swipe = (d: number) => {
    setDir(d);
    setTop((t) => t + 1);
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${CARD_BOX}`}>
        <AnimatePresence>{rareOnTop && <RareBurst key="burst" />}</AnimatePresence>
        <AnimatePresence custom={dir}>
          {CARDS.map((card, i) => {
            const depth = i - top;
            if (depth < 0 || depth > 3) return null;
            return <SwipeCard key={card.no} card={card} depth={depth} dir={dir} onSwipe={swipe} />;
          }).reverse()}
        </AnimatePresence>
      </div>
      <div className="mt-6 flex items-center gap-2 text-[12px] font-semibold text-white/90">
        <span className="rounded-full bg-white/15 px-2 py-0.5 tabular-nums ring-1 ring-inset ring-white/25">
          {Math.min(top + 1, CARDS.length)} / {CARDS.length}
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={rareOnTop ? "rare" : "normal"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
            {rareOnTop ? "✦ 레어 코스 등장!" : "옆으로 넘기거나 눌러서 다음 카드"}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** 3단계 — 뽑은 5장을 부채꼴로 펼쳐 보여주고, 다시 뜯거나 코스로 이어간다 */
function Collection({ onReset }: { onReset: () => void }) {
  const mid = (CARDS.length - 1) / 2;
  return (
    <div className="flex flex-col items-center pt-6">
      <div className="flex items-end justify-center">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.no}
            className="relative -mx-6 h-[153px] w-[109px] md:-mx-4 md:h-[222px] md:w-[159px]"
            initial={{ opacity: 0, y: 60, rotate: 0 }}
            animate={{ opacity: 1, y: Math.abs(i - mid) * 14, rotate: (i - mid) * 8 }}
            whileHover={{ y: -26, rotate: 0, scale: 1.08, zIndex: 20 }}
            transition={{ type: "spring", stiffness: 220, damping: 20, delay: i * 0.07 }}
          >
            <div className={`absolute left-0 top-0 origin-top-left scale-[0.42] md:scale-[0.5] ${CARD_BOX}`}>
              <CourseCardFace card={card} />
            </div>
          </motion.div>
        ))}
      </div>
      <p className="mt-14 text-[13px] font-semibold text-white/90">오늘 뽑은 코스 5장 — 마음에 드는 카드로 바로 시작해요</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <motion.button
          type="button"
          onClick={onReset}
          whileTap={{ scale: 0.94 }}
          className="inline-flex items-center gap-1.5 rounded-full bg-lime-300 px-4 py-2 text-[14px] font-bold text-navy-900 shadow-[0_8px_20px_-8px_rgba(200,241,53,0.8)]"
        >
          <RotateCcw className="h-4 w-4" />새 팩 뜯기
        </motion.button>
        <button type="button" className="rounded-full bg-white/15 px-4 py-2 text-[14px] font-semibold text-white ring-1 ring-inset ring-white/30">
          레어 코스로 시작하기
        </button>
      </div>
    </div>
  );
}

type Phase = "pack" | "cards" | "done";

/** 시안 C · 오늘의 코스 팩 — 카드팩을 뜯어 오늘 놀 코스를 뽑는다: 팩 뜯기 → 한 장씩 넘기기 → 마지막 레어 → 펼쳐 보기 */
export default function CardPackHero() {
  const [phase, setPhase] = useState<Phase>("pack");
  const [round, setRound] = useState(0);

  return (
    <ConceptShell
      headline={
        <>
          오늘의 부산 코스, <span className="text-lime-300">한 팩 뜯어볼래요?</span>
        </>
      }
    >
      <MotionConfig reducedMotion="user">
        <div className="mx-auto w-full max-w-[720px] px-5">
          <Marquee />
          <div className="relative mt-7 flex h-[420px] justify-center md:h-[500px]">
            <AnimatePresence mode="wait">
              {phase === "pack" && (
                <motion.div key={`pack-${round}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <Pack onOpen={() => setPhase("cards")} />
                </motion.div>
              )}
              {phase === "cards" && (
                <motion.div key="cards" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <CardStack onDone={() => setPhase("done")} />
                </motion.div>
              )}
              {phase === "done" && (
                <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Collection
                    onReset={() => {
                      setRound((r) => r + 1);
                      setPhase("pack");
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </MotionConfig>
    </ConceptShell>
  );
}

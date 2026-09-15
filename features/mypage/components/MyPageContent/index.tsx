"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Variants, MotionConfig, motion } from "motion/react";
import {
  ArrowUpRight,
  Bell,
  Bookmark,
  ChevronRight,
  FileText,
  Heart,
  LogOut,
  MapPin,
  MessageSquareText,
  Route,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useMyCourses } from "@/features/course/hooks/useMyCourses";
import { useFavoriteStats } from "@/features/mypage/hooks/useFavoriteStats";
import { useFavoritesList } from "@/features/spot/hooks/useFavorites";
import { useFavoritePlaceImages } from "@/features/mypage/hooks/useFavoritePlaceImages";
import { CATEGORY_META } from "@/features/spot/constants/categoryMap";
import NotificationSettingsModal from "@/features/mypage/components/NotificationSettingsModal";
import { MOCK_HANKKUT_LIST } from "@/features/hankkut/data/mockHankkut";
import SkyScene from "@/features/home/components/TodayStrip/SkyScene";

import type { LucideIcon } from "lucide-react";
import type { MyCourseSummary } from "@/types/course";
import type { Hankkut } from "@/features/hankkut/data/mockHankkut";

function toHttps(url?: string) {
  return url?.replace(/^http:\/\//, "https://");
}

const RECENT_COURSES_LIMIT = 4;
const SAVED_HANKKUT_LIMIT = 4;
const FAVORITE_PLACES_LIMIT = 4;
const HANKKUT_BOOKMARK_STORAGE_KEY = "hankkut:bookmarks";
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const CATEGORY_DOT_STYLES: Record<Hankkut["category"], string> = {
  "오늘 행사": "bg-pink-500",
  "무료로 즐기기": "bg-lime-400",
  "할인 혜택 팁": "bg-navy-900",
};

const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const heroRise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};
const sectionRise = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.45, ease: EASE_OUT },
};

// 한끗 찜은 백엔드 API가 없어 localStorage에만 저장된다(useHankkutBookmark 참고).
function useSavedHankkut() {
  const [saved, setSaved] = useState<Hankkut[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HANKKUT_BOOKMARK_STORAGE_KEY);
      const ids = raw ? (JSON.parse(raw) as number[]) : [];
      /* eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 후에만 localStorage를 읽어야 하이드레이션 불일치가 안 생김 */
      setSaved(MOCK_HANKKUT_LIST.filter((item) => ids.includes(item.id)));
    } catch {
      setSaved([]);
    }
  }, []);

  return saved;
}

function LoadingState() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 pt-28 pb-20 md:px-10 lg:px-20">
      <div className="animate-shimmer h-64 rounded-[32px]" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="animate-shimmer h-48 rounded-[24px]" />
        ))}
      </div>
    </main>
  );
}

function LoggedOutState() {
  const router = useRouter();

  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 pt-28 pb-20 md:px-10 lg:px-20">
      <section className="relative isolate flex flex-col items-center gap-6 overflow-hidden rounded-[32px] bg-ocean-600 px-6 py-20 text-center text-white">
        <div className="absolute inset-0 -z-10">
          <SkyScene phase="day" pty={0} hideDecorOnMobile />
        </div>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-1 ring-inset ring-white/30 backdrop-blur-sm">
          <MapPin className="h-8 w-8 text-lime-300" />
        </div>
        <div>
          <p className="text-2xl font-bold">로그인이 필요해요</p>
          <p className="mt-2 text-sm text-white/85">로그인하고 나만의 부산 여행 기록을 모아보세요</p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="rounded-full bg-lime-300 px-8 py-3 text-sm font-bold text-navy-900 transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          로그인하러 가기
        </button>
      </section>
    </main>
  );
}

// ── 프로필 헤더 ───────────────────────────────────────────────────────────────
interface ProfileHeroProps {
  nickname: string;
  email: string;
  profileImageUrl?: string;
  isAdmin: boolean;
  stats: { label: string; value: string; icon: LucideIcon }[];
}

const QUICK_ACTIONS = [
  { href: "/", label: "새 코스 만들기", icon: Sparkles, primary: true },
  { href: "/spot", label: "스팟 찾기", icon: MapPin, primary: false },
  { href: "/hankkut", label: "한끗 둘러보기", icon: MessageSquareText, primary: false },
];

function ProfileHero({ nickname, email, profileImageUrl, isAdmin, stats }: ProfileHeroProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-[32px] bg-ocean-600 text-white">
      {/* 맑은 낮 하늘 — 홈 "오늘의 부산" 카드와 같은 장면(해·구름이 천천히 움직임), 시간대와 상관없이 늘 밝게 */}
      <div className="absolute inset-0 -z-10">
        <SkyScene phase="day" pty={0} hideDecorOnMobile />
      </div>

      <div className="grid gap-8 px-6 py-9 md:px-10 md:py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <motion.div variants={heroStagger} initial="hidden" animate="visible" className="min-w-0">
          <motion.div variants={heroRise} className="flex items-center gap-4">
            {profileImageUrl ? (
              <Image
                src={toHttps(profileImageUrl)!}
                alt={nickname}
                width={72}
                height={72}
                className="h-[72px] w-[72px] shrink-0 rounded-full object-cover ring-4 ring-lime-300/80"
              />
            ) : (
              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-lime-300 ring-4 ring-white/10">
                <span className="text-2xl font-bold text-navy-900">{nickname.charAt(0)}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm text-white/85">안녕하세요,</p>
              <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight md:text-4xl">
                <span className="truncate">{nickname}</span>
                <span className="shrink-0 text-white/75">님</span>
                {isAdmin && (
                  <span className="shrink-0 rounded-full bg-lime-300 px-2 py-0.5 text-[10px] font-bold text-navy-900">
                    ADMIN
                  </span>
                )}
              </h1>
              <p className="mt-1 truncate text-sm text-white/80">{email}</p>
            </div>
          </motion.div>

          <motion.div variants={heroRise} className="mt-7 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map(({ href, label, icon: Icon, primary }) => (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-transform hover:-translate-y-0.5 active:scale-95 ${
                  primary
                    ? "bg-lime-300 text-navy-900"
                    : "bg-white/20 text-white ring-1 ring-inset ring-white/30 backdrop-blur-sm hover:bg-white/30"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </motion.div>
        </motion.div>

        <motion.dl
          variants={heroRise}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-2.5 lg:w-[380px]"
        >
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl bg-white/15 px-4 py-3.5 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
              <Icon className="h-4 w-4 text-lime-300" />
              <dd className="mt-2 text-2xl font-bold tabular-nums">{value}</dd>
              <dt className="mt-0.5 text-[11px] text-white/85">{label}</dt>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}

// ── 공통 섹션 머리 ────────────────────────────────────────────────────────────
function SectionHead({
  icon: Icon,
  iconClass,
  title,
  href,
}: {
  icon: LucideIcon;
  iconClass: string;
  title: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-navy-900">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h2>
      <Link
        href={href}
        className="group inline-flex items-center gap-0.5 text-sm font-semibold text-gray-500 transition-colors hover:text-navy-900"
      >
        전체보기
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function EmptyBlock({ icon: Icon, text, href, cta }: { icon: LucideIcon; text: string; href: string; cta: string }) {
  return (
    <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center">
      <Icon className="h-6 w-6 text-gray-300" />
      <p className="text-sm text-gray-500">{text}</p>
      <Link
        href={href}
        className="rounded-full bg-navy-900 px-5 py-2 text-xs font-semibold text-lime-300 transition-transform active:scale-95"
      >
        {cta}
      </Link>
    </div>
  );
}

// ── 최근 만든 코스 — 한 줄 4장, 미니 동선 카드 ─────────────────────────────────
function RecentCoursesSection({ courses, isLoading }: { courses: MyCourseSummary[] | undefined; isLoading: boolean }) {
  const router = useRouter();

  return (
    <motion.section {...sectionRise} className="rounded-[28px] bg-white p-6 ring-1 ring-gray-100 md:p-7">
      <SectionHead icon={Route} iconClass="bg-ocean-50 text-ocean-600" title="최근 만든 코스" href="/course" />

      {isLoading ? (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="animate-shimmer h-44 rounded-2xl" />
          ))}
        </div>
      ) : !courses || courses.length === 0 ? (
        <EmptyBlock icon={Route} text="아직 만든 코스가 없어요" href="/" cta="첫 코스 만들러 가기" />
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {courses.slice(0, RECENT_COURSES_LIMIT).map((course) => {
            const stops = (course.spotTitles ?? []).slice(0, 3);
            const rest = (course.spotTitles?.length ?? 0) - stops.length;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => router.push(`/course/result?pairId=${course.pairId}`)}
                className="group flex h-full flex-col rounded-2xl bg-gray-50/70 p-4 text-left ring-1 ring-inset ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_36px_-18px_rgba(13,48,128,0.3)] hover:ring-ocean-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-[15px] font-bold leading-snug text-navy-900 break-keep">{course.title}</p>
                  {course.isPublic && (
                    <span className="shrink-0 rounded-full bg-lime-100 px-1.5 py-0.5 text-[10px] font-bold text-lime-700">공개</span>
                  )}
                </div>
                <ol className="mt-3 flex-1">
                  {stops.map((spot, i) => (
                    <li key={`${course.id}-${i}`} className="flex items-stretch gap-2.5">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                            i === 0 ? "bg-navy-900 text-lime-300" : "bg-white text-gray-500 ring-1 ring-gray-200"
                          }`}
                        >
                          {i + 1}
                        </span>
                        {(i < stops.length - 1 || rest > 0) && (
                          <span className="my-0.5 w-0 flex-1 border-l border-dashed border-gray-300" />
                        )}
                      </div>
                      <span className="truncate pb-2 text-[12px] text-gray-600">{spot}</span>
                    </li>
                  ))}
                  {rest > 0 && <li className="pl-6 text-[11px] font-medium text-gray-400">+{rest}곳</li>}
                </ol>
                <div className="mt-3 flex items-center justify-between border-t border-dashed border-gray-200 pt-3">
                  <span className="text-[15px] font-bold tabular-nums text-navy-900">
                    {course.totalCost > 0 ? `${course.totalCost.toLocaleString()}원` : "무료"}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-ocean-500" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}

// ── 찜한 장소 — 사진 타일 2×2 ─────────────────────────────────────────────────
// 서버에 저장된 찜한 장소 목록(스팟 페이지 하트와 같은 데이터).
// 헤더 아래 한 줄은 GET /users/me/favorite-stats — "오늘/이번 주/이번 달 N개 찜했어요" 문장.
function FavoritePlacesSection() {
  const { data: favorites, isLoading } = useFavoritesList();
  const { data: stats } = useFavoriteStats();
  const items = favorites ?? [];
  const shown = items.slice(0, FAVORITE_PLACES_LIMIT);
  const images = useFavoritePlaceImages(shown);

  return (
    <motion.section {...sectionRise} className="rounded-[28px] bg-white p-6 ring-1 ring-gray-100 md:p-7">
      <SectionHead icon={Heart} iconClass="bg-pink-50 text-pink-500" title="찜한 장소" href="/spot" />

      {stats && stats.count > 0 && (
        <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-semibold text-pink-600">
          <Sparkles className="h-3 w-3" />
          {stats.message}
        </p>
      )}

      {isLoading ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="animate-shimmer aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyBlock icon={Heart} text="아직 찜한 장소가 없어요" href="/spot" cta="스팟 구경하러 가기" />
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {shown.map((item) => {
            const imageUrl = images.get(item.mapPlaceId);
            const category =
              item.category && item.category in CATEGORY_META
                ? CATEGORY_META[item.category as keyof typeof CATEGORY_META]
                : null;
            const meta = [category?.label, item.district].filter(Boolean).join(" · ");

            return (
              <Link
                key={item.mapPlaceId}
                href={`/spot?keyword=${encodeURIComponent(item.name)}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-navy-700 to-ocean-600"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 280px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <MapPin className="absolute left-1/2 top-[38%] h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-white/30" strokeWidth={1.5} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <Heart className="absolute right-2.5 top-2.5 h-4 w-4 fill-pink-500 text-pink-500 drop-shadow" />
                <div className="absolute inset-x-3 bottom-2.5">
                  <p className="truncate text-[13px] font-bold text-white">{item.name}</p>
                  {meta && <p className="truncate text-[10px] text-white/70">{meta}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}

// ── 저장한 한끗 ───────────────────────────────────────────────────────────────
function SavedHankkutSection({ saved }: { saved: Hankkut[] }) {
  return (
    <motion.section {...sectionRise} className="rounded-[28px] bg-white p-6 ring-1 ring-gray-100 md:p-7">
      <SectionHead icon={Bookmark} iconClass="bg-lime-100 text-lime-700" title="저장한 한끗" href="/hankkut" />

      {saved.length === 0 ? (
        <EmptyBlock icon={Bookmark} text="아직 저장한 한끗 정보가 없어요" href="/hankkut" cta="한끗 정보 구경하기" />
      ) : (
        <ul className="mt-5 flex flex-col gap-2.5">
          {saved.slice(0, SAVED_HANKKUT_LIMIT).map((item) => (
            <li key={item.id}>
              <Link
                href={`/hankkut/${item.id}`}
                className="group flex items-center gap-3 rounded-2xl p-2 pr-3 ring-1 ring-inset ring-gray-100 transition-all duration-300 hover:bg-gray-50/70 hover:ring-ocean-200"
              >
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="80px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${CATEGORY_DOT_STYLES[item.category]}`} />
                    <span className="text-[11px] font-semibold text-gray-500">
                      {item.category} · {item.region}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[13px] font-semibold text-navy-900 break-keep">{item.title}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-ocean-500" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}

// ── 설정 — 한 줄 ─────────────────────────────────────────────────────────────
function SettingsSection({
  onOpenNotifications,
  onLogout,
  isLoggingOut,
}: {
  onOpenNotifications: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}) {
  const itemClass =
    "flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-left ring-1 ring-gray-100 transition-colors hover:bg-gray-50";

  return (
    <motion.section {...sectionRise} aria-label="설정" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <button onClick={onOpenNotifications} className={itemClass}>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500">
          <Bell className="h-4 w-4" />
        </span>
        <span className="flex-1 text-sm font-semibold text-gray-700">알림 설정</span>
        <ChevronRight className="h-4 w-4 text-gray-300" />
      </button>
      <Link href="/terms" className={itemClass}>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500">
          <FileText className="h-4 w-4" />
        </span>
        <span className="flex-1 text-sm font-semibold text-gray-700">이용약관</span>
        <ChevronRight className="h-4 w-4 text-gray-300" />
      </Link>
      <button onClick={onLogout} disabled={isLoggingOut} className={`${itemClass} disabled:opacity-50`}>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-error">
          <LogOut className="h-4 w-4" />
        </span>
        <span className="flex-1 text-sm font-semibold text-error">{isLoggingOut ? "로그아웃 중..." : "로그아웃"}</span>
      </button>
    </motion.section>
  );
}

export default function MyPageContent() {
  const { user, isLoading, isLoggedIn, logout, isLoggingOut } = useAuth();
  const { data: courses, isLoading: isCoursesLoading } = useMyCourses({
    enabled: isLoggedIn,
  });
  const savedHankkut = useSavedHankkut();
  const { data: favorites } = useFavoritesList();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  if (isLoading) return <LoadingState />;
  if (!isLoggedIn || !user) return <LoggedOutState />;

  const totalLikes = courses?.reduce((acc, c) => acc + (c.likeCount ?? 0), 0) ?? 0;

  const stats = [
    { label: "만든 코스", value: courses ? String(courses.length) : "-", icon: Route },
    { label: "찜한 장소", value: favorites ? String(favorites.length) : "-", icon: Heart },
    { label: "받은 좋아요", value: courses ? String(totalLikes) : "-", icon: Sparkles },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <main className="mx-auto w-full max-w-[1280px] px-5 pt-28 pb-20 md:px-10 lg:px-20">
        <ProfileHero
          nickname={user.nickname}
          email={user.email}
          profileImageUrl={user.profileImageUrl}
          isAdmin={user.role === "ADMIN"}
          stats={stats}
        />

        <div className="mt-8">
          <RecentCoursesSection courses={courses} isLoading={isCoursesLoading} />
        </div>

        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <FavoritePlacesSection />
          <SavedHankkutSection saved={savedHankkut} />
        </div>

        <div className="mt-6">
          <SettingsSection
            onOpenNotifications={() => setIsNotifOpen(true)}
            onLogout={() => logout()}
            isLoggingOut={isLoggingOut}
          />
        </div>

        <NotificationSettingsModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      </main>
    </MotionConfig>
  );
}

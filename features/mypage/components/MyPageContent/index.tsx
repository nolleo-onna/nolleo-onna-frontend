"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Bookmark,
  ChevronRight,
  Heart,
  LogOut,
  MapPin,
  Route,
  Sparkles,
  SquarePen,
  Wallet,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useMyCourses } from "@/features/course/hooks/useMyCourses";
import { useCustomNickname } from "@/features/mypage/hooks/useCustomNickname";
import NotificationSettingsModal from "@/features/mypage/components/NotificationSettingsModal";
import ProfileEditModal from "@/features/mypage/components/ProfileEditModal";
import { MOCK_HANKKUT_LIST } from "@/features/hankkut/data/mockHankkut";

import type { MyCourseSummary } from "@/types/course";
import type { Hankkut } from "@/features/hankkut/data/mockHankkut";

function toHttps(url?: string) {
  return url?.replace(/^http:\/\//, "https://");
}

const RECENT_COURSES_LIMIT = 4;
const SAVED_HANKKUT_LIMIT = 4;
const HANKKUT_BOOKMARK_STORAGE_KEY = "hankkut:bookmarks";

const CATEGORY_DOT_STYLES: Record<Hankkut["category"], string> = {
  "오늘 행사": "bg-pink-500",
  "무료로 즐기기": "bg-lime-400",
  "할인 혜택 팁": "bg-navy-900",
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
      <div className="animate-shimmer h-56 rounded-[28px]" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="animate-shimmer h-80 rounded-[28px] lg:col-span-2" />
        <div className="animate-shimmer h-80 rounded-[28px]" />
      </div>
    </main>
  );
}

function LoggedOutState() {
  const router = useRouter();

  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 pt-28 pb-20 md:px-10 lg:px-20">
      <section className="flex flex-col items-center gap-6 rounded-[28px] border border-gray-100 bg-gradient-to-br from-ocean-50 via-white to-lime-50 px-6 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-base">
          <MapPin className="h-8 w-8 text-ocean-500" />
        </div>
        <div>
          <p className="text-2xl font-bold text-navy-900">로그인이 필요해요</p>
          <p className="mt-2 text-sm text-gray-500">
            로그인하고 나만의 부산 여행 기록을 모아보세요
          </p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="rounded-full bg-ocean-500 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-ocean-600 active:scale-95"
        >
          로그인하러 가기
        </button>
      </section>
    </main>
  );
}

interface ProfileHeroProps {
  nickname: string;
  email: string;
  profileImageUrl?: string;
  isAdmin: boolean;
  stats: { label: string; value: string; icon: typeof Route }[];
  onEditProfile: () => void;
}

function ProfileHero({ nickname, email, profileImageUrl, isAdmin, stats, onEditProfile }: ProfileHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-gray-100 bg-gradient-to-br from-ocean-50 via-white to-lime-50 p-6 md:p-10">
      {/* 장식용 배경 원 */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-ocean-100/60 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-lime-100/70 blur-2xl" />

      <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          {profileImageUrl ? (
            <Image
              src={toHttps(profileImageUrl)!}
              alt={nickname}
              width={88}
              height={88}
              className="h-[88px] w-[88px] rounded-full border-4 border-white object-cover shadow-base"
            />
          ) : (
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-4 border-white bg-lime-300 shadow-base">
              <span className="text-3xl font-bold text-navy-900">
                {nickname.charAt(0)}
              </span>
            </div>
          )}

          <div>
            <p className="flex items-center gap-1 text-sm font-semibold text-ocean-600">
              <Sparkles className="h-3.5 w-3.5" />
              마이페이지
            </p>
            <div className="mt-1 flex items-center gap-2">
              <h1 className="relative text-2xl font-bold text-navy-900 md:text-3xl">
                <span className="absolute inset-x-0 bottom-0.5 -z-10 h-2.5 bg-lime-300/70" />
                {nickname}
              </h1>
              <button
                type="button"
                onClick={onEditProfile}
                aria-label="닉네임 수정"
                className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white hover:text-navy-900"
              >
                <SquarePen className="h-4 w-4" />
              </button>
              {isAdmin && (
                <span className="rounded-full bg-ocean-100 px-2 py-0.5 text-[10px] font-bold text-ocean-600">
                  ADMIN
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">{email}</p>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 rounded-2xl border border-white bg-white/80 px-4 py-3 backdrop-blur-sm md:min-w-[104px]"
            >
              <Icon className="h-4 w-4 text-ocean-500" />
              <span className="text-lg font-bold text-navy-900">{value}</span>
              <span className="text-[11px] text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface RecentCoursesSectionProps {
  courses: MyCourseSummary[] | undefined;
  isLoading: boolean;
}

function RecentCoursesSection({ courses, isLoading }: RecentCoursesSectionProps) {
  const router = useRouter();

  return (
    <section className="rounded-[28px] border border-gray-100 bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Route className="h-4 w-4 text-ocean-500" />
          <h2 className="text-base font-bold text-navy-900">최근 생성한 코스</h2>
        </div>
        <Link
          href="/course"
          className="flex items-center gap-0.5 text-xs text-gray-500 transition-colors hover:text-navy-900"
        >
          전체보기 <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-shimmer h-24 rounded-2xl" />
          ))}
        </div>
      ) : !courses || courses.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-gray-50 px-6 py-10 text-center">
          <p className="text-sm text-gray-500">아직 만든 코스가 없어요</p>
          <Link
            href="/course"
            className="rounded-full bg-navy-900 px-5 py-2 text-xs font-semibold text-lime-300 transition-transform active:scale-95"
          >
            첫 코스 만들러 가기
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {courses.slice(0, RECENT_COURSES_LIMIT).map((course) => (
            <div
              key={course.id}
              onClick={() => router.push(`/course/result?pairId=${course.pairId}`)}
              className="group cursor-pointer rounded-2xl border border-gray-100 p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-ocean-200 hover:shadow-[0_20px_40px_-16px_rgba(10,132,255,0.18)]"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-navy-900">{course.title}</p>
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-ocean-500" />
              </div>
              {course.description && (
                <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                  {course.description}
                </p>
              )}

              {course.spotTitles && course.spotTitles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {course.spotTitles.slice(0, 3).map((title) => (
                    <span
                      key={title}
                      className="rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600"
                    >
                      {title}
                    </span>
                  ))}
                  {course.spotTitles.length > 3 && (
                    <span className="rounded-full bg-ocean-50 px-2.5 py-1 text-[11px] font-semibold text-ocean-600">
                      +{course.spotTitles.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {course.spotTitles?.length ?? 0}곳
                </span>
                <span className="flex items-center gap-1">
                  <Wallet className="h-3 w-3" />
                  {course.totalCost > 0
                    ? `${course.totalCost.toLocaleString()}원`
                    : "무료"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SavedHankkutSection({ saved }: { saved: Hankkut[] }) {
  return (
    <section className="rounded-[28px] border border-gray-100 bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-pink-500" />
          <h2 className="text-base font-bold text-navy-900">저장한 한끗</h2>
        </div>
        <Link
          href="/hankkut"
          className="flex items-center gap-0.5 text-xs text-gray-500 transition-colors hover:text-navy-900"
        >
          전체보기 <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {saved.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-gray-50 px-6 py-10 text-center">
          <Heart className="h-5 w-5 text-gray-300" />
          <p className="text-sm text-gray-500">
            아직 저장한 한끗 정보가 없어요
          </p>
          <Link
            href="/hankkut"
            className="rounded-full bg-navy-900 px-5 py-2 text-xs font-semibold text-lime-300 transition-transform active:scale-95"
          >
            한끗 정보 구경하기
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {saved.slice(0, SAVED_HANKKUT_LIMIT).map((item) => (
            <Link
              key={item.id}
              href={`/hankkut/${item.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-gray-100 p-3 transition-all duration-300 ease-out hover:border-ocean-200 hover:shadow-[0_12px_24px_-12px_rgba(10,132,255,0.2)]"
            >
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl">
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
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${CATEGORY_DOT_STYLES[item.category]}`}
                  />
                  <span className="text-[11px] font-semibold text-gray-500">
                    {item.category} · {item.region}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[13px] font-semibold text-navy-900">
                  {item.title}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-ocean-500" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function SettingsSection({
  onOpenNotifications,
  onLogout,
  isLoggingOut,
}: {
  onOpenNotifications: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-gray-100 bg-white">
      <button
        onClick={onOpenNotifications}
        className="flex w-full items-center justify-between border-b border-gray-50 px-6 py-4 transition-colors hover:bg-gray-50"
      >
        <span className="text-sm text-gray-700">알림 설정</span>
        <ChevronRight className="h-4 w-4 text-gray-300" />
      </button>
      <Link
        href="/terms"
        className="flex w-full items-center justify-between border-b border-gray-50 px-6 py-4 transition-colors hover:bg-gray-50"
      >
        <span className="text-sm text-gray-700">이용약관</span>
        <ChevronRight className="h-4 w-4 text-gray-300" />
      </Link>
      <button
        onClick={onLogout}
        disabled={isLoggingOut}
        className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50 disabled:opacity-50"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-error">
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
        </span>
      </button>
    </section>
  );
}

export default function MyPageContent() {
  const { user, isLoading, isLoggedIn, logout, isLoggingOut } = useAuth();
  const { data: courses, isLoading: isCoursesLoading } = useMyCourses({
    enabled: isLoggedIn,
  });
  const savedHankkut = useSavedHankkut();
  const { customNickname, saveNickname } = useCustomNickname(user?.userId);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  if (isLoading) return <LoadingState />;
  if (!isLoggedIn || !user) return <LoggedOutState />;

  const displayNickname = customNickname ?? user.nickname;

  const totalSpots =
    courses?.reduce((acc, c) => acc + (c.spotTitles?.length ?? 0), 0) ?? 0;

  const stats = [
    {
      label: "생성한 코스",
      value: courses ? String(courses.length) : "-",
      icon: Route,
    },
    {
      label: "담은 스팟",
      value: courses ? String(totalSpots) : "-",
      icon: MapPin,
    },
    {
      label: "저장한 한끗",
      value: String(savedHankkut.length),
      icon: Bookmark,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 pt-28 pb-20 md:px-10 lg:px-20">
      <ProfileHero
        nickname={displayNickname}
        email={user.email}
        profileImageUrl={user.profileImageUrl}
        isAdmin={user.role === "ADMIN"}
        stats={stats}
        onEditProfile={() => setIsEditOpen(true)}
      />

      <ProfileEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        currentNickname={customNickname ?? ""}
        socialNickname={user.nickname}
        onSave={saveNickname}
      />

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentCoursesSection courses={courses} isLoading={isCoursesLoading} />
        </div>
        <div className="flex flex-col gap-6">
          <SavedHankkutSection saved={savedHankkut} />
          <SettingsSection
            onOpenNotifications={() => setIsNotifOpen(true)}
            onLogout={() => logout()}
            isLoggingOut={isLoggingOut}
          />
        </div>
      </div>

      <NotificationSettingsModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
    </main>
  );
}

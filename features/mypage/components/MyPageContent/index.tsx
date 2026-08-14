"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Heart, Route, LogOut, ChevronRight, Clock } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

function toHttps(url?: string) {
  return url?.replace(/^http:\/\//, "https://");
}

const MOCK_RECENT_COURSES = [
  {
    id: 1,
    type: "🎨",
    title: "광안리 감성 반나절 코스",
    duration: "3시간",
    region: "수영구",
    createdAt: "2일 전",
  },
  {
    id: 2,
    type: "🍜",
    title: "해운대 맛집 투어 코스",
    duration: "4시간",
    region: "해운대구",
    createdAt: "5일 전",
  },
];

const MOCK_LIKED_SPOTS = [
  { id: 1, name: "광안리해수욕장", category: "자연·해변", imageUrl: "https://picsum.photos/seed/gwangalli/120/120" },
  { id: 2, name: "감천문화마을", category: "관광·문화", imageUrl: "https://picsum.photos/seed/gamcheon/120/120" },
  { id: 3, name: "해리단길", category: "맛집·카페", imageUrl: "https://picsum.photos/seed/haeridan/120/120" },
];

const STATS = [
  { label: "생성한 코스", value: "12", icon: Route },
  { label: "찜한 스팟", value: "38", icon: Heart },
  { label: "방문한 지역", value: "7", icon: MapPin },
];

export default function MyPageContent() {
  const router = useRouter();
  const { user, isLoading, isLoggedIn, logout, isLoggingOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200" />
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4 bg-gray-50">
        <div className="w-20 h-20 rounded-full bg-navy-50 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-navy-400" />
        </div>
        <div>
          <p className="text-xl font-bold text-navy-900">로그인이 필요해요</p>
          <p className="mt-1 text-sm text-gray-500">로그인하고 나만의 부산 여행을 시작해보세요</p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="rounded-full bg-navy-400 px-8 py-3 text-sm font-semibold text-white hover:bg-navy-500 transition-colors"
        >
          로그인하러 가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-4">

        {/* 프로필 카드 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* 상단 네이비 띠 */}
          <div className="h-16 bg-gradient-to-r from-navy-500 to-navy-400" />

          <div className="px-6 pb-6">
            {/* 아바타 */}
            <div className="-mt-10 mb-4">
              {user.profileImageUrl ? (
                <Image
                  src={toHttps(user.profileImageUrl)!}
                  alt={user.nickname}
                  width={72}
                  height={72}
                  className="w-[72px] h-[72px] rounded-full border-4 border-white object-cover shadow-md"
                />
              ) : (
                <div className="w-[72px] h-[72px] rounded-full border-4 border-white bg-lime-300 flex items-center justify-center shadow-md">
                  <span className="text-2xl font-bold text-navy-900">
                    {user.nickname.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-navy-900">{user.nickname}</h1>
              {user.role === "ADMIN" && (
                <span className="rounded-full bg-ocean-100 px-2 py-0.5 text-[10px] font-bold text-ocean-600">
                  ADMIN
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-gray-500">{user.email}</p>

            {/* 통계 */}
            <div className="mt-5 grid grid-cols-3 divide-x divide-gray-100">
              {STATS.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center gap-1 px-2">
                  <Icon className="w-3.5 h-3.5 text-navy-400" />
                  <span className="text-lg font-bold text-navy-900">{value}</span>
                  <span className="text-[11px] text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 최근 생성한 코스 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-navy-400" />
              <h2 className="text-sm font-bold text-navy-900">최근 생성한 코스</h2>
            </div>
            <button className="text-xs text-gray-500 flex items-center gap-0.5 hover:text-gray-600">
              전체보기 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {MOCK_RECENT_COURSES.map((course) => (
              <div key={course.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center shrink-0 text-base">
                  {course.type}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy-900 truncate">{course.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="flex items-center gap-0.5 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />{course.region}
                    </span>
                    <span className="text-gray-200">·</span>
                    <span className="flex items-center gap-0.5 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />{course.duration}
                    </span>
                    <span className="text-gray-200">·</span>
                    <span className="text-xs text-gray-500">{course.createdAt}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </div>
            ))}
          </div>
        </section>

        {/* 찜한 스팟 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <h2 className="text-sm font-bold text-navy-900">찜한 스팟</h2>
            </div>
            <button className="text-xs text-gray-500 flex items-center gap-0.5 hover:text-gray-600">
              전체보기 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3 px-5 pb-5 overflow-x-auto scrollbar-hide">
            {MOCK_LIKED_SPOTS.map((spot) => (
              <div key={spot.id} className="shrink-0 w-28 rounded-xl overflow-hidden border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
                <div className="relative h-20">
                  <Image src={spot.imageUrl} alt={spot.name} fill className="object-cover" />
                  <button className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                    <Heart className="w-3 h-3 fill-pink-400 text-pink-400" />
                  </button>
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold text-navy-900 truncate">{spot.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{spot.category}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 설정 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {["알림 설정", "이용약관"].map((label) => (
            <button
              key={label}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <span className="text-sm text-gray-700">{label}</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          ))}
        </section>

        {/* 로그아웃 */}
        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-4 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
        </button>
      </div>
    </div>
  );
}
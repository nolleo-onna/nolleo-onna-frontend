"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

// 외부 이미지가 http로 내려오는 경우 https로 정규화 (mixed content 방지)
function toHttps(url?: string) {
  return url?.replace(/^http:\/\//, "https://");
}

export default function MyPageContent() {
  const router = useRouter();
  const { user, isLoading, isLoggedIn, logout, isLoggingOut } = useAuth();

  if (isLoading) {
    return (
      <div className="py-20">
        <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-gray-200" />
        <div className="mx-auto mt-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-lg font-semibold text-navy-700">로그인이 필요합니다</p>
        <button
          onClick={() => router.push("/login")}
          className="rounded-full bg-navy-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-navy-700"
        >
          로그인하러 가기
        </button>
      </div>
    );
  }

  return (
    <div className="py-10 md:py-16">
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="h-28 w-full bg-gradient-to-r from-navy-600 to-navy-400 md:h-36" />

        <div className="px-6 pb-8 md:px-10">
          <div className="-mt-12 mb-4 md:-mt-14">
            {user.profileImageUrl ? (
              <Image
                src={toHttps(user.profileImageUrl)!}
                alt={user.nickname}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-navy-100 text-3xl font-bold text-navy-600 shadow-md">
                {user.nickname.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900">{user.nickname}</h1>
            {user.role === "ADMIN" && (
              <span className="rounded-full bg-pink-100 px-2.5 py-1 text-xs font-semibold text-pink-600">
                ADMIN
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-500">{user.email}</p>

          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="mt-6 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </button>
        </div>
      </div>
    </div>
  );
}
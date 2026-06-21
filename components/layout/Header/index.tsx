"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { label: "홈", href: "/" },
  { label: "스팟", href: "/spot" },
  { label: "코스", href: "/course" },
  { label: "한끗", href: "/hankkut" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const { user, isLoading, isLoggedIn, logout, isLoggingOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto w-full max-w-[1280px] px-5 md:px-10 lg:px-20">
          <div className="relative flex items-center justify-between h-16">
            {/* 로고 */}
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/logo/logo.png"
                alt="놀러온나 로고"
                width={150}
                height={45}
                priority
              />
            </Link>

            {/* 데스크탑 네비 */}
            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {NAV_ITEMS.map(({ label, href }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`text-base font-medium transition-colors duration-200 ${
                      isActive ? "text-pink-600" : "text-gray-700 hover:text-pink-600"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* 우측 영역 */}
            <div className="flex items-center gap-3">
              {isLoading ? null : isLoggedIn ? (
                <>
                  <Link
                    href="/mypage"
                    className="hidden md:block text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                  >
                    {user?.nickname}님
                  </Link>
                  <button
                    type="button"
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                    className="hidden md:block text-sm font-semibold text-gray-500 hover:text-pink-600 transition-colors disabled:opacity-50"
                  >
                    {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:block bg-pink-400 hover:bg-pink-500 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors duration-200"
                >
                  로그인
                </Link>
              )}

              {/* 햄버거 버튼 */}
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="md:hidden p-2 text-gray-700"
                aria-label="메뉴"
              >
                {isMenuOpen ? (
                  // X 아이콘
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  // 햄버거 아이콘
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 드롭다운 */}
      {isMenuOpen && (
        <>
          {/* 백드롭 */}
          <div
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* 메뉴 패널 */}
          <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-lg md:hidden">
            <nav className="flex flex-col px-5 py-3">
              {NAV_ITEMS.map(({ label, href }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`py-3.5 text-base font-medium border-b border-gray-100 last:border-0 transition-colors ${
                      isActive ? "text-pink-600" : "text-gray-700"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}

              {/* 모바일 로그인/로그아웃 */}
              <div className="pt-3 pb-1">
                {isLoading ? null : isLoggedIn ? (
                  <div className="flex items-center justify-between">
                    <Link
                      href="/mypage"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-sm font-medium text-gray-700"
                    >
                      {user?.nickname}님
                    </Link>
                    <button
                      type="button"
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      disabled={isLoggingOut}
                      className="text-sm font-semibold text-gray-500 disabled:opacity-50"
                    >
                      {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center bg-pink-400 hover:bg-pink-500 text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
                  >
                    로그인
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}

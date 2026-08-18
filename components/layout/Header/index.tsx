"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { label: "홈", href: "/" },
  { label: "스팟", href: "/spot" },
  { label: "코스", href: "/course" },
  { label: "한끗", href: "/hankkut" },
] as const;

// ── 아바타 이니셜 칩 + 드롭다운 ──────────────────────────────────────────────
function UserChip({
  nickname,
  onLogout,
  isLoggingOut,
}: {
  nickname: string;
  onLogout: () => void;
  isLoggingOut: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initial = nickname.charAt(0);

  return (
    <div ref={ref} className="relative hidden md:block">
      {/* 트리거 칩 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200
          ${open
            ? 'bg-navy-600 border-navy-600 text-white shadow-md'
            : 'bg-white border-gray-200 text-gray-700 hover:border-navy-600/40 hover:shadow-sm'
          }
        `}
      >
        {/* 이니셜 아바타 */}
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-colors
            ${open ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-navy-600 to-ocean-500 text-white'}
          `}
        >
          {initial}
        </div>
        <span className="text-[13px] font-semibold">{nickname}님</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 드롭다운 */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-44 bg-white rounded-2xl shadow-[0_8px_32px_rgba(13,48,128,0.15)] border border-gray-100 overflow-hidden z-50">
          {/* 유저 정보 헤더 */}
          <div className="px-4 py-3 bg-gradient-to-br from-[#f6f8ff] to-[#eaf6ff] border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-600 to-ocean-500 flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
                {initial}
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-800">{nickname}</p>
                <p className="text-[10px] text-gray-400">부산 여행 탐험가 ✈️</p>
              </div>
            </div>
          </div>

          {/* 메뉴 항목 */}
          <div className="py-1">
            <Link
              href="/mypage"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-[#f6f8ff] hover:text-navy-600 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              마이페이지
            </Link>
            <button
              type="button"
              onClick={() => { onLogout(); setOpen(false); }}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 메인 헤더 ────────────────────────────────────────────────────────────────
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
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/logo/icon.png"
                alt=""
                width={56}
                height={56}
                priority
              />
              <span className="font-taenada text-2xl bg-gradient-to-r from-navy-700 via-ocean-600 to-ocean-400 bg-clip-text text-transparent">
                놀러온나
              </span>
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
                      isActive ? "text-ocean-600" : "text-gray-700 hover:text-ocean-600"
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
                <UserChip
                  nickname={user?.nickname ?? ''}
                  onLogout={logout}
                  isLoggingOut={isLoggingOut}
                />
              ) : (
                <Link
                  href="/login"
                  className="hidden md:block bg-ocean-500 hover:bg-ocean-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
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
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
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
          <div
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
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
                      isActive ? "text-ocean-600" : "text-gray-700"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}

              {/* 모바일 유저 영역 */}
              <div className="pt-3 pb-1">
                {isLoading ? null : isLoggedIn ? (
                  <div className="flex items-center justify-between">
                    {/* 모바일 아바타 칩 */}
                    <Link
                      href="/mypage"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-navy-600 to-ocean-500 flex items-center justify-center text-white text-[12px] font-bold">
                        {user?.nickname?.charAt(0)}
                      </div>
                      <span className="text-[13px] font-semibold text-gray-700">
                        {user?.nickname}님
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      disabled={isLoggingOut}
                      className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center bg-ocean-500 hover:bg-ocean-600 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-sm transition-all duration-200 active:scale-95"
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
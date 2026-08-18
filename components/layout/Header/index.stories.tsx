import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ── useAuth를 mock으로 대체한 Header 래퍼 ────────────────────────────────────
// storybook에서 훅 자체를 spyOn하기 어렵기 때문에,
// props로 auth 상태를 주입받는 래퍼를 만들어서 테스트합니다.
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut } from "lucide-react";

// ── 타입 ──────────────────────────────────────────────────────────────────────
interface MockUser {
  nickname: string;
}

interface HeaderStoryProps {
  isLoggedIn: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  user: MockUser | null;
  onLogout: () => void;
}

// ── UserChip (스토리북용 독립 컴포넌트) ──────────────────────────────────────
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
  const initial = nickname.charAt(0);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 ${
          open
            ? "bg-[#0d3080] border-[#0d3080] text-white shadow-md"
            : "bg-white border-gray-200 text-gray-700 hover:border-[#0d3080]/40 hover:shadow-sm"
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-colors ${
            open ? "bg-white/20 text-white" : "bg-gradient-to-br from-[#0d3080] to-[#0a84ff] text-white"
          }`}
        >
          {initial}
        </div>
        <span className="text-[13px] font-semibold">{nickname}님</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-44 bg-white rounded-2xl shadow-[0_8px_32px_rgba(13,48,128,0.15)] border border-gray-100 overflow-hidden z-50">
          <div className="px-4 py-3 bg-gradient-to-br from-[#f6f8ff] to-[#eaf6ff] border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0d3080] to-[#0a84ff] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
                {initial}
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-800">{nickname}</p>
                <p className="text-[10px] text-gray-400">부산 여행 탐험가 ✈️</p>
              </div>
            </div>
          </div>
          <div className="py-1">
            <Link
              href="/mypage"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-[#f6f8ff] hover:text-[#0d3080] transition-colors"
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
              {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 스토리북 전용 Header 래퍼 ─────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "홈", href: "/" },
  { label: "스팟", href: "/spot" },
  { label: "코스", href: "/course" },
  { label: "한끗", href: "/hankkut" },
] as const;

function HeaderStory({ isLoggedIn, isLoading, isLoggingOut, user, onLogout }: HeaderStoryProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto w-full max-w-[1280px] px-5 md:px-10 lg:px-20">
          <div className="relative flex items-center justify-between h-16">
            <Link href="/" className="flex items-center shrink-0">
              <Image src="/logo/logo.png" alt="놀러온나 로고" width={88} height={56} priority />
            </Link>

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

            <div className="flex items-center gap-3">
              {isLoading ? null : isLoggedIn ? (
                <div className="hidden md:block">
                  <UserChip
                    nickname={user?.nickname ?? ""}
                    onLogout={onLogout}
                    isLoggingOut={isLoggingOut}
                  />
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:block bg-ocean-500 hover:bg-ocean-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
                >
                  로그인
                </Link>
              )}

              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="md:hidden p-2 text-gray-700"
                aria-label="메뉴"
              >
                {isMenuOpen ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 md:hidden" onClick={() => setIsMenuOpen(false)} />
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
              <div className="pt-3 pb-1">
                {isLoading ? null : isLoggedIn ? (
                  <div className="flex items-center justify-between">
                    <Link href="/mypage" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0d3080] to-[#0a84ff] flex items-center justify-center text-white text-[12px] font-bold">
                        {user?.nickname?.charAt(0)}
                      </div>
                      <span className="text-[13px] font-semibold text-gray-700">{user?.nickname}님</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => { onLogout(); setIsMenuOpen(false); }}
                      disabled={isLoggingOut}
                      className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                    </button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center bg-ocean-500 hover:bg-ocean-600 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-sm transition-all duration-200 active:scale-95">
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

// ── Meta ──────────────────────────────────────────────────────────────────────
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const meta = {
  title: "Layout/Header",
  component: HeaderStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  argTypes: {
    isLoggedIn: { control: "boolean", description: "로그인 여부" },
    isLoggingOut: { control: "boolean", description: "로그아웃 처리 중 여부" },
    isLoading: { control: "boolean", description: "인증 로딩 중 여부" },
  },
} satisfies Meta<typeof HeaderStory>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
  onLogout: () => {},
};

/** 비로그인 */
export const Default: Story = {
  args: { ...baseArgs, isLoggedIn: false, isLoading: false, isLoggingOut: false, user: null },
};

/** 로그인 상태 — UserChip 드롭다운 클릭해보세요! */
export const LoggedIn: Story = {
  args: {
    ...baseArgs,
    isLoggedIn: true,
    isLoading: false,
    isLoggingOut: false,
    user: { nickname: "상호" },
  },
};

/** 로그아웃 처리 중 */
export const LoggingOut: Story = {
  args: {
    ...baseArgs,
    isLoggedIn: true,
    isLoading: false,
    isLoggingOut: true,
    user: { nickname: "상호" },
  },
};

/** 인증 로딩 중 */
export const Loading: Story = {
  args: { ...baseArgs, isLoggedIn: false, isLoading: true, isLoggingOut: false, user: null },
};

/** 비로그인 — 스팟 페이지 활성 */
export const OnSpotPage: Story = {
  args: { ...baseArgs, isLoggedIn: false, isLoading: false, isLoggingOut: false, user: null },
  parameters: { nextjs: { navigation: { pathname: "/spot" } } },
};

/** 로그인 — 코스 페이지 활성 */
export const LoggedInOnCoursePage: Story = {
  args: {
    ...baseArgs,
    isLoggedIn: true,
    isLoading: false,
    isLoggingOut: false,
    user: { nickname: "상호" },
  },
  parameters: { nextjs: { navigation: { pathname: "/course" } } },
};
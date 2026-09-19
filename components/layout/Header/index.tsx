"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight, ChevronDown, LogOut, Route, User as UserIcon } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

import type { LucideIcon } from "lucide-react";
import DefaultAvatar from "@/components/ui/DefaultAvatar";
import LoginTicketModal from "@/features/auth/LoginTicketModal";

import type { User } from "@/types/auth";

const NAV_ITEMS = [
  { label: "홈", href: "/" },
  { label: "스팟", href: "/spot" },
  { label: "코스", href: "/course" },
  { label: "한끗", href: "/hankkut" },
] as const;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const PILL_SPRING = { type: "spring", stiffness: 460, damping: 36 } as const;

/** 하위 페이지(/course/result, /hankkut/region/...)에서도 해당 탭이 켜지게 앞부분으로 비교한다 */
function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type HeaderUser = Pick<User, "nickname" | "email" | "profileImageUrl">;

function Avatar({ user, size }: { user: HeaderUser; size: number }) {
  const src = user.profileImageUrl?.replace(/^http:\/\//, "https://");
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover ring-2 ring-white"
        style={{ width: size, height: size }}
      />
    );
  }
  return <DefaultAvatar seed={user.nickname} size={size} className="ring-2 ring-white" />;
}

function MenuLink({
  href,
  icon: Icon,
  children,
  onSelect,
}: {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[14px] font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-navy-900"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-colors group-hover:bg-white group-hover:text-ocean-600">
        <Icon className="h-4 w-4" />
      </span>
      {children}
    </Link>
  );
}

// ── 프로필 버튼 + 드롭다운 ───────────────────────────────────────────────────
function UserMenu({
  user,
  onLogout,
  isLoggingOut,
}: {
  user: HeaderUser;
  onLogout: () => void;
  isLoggingOut: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 바깥을 누르거나 Esc를 누르면 닫는다
  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${user.nickname}님 메뉴`}
        className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-1 transition-colors md:pr-2.5 ${
          open ? "bg-navy-900/[0.07]" : "hover:bg-navy-900/[0.05]"
        }`}
      >
        <Avatar user={user} size={32} />
        <span className="hidden text-[13px] font-semibold text-navy-900 lg:inline">{user.nickname}님</span>
        <ChevronDown
          className={`hidden h-3.5 w-3.5 text-gray-400 transition-transform duration-200 md:block ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-[calc(100%+14px)] w-64 overflow-hidden rounded-3xl bg-white p-2 shadow-[0_24px_60px_-20px_rgba(5,12,26,0.35)] ring-1 ring-black/5"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-ocean-50 to-white p-3">
              <Avatar user={user} size={40} />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold text-navy-900">{user.nickname}님</p>
                <p className="truncate text-[12px] text-gray-400">{user.email}</p>
              </div>
            </div>
            <div className="mt-1.5 flex flex-col">
              <MenuLink href="/mypage" icon={UserIcon} onSelect={close}>
                마이페이지
              </MenuLink>
              <MenuLink href="/course" icon={Route} onSelect={close}>
                내가 만든 코스
              </MenuLink>
              <div className="mx-3 my-1 h-px bg-gray-100" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onLogout();
                  close();
                }}
                disabled={isLoggingOut}
                className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[14px] font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-error disabled:opacity-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 transition-colors group-hover:bg-white">
                  <LogOut className="h-4 w-4" />
                </span>
                {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface HeaderViewProps {
  user: HeaderUser | null | undefined;
  isLoading: boolean;
  isLoggingOut: boolean;
  onLogout: () => void;
}

/**
 * 화면 위에 떠 있는 유리 캡슐 헤더. 스크롤하면 조금 더 불투명해지고 그림자가 짙어진다.
 * 페이지들이 헤더 높이 64px(mt-16·pt-16·100vh-64px)에 맞춰져 있어 바깥 높이는 h-16을 유지한다.
 */
export function HeaderView({ user, isLoading, isLoggingOut, onLogout }: HeaderViewProps) {
  const pathname = usePathname() ?? "/";
  const [hovered, setHovered] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const raised = scrolled || menuOpen;

  return (
    <MotionConfig reducedMotion="user">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 h-16">
        <div className="mx-auto h-full w-full max-w-[1280px] px-2 md:px-7 lg:px-[68px]">
          <div
            className={`pointer-events-auto relative mt-2 flex h-12 items-center justify-between rounded-full pl-3 pr-1.5 ring-1 backdrop-blur-xl backdrop-saturate-150 transition-[background-color,box-shadow] duration-300 ${
              raised
                ? "bg-white/85 shadow-[0_12px_32px_-14px_rgba(5,12,26,0.3)] ring-black/[0.06]"
                : "bg-white/65 shadow-[0_4px_20px_-12px_rgba(5,12,26,0.2)] ring-white/70"
            }`}
          >
            {/* 로고 */}
            <Link href="/" onClick={closeMenu} className="flex shrink-0 items-center gap-1.5" aria-label="놀러온나 홈">
              <Image src="/logo/icon.png" alt="" width={40} height={34} priority className="h-[30px] w-auto" />
              <span className="font-taenada translate-y-0.5 bg-gradient-to-r from-navy-700 via-ocean-600 to-ocean-400 bg-clip-text text-[21px] text-transparent">
                놀러온나
              </span>
            </Link>

            {/* 데스크탑 네비 — 흰 알약이 켜진 탭으로 미끄러지고, 옅은 알약이 마우스를 따라간다 */}
            <nav aria-label="주요 메뉴" className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
              <ul
                className="flex items-center gap-0.5 rounded-full bg-navy-900/[0.045] p-1"
                onMouseLeave={() => setHovered(null)}
              >
                {NAV_ITEMS.map(({ label, href }) => {
                  const active = isActivePath(pathname, href);
                  return (
                    <li key={href} className="relative">
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        onMouseEnter={() => setHovered(href)}
                        onFocus={() => setHovered(href)}
                        onBlur={() => setHovered(null)}
                        className={`relative z-10 block rounded-full px-4 py-1.5 text-[14px] font-semibold transition-colors duration-200 ${
                          active ? "text-navy-900" : "text-navy-900/55 hover:text-navy-900"
                        }`}
                      >
                        {label}
                      </Link>
                      {active && (
                        <motion.span
                          layoutId="header-nav-active"
                          transition={PILL_SPRING}
                          className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(5,12,26,0.08),0_6px_14px_-6px_rgba(5,12,26,0.22)]"
                        />
                      )}
                      {hovered === href && !active && (
                        <motion.span
                          layoutId="header-nav-hover"
                          transition={PILL_SPRING}
                          className="absolute inset-0 rounded-full bg-white/55"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* 우측 */}
            <div className="flex items-center gap-1">
              {isLoading ? (
                <span aria-hidden className="h-8 w-8 animate-pulse rounded-full bg-navy-900/[0.06]" />
              ) : user ? (
                <UserMenu user={user} onLogout={onLogout} isLoggingOut={isLoggingOut} />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    setLoginOpen(true);
                  }}
                  className="group inline-flex items-center gap-1 rounded-full bg-navy-900 px-4 py-2 text-[13px] font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-ocean-600 active:scale-95"
                >
                  로그인
                  <ArrowRight className="hidden h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 sm:block" />
                </button>
              )}

              {/* 모바일 메뉴 버튼 — 두 줄이 X로 접힌다 */}
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-navy-900/[0.05] md:hidden"
              >
                <motion.span
                  className="absolute h-[2px] w-[18px] rounded-full bg-navy-900"
                  initial={false}
                  animate={menuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -3.5 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                />
                <motion.span
                  className="absolute h-[2px] w-[18px] rounded-full bg-navy-900"
                  initial={false}
                  animate={menuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 3.5 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 로그인 — 페이지를 옮기지 않고 보던 화면 위에 표를 띄운다 */}
      <LoginTicketModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* 모바일 메뉴 — 캡슐 아래로 카드가 내려오고 링크가 차례로 떠오른다 */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="mobile-nav-backdrop"
              className="fixed inset-0 z-40 bg-navy-900/20 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
            />
            <motion.div
              key="mobile-nav"
              id="mobile-nav"
              className="fixed inset-x-2 top-16 z-50 rounded-[28px] bg-white p-2 shadow-[0_24px_60px_-20px_rgba(5,12,26,0.4)] ring-1 ring-black/5 md:hidden"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.24, ease: EASE_OUT }}
              style={{ transformOrigin: "top center" }}
            >
              <nav aria-label="주요 메뉴">
                <ul className="flex flex-col">
                  {NAV_ITEMS.map(({ label, href }, i) => {
                    const active = isActivePath(pathname, href);
                    return (
                      <motion.li
                        key={href}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + i * 0.04, duration: 0.28, ease: EASE_OUT }}
                      >
                        <Link
                          href={href}
                          onClick={closeMenu}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-[20px] font-bold tracking-tight transition-colors ${
                            active ? "bg-gray-50 text-navy-900" : "text-gray-500 active:bg-gray-50"
                          }`}
                        >
                          {label}
                          {active ? (
                            <span className="h-2 w-2 rounded-full bg-ocean-500" />
                          ) : (
                            <ArrowRight className="h-4 w-4 text-gray-300" />
                          )}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

export default function Header() {
  const { user, isLoading, logout, isLoggingOut } = useAuth();
  return <HeaderView user={user} isLoading={isLoading} isLoggingOut={isLoggingOut} onLogout={() => logout()} />;
}

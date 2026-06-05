"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
	{ label: "홈", href: "/" },
	{ label: "스팟", href: "/spot" },
	{ label: "한끗", href: "/course" },
] as const;

export default function Header() {
	const pathname = usePathname();

	return (
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

					{/* 네비게이션 */}
					<nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
						{NAV_ITEMS.map(({ label, href }) => {
							const isActive = pathname === href;
							return (
								<Link
									key={href}
									href={href}
									className={`
										text-base font-medium transition-colors duration-200
										${isActive ? "text-pink-600" : "text-gray-700 hover:text-pink-600"}
									`}
								>
									{label}
								</Link>
							);
						})}
					</nav>

					{/* 우측 액션 */}
					<div className="flex items-center gap-3">
						<Link
							href="/login"
							className="bg-pink-400 hover:bg-pink-400 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors duration-200"
						>
							로그인
						</Link>

						{/* 모바일 햄버거 */}
						<button className="md:hidden p-2 text-gray-700">
							<svg
								width="22"
								height="22"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<line x1="3" y1="6" x2="21" y2="6" />
								<line x1="3" y1="12" x2="21" y2="12" />
								<line x1="3" y1="18" x2="21" y2="18" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</header>
	);
}

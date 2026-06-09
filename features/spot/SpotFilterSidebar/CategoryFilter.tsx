"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Check } from "lucide-react";

const CATEGORIES = [
	{ id: "food", label: "가성비 맛집", emoji: "🍽️" },
	{ id: "cafe", label: "감성 카페", emoji: "☕" },
	{ id: "culture", label: "전시 · 공연", emoji: "🎭" },
	{ id: "nature", label: "공원 · 바다뷰", emoji: "🌊" },
	{ id: "festival", label: "행사 · 축제", emoji: "🎉" },
];

export default function CategoryFilter() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const selected = searchParams.getAll("category");

	const toggle = useCallback(
		(id: string) => {
			const params = new URLSearchParams(searchParams.toString());
			params.delete("category");

			const next = selected.includes(id)
				? selected.filter((c) => c !== id)
				: [...selected, id];

			next.forEach((c) => params.append("category", c));
			router.replace(`?${params.toString()}`, { scroll: false });
		},
		[router, searchParams, selected],
	);

	return (
		<div>
			<div className="mb-3.5">
				<span className="text-xs font-bold tracking-widest text-gray-900 uppercase">카테고리</span>
			</div>
			<ul className="flex flex-col gap-0.5">
				{CATEGORIES.map(({ id, label, emoji }) => {
					const checked = selected.includes(id);
					return (
						<li key={id}>
							<button
								onClick={() => toggle(id)}
								className="flex w-full items-center gap-2.5 rounded-lg px-1 py-2 transition-colors hover:bg-gray-50"
							>
								{/* 커스텀 체크박스 */}
								<span
									className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all ${
										checked
											? "border-navy-400 bg-navy-400"
											: "border-gray-300 bg-white"
									}`}
								>
									{checked && <Check size={10} stroke="white" strokeWidth={2.5} />}
								</span>
								<span className="text-[15px]" aria-hidden="true">{emoji}</span>
								<span className={`text-sm font-medium tracking-tight ${checked ? "text-gray-900" : "text-gray-600"}`}>
									{label}
								</span>
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

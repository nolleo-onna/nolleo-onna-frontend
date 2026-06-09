"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import Chip from "@/components/ui/Chip";

const REGIONS = [
	"강서구", "금정구", "기장군", "남구",
	"동구", "동래구", "부산진구", "북구",
	"사상구", "사하구", "서구", "수영구",
	"연제구", "영도구", "중구", "해운대구",
];

export default function RegionFilter() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const selected = searchParams.getAll("region");

	const isAllSelected = REGIONS.every((r) => selected.includes(r));

	const updateParams = useCallback(
		(next: string[]) => {
			const params = new URLSearchParams(searchParams.toString());
			params.delete("region");
			next.forEach((r) => params.append("region", r));
			router.replace(`?${params.toString()}`, { scroll: false });
		},
		[router, searchParams],
	);

	const toggle = useCallback(
		(region: string) => {
			const next = selected.includes(region)
				? selected.filter((r) => r !== region)
				: [...selected, region];
			updateParams(next);
		},
		[selected, updateParams],
	);

	const toggleAll = useCallback(() => {
		updateParams(isAllSelected ? [] : REGIONS);
	}, [isAllSelected, updateParams]);

	const reset = useCallback(() => {
		updateParams([]);
	}, [updateParams]);

	return (
		<div>
			<div className="mb-3.5 flex items-center justify-between">
				<span className="text-xs font-bold tracking-widest text-gray-900 uppercase">지역 · 구</span>
				<div className="flex items-center gap-2">
					{selected.length > 0 && (
						<>
							<span className="rounded-full bg-navy-50 px-2 py-0.5 text-xs font-semibold text-navy-400">
								{selected.length}개 선택
							</span>
							<button
								onClick={reset}
								className="text-xs text-gray-400 underline-offset-2 hover:text-gray-600 hover:underline"
							>
								초기화
							</button>
						</>
					)}
				</div>
			</div>
			<div className="grid grid-cols-3 gap-1.5">
				{/* 전체 버튼 */}
				<Chip
					size="sm"
					onClick={toggleAll}
					className={`w-full justify-center ${isAllSelected ? "border-navy-300 bg-navy-300 text-white" : ""}`}
				>
					전체
				</Chip>
				{REGIONS.map((region) => (
					<Chip
						key={region}
						size="sm"
						onClick={() => toggle(region)}
						className={`w-full justify-center ${
							selected.includes(region)
								? "border-navy-300 bg-navy-300 text-white"
								: ""
						}`}
					>
						{region}
					</Chip>
				))}
			</div>
		</div>
	);
}

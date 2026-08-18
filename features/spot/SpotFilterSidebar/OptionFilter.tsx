"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Tag } from "lucide-react";

// "지금 영업중만"(open_now)은 읽는 곳이 없는 무기능 토글이라 제거했다.
const OPTIONS = [{ id: "free_only", label: "무료 스팟만", icon: Tag }];

export default function OptionFilter() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const toggle = useCallback(
		(id: string) => {
			const params = new URLSearchParams(searchParams.toString());
			if (params.get(id) === "true") {
				params.delete(id);
			} else {
				params.set(id, "true");
			}
			router.replace(`?${params.toString()}`, { scroll: false });
		},
		[router, searchParams],
	);

	return (
		<div>
			<div className="mb-3.5">
				<span className="text-xs font-bold tracking-widest text-gray-900 uppercase">추가 옵션</span>
			</div>
			<ul className="flex flex-col gap-3">
				{OPTIONS.map(({ id, label, icon: Icon }) => {
					const on = searchParams.get(id) === "true";
					return (
						<li key={id}>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Icon
										size={14}
										className={on ? "text-navy-400" : "text-gray-400"}
									/>
									<span className={`text-sm font-medium tracking-tight ${on ? "text-gray-900" : "text-gray-500"}`}>
										{label}
									</span>
								</div>
								{/* 토글 */}
								<button
									role="switch"
									aria-checked={on}
									aria-label={label}
									onClick={() => toggle(id)}
									className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
										on ? "bg-navy-400" : "bg-gray-200"
									}`}
								>
									<span
										className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
											on ? "left-[18px]" : "left-0.5"
										}`}
									/>
								</button>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

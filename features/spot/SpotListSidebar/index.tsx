"use client";

import { useState } from "react";

import Dropdown from "@/components/ui/Dropdown";
import Button from "@/components/ui/Buttons";

const SORT_OPTIONS = [
	{ label: "별점순", value: "rating" },
	{ label: "리뷰순", value: "review" },
	{ label: "가격순", value: "price" },
];

const MOCK_SPOTS = [
	{
		id: 1,
		imageSrc: "https://picsum.photos/seed/spot1/200/200",
		name: "해운대 해수욕장",
		category: "해수욕장",
		location: "해운대구",
		isOpen: true,
		rating: 4.8,
		reviewCount: "2.1k",
		price: null,
	},
	{
		id: 2,
		imageSrc: "https://picsum.photos/seed/spot2/200/200",
		name: "광안리 해수욕장",
		category: "해수욕장",
		location: "수영구",
		isOpen: true,
		rating: 4.6,
		reviewCount: "1.8k",
		price: null,
	},
	{
		id: 3,
		imageSrc: "https://picsum.photos/seed/spot3/200/200",
		name: "감천문화마을",
		category: "관광지",
		location: "사하구",
		isOpen: false,
		rating: 4.5,
		reviewCount: "3.2k",
		price: 2000,
	},
	{
		id: 4,
		imageSrc: "https://picsum.photos/seed/spot4/200/200",
		name: "국제시장",
		category: "시장",
		location: "중구",
		isOpen: true,
		rating: 4.3,
		reviewCount: "980",
		price: null,
	},
	{
		id: 5,
		imageSrc: "https://picsum.photos/seed/spot5/200/200",
		name: "부산타워",
		category: "전망대",
		location: "중구",
		isOpen: true,
		rating: 4.2,
		reviewCount: "1.2k",
		price: 12000,
	},
	{
		id: 6,
		imageSrc: "https://picsum.photos/seed/spot6/200/200",
		name: "태종대",
		category: "자연",
		location: "영도구",
		isOpen: true,
		rating: 4.7,
		reviewCount: "1.5k",
		price: null,
	},
];

export default function SpotListSidebar() {
	const [selected, setSelected] = useState<string[]>([]);

	const toggleSpot = (id: number) => {
		setSelected((prev) =>
			prev.includes(String(id))
				? prev.filter((s) => s !== String(id))
				: [...prev, String(id)],
		);
	};

	return (
		<div className="flex h-full flex-col">
			{/* 헤더 */}
			<div className="border-b border-gray-100 px-4 py-3">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-bold text-gray-900">
						추천 스팟
						<span className="ml-1.5 text-xs font-normal text-gray-400">{MOCK_SPOTS.length}개</span>
					</h3>
					<Dropdown options={SORT_OPTIONS} placeholder="별점순" />
				</div>
			</div>

			{/* 카드 리스트 */}
			<ul className="flex flex-1 flex-col divide-y divide-gray-100 overflow-y-auto">
				{MOCK_SPOTS.map((spot) => {
					const isFree = spot.price === null;
					const isSelected = selected.includes(String(spot.id));
					return (
						<li
							key={spot.id}
							onClick={() => toggleSpot(spot.id)}
							className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${
								isSelected ? "bg-navy-50" : "hover:bg-gray-50"
							}`}
						>
							{/* 썸네일 */}
							<div className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-xl bg-gray-100">
								<img
									src={spot.imageSrc}
									alt={spot.name}
									className="h-full w-full object-cover"
								/>
								{isSelected && (
									<div className="absolute inset-0 flex items-center justify-center rounded-xl bg-navy-400/60">
										<span className="text-lg font-bold text-white">
											{selected.indexOf(String(spot.id)) + 1}
										</span>
									</div>
								)}
							</div>

							{/* 정보 */}
							<div className="flex min-w-0 flex-1 flex-col gap-0.5">
								<div className="flex items-center gap-1.5">
									<span className="text-xs text-gray-400">{spot.category}</span>
									<span className="text-gray-200">·</span>
									<span className="text-xs text-gray-400">{spot.location}</span>
									<span className="text-gray-200">·</span>
									<span className={`text-xs font-medium ${spot.isOpen ? "text-green-500" : "text-gray-400"}`}>
										{spot.isOpen ? "영업중" : "영업종료"}
									</span>
								</div>
								<p className="truncate text-sm font-bold text-gray-900">{spot.name}</p>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-1">
										<span className="text-xs text-orange-400">★</span>
										<span className="text-xs font-semibold text-gray-700">{spot.rating}</span>
										<span className="text-xs text-gray-400">({spot.reviewCount})</span>
									</div>
									<span className={`text-xs font-bold ${isFree ? "text-navy-400" : "text-gray-700"}`}>
										{isFree ? "무료" : `${spot.price?.toLocaleString()}원~`}
									</span>
								</div>
							</div>
						</li>
					);
				})}
			</ul>

			{/* 코스 만들기 버튼 */}
			{selected.length > 0 && (
				<div className="border-t border-gray-100 px-4 py-3">
					<Button variant="primary" className="w-full rounded-xl py-3 text-sm bg-navy-400 hover:bg-navy-500">
						✦ 선택한 스팟으로 코스 만들기 ({selected.length}개)
					</Button>
				</div>
			)}
		</div>
	);
}

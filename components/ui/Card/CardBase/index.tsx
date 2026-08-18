import Image from "next/image";
import { ReactNode } from "react";

interface Badge {
	label: string;
	variant?: "crowd" | "free" | "default";
}

interface CardBaseProps {
	imageSrc: string;
	imageAlt: string;
	badges?: Badge[];
	topLeftSlot?: ReactNode; // 랭킹 번호, 상황뱃지 등
	topRightSlot?: ReactNode; // 혼잡도 뱃지 등
	children?: ReactNode; // 카드 하단 영역
	onClick?: () => void;
	className?: string;
	aspectRatio?: "square" | "video" | "card";
}

const badgeVariantStyles: Record<string, string> = {
	crowd:
		"bg-white/90 text-gray-800 before:content-['●'] before:mr-1 before:text-[8px]",
	free: "bg-purple-500 text-white",
	default: "bg-white/90 text-gray-800",
};

const crowdColorMap: Record<string, string> = {
	매우혼잡: "before:text-red-500",
	혼잡: "before:text-orange-400",
	보통: "before:text-yellow-400",
	여유: "before:text-green-500",
};

const aspectRatioStyles = {
	square: "aspect-square",
	video: "aspect-video",
	card: "aspect-[4/3]",
};

export default function CardBase({
	imageSrc,
	imageAlt,
	badges = [],
	topLeftSlot,
	topRightSlot,
	children,
	onClick,
	className = "",
	aspectRatio = "card",
}: CardBaseProps) {
	return (
		<div
			onClick={onClick}
			className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-base transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${onClick ? "cursor-pointer" : ""} ${className}`}
		>
			{/* 이미지 영역 */}
			<div className={`relative w-full overflow-hidden ${aspectRatioStyles[aspectRatio]}`}>
				<Image
					src={imageSrc}
					alt={imageAlt}
					fill
					className="object-cover transition-transform duration-500 group-hover:scale-105"
					sizes="(max-width: 744px) 100vw, (max-width: 1280px) 50vw, 33vw"
				/>

				{/* 이미지 위 그라디언트 */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

				{/* 상단 왼쪽 슬롯 (랭킹 번호, 상황뱃지 등) */}
				{topLeftSlot && (
					<div className="absolute left-3 top-3">{topLeftSlot}</div>
				)}

				{/* 상단 오른쪽 슬롯 (혼잡도 뱃지 등) */}
				{topRightSlot && (
					<div className="absolute right-3 top-3">{topRightSlot}</div>
				)}

				{/* 뱃지 목록 (이미지 위에 띄울 경우) */}
				{badges.length > 0 && (
					<div className="absolute bottom-3 right-3 flex flex-wrap gap-1">
						{badges.map((badge, i) => (
							<span
								key={i}
								className={`flex items-center rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur-sm ${badgeVariantStyles[badge.variant ?? "default"]} ${badge.variant === "crowd" ? (crowdColorMap[badge.label] ?? "") : ""}`}
							>
								{badge.label}
							</span>
						))}
					</div>
				)}
			</div>

			{/* 하단 콘텐츠 슬롯 */}
			{children && <div className="flex flex-col gap-1 p-4">{children}</div>}
		</div>
	);
}

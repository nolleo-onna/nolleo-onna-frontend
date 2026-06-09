import CardBase from "@/components/ui/Card/CardBase";

interface SpotCardProps {
	imageSrc: string;
	name: string;
	location: string;
	rating: number;
	reviewCount: string;
	price?: number | null;
	crowdStatus?: "매우혼잡" | "혼잡" | "보통" | "여유";
	onClick?: () => void;
	className?: string;
}

export default function SpotCard({
	imageSrc,
	name,
	location,
	rating,
	reviewCount,
	price,
	crowdStatus,
	onClick,
	className,
}: SpotCardProps) {
	const isFree = price === null;

	return (
		<CardBase
			imageSrc={imageSrc}
			imageAlt={name}
			badges={crowdStatus ? [{ label: crowdStatus, variant: "crowd" }] : []}
			topRightSlot={
				isFree ? (
					<span className="rounded-full bg-navy-400 px-2.5 py-0.5 text-xs font-semibold text-white">
						무료
					</span>
				) : undefined
			}
			onClick={onClick}
			className={className}
		>
			{/* 별점 + 리뷰수 */}
			<div className="flex items-center gap-1">
				<span className="text-xs text-orange-400">★</span>
				<span className="text-xs font-semibold text-gray-800">{rating}</span>
				<span className="text-xs text-gray-400">({reviewCount})</span>
			</div>

			{/* 장소명 */}
			<p className="text-sm font-bold text-gray-900">{name}</p>

			{/* 위치 */}
			<p className="flex items-center gap-0.5 text-xs text-gray-500">
				<span>📍</span>
				{location}
			</p>

			{/* 가격 */}
			<p className={`mt-1 text-sm font-bold ${isFree ? "text-navy-400" : "text-gray-900"}`}>
				{isFree ? "무료" : `${price?.toLocaleString()}원/인`}
			</p>
		</CardBase>
	);
}

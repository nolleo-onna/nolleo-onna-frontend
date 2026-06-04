import CardBase from "@/components/ui/Card/CardBase";

interface CourseCardProps {
	imageSrc: string;
	title: string;
	rating: number;
	reviewCount: string;
	location: string;
	tags?: string[]; // ["관광공사", "해운대"] 등
	originalPrice?: number;
	discountPrice?: number;
	onClick?: () => void;
	className?: string;
}

export default function CourseCard({
	imageSrc,
	title,
	rating,
	reviewCount,
	location,
	tags = [],
	originalPrice,
	discountPrice,
	onClick,
	className,
}: CourseCardProps) {
	return (
		<CardBase
			imageSrc={imageSrc}
			imageAlt={title}
			aspectRatio="video"
			topLeftSlot={
				tags.length > 0 ? (
					<div className="flex gap-1">
						{tags.map((tag, i) => (
							<span
								key={i}
								className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
									tag === "관광공사"
										? "bg-purple-500 text-white"
										: "bg-white/90 text-gray-700"
								}`}
							>
								{tag}
							</span>
						))}
					</div>
				) : undefined
			}
			onClick={onClick}
			className={className}
		>
			{/* 코스 제목 */}
			<p className="line-clamp-2 text-sm font-bold text-gray-900">{title}</p>

			{/* 별점 + 위치 */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1">
					<span className="text-xs text-orange-400">★</span>
					<span className="text-xs font-semibold text-gray-800">{rating}</span>
					<span className="text-xs text-gray-400">({reviewCount})</span>
				</div>
				<p className="flex items-center gap-0.5 text-xs text-gray-500">
					<span>📍</span>
					{location}
				</p>
			</div>

			{/* 가격 */}
			{discountPrice !== undefined && (
				<div className="mt-1 flex items-center gap-2">
					{originalPrice && (
						<span className="text-xs text-gray-400 line-through">
							{originalPrice.toLocaleString()}원
						</span>
					)}
					<span className="text-sm font-bold text-gray-900">
						{discountPrice.toLocaleString()}원
					</span>
				</div>
			)}
		</CardBase>
	);
}

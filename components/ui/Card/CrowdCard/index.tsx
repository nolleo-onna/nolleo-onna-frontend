import CardBase from "@/components/ui/Card/CardBase";

interface CrowdCardProps {
    imageSrc: string;
    name: string;
    rank: number;
    crowdStatus: "매우혼잡" | "혼잡" | "보통" | "여유";
    peakInfo: string; // "해운대구 · 14~17시 피크"
    onClick?: () => void;
    className?: string;
}

const crowdBadgeStyles: Record<string, string> = {
    매우혼잡: "bg-red-500 text-white",
    혼잡: "bg-orange-400 text-white",
    보통: "bg-yellow-400 text-gray-800",
    여유: "bg-green-500 text-white",
};

const crowdDotStyles: Record<string, string> = {
    매우혼잡: "bg-red-400",
    혼잡: "bg-orange-300",
    보통: "bg-yellow-300",
    여유: "bg-green-400",
};

export default function CrowdCard({
    imageSrc,
    name,
    rank,
    crowdStatus,
    peakInfo,
    onClick,
    className,
}: CrowdCardProps) {
    return (
        <CardBase
            imageSrc={imageSrc}
            imageAlt={name}
            aspectRatio="card"
            topLeftSlot={
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                    {rank}
                </div>
            }
            topRightSlot={
                <span
                    className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${crowdBadgeStyles[crowdStatus]}`}
                >
                    <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${crowdDotStyles[crowdStatus]}`}
                    />
                    {crowdStatus}
                </span>
            }
            onClick={onClick}
            className={className}
        >
            {/* 장소명 */}
            <p className="text-sm font-bold text-gray-900">{name}</p>
            {/* 피크 정보 */}
            <p className="text-xs text-gray-500">{peakInfo}</p>
        </CardBase>
    );
}

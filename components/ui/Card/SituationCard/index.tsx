import Image from "next/image";

import CardBase from "@/components/ui/Card/CardBase";

interface SituationCardProps {
    imageSrc: string;
    tag: string; // "상황별", "추천 코스·야경"
    emoji: string; // "🌧️", "💰"
    title: string; // "비 와도 괜찮아"
    subtitle: string; // "실내 위주 큐레이션"
    onClick?: () => void;
    className?: string;
}

export default function SituationCard({
    imageSrc,
    tag,
    emoji,
    title,
    subtitle,
    onClick,
    className,
}: SituationCardProps) {
    return (
        <CardBase
            imageSrc={imageSrc}
            imageAlt={title}
            aspectRatio="video"
            topLeftSlot={
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                    {tag}
                </span>
            }
            topRightSlot={
                <span className="text-2xl">{emoji}</span>
            }
            onClick={onClick}
            className={`overflow-hidden ${className ?? ""}`}
        >
            {/* 카드 하단 텍스트는 이미지 위에 겹쳐서 표시 */}
        </CardBase>
    );
}

// 이미지 위에 텍스트를 겹쳐야 해서 CardBase를 직접 확장한 버전
// 실제 렌더링은 아래처럼 이미지 내부에 텍스트를 배치
export function SituationCardOverlay({
    imageSrc,
    tag,
    emoji,
    title,
    subtitle,
    onClick,
    className,
}: SituationCardProps) {
    return (
        <div
            onClick={onClick}
            className={`group relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl ${className ?? ""}`}
        >
            {/* 배경 이미지 */}
            <Image
                src={imageSrc}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 744px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />

            {/* 어두운 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            {/* 상단: 태그 + 이모지 */}
            <div className="absolute left-4 right-4 top-4 flex items-start justify-between">
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                    {tag}
                </span>
                <span className="text-2xl">{emoji}</span>
            </div>

            {/* 하단: 제목 + 부제목 + 버튼 */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1">
                <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                    {subtitle}
                </p>
                <p className="text-xl font-bold leading-tight text-white">{title}</p>
                <button className="mt-2 flex w-fit items-center gap-1 text-sm font-semibold text-white underline-offset-2 hover:underline">
                    코스 보기 →
                </button>
            </div>
        </div>
    );
}

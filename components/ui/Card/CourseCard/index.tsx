import Image from "next/image";

interface CourseCardProps {
  imageSrc: string;
  badge?: string;
  emoji?: string;
  subTitle?: string;
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
}

export default function CourseCard({
  imageSrc,
  badge,
  emoji,
  subTitle,
  title,
  description,
  onClick,
  className = "",
}: CourseCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer ${className}`}
    >
      {/* 배경 이미지 */}
      <Image
        src={imageSrc}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
      />

      {/* 전체 그라디언트 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* 상단 */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        {badge && (
          <span className="rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white">
            {badge}
          </span>
        )}
        {emoji && (
          <span className="text-2xl ml-auto">{emoji}</span>
        )}
      </div>

      {/* 하단 텍스트 오버레이 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-1">
        {subTitle && (
          <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
            {subTitle}
          </p>
        )}
        <h3 className="text-xl font-bold text-white leading-tight">{title}</h3>
        {description && (
          <p className="text-xs text-white/80">{description}</p>
        )}
        <button className="mt-2 text-sm font-semibold text-white flex items-center gap-1 w-fit">
          코스 보기 →
        </button>
      </div>
    </div>
  );
}
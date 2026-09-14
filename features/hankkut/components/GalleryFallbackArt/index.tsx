interface GalleryFallbackArtProps {
  name: string;
}

/**
 * 대표 사진이 없는 동네 카드의 배경. 이모지 대신 네이비 그라데이션 위에 동네 이름을 크게 흐리게 깔고
 * 파도 곡선을 얹어, 사진 카드들 사이에 섞여도 어색하지 않은 "타이포 카드"로 보이게 한다.
 */
export default function GalleryFallbackArt({ name }: GalleryFallbackArtProps) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-gradient-to-br from-navy-600 via-navy-700 to-navy-900">
      <div className="absolute -left-12 -top-16 h-56 w-56 rounded-full bg-ocean-500/30 blur-3xl" />
      <div className="absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-lime-300/10 blur-3xl" />
      <svg
        className="absolute inset-x-0 bottom-0 h-1/3 w-full text-white/[0.06]"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0 60 C 60 30, 120 90, 200 60 S 340 30, 400 60 V100 H0Z" />
        <path d="M0 80 C 80 55, 140 100, 220 78 S 350 55, 400 80 V100 H0Z" />
      </svg>
      <span className="absolute -bottom-3 right-3 select-none whitespace-nowrap text-[88px] font-black leading-none tracking-tighter text-white/[0.07]">
        {name}
      </span>
    </div>
  );
}

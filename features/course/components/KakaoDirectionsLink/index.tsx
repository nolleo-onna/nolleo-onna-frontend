import { Navigation } from "lucide-react";

interface Props {
  /** 도착지 이름 (카카오맵에 표시됨) */
  name: string;
  lat: number;
  lng: number;
  className?: string;
}

// 카카오맵 길찾기 링크. 좌표가 없는 장소(0 또는 비정상 값)는 아무것도 그리지 않는다.
export default function KakaoDirectionsLink({ name, lat, lng, className }: Props) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) {
    return null;
  }

  return (
    <a
      href={`https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} 카카오맵 길찾기`}
      className={`flex items-center gap-1 rounded-full bg-ocean-50 px-2 py-1 text-[11px] font-semibold text-ocean-600 transition-colors hover:bg-ocean-100 ${className ?? ""}`}
    >
      <Navigation className="h-3 w-3" />
      길찾기
    </a>
  );
}

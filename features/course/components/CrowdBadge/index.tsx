import { CROWD_STYLE } from "@/features/crowd/utils/crowdUtils";

import type { PlaceCongestion } from "@/features/course/utils/courseCongestion";

interface CrowdBadgeProps {
  congestion: PlaceCongestion;
  className?: string;
}

/**
 * 코스 타임라인·스팟 추가 패널에서 쓰는 실시간 혼잡도 미니 배지.
 * 색만으로 구분하지 않도록 라벨을 항상 함께 쓰고(CROWD_STYLE 규칙),
 * title로 집중률과 산출 기준(관광지/구 단위)을 알려준다.
 */
export default function CrowdBadge({ congestion, className = "" }: CrowdBadgeProps) {
  const style = CROWD_STYLE[congestion.level];
  const title =
    congestion.source === "district"
      ? `${congestion.district} 일대 기준 집중률 ${Math.round(congestion.rate)}%`
      : `실시간 집중률 ${Math.round(congestion.rate)}%`;

  return (
    <span
      title={title}
      className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-[1px] text-[10px] font-semibold ${className}`}
      style={{ backgroundColor: `${style.bg}e6`, color: style.text }}
    >
      {style.label}
    </span>
  );
}

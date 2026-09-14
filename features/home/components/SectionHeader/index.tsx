import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface SectionHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: SectionAction;
  /** 제목 줄 오른쪽에 함께 둘 요소 — 캐러셀 화살표, 탭 등 */
  children?: React.ReactNode;
  tone?: "light" | "dark";
}

/**
 * 홈 섹션 제목 줄. 섹션마다 색 라벨 + 제목 + 테두리 버튼을 반복하던 틀을 걷어내고,
 * 제목과 한 줄 설명, 화살표 텍스트 링크만 남겨 섹션 본문(사진·목록)이 먼저 보이게 한다.
 */
export default function SectionHeader({ title, description, action, children, tone = "light" }: SectionHeaderProps) {
  const dark = tone === "dark";
  const actionClass = `group inline-flex shrink-0 items-center gap-1 text-sm font-semibold transition-colors ${
    dark ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-navy-900"
  }`;
  const actionContent = action && (
    <>
      {action.label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </>
  );

  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 md:mb-8">
      <div className="min-w-0">
        <h2 className={`text-2xl font-bold tracking-tight break-keep md:text-[28px] ${dark ? "text-white" : "text-navy-900"}`}>
          {title}
        </h2>
        {description && (
          <p className={`mt-1.5 text-sm break-keep ${dark ? "text-white/55" : "text-gray-500"}`}>{description}</p>
        )}
      </div>
      {(children || action) && (
        <div className="flex items-center gap-3">
          {children}
          {action &&
            (action.href ? (
              <Link href={action.href} className={actionClass}>
                {actionContent}
              </Link>
            ) : (
              <button type="button" onClick={action.onClick} className={actionClass}>
                {actionContent}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

import { Clock, MapPin, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import SaveToggleButton from "@/features/hankkut/components/HankkutDetailSidebar/SaveToggleButton";
import ShareButton from "@/features/hankkut/components/HankkutDetailSidebar/ShareButton";
import type { HankkutDetail } from "@/features/hankkut/data/hankkutDetail";
import type { Hankkut } from "@/features/hankkut/data/mockHankkut";

interface HankkutDetailSidebarProps {
  hankkut: HankkutDetail;
  otherList: Hankkut[];
}

export default function HankkutDetailSidebar({
  hankkut,
  otherList,
}: HankkutDetailSidebarProps) {
  return (
    <aside className="space-y-5">
      {/* 액션 버튼 */}
      <section className="rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-bold text-navy-900">이 한끗 저장하기</h2>
        <div className="mt-3 space-y-2">
          <SaveToggleButton id={hankkut.id} />
          <ShareButton title={hankkut.title} />
        </div>
      </section>

      {/* 위치 / 운영 정보 */}
      <section className="rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-bold text-navy-900">위치</h2>
        <a
          href={`https://map.kakao.com/?q=${encodeURIComponent(hankkut.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl bg-gray-50 text-gray-400 transition-colors hover:bg-gray-100 hover:text-navy-900"
        >
          <MapPin className="h-8 w-8" />
          <span className="text-xs font-semibold">카카오맵에서 보기</span>
        </a>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <span className="text-gray-600">{hankkut.address}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-400">
              <Clock className="h-4 w-4" />
              운영시간
            </span>
            <span className="font-medium text-navy-900">{hankkut.hours}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-400">
              <Ticket className="h-4 w-4" />
              입장료
            </span>
            <span className="font-medium text-navy-900">{hankkut.fee}</span>
          </li>
        </ul>
      </section>

      {/* 다른 한끗 추천 */}
      {otherList.length > 0 && (
        <section className="rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-navy-900">
            이런 한끗도 있어요
          </h2>
          <ul className="mt-3 space-y-3">
            {otherList.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/hankkut/${item.id}`}
                  className="group flex items-center gap-3"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="48px"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy-900 group-hover:text-ocean-600">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {item.region} · {item.category}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}

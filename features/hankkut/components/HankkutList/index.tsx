import { MapPinned } from "lucide-react";

import HankkutCard from "@/features/hankkut/components/HankkutCard";
import type { Hankkut } from "@/features/hankkut/data/mockHankkut";

interface HankkutListProps {
  list: Hankkut[];
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 shadow-lg">
        <MapPinned className="h-8 w-8 text-lime-300" />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-800">아직 등록된 한끗이 없어요</p>
        <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">
          이 카테고리에 해당하는 한끗이 등록되면
          <br />
          여기에서 확인할 수 있어요
        </p>
      </div>
    </div>
  );
}

export default function HankkutList({ list }: HankkutListProps) {
  if (list.length === 0) {
    return <EmptyState />;
  }

  return (
    <section>
      <p className="mb-5 text-sm text-gray-500">
        총 <span className="font-bold text-navy-900">{list.length}</span>개의
        한끗
      </p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {list.map((hankkut, index) => (
          <HankkutCard
            key={hankkut.id}
            hankkut={hankkut}
            featured={index === 0}
          />
        ))}
      </div>
    </section>
  );
}

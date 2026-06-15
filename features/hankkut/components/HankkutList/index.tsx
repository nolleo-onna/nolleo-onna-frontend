import HankkutCard from "@/features/hankkut/components/HankkutCard";
import type { Hankkut } from "@/features/hankkut/data/mockHankkut";

interface HankkutListProps {
  list: Hankkut[];
}

export default function HankkutList({ list }: HankkutListProps) {
  if (list.length === 0) {
    return (
      <p className="py-24 text-center text-sm text-gray-400">
        아직 등록된 한끗이 없어요.
      </p>
    );
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

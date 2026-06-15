import HankkutHero from "@/features/hankkut/components/HankkutHero";
import HankkutList from "@/features/hankkut/components/HankkutList";
import HankkutReportBanner from "@/features/hankkut/components/HankkutReportBanner";
import { MOCK_HANKKUT_LIST } from "@/features/hankkut/data/mockHankkut";

interface HankkutPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function HankkutPage({ searchParams }: HankkutPageProps) {
  const { category } = await searchParams;

  const filteredList =
    !category || category === "전체"
      ? MOCK_HANKKUT_LIST
      : MOCK_HANKKUT_LIST.filter((item) => item.category === category);

  return (
    <div className="pt-16">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-10 lg:px-20">
        <HankkutHero activeCategory={category ?? "전체"} />
        <div className="mt-10">
          <HankkutList list={filteredList} />
        </div>
        <div className="mt-14">
          <HankkutReportBanner />
        </div>
      </div>
    </div>
  );
}

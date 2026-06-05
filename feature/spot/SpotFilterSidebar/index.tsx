export default function SpotFilterSidebar() {
  return (
    <aside
      className="
        w-[320px]
        shrink-0
        overflow-y-auto
        border-r
        border-gray-200
        bg-white
        p-6
      "
    >
      <h2 className="text-2xl font-bold">
        부산 어디로 놀러갈래?
      </h2>

      <div className="mt-8">
        지역 필터 영역
      </div>

      <div className="mt-8">
        카테고리 영역
      </div>

      <div className="mt-8">
        예산 영역
      </div>
    </aside>
  );
}
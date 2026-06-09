interface SpotLayoutProps {
  filterSidebar: React.ReactNode;
  map: React.ReactNode;
  listSidebar: React.ReactNode;
}

export default function SpotLayout({
  filterSidebar,
  map,
  listSidebar,
}: SpotLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-64px)] mt-16 w-full overflow-hidden bg-gray-50">
      {/* 좌측: 필터 사이드바 */}
      <aside className="scrollbar flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-r border-gray-100 bg-white">
        {filterSidebar}
      </aside>

      {/* 중앙: 카카오맵 */}
      <main className="relative flex-1 overflow-hidden">
        {map}
      </main>

      {/* 우측: 스팟 리스트 사이드바 */}
      <aside className="scrollbar flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-l border-gray-100 bg-white">
        {listSidebar}
      </aside>
    </div>
  );
}

interface SpotLayoutProps {
  filterSidebar: React.ReactNode;
  map: React.ReactNode;
  listSidebar: React.ReactNode;
}
export default function SpotLayout({ filterSidebar, map, listSidebar }: SpotLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-64px)] mt-16 w-full overflow-hidden bg-gray-50">
      <aside className="scrollbar flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-r border-gray-100 bg-white">
        {filterSidebar}
      </aside>

      <main className="flex flex-1 h-full">
        {map}
      </main>

      <aside className="scrollbar flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-l border-gray-100 bg-white">
        {listSidebar}
      </aside>
    </div>
  );
}

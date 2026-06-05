import SpotFilterSidebar from "../SpotFilterSidebar";
import SpotMap from "../SpotMap";
import SpotListSidebar from "../SpotListSidebar";

export default function SpotLayout() {
  return (
    <main className="flex h-[calc(100vh-80px)]">
      <SpotFilterSidebar />
      <SpotMap />
      <SpotListSidebar />
    </main>
  );
}
import SpotLayout from "@/features/spot/SpotLayout";
import SpotFilterSidebar from "@/features/spot/SpotFilterSidebar";
import SpotMap from "@/features/spot/SpotMap";
import SpotListSidebar from "@/features/spot/SpotListSidebar";

export default function SpotPage() {
  return (
    <SpotLayout
      filterSidebar={<SpotFilterSidebar />}
      map={<SpotMap />}
      listSidebar={<SpotListSidebar />}
    />
  );
}
export default function MapSkeleton() {
  return (
    <div className="relative h-full w-full bg-gray-100">
      {/* 지도 배경 */}
      <div className="absolute inset-0 animate-shimmer" />
      
      {/* 줌 컨트롤 */}
      <div className="absolute right-4 top-4 flex flex-col gap-1">
        <div className="w-8 h-8 rounded bg-gray-300" />
        <div className="w-8 h-8 rounded bg-gray-300" />
      </div>

      {/* 카카오 로고 자리 */}
      <div className="absolute bottom-4 right-4 w-16 h-5 rounded bg-gray-300" />
    </div>
  );
}
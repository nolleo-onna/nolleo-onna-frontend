import TourCourseCard from "@/components/ui/Card/TourCourseCard";

type TourCourse = {
  id: number;
  imageSrc: string;
  title: string;
  rating: number;
  reviewCount: string;
  location: string;
  regionTags?: string[];
};

const mockCourses: TourCourse[] = [
  { id: 1, imageSrc: "https://picsum.photos/seed/market/600/400", title: "다이나믹한 부산의 매력을 만나다", rating: 4.8, reviewCount: "2.1k", location: "중구", regionTags: ["중구"] },
  { id: 2, imageSrc: "https://picsum.photos/seed/sunset/600/400", title: "부산의 아름다운 낮과 밤, 주경·야경", rating: 4.9, reviewCount: "3.5k", location: "해운대", regionTags: ["해운대"] },
  { id: 3, imageSrc: "https://picsum.photos/seed/yeongdo/600/400", title: "영도의 바다를 만나다", rating: 4.7, reviewCount: "1.8k", location: "영도", regionTags: ["영도"] },
];

type Props = {
  courses?: TourCourse[];
};

export default function TourCourseSection({ courses = mockCourses }: Props) {
  return (
    <section className="py-6 md:py-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-pink-400">관광공사 · TourAPI</span>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">관광공사 추천 코스</h2>
        </div>
        <button className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5">
          {courses.length}개 전체 보기
        </button>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <TourCourseCard
            key={course.id}
            imageSrc={course.imageSrc}
            title={course.title}
            rating={course.rating}
            reviewCount={course.reviewCount}
            location={course.location}
            regionTags={course.regionTags}
          />
        ))}
      </div>
    </section>
  );
}
import Header from "@/components/layout/Header";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-6">
        <h1 className="text-5xl font-bold">
          놀러왔나
        </h1>

        <p className="text-gray-500">
          부산 여행 추천 서비스
        </p>

        <Link
          href="/spot"
          className="rounded-xl bg-pink-500 px-6 py-3 text-white"
        >
          스팟 둘러보기
        </Link>
      </main>
    </>
  );
}
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="mt-16 flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-xl font-bold text-gray-900">로그인에 실패했어요</h1>
        <p className="text-sm text-gray-500">
          잠시 후 다시 시도해 주세요.
        </p>
        <Link
          href="/login"
          className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
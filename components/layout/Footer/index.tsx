export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* 로고 + 설명 */}
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-navy-900">놀러왔나</span>
            <p className="text-sm text-gray-500">부산 여행자를 위한 예산 맞춤형 여행 플래너</p>
          </div>

          {/* 링크 */}
          <nav className="flex gap-6 text-sm text-gray-500">
            <a href="/about" className="hover:text-navy-700 transition-colors">
              서비스 소개
            </a>
            <a href="/terms" className="hover:text-navy-700 transition-colors">
              이용약관
            </a>
            <a href="/privacy" className="hover:text-navy-700 transition-colors">
              개인정보처리방침
            </a>
          </nav>
        </div>

        {/* 카피라이트 */}
        <p className="mt-6 text-xs text-gray-400">
          © 2025 놀러왔나. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
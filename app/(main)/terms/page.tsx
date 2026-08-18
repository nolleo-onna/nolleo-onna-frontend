import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 | 놀러온나",
};

const TERMS_SECTIONS = [
  {
    title: "제1조 (목적)",
    body: "이 약관은 놀러온나(이하 \"서비스\")의 이용 조건과 절차, 이용자와 서비스 제공자의 권리·의무를 규정하는 것을 목적으로 합니다. 놀러온나는 부산 여행 정보를 탐색하고 예산 내 여행 코스를 구성할 수 있도록 돕는 서비스입니다.",
  },
  {
    title: "제2조 (서비스의 성격)",
    body: "본 서비스는 공모전 출품을 위해 제작된 데모 서비스로, 사전 고지 없이 기능이 변경되거나 운영이 중단될 수 있습니다. 서비스 내 일부 콘텐츠는 시연을 위한 예시 데이터를 포함할 수 있습니다.",
  },
  {
    title: "제3조 (계정 및 로그인)",
    body: "서비스는 카카오·네이버·구글 소셜 로그인을 통해 이용할 수 있습니다. 서비스는 로그인 과정에서 닉네임, 이메일, 프로필 이미지 등 최소한의 정보만 제공받으며, 비밀번호를 직접 수집하지 않습니다.",
  },
  {
    title: "제4조 (콘텐츠의 출처)",
    body: "서비스에서 제공하는 관광지·음식점 등 여행 정보는 한국관광공사 TourAPI 등 공공 데이터를 기반으로 하며, 지도는 카카오맵 API를 사용합니다. 원천 데이터의 갱신 시점에 따라 실제 정보(운영시간, 가격 등)와 차이가 있을 수 있습니다.",
  },
  {
    title: "제5조 (이용자 데이터)",
    body: "이용자가 생성한 여행 코스는 서비스 서버에 저장됩니다. 한끗 저장, 닉네임 변경, 알림 설정 등 일부 기능은 이용 중인 브라우저에만 저장되며 다른 기기와 동기화되지 않습니다.",
  },
  {
    title: "제6조 (책임의 한계)",
    body: "서비스가 제공하는 정보는 여행 계획을 돕기 위한 참고 자료입니다. 정보의 정확성·완전성을 보장하지 않으며, 이를 근거로 한 의사결정의 결과에 대해 서비스 제공자는 책임을 지지 않습니다.",
  },
  {
    title: "제7조 (약관의 변경)",
    body: "본 약관은 서비스 개선을 위해 변경될 수 있으며, 변경 시 이 페이지를 통해 공지합니다.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 pt-28 pb-20 md:px-10 lg:px-20">
      <article className="mx-auto max-w-3xl">
        <header className="rounded-[28px] border border-gray-100 bg-gradient-to-br from-ocean-50 via-white to-lime-50 p-8 md:p-10">
          <p className="text-sm font-semibold text-ocean-600">놀러온나</p>
          <h1 className="mt-1 text-3xl font-bold text-navy-900">이용약관</h1>
          <p className="mt-2 text-sm text-gray-500">시행일: 2026년 6월 1일</p>
        </header>

        <div className="mt-6 flex flex-col gap-4">
          {TERMS_SECTIONS.map(({ title, body }) => (
            <section
              key={title}
              className="rounded-[28px] border border-gray-100 bg-white p-6 md:p-8"
            >
              <h2 className="text-base font-bold text-navy-900">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}

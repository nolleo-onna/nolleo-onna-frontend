import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 놀러온나",
};

// 개인정보보호법 제30조(개인정보 처리방침의 수립·공개)의 표준 구성을 따르되,
// 실제 서비스 동작(소셜 로그인 최소 수집, 제3자 제공 없음, 일부 기능 브라우저 저장)에 맞게 작성.
const PRIVACY_SECTIONS: { title: string; clauses: string[] }[] = [
  {
    title: "제1조 (개인정보의 처리 목적)",
    clauses: [
      "회원 식별 및 소셜 로그인 기반 서비스 제공 (코스 생성·저장, 별점 리뷰 등 회원 전용 기능)",
      "서비스 화면에 닉네임·프로필 이미지 표시",
      "서비스 이용 관련 문의 대응. 놀러온나(이하 \"서비스\")는 위 목적 이외의 용도로 개인정보를 이용하지 않습니다.",
    ],
  },
  {
    title: "제2조 (수집하는 개인정보의 항목 및 방법)",
    clauses: [
      "수집 항목: 소셜 계정(카카오·네이버·구글)의 닉네임, 이메일 주소, 프로필 이미지 URL",
      "수집 방법: 이용자가 소셜 로그인에 동의하는 과정에서 해당 플랫폼으로부터 제공받으며, 서비스가 비밀번호를 직접 수집하거나 저장하지 않습니다.",
      "서비스 이용 과정에서 이용자가 생성한 여행 코스와 별점 리뷰가 서버에 저장됩니다.",
    ],
  },
  {
    title: "제3조 (개인정보의 처리 및 보유 기간)",
    clauses: [
      "개인정보는 회원 자격이 유지되는 동안 보유하며, 회원이 소셜 계정 연결을 해제하거나 서비스가 종료되는 경우 지체 없이 파기합니다.",
      "본 서비스는 공모전 출품용 데모 서비스로, 공모전 종료 등 운영 종료 시 저장된 개인정보 전체가 파기될 수 있습니다.",
    ],
  },
  {
    title: "제4조 (개인정보의 제3자 제공)",
    clauses: [
      "서비스는 이용자의 개인정보를 외부에 제공하지 않습니다. 다만 법령에 근거한 수사기관의 적법한 요청이 있는 경우는 예외로 합니다.",
    ],
  },
  {
    title: "제5조 (개인정보 처리의 위탁)",
    clauses: [
      "서비스는 서버 운영을 위해 클라우드 인프라(GCP)를 이용하며, 개인정보는 해당 인프라에 저장됩니다. 이 외에 개인정보 처리를 외부에 위탁하지 않습니다.",
    ],
  },
  {
    title: "제6조 (쿠키 및 유사 기술의 사용)",
    clauses: [
      "로그인 상태 유지를 위해 인증 쿠키를 사용합니다. 쿠키를 차단하면 회원 전용 기능을 이용할 수 없습니다.",
      "한끗 저장, 닉네임 표시 설정, 알림 설정 등 일부 기능은 이용 중인 브라우저의 localStorage에만 저장되며 서버로 전송되지 않습니다. 브라우저 데이터를 삭제하면 함께 삭제됩니다.",
    ],
  },
  {
    title: "제7조 (개인정보의 파기 절차 및 방법)",
    clauses: [
      "보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다.",
      "전자적 파일 형태의 개인정보는 복구할 수 없는 기술적 방법으로 삭제합니다.",
    ],
  },
  {
    title: "제8조 (정보주체의 권리와 행사 방법)",
    clauses: [
      "이용자는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를 요구할 수 있습니다.",
      "소셜 계정 설정에서 서비스와의 연결을 해제하면 서비스의 개인정보 수집이 중단됩니다.",
      "권리 행사는 서비스 운영팀(GitHub 저장소 이슈 또는 공모전 제출 자료에 기재된 연락처)을 통해 요청할 수 있습니다.",
    ],
  },
  {
    title: "제9조 (개인정보의 안전성 확보 조치)",
    clauses: [
      "개인정보는 HTTPS 암호화 통신을 통해 전송됩니다.",
      "서버 접근 권한을 운영에 필요한 최소 인원으로 제한합니다.",
      "비밀번호를 수집하지 않는 소셜 로그인 방식을 사용해 유출 위험을 최소화합니다.",
    ],
  },
  {
    title: "제10조 (개인정보 보호책임자)",
    clauses: [
      "개인정보 보호 관련 문의는 놀러온나 운영팀이 담당합니다. 공모전 출품용 데모 서비스 특성상 별도 상설 조직은 없으며, 문의는 제8조의 경로로 접수받습니다.",
    ],
  },
  {
    title: "제11조 (개인정보처리방침의 변경)",
    clauses: [
      "이 방침의 내용이 변경되는 경우 시행일과 변경 내용을 이 페이지를 통해 공지합니다.",
    ],
  },
  {
    title: "부칙",
    clauses: ["이 방침은 2026년 6월 1일부터 시행합니다."],
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 pt-28 pb-20 md:px-10 lg:px-20">
      <article className="mx-auto max-w-3xl">
        <header className="rounded-[28px] border border-gray-100 bg-gradient-to-br from-ocean-50 via-white to-lime-50 p-8 md:p-10">
          <p className="text-sm font-semibold text-ocean-600">놀러온나</p>
          <h1 className="mt-1 text-3xl font-bold text-navy-900">개인정보처리방침</h1>
          <p className="mt-2 text-sm text-gray-500">시행일: 2026년 6월 1일</p>
        </header>

        <div className="mt-6 flex flex-col gap-4">
          {PRIVACY_SECTIONS.map(({ title, clauses }) => (
            <section
              key={title}
              className="rounded-[28px] border border-gray-100 bg-white p-6 md:p-8"
            >
              <h2 className="text-base font-bold text-navy-900">{title}</h2>
              {clauses.length === 1 ? (
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {clauses[0]}
                </p>
              ) : (
                <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-relaxed text-gray-600">
                  {clauses.map((clause) => (
                    <li key={clause}>{clause}</li>
                  ))}
                </ol>
              )}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}

import Container from "@/components/layout/Container";

interface LoginLayoutProps {
  loginForm: React.ReactNode;
}

export default function LoginLayout({ loginForm }: LoginLayoutProps) {
  return (
    <main className="relative mt-16 flex min-h-[calc(100vh-64px)] w-full items-center justify-center overflow-hidden bg-gray-50">
      {/* 배경 메시 그라디언트 — 홈 히어로와 동일한 톤 */}
      <div
        className="absolute inset-0"
        style={{
          maskImage: "radial-gradient(ellipse at center, black 45%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 45%, transparent 85%)",
        }}
      >
        <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-ocean-200 blur-3xl opacity-40" />
        <div className="absolute top-1/3 right-[-4rem] w-72 h-72 rounded-full bg-lime-200 blur-3xl opacity-30" />
        <div className="absolute -bottom-16 left-1/3 w-96 h-96 rounded-full bg-sky-200 blur-3xl opacity-30" />
      </div>

      <Container className="relative flex justify-center py-10">
        {loginForm}
      </Container>
    </main>
  );
}
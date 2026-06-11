import Container from "@/components/layout/Container";

interface LoginLayoutProps {
  loginForm: React.ReactNode;
}

export default function LoginLayout({ loginForm }: LoginLayoutProps) {
  return (
    <main className="mt-16 flex min-h-[calc(100vh-64px)] w-full items-center justify-center bg-gray-50">
      <Container className="flex justify-center py-10">
        {loginForm}
      </Container>
    </main>
  );
}
import { Suspense } from "react";

import LoginLayout from "@/features/auth/LoginLayout";
import LoginForm from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <LoginLayout
      loginForm={
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      }
    />
  );
}
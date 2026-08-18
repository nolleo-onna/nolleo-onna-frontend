"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { AlertCircle } from "lucide-react";

import SocialLoginButton from "@/features/auth/SocialLoginButton";

const RETURN_URL_KEY = "auth:returnUrl";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const isSessionExpired = searchParams.get("notice") === "session";

  useEffect(() => {
    const returnUrl = searchParams.get("returnUrl");

    if (returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")) {
      sessionStorage.setItem(RETURN_URL_KEY, returnUrl);
    }
  }, [searchParams]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex w-full max-w-sm flex-col gap-7 rounded-3xl border border-gray-100 bg-white/80 p-8 shadow-[0_8px_40px_rgba(13,48,128,0.10)] backdrop-blur-xl"
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-6">
          <Image
            src="/logo/icon.png"
            alt=""
            width={64}
            height={64}
            priority
          />
          <span className="font-taenada text-3xl bg-gradient-to-r from-navy-700 via-ocean-600 to-ocean-400 bg-clip-text text-transparent">
            놀러온나
          </span>
        </div>
        <h1 className="text-xl font-bold text-navy-900">다시 만나서 반가워요</h1>
        <p className="mt-2 text-sm text-gray-500">
          소셜 계정으로 간편하게 시작하세요
        </p>
      </div>

      {isSessionExpired && (
        <div className="flex items-center gap-2 rounded-2xl bg-ocean-50 px-4 py-3 text-xs font-medium text-ocean-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          로그인이 만료됐어요. 다시 로그인해주세요.
        </div>
      )}

      <div className="flex flex-col gap-3">
        <SocialLoginButton provider="kakao" />
        <SocialLoginButton provider="naver" />
        <SocialLoginButton provider="google" />
      </div>
    </motion.div>
  );
}
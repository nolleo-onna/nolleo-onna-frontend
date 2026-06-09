import SocialLoginButton from "@/features/auth/SocialLoginButton";

export default function LoginForm() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-6">
			<div className="text-center">
				<h1 className="text-2xl font-bold text-gray-900">로그인</h1>
				<p className="mt-2 text-sm text-gray-500">
					소셜 계정으로 간편하게 시작하세요
				</p>
			</div>

			<div className="flex flex-col gap-3">
				<SocialLoginButton provider="kakao" />
				<SocialLoginButton provider="naver" />
				<SocialLoginButton provider="google" />
			</div>
		</div>
	);
}
import { Suspense } from "react";

import WavesBackground from "@/components/ui/WavesBackground";
import TicketCard from "@/features/auth/LoginTicket/TicketCard";

export default function LoginPage() {
  return (
    // 홈 히어로와 같은 파도 위에 표 한 장이 떠 있는 화면
    <main className="relative mt-16 flex min-h-[calc(100vh-64px)] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-navy-800 via-navy-700 to-ocean-800 px-5 py-12">
      <WavesBackground />

      <div className="relative z-10 flex w-full justify-center">
        {/* useSearchParams(returnUrl·세션 만료 안내)를 쓰므로 Suspense 필요 */}
        <Suspense fallback={null}>
          <TicketCard />
        </Suspense>
      </div>
    </main>
  );
}

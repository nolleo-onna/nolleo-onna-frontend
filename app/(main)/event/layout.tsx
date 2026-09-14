import Script from "next/script";

// 행사 상세의 위치 지도(EventLocationMap)용 카카오 지도 SDK
export default function EventLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
      />
      {children}
    </>
  );
}

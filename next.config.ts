import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // 기본 품질(75)은 관광공사 사진 재압축 시 아티팩트가 보여서 카드류는 90을 쓴다.
    // Next 16부터는 quality prop에 쓸 값을 여기에 등록해야 한다.
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "http",
        hostname: "tong.visitkorea.or.kr",
      },
      {
        protocol: "https",
        hostname: "img1.kakaocdn.net",
      },
      {
        protocol: "https",
        hostname: "tong.visitkorea.or.kr",
      },
    ],
  },
};

export default nextConfig;
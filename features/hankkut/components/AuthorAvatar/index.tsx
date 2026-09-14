"use client";

import { useState } from "react";
import Image from "next/image";

interface AuthorAvatarProps {
  name: string;
  /** 작성자 프로필 사진. 없거나 불러오지 못하면 첫 글자로 대신한다 */
  imageUrl?: string;
  size?: number;
}

// 카카오 프로필 주소가 http로 오는데 next/image는 https 카카오 이미지만 허용해 깨진 아이콘이 떴다.
// https로 바꿔 요청하고, 그래도 실패하면 폴백 원(라임 + 첫 글자)으로 바꾼다.
function toHttps(url: string): string {
  return url.replace(/^http:\/\//, "https://");
}

// 마이페이지 프로필 히어로와 같은 폴백 스타일(라임 원 + 첫 글자)을 재사용해
// 게시판·댓글에서도 톤을 맞춘다.
export default function AuthorAvatar({ name, imageUrl, size = 32 }: AuthorAvatarProps) {
  const src = imageUrl ? toHttps(imageUrl) : null;
  // 실패한 주소를 기억해 두면 다른 사진으로 바뀌었을 때 따로 초기화하지 않아도 다시 시도한다
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (src && src !== failedSrc) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        onError={() => setFailedSrc(src)}
        className="shrink-0 rounded-full border border-white object-cover shadow-base"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border border-white bg-lime-300 shadow-base"
      style={{ width: size, height: size }}
    >
      <span
        className="font-bold text-navy-900"
        style={{ fontSize: Math.max(10, Math.round(size * 0.4)) }}
      >
        {name.charAt(0)}
      </span>
    </div>
  );
}

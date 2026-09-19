"use client";

import { useState } from "react";
import Image from "next/image";

import DefaultAvatar from "@/components/ui/DefaultAvatar";

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

// 사진이 없거나 불러오지 못하면 기본 바다 그림으로 대신한다 (마이페이지·헤더와 같은 그림).
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
  return <DefaultAvatar seed={name} size={size} className="border border-white shadow-base" />;
}

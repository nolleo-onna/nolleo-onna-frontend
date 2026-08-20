import Image from "next/image";

interface AuthorAvatarProps {
  name: string;
  /** 지금 로그인한 유저 본인 글일 때만 실제 프로필 사진을 보여준다 */
  imageUrl?: string;
  size?: number;
}

// 마이페이지 프로필 히어로와 같은 폴백 스타일(라임 원 + 첫 글자)을 재사용해
// 게시판·댓글에서도 톤을 맞춘다.
export default function AuthorAvatar({ name, imageUrl, size = 32 }: AuthorAvatarProps) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
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

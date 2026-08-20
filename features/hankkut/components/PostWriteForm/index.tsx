"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, X } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useCustomNickname } from "@/features/mypage/hooks/useCustomNickname";
import { useHankkutPosts } from "@/features/hankkut/hooks/useHankkutPosts";
import { maskName } from "@/features/hankkut/utils/maskName";
import { getGalleryBySlug } from "@/features/hankkut/data/galleries";

interface PostWriteFormProps {
  /** 새 글 작성 — 어느 갤러리에 올릴지 */
  regionSlug?: string;
  /** 있으면 수정 모드 — 해당 글을 불러와 채운 뒤 수정으로 제출한다 */
  postId?: string;
}

const TITLE_MAX = 60;
const CONTENT_MAX = 2000;
/** localStorage 용량(≈5MB) 보호 — 긴 변 기준 리사이즈 후 JPEG 저장 */
const IMAGE_MAX_EDGE = 800;

function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, IMAGE_MAX_EDGE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("load"));
    };
    img.src = url;
  });
}

export default function PostWriteForm({ regionSlug, postId }: PostWriteFormProps) {
  const router = useRouter();
  const { user, isLoading, isLoggedIn } = useAuth();
  const { customNickname } = useCustomNickname(user?.userId);
  const { posts, createPost, updatePost } = useHankkutPosts();

  const editingPost = postId ? posts.find((p) => p.id === postId) : undefined;
  const isEditMode = Boolean(postId);
  const effectiveRegionSlug = editingPost?.regionSlug ?? regionSlug;
  const gallery = effectiveRegionSlug ? getGalleryBySlug(effectiveRegionSlug) : undefined;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 수정 모드: 글 로드가 끝나면 기존 값으로 한 번 채운다
  const filledRef = useRef(false);
  useEffect(() => {
    if (!isEditMode || filledRef.current || !editingPost) return;
    filledRef.current = true;
    setTitle(editingPost.title);
    setContent(editingPost.content);
    setImageDataUrl(editingPost.imageDataUrl);
  }, [isEditMode, editingPost]);

  if (isLoading || (isEditMode && posts.length === 0)) {
    return <div className="animate-shimmer h-80 rounded-[28px]" />;
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[28px] border border-gray-100 bg-white px-6 py-16 text-center">
        <p className="text-lg font-bold text-navy-900">로그인하고 글을 남겨보세요</p>
        <p className="text-sm text-gray-500">
          이 지역의 꿀팁과 후기를 다른 여행자들과 나눌 수 있어요
        </p>
        <Link
          href="/login"
          className="rounded-full bg-ocean-500 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-ocean-600 active:scale-95"
        >
          로그인하러 가기
        </Link>
      </div>
    );
  }

  if (isEditMode && !editingPost) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[28px] border border-gray-100 bg-white px-6 py-16 text-center">
        <p className="text-[15px] font-semibold text-gray-700">글을 찾을 수 없어요</p>
      </div>
    );
  }

  if (isEditMode && editingPost && editingPost.authorId !== user.userId) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[28px] border border-gray-100 bg-white px-6 py-16 text-center">
        <p className="text-[15px] font-semibold text-gray-700">본인 글만 수정할 수 있어요</p>
      </div>
    );
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setImageDataUrl(await resizeToDataUrl(file));
      setError(null);
    } catch {
      setError("이미지를 불러오지 못했어요. 다른 파일로 시도해주세요.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (isEditMode && editingPost) {
      const updated = updatePost(editingPost.id, {
        title: trimmedTitle,
        content: trimmedContent,
        imageDataUrl,
      });
      if (!updated) {
        setError("저장 공간이 가득 찼어요. 이미지를 빼고 다시 시도해주세요.");
        return;
      }
      router.push(`/hankkut/post/${updated.id}`);
      return;
    }

    if (!effectiveRegionSlug) return; // regionSlug 없이 새 글 작성은 호출부 버그
    const post = createPost({
      regionSlug: effectiveRegionSlug,
      title: trimmedTitle,
      content: trimmedContent,
      imageDataUrl,
      author: customNickname ?? maskName(user.nickname),
      authorId: user.userId,
    });
    if (!post) {
      setError("저장 공간이 가득 찼어요. 이미지를 빼거나 오래된 글을 지운 뒤 다시 시도해주세요.");
      return;
    }
    router.push(`/hankkut/post/${post.id}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-[28px] border border-gray-100 bg-white p-6 md:p-8"
    >
      <button
        type="button"
        onClick={() => router.back()}
        className="flex w-fit items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        돌아가기
      </button>

      {gallery && (
        <div>
          <p className="text-xs font-semibold tracking-widest text-ocean-600 uppercase">
            Community
          </p>
          <h1 className="mt-1 text-2xl font-bold text-navy-900">
            {gallery.emoji} {gallery.name} 한끗에 {isEditMode ? "글 수정" : "글쓰기"}
          </h1>
        </div>
      )}

      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX}
          placeholder="제목을 입력해주세요"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] font-semibold text-gray-900 outline-none transition-colors placeholder:font-normal placeholder:text-gray-400 focus:border-ocean-400 focus:bg-white"
        />
        <p className="mt-1 text-right text-[11px] tabular-nums text-gray-400">
          {title.length}/{TITLE_MAX}
        </p>
      </div>

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={CONTENT_MAX}
          rows={10}
          placeholder="이 지역에서 발견한 꿀팁, 후기, 질문을 자유롭게 적어주세요"
          className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-ocean-400 focus:bg-white"
        />
        <p className="mt-1 text-right text-[11px] tabular-nums text-gray-400">
          {content.length}/{CONTENT_MAX}
        </p>
      </div>

      {/* 이미지 첨부 */}
      {imageDataUrl ? (
        <div className="relative w-fit">
          {/* dataURL 미리보기라 next/image 최적화 대상이 아님 */}
          <Image
            src={imageDataUrl}
            alt="첨부 이미지 미리보기"
            width={160}
            height={120}
            unoptimized
            className="h-28 w-auto rounded-xl border border-gray-100 object-cover"
          />
          <button
            type="button"
            onClick={() => setImageDataUrl(undefined)}
            aria-label="이미지 제거"
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/80 text-white transition-colors hover:bg-gray-900"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-fit items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-xs font-medium text-gray-500 transition-colors hover:border-ocean-300 hover:text-ocean-600"
        >
          <ImagePlus className="h-4 w-4" />
          사진 추가 (선택)
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-500">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-gray-50 pt-4">
        <p className="text-[11px] text-gray-400">
          {customNickname ?? maskName(user.nickname)} 이름으로 게시돼요 · 이 브라우저에
          저장됩니다
        </p>
        <button
          type="submit"
          className="rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-lime-300 transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          {isEditMode ? "수정 완료" : "게시하기"}
        </button>
      </div>
    </form>
  );
}

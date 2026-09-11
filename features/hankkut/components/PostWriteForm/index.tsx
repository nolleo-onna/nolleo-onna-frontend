"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, X } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { getGalleryByDistrict, getGalleryBySlug } from "@/features/hankkut/data/galleries";
import { POST_CATEGORY_LABELS } from "@/features/hankkut/constants/postTags";
import { useCreatePost, usePost, useUpdatePost } from "@/features/hankkut/hooks/usePosts";
import { maskName } from "@/features/hankkut/utils/maskName";
import { PostApiError, uploadImages } from "@/libs/api/posts";
import {
  POST_CATEGORY_MAX,
  POST_CATEGORY_TAGS,
  POST_IMAGE_MAX,
  POST_IMAGE_MAX_BYTES,
} from "@/types/post";

import type { HankkutGallery } from "@/features/hankkut/data/galleries";
import type { PostCategoryTag, PostDetail } from "@/types/post";

interface PostWriteFormProps {
  /** 새 글 작성 — 어느 갤러리에 올릴지 */
  regionSlug?: string;
  /** 있으면 수정 모드 — 해당 글을 불러와 채운 뒤 수정으로 제출한다 */
  postId?: string;
}

const TITLE_MAX = 60;
const CONTENT_MAX = 2000;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function Notice({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[28px] border border-gray-100 bg-white px-6 py-16 text-center">
      <p className="text-[15px] font-semibold text-gray-700">{title}</p>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
}

interface PostEditorProps {
  gallery: HankkutGallery | undefined;
  /** 수정 모드면 기존 글 */
  post?: PostDetail;
  authorName: string;
}

function PostEditor({ gallery, post, authorName }: PostEditorProps) {
  const router = useRouter();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost(post?.id ?? 0);

  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [tags, setTags] = useState<PostCategoryTag[]>(post?.categoryTags ?? []);
  const [existingUrls, setExistingUrls] = useState<string[]>(post?.imageUrls ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 새로 고른 파일의 미리보기 URL — 파일 목록이 바뀔 때만 다시 만들고 이전 것은 해제한다
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const imageCount = existingUrls.length + files.length;

  const toggleTag = (tag: PostCategoryTag) => {
    setError(null);
    setTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= POST_CATEGORY_MAX) return prev;
      return [...prev, tag];
    });
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length === 0) return;

    const rejected = picked.find(
      (f) => !ACCEPTED_TYPES.includes(f.type) || f.size > POST_IMAGE_MAX_BYTES,
    );
    if (rejected) {
      setError("jpg·png·webp 이미지를 10MB 이하로 올려주세요.");
      return;
    }
    if (imageCount + picked.length > POST_IMAGE_MAX) {
      setError(`사진은 최대 ${POST_IMAGE_MAX}장까지 올릴 수 있어요.`);
      return;
    }
    setError(null);
    setFiles((prev) => [...prev, ...picked]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }
    if (tags.length === 0) {
      setError("태그를 하나 이상 골라주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // 사진은 먼저 올려 URL을 받은 뒤 글에 담는다
      const uploaded = files.length > 0 ? await uploadImages(files) : [];
      const body = {
        title: trimmedTitle,
        content: trimmedContent,
        categoryTags: tags,
        districtTag: gallery?.districtTag,
        imageUrls: [...existingUrls, ...uploaded],
      };
      const saved = post
        ? await updatePost.mutateAsync(body)
        : await createPost.mutateAsync(body);
      router.push(`/hankkut/post/${saved.id}`);
    } catch (err) {
      const message =
        err instanceof PostApiError
          ? (Object.values(err.fieldErrors)[0] ?? err.message)
          : "글을 저장하지 못했어요. 잠시 후 다시 시도해주세요.";
      setError(message);
      setIsSubmitting(false);
    }
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
            {gallery.emoji} {gallery.name} 한끗에 {post ? "글 수정" : "글쓰기"}
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

      {/* 태그 — 서버가 1개 이상을 요구한다 */}
      <div>
        <p className="mb-2 text-xs font-semibold text-gray-600">
          태그 <span className="font-normal text-gray-400">(1~{POST_CATEGORY_MAX}개)</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {POST_CATEGORY_TAGS.map((tag) => {
            const selected = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={selected}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selected
                    ? "border-navy-900 bg-navy-900 text-lime-300"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {POST_CATEGORY_LABELS[tag]}
              </button>
            );
          })}
        </div>
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

      {/* 사진 — 기존 URL + 새 파일 미리보기 */}
      <div className="flex flex-wrap items-center gap-3">
        {existingUrls.map((url) => (
          <div key={url} className="relative">
            <Image
              src={url}
              alt="첨부 이미지"
              width={160}
              height={120}
              className="h-24 w-auto rounded-xl border border-gray-100 object-cover"
            />
            <button
              type="button"
              onClick={() => setExistingUrls((prev) => prev.filter((u) => u !== url))}
              aria-label="이미지 제거"
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/80 text-white transition-colors hover:bg-gray-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {previews.map((url, i) => (
          <div key={url} className="relative">
            <Image
              src={url}
              alt="첨부 이미지 미리보기"
              width={160}
              height={120}
              unoptimized
              className="h-24 w-auto rounded-xl border border-gray-100 object-cover"
            />
            <button
              type="button"
              onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
              aria-label="이미지 제거"
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/80 text-white transition-colors hover:bg-gray-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {imageCount < POST_IMAGE_MAX && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-xs font-medium text-gray-500 transition-colors hover:border-ocean-300 hover:text-ocean-600"
          >
            <ImagePlus className="h-4 w-4" />
            사진 추가 ({imageCount}/{POST_IMAGE_MAX})
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        onChange={handleFilesChange}
        className="hidden"
      />

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-500">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-gray-50 pt-4">
        <p className="text-[11px] text-gray-400">{authorName} 이름으로 게시돼요</p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-lime-300 transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isSubmitting ? "저장 중..." : post ? "수정 완료" : "게시하기"}
        </button>
      </div>
    </form>
  );
}

// 로그인·글 로드·권한 확인만 하고, 입력 상태는 PostEditor가 초기값으로 받는다
export default function PostWriteForm({ regionSlug, postId }: PostWriteFormProps) {
  const { user, isLoading, isLoggedIn } = useAuth();
  const numericId = postId && /^\d+$/.test(postId) ? Number(postId) : null;
  const isEditMode = Boolean(postId);
  const { data: editingPost, isPending: isPostPending, isError } = usePost(numericId);

  if (isLoading || (isEditMode && numericId !== null && isPostPending)) {
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

  if (isEditMode && (numericId === null || isError || !editingPost)) {
    return <Notice title="글을 찾을 수 없어요" />;
  }

  if (editingPost && editingPost.author.nickname !== user.nickname) {
    return <Notice title="본인 글만 수정할 수 있어요" />;
  }

  const gallery = editingPost
    ? (getGalleryByDistrict(editingPost.districtTag) ??
      (regionSlug ? getGalleryBySlug(regionSlug) : undefined))
    : regionSlug
      ? getGalleryBySlug(regionSlug)
      : undefined;

  return (
    <PostEditor
      key={editingPost?.id ?? "new"}
      gallery={gallery}
      post={editingPost}
      authorName={maskName(user.nickname)}
    />
  );
}

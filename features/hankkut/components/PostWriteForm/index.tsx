"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ImagePlus, Lightbulb, X } from "lucide-react";
import { MotionConfig, motion } from "motion/react";

import { useAuth } from "@/hooks/useAuth";
import GalleryFallbackArt from "@/features/hankkut/components/GalleryFallbackArt";
import {
  getGalleryByDistrict,
  getGalleryBySlug,
  getGallerySummary,
} from "@/features/hankkut/data/galleries";
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
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const WRITING_TIPS = [
  "언제, 어디서 겪은 일인지 먼저 적어요",
  "가격 · 영업시간 · 대기 시간처럼 숫자를 넣으면 더 믿음이 가요",
  "사진 한 장이 긴 설명보다 많은 걸 알려줘요",
];

function Notice({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 rounded-[28px] border border-gray-100 bg-white px-6 py-16 text-center">
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
  const [isDragging, setIsDragging] = useState(false);
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

  // 파일 선택 · 끌어다 놓기가 같은 검사를 거친다
  const addFiles = (picked: File[]) => {
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

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    addFiles(picked);
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

  const cover = gallery ? getGallerySummary(gallery.slug).coverImage : undefined;
  const checklist: { label: string; done: boolean }[] = [
    { label: "제목", done: title.trim().length > 0 },
    { label: "태그", done: tags.length > 0 },
    { label: "내용", done: content.trim().length > 0 },
  ];
  const photos = [
    ...existingUrls.map((url) => ({
      key: url,
      url,
      isLocal: false,
      remove: () => setExistingUrls((prev) => prev.filter((u) => u !== url)),
    })),
    ...previews.map((url, i) => ({
      key: url,
      url,
      isLocal: true,
      remove: () => setFiles((prev) => prev.filter((_, j) => j !== i)),
    })),
  ];

  return (
    <MotionConfig reducedMotion="user">
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
          className="rounded-[28px] bg-white ring-1 ring-gray-100"
        >
          {/* 동네 표지 — 어느 동네 게시판에 쓰는지 사진으로 먼저 보여준다 */}
          <div className="relative h-32 overflow-hidden rounded-t-[28px] bg-navy-800 md:h-36">
            {cover ? (
              <Image src={cover} alt="" fill priority quality={80} sizes="(max-width: 1024px) 100vw, 780px" className="object-cover" />
            ) : (
              gallery && <GalleryFallbackArt name={gallery.name} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/40 to-navy-900/10" />
            <button
              type="button"
              onClick={() => router.back()}
              className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/45"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              돌아가기
            </button>
            <div className="absolute inset-x-5 bottom-4 md:inset-x-7">
              {gallery && (
                <span className="inline-flex rounded-full bg-lime-300 px-2.5 py-0.5 text-[11px] font-bold text-navy-900">
                  {gallery.name} 한끗
                </span>
              )}
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white">
                {post ? "글 수정하기" : "동네 이야기 남기기"}
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-7 p-5 md:p-7">
            {/* 제목 — 입력칸 테두리 대신 밑줄 하나 */}
            <div>
              <label htmlFor="post-title" className="sr-only">
                제목
              </label>
              <input
                id="post-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={TITLE_MAX}
                placeholder="제목을 적어주세요"
                className="w-full border-0 border-b-2 border-gray-100 bg-transparent px-0 pb-3 text-[22px] font-bold tracking-tight text-navy-900 outline-none transition-colors placeholder:text-gray-300 focus:border-navy-900 md:text-[26px]"
              />
              <p className="mt-1.5 text-right text-[11px] tabular-nums text-gray-400">
                {title.length}/{TITLE_MAX}
              </p>
            </div>

            {/* 태그 — 서버가 1개 이상을 요구한다 */}
            <section>
              <div className="mb-2.5 flex items-baseline justify-between gap-2">
                <p className="text-sm font-bold text-navy-900">어떤 이야기인가요?</p>
                <span className="text-[11px] tabular-nums text-gray-400">
                  {tags.length}/{POST_CATEGORY_MAX} · 하나 이상 골라주세요
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POST_CATEGORY_TAGS.map((tag) => {
                  const selected = tags.includes(tag);
                  return (
                    <motion.button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      aria-pressed={selected}
                      whileTap={{ scale: 0.94 }}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        selected
                          ? "bg-navy-900 text-lime-300"
                          : "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-white hover:ring-gray-300"
                      }`}
                    >
                      {selected && <Check className="h-3 w-3" />}
                      {POST_CATEGORY_LABELS[tag]}
                    </motion.button>
                  );
                })}
              </div>
            </section>

            {/* 내용 */}
            <section>
              <label htmlFor="post-content" className="mb-2.5 block text-sm font-bold text-navy-900">
                내용
              </label>
              <textarea
                id="post-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={CONTENT_MAX}
                rows={10}
                placeholder={"언제, 어디서, 무엇이 좋았는지 적어주세요.\n가격이나 시간 같은 숫자가 있으면 더 도움이 돼요."}
                className="w-full resize-y rounded-2xl bg-gray-50 px-4 py-3.5 text-[15px] leading-relaxed text-gray-900 outline-none ring-1 ring-inset ring-gray-100 transition placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-navy-900/80"
              />
              <p className="mt-1.5 text-right text-[11px] tabular-nums text-gray-400">
                {content.length}/{CONTENT_MAX}
              </p>
            </section>

            {/* 사진 — 첫 장이 대표, 끌어다 놓기 지원 */}
            <section>
              <div className="mb-2.5 flex items-baseline justify-between gap-2">
                <p className="text-sm font-bold text-navy-900">사진</p>
                <span className="text-[11px] tabular-nums text-gray-400">
                  {imageCount}/{POST_IMAGE_MAX} · 첫 장이 대표 사진이에요
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                {photos.map((photo, i) => (
                  <div key={photo.key} className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-100">
                    <Image
                      src={photo.url}
                      alt="첨부 이미지"
                      fill
                      sizes="160px"
                      unoptimized={photo.isLocal}
                      className="object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-navy-900/85 px-2 py-0.5 text-[10px] font-bold text-lime-300">
                        대표
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={photo.remove}
                      aria-label="이미지 제거"
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {imageCount < POST_IMAGE_MAX && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      addFiles(Array.from(e.dataTransfer.files));
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed text-[11px] font-semibold transition-colors ${
                      isDragging
                        ? "border-ocean-400 bg-ocean-50 text-ocean-600"
                        : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
                    } ${imageCount === 0 ? "col-span-3 py-9 sm:col-span-5" : "aspect-square"}`}
                  >
                    <ImagePlus className="h-5 w-5" />
                    {imageCount === 0 ? "사진을 끌어다 놓거나 눌러서 추가하세요" : "추가"}
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
            </section>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-500">
                {error}
              </p>
            )}
          </div>

          {/* 하단 바 — 스크롤해도 따라오며 무엇이 남았는지 보여준다 */}
          <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 rounded-b-[28px] border-t border-gray-100 bg-white/90 px-5 py-4 backdrop-blur md:px-7">
            <ul aria-label="작성 체크리스트" className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
              {checklist.map(({ label, done }) => (
                <li
                  key={label}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
                    done ? "bg-lime-100 text-lime-700" : "bg-gray-50 text-gray-400"
                  }`}
                >
                  {done ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />}
                  {label}
                </li>
              ))}
            </ul>
            <p className="ml-auto hidden text-[11px] text-gray-400 sm:block">{authorName} 이름으로 게시돼요</p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-auto rounded-full bg-navy-900 px-6 py-2.5 text-sm font-bold text-lime-300 transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 sm:ml-0"
            >
              {isSubmitting ? "저장 중..." : post ? "수정 완료" : "게시하기"}
            </button>
          </div>
        </motion.div>

        {/* 미리보기 · 쓰는 법 */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <div className="rounded-[24px] bg-white p-4 ring-1 ring-gray-100">
            <p className="mb-3 text-xs font-bold text-gray-500">핫이슈에 오르면 이렇게 보여요</p>
            <div className="relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-[18px] bg-gradient-to-br from-navy-900 to-ocean-600 p-4">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-1 -top-8 select-none text-[120px] font-bold leading-none text-white/10"
              >
                &rdquo;
              </span>
              <div className="relative flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold text-white">by {authorName}</span>
                {tags[0] && (
                  <span className="rounded-full bg-lime-300 px-2 py-0.5 text-[11px] font-bold text-navy-900">
                    {POST_CATEGORY_LABELS[tags[0]]}
                  </span>
                )}
              </div>
              <p className={`relative line-clamp-3 text-base font-bold leading-snug break-keep ${title.trim() ? "text-white" : "text-white/40"}`}>
                {title.trim() || "제목이 여기에 보여요"}
              </p>
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-5 ring-1 ring-gray-100">
            <p className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
              <Lightbulb className="h-4 w-4 text-lime-600" />
              좋은 한끗 글 쓰는 법
            </p>
            <ol className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-gray-600">
              {WRITING_TIPS.map((tip, i) => (
                <li key={tip} className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-900 text-[10px] font-bold text-lime-300">
                    {i + 1}
                  </span>
                  <span className="break-keep">{tip}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </form>
    </MotionConfig>
  );
}

// 로그인·글 로드·권한 확인만 하고, 입력 상태는 PostEditor가 초기값으로 받는다
export default function PostWriteForm({ regionSlug, postId }: PostWriteFormProps) {
  const { user, isLoading, isLoggedIn } = useAuth();
  const numericId = postId && /^\d+$/.test(postId) ? Number(postId) : null;
  const isEditMode = Boolean(postId);
  const { data: editingPost, isPending: isPostPending, isError } = usePost(numericId);

  if (isLoading || (isEditMode && numericId !== null && isPostPending)) {
    return <div className="animate-shimmer mx-auto h-80 w-full max-w-2xl rounded-[28px]" />;
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 rounded-[28px] border border-gray-100 bg-white px-6 py-16 text-center">
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

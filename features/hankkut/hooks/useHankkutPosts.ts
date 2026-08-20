"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { HANKKUT_SEED_POSTS } from "@/features/hankkut/data/seedPosts";

/**
 * 지역 갤러리 자유게시판 글 저장소.
 * 백엔드에 게시글 API가 아직 없어(Swagger 확인) localStorage에만 저장하는
 * 프론트 MVP다 — 이 파일의 저장/조회 함수만 서버 호출로 교체하면 화면
 * 코드는 그대로 쓸 수 있게 CRUD를 여기로 격리한다.
 * id는 uuid 문자열이라 목데이터 한끗(id: number)과 절대 섞이지 않는다.
 */
export interface HankkutPost {
  id: string;
  regionSlug: string;
  title: string;
  content: string;
  /** 캔버스 리사이즈를 거친 dataURL (용량 절약). 없으면 텍스트 글 */
  imageDataUrl?: string;
  author: string;
  authorId: number;
  createdAt: string; // ISO
  views: number;
}

const STORAGE_KEY = "hankkut:posts";

function readPosts(): HankkutPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // 진짜 첫 방문(키 자체가 없음)일 때만 데모 시드를 채운다. 사용자가 글을
    // 전부 지워 배열이 []가 된 경우(raw === "[]")는 재시딩하지 않는다.
    if (raw === null) {
      writePosts(HANKKUT_SEED_POSTS);
      return HANKKUT_SEED_POSTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePosts(posts: HankkutPost[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return true;
  } catch {
    // 용량 초과(QuotaExceededError) 등 — 호출부에서 사용자에게 안내
    return false;
  }
}

const postsKey = ["hankkutPosts"] as const;

export function useHankkutPosts() {
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery<HankkutPost[]>({
    queryKey: postsKey,
    queryFn: readPosts,
    staleTime: Infinity,
  });

  const refresh = useCallback(
    (next: HankkutPost[]) => {
      queryClient.setQueryData(postsKey, next);
    },
    [queryClient],
  );

  /** 성공 시 만들어진 글을, 저장 실패(용량 초과 등) 시 null을 반환 */
  const createPost = useCallback(
    (input: Omit<HankkutPost, "id" | "createdAt" | "views">): HankkutPost | null => {
      const post: HankkutPost = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        views: 0,
      };
      const next = [post, ...readPosts()];
      if (!writePosts(next)) return null;
      refresh(next);
      return post;
    },
    [refresh],
  );

  const removePost = useCallback(
    (id: string) => {
      const next = readPosts().filter((p) => p.id !== id);
      writePosts(next);
      refresh(next);
    },
    [refresh],
  );

  /** 상세 진입 시 조회수 +1 (같은 마운트에서 중복 호출은 호출부 ref로 방지) */
  const incrementViews = useCallback(
    (id: string) => {
      const next = readPosts().map((p) =>
        p.id === id ? { ...p, views: p.views + 1 } : p,
      );
      writePosts(next);
      refresh(next);
    },
    [refresh],
  );

  return { posts, createPost, removePost, incrementViews };
}

/** 특정 갤러리의 글 목록 (최신순) */
export function selectRegionPosts(posts: HankkutPost[], regionSlug: string): HankkutPost[] {
  return posts
    .filter((p) => p.regionSlug === regionSlug)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

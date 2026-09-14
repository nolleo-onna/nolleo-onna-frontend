"use client";

import { useState } from "react";

import { buildCourseShareUrl, shareCourseUrl } from "@/features/course/utils/shareLink";

import type { CourseShareInfo } from "@/types/course";

/** idle → (비공개 코스면) confirming → publishing → copied → idle */
export type LinkShareStatus = "idle" | "confirming" | "publishing" | "copied";

interface UseCourseLinkShareOptions {
  title: string;
  /** 서버 코스의 공개 상태. 없으면(목업 코스) 현재 주소를 그대로 공유한다 */
  share?: CourseShareInfo;
  /** 코스를 공개로 바꾸고 발급된 토큰을 돌려준다. 실패하면 null */
  onPublish?: () => Promise<string | null>;
}

/**
 * 코스 "링크 공유" 흐름.
 *
 * 지금 백엔드는 공유 링크 열람(GET /courses/shared/{token})과 홈 공개 목록(GET /courses/popular)이
 * 같은 isPublic 하나로 묶여 있어서, 비공개 코스의 링크를 만들면 홈 인기 코스에도 올라간다.
 * 예전엔 공유 버튼이 이걸 말없이 공개로 바꿨는데, 이제는 한 번 확인(confirming)을 받은 뒤에만 공개한다.
 * 백엔드가 링크 공유와 홈 공개를 나누면 확인 단계를 빼고 링크 전용 API를 부르도록 바꾸면 된다.
 */
export function useCourseLinkShare({ title, share, onPublish }: UseCourseLinkShareOptions) {
  const [status, setStatus] = useState<LinkShareStatus>("idle");

  const deliver = async (url: string) => {
    if (await shareCourseUrl(title, url)) {
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    } else {
      setStatus("idle");
    }
  };

  const start = async () => {
    if (!share || !onPublish) {
      await deliver(window.location.href);
      return;
    }
    if (share.isPublic && share.shareToken) {
      await deliver(buildCourseShareUrl(share.shareToken));
      return;
    }
    setStatus("confirming");
  };

  const confirm = async () => {
    if (!onPublish) return;
    setStatus("publishing");
    const token = await onPublish();
    if (!token) {
      setStatus("idle");
      return;
    }
    await deliver(buildCourseShareUrl(token));
  };

  const cancel = () => setStatus("idle");

  return { status, start, confirm, cancel };
}

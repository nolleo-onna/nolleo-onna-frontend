"use client";

import { useState } from "react";

import { buildCourseShareText } from "@/features/course/utils/courseShareText";
import { buildCourseShareUrl, shareCourseContent } from "@/features/course/utils/shareLink";

import type { CoursePlace } from "@/features/course/data/mockCourse";
import type { CourseShareInfo } from "@/types/course";

interface UseCourseShareOptions {
  title: string;
  description?: string;
  places: CoursePlace[];
  /** 서버 코스의 공개 상태. 없으면(목업 코스) 지금 페이지 주소를 링크로 붙인다 */
  share?: CourseShareInfo;
}

/**
 * 코스 "공유" — 링크 대신 코스 내용(제목·장소 순서·비용·카카오맵 링크)을 글로 보낸다.
 * 코스를 공개로 바꾸지 않으므로 홈 인기 코스에 올라가지 않는다. 이미 홈에 올라간 코스면
 * 누구나 열 수 있는 사이트 링크도 글 끝에 붙인다. (공개 링크 페이지는 백엔드가 공개 코스만 열어 준다)
 */
export function useCourseShare({ title, description, places, share }: UseCourseShareOptions) {
  const [copied, setCopied] = useState(false);

  const shareCourse = async () => {
    const siteUrl = share
      ? share.isPublic && share.shareToken
        ? buildCourseShareUrl(share.shareToken)
        : null
      : window.location.href;
    const text = buildCourseShareText({ title, description, places, siteUrl });
    if (await shareCourseContent(title, text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return { copied, shareCourse };
}

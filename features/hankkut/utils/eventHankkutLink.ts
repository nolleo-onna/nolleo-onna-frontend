import { POST_DISTRICT_LABELS } from "@/features/hankkut/constants/postTags";
import { getGalleryByDistrict } from "@/features/hankkut/data/galleries";
import { getHankkutDetail } from "@/features/hankkut/data/hankkutDetail";
import { MOCK_HANKKUT_LIST } from "@/features/hankkut/data/mockHankkut";
import { extractDistrictName } from "@/features/hankkut/utils/regionEvents";

import type { BusanEvent } from "@/types/event";
import type { PostDistrictTag } from "@/types/post";

/** "해운대구" → "HAEUNDAE_GU" — 행사 주소의 구 이름을 한끗 게시판의 districtTag로 되돌린다 */
const DISTRICT_TAG_BY_LABEL = Object.fromEntries(
  Object.entries(POST_DISTRICT_LABELS).map(([tag, label]) => [label, tag]),
) as Record<string, PostDistrictTag>;

/**
 * 행사 포스터를 눌렀을 때 갈 한끗 페이지.
 * 1. 그 행사를 직접 다룬 한끗 글이 있으면 그 글
 * 2. 없으면 행사가 열리는 구의 한끗 동네 페이지 — 핫이슈에 이 행사가 함께 뜬다
 * 3. 한끗에 그 구 동네가 없으면(금정구 등) 행사 상세
 * 한끗 글은 일부 행사만 다루고 있어서, 1번만 보면 대부분의 포스터가 한끗으로 이어지지 않는다.
 */
export function getEventHankkutHref(event: Pick<BusanEvent, "contentId" | "addr1">): string {
  const article = MOCK_HANKKUT_LIST.find(
    (item) => getHankkutDetail(item.id)?.eventContentId === event.contentId,
  );
  if (article) return `/hankkut/${article.id}`;

  const district = extractDistrictName(event.addr1);
  const gallery = district ? getGalleryByDistrict(DISTRICT_TAG_BY_LABEL[district]) : undefined;
  if (gallery) return `/hankkut/region/${gallery.slug}`;

  return `/event/${encodeURIComponent(event.contentId)}`;
}

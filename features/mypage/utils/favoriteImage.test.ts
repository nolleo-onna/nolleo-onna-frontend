import { describe, expect, it } from "vitest";

import { findFavoriteImage } from "./favoriteImage";

const place = (id: number, name: string, imageUrl: string | null) => ({ id, name, imageUrl });

describe("findFavoriteImage", () => {
  it("같은 mapPlaceId의 사진을 먼저 고른다", () => {
    const places = [place(1, "뮤지엄 원", "https://a/1.jpg"), place(3122, "뮤지엄 원", "https://a/3122.jpg")];
    expect(findFavoriteImage(places, { mapPlaceId: 3122, name: "뮤지엄 원" })).toBe("https://a/3122.jpg");
  });

  it("id가 없으면 이름이 같은 장소로 대신한다", () => {
    const places = [place(9, "흰여울문화마을 ", "https://a/9.jpg")];
    expect(findFavoriteImage(places, { mapPlaceId: 1, name: "흰여울문화마을" })).toBe("https://a/9.jpg");
  });

  it("http 사진은 https로 바꾸고, 못 찾거나 사진이 없으면 null", () => {
    expect(
      findFavoriteImage([place(5, "청와정", "http://tong.visitkorea.or.kr/x.jpg")], { mapPlaceId: 5, name: "청와정" }),
    ).toBe("https://tong.visitkorea.or.kr/x.jpg");
    expect(findFavoriteImage([place(5, "청와정", null)], { mapPlaceId: 5, name: "청와정" })).toBeNull();
    expect(findFavoriteImage([], { mapPlaceId: 5, name: "청와정" })).toBeNull();
    expect(findFavoriteImage(undefined, { mapPlaceId: 5, name: "청와정" })).toBeNull();
  });
});

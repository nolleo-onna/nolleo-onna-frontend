import { describe, expect, it } from "vitest";

import { getKakaoMapDirectionsUrl, getKakaoMapPlaceUrl, toKakaoLinkName } from "./kakaoMapLink";

describe("toKakaoLinkName", () => {
  it("카카오가 404로 보내는 슬래시·역슬래시와 구분자 쉼표를 공백으로 바꾼다", () => {
    expect(toKakaoLinkName("광안리 해수욕장 / 벡스코")).toBe("광안리 해수욕장 벡스코");
    expect(toKakaoLinkName("벡스코 제2전시장 4C, 4D홀")).toBe("벡스코 제2전시장 4C 4D홀");
    expect(toKakaoLinkName("역\\광장")).toBe("역 광장");
  });
});

describe("getKakaoMapDirectionsUrl", () => {
  it("정리한 이름을 인코딩해 길찾기 링크를 만든다", () => {
    expect(getKakaoMapDirectionsUrl("부산 금정구 온천천 / 부산대학로 일원", 35.23, 129.08)).toBe(
      `https://map.kakao.com/link/to/${encodeURIComponent("부산 금정구 온천천 부산대학로 일원")},35.23,129.08`,
    );
  });

  it("링크 경로에 인코딩된 슬래시(%2F)가 남지 않는다", () => {
    expect(getKakaoMapDirectionsUrl("동서대학교 센텀캠퍼스 / 해운대 문화회관 등", 35.17, 129.13)).not.toContain("%2F");
  });
});

describe("getKakaoMapPlaceUrl", () => {
  it("한글은 그대로 두고 공백·특수문자는 인코딩한다", () => {
    expect(getKakaoMapPlaceUrl("광안리 해수욕장", 35.15, 129.11)).toBe(
      "https://map.kakao.com/link/map/광안리%20해수욕장,35.15,129.11",
    );
    expect(getKakaoMapPlaceUrl("해변#공연 / 무대", 35.15, 129.11)).toBe(
      "https://map.kakao.com/link/map/해변%23공연%20무대,35.15,129.11",
    );
  });
});

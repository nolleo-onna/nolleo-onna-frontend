import { describe, expect, it } from "vitest";

import { toBackdropPhoto, toLargeTourImage } from "./tourImage";

describe("toLargeTourImage", () => {
  it("관광공사 사진을 큰 원본 주소로 바꾸고 https로 맞춘다", () => {
    expect(toLargeTourImage("http://tong.visitkorea.or.kr/cms/resource/11/3413711_image2_1.jpg")).toBe(
      "https://tong.visitkorea.or.kr/cms/resource/11/3413711_image1_1.jpg",
    );
    expect(toLargeTourImage("https://tong.visitkorea.or.kr/cms/resource/60/3008060_image2_1.JPG")).toBe(
      "https://tong.visitkorea.or.kr/cms/resource/60/3008060_image1_1.JPG",
    );
  });

  it("관광공사 사진이 아니거나 이미 다른 크기면 null", () => {
    expect(toLargeTourImage("https://storage.googleapis.com/nolleo-onna-images/a.jpg")).toBeNull();
    expect(toLargeTourImage("https://tong.visitkorea.or.kr/cms/resource/11/3413711_image3_1.jpg")).toBeNull();
  });
});

describe("toBackdropPhoto", () => {
  it("큰 원본을 쓰고 원래 사진을 대체 주소로 둔다", () => {
    expect(toBackdropPhoto("http://tong.visitkorea.or.kr/cms/resource/22/3495922_image2_1.jpg", "바다")).toEqual({
      src: "https://tong.visitkorea.or.kr/cms/resource/22/3495922_image1_1.jpg",
      fallbackSrc: "https://tong.visitkorea.or.kr/cms/resource/22/3495922_image2_1.jpg",
      label: "바다",
    });
  });

  it("관광공사 사진이 아니면 그대로(https로만) 쓴다", () => {
    expect(toBackdropPhoto("https://storage.googleapis.com/nolleo-onna-images/a.jpg")).toEqual({
      src: "https://storage.googleapis.com/nolleo-onna-images/a.jpg",
      label: undefined,
    });
  });
});

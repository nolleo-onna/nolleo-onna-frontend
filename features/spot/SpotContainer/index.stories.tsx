import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { mapPlaceKeys, MAP_PLACES_PAGE_SIZE } from "@/features/spot/hooks/useMapPlaces";
import { spotKeys } from "@/features/spot/hooks/useSpotMarkers";
import SpotContainer from "./index";

import type { MapPlace } from "@/types/map";
import type { MapMarker } from "@/types/spot";

/*
 * 스토리북엔 카카오 지도 키·도메인이 없어서 지도가 안 뜬다.
 * 목록 클릭 → 지도 이동 → 마커 "딸랑" 흐름을 볼 수 있게, SpotMap이 쓰는 카카오 API만 흉내 낸 가짜 지도를 깐다.
 * 좌표 → 화면 위치는 대충의 선형 변환이라 실제 축척과는 다르다.
 */
type Listener = () => void;
type Listenable = { __listeners?: Record<string, Listener[]> };

function emit(target: Listenable, type: string) {
  target.__listeners?.[type]?.forEach((fn) => fn());
}

class FakeLatLng {
  constructor(
    public lat: number,
    public lng: number,
  ) {}
  getLat() {
    return this.lat;
  }
  getLng() {
    return this.lng;
  }
}

class FakeMap implements Listenable {
  __listeners?: Record<string, Listener[]>;
  overlays = new Set<FakeOverlay>();
  center: FakeLatLng;
  level: number;

  constructor(
    public container: HTMLElement,
    options: { center: FakeLatLng; level: number },
  ) {
    this.center = options.center;
    this.level = options.level;
    Object.assign(container.style, {
      position: "relative",
      overflow: "hidden",
      background: "#e8eef3",
      backgroundImage:
        "linear-gradient(#d5dee6 1px, transparent 1px), linear-gradient(90deg, #d5dee6 1px, transparent 1px)",
      backgroundSize: "48px 48px",
    });
  }

  /** 레벨이 1 낮아질 때마다 두 배 확대 */
  pxPerDegree() {
    return 60000 / 2 ** (this.level - 1);
  }

  project(p: FakeLatLng) {
    const k = this.pxPerDegree();
    return {
      x: (p.lng - this.center.lng) * k + this.container.clientWidth / 2,
      y: (this.center.lat - p.lat) * k * 1.2 + this.container.clientHeight / 2,
    };
  }

  getLevel() {
    return this.level;
  }

  setLevel(level: number) {
    if (level === this.level) return;
    this.level = level;
    this.overlays.forEach((o) => o.place(false));
    emit(this, "zoom_changed");
  }

  setCenter(center: FakeLatLng) {
    this.center = center;
    this.overlays.forEach((o) => o.place(false));
  }

  panTo(center: FakeLatLng) {
    this.center = center;
    this.overlays.forEach((o) => o.place(true));
    // 카카오맵처럼 이동이 끝나면 idle
    setTimeout(() => emit(this, "idle"), 420);
  }

  setBounds() {}
}

class FakeOverlay {
  wrapper = document.createElement("div");
  map: FakeMap | null = null;

  constructor(
    private options: { position: FakeLatLng; content: HTMLElement; yAnchor?: number; zIndex?: number },
  ) {
    this.wrapper.style.position = "absolute";
    this.wrapper.style.zIndex = String(options.zIndex ?? 1);
    this.wrapper.appendChild(options.content);
  }

  setMap(map: FakeMap | null) {
    if (map) {
      this.map = map;
      map.container.appendChild(this.wrapper);
      map.overlays.add(this);
      this.place(false);
    } else if (this.map) {
      this.map.overlays.delete(this);
      this.wrapper.remove();
      this.map = null;
    }
  }

  place(animate: boolean) {
    if (!this.map) return;
    const { x, y } = this.map.project(this.options.position);
    this.wrapper.style.transition = animate ? "left 0.4s ease, top 0.4s ease" : "";
    this.wrapper.style.left = `${x}px`;
    this.wrapper.style.top = `${y}px`;
    this.wrapper.style.transform = `translate(-50%, -${(this.options.yAnchor ?? 0.5) * 100}%)`;
  }
}

class FakePolygon {
  setMap() {}
  setOptions() {}
}

const fakeKakao = {
  maps: {
    load: (cb: () => void) => cb(),
    Map: FakeMap,
    LatLng: FakeLatLng,
    LatLngBounds: class {
      extend() {}
    },
    CustomOverlay: FakeOverlay,
    Polygon: FakePolygon,
    event: {
      addListener: (target: Listenable, type: string, fn: Listener) => {
        target.__listeners ??= {};
        (target.__listeners[type] ??= []).push(fn);
      },
      removeListener: (target: Listenable, type: string, fn: Listener) => {
        const list = target.__listeners?.[type];
        if (list) target.__listeners![type] = list.filter((f) => f !== fn);
      },
    },
  },
};

// 남구 문화 벨트 — 서로 가까워서 확대한 뒤 어느 마커가 흔들리는지 구분이 잘 된다
const PLACES = [
  { id: 1, name: "유엔평화기념관", originalId: "2715601", lat: 35.1275, lng: 129.0944, category: "HS" },
  { id: 2, name: "국립일제강제동원역사관", originalId: "2715602", lat: 35.1262, lng: 129.0969, category: "HS" },
  { id: 3, name: "부산박물관", originalId: "2715603", lat: 35.1298, lng: 129.0921, category: "HS" },
  { id: 4, name: "이기대 수변공원", originalId: "2715604", lat: 35.1224, lng: 129.1203, category: "NA" },
  { id: 5, name: "오륙도 스카이워크", originalId: "2715605", lat: 35.1006, lng: 129.1244, category: "NA" },
] as const;

const MARKERS: MapMarker[] = PLACES.map((p) => ({
  type: "SPOT",
  id: p.originalId,
  title: p.name,
  mapX: p.lng,
  mapY: p.lat,
  firstImage: null,
  category: p.category,
}));

const MAP_PLACES: MapPlace[] = PLACES.map((p) => ({
  id: p.id,
  placeType: "SPOT",
  originalId: p.originalId,
  name: p.name,
  district: "남구",
  category: p.category,
  longitude: p.lng,
  latitude: p.lat,
  imageUrl: null,
  minPrice: null,
  free: true,
  avgRating: 4.5,
  reviewCount: 12,
}));

function WithFakeKakao({ children }: { children: React.ReactNode }) {
  // 지도 컴포넌트가 마운트되며 window.kakao를 찾기 전에 깔려 있어야 해서, 첫 렌더에서 한 번만 바꿔 끼운다
  const [previous] = useState(() => {
    const w = window as unknown as { kakao?: unknown };
    const original = w.kakao;
    w.kakao = fakeKakao;
    return original;
  });
  useEffect(
    () => () => {
      (window as unknown as { kakao?: unknown }).kakao = previous;
    },
    [previous],
  );
  return <>{children}</>;
}

const meta = {
  title: "Spot/SpotContainer",
  component: SpotContainer,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true, navigation: { pathname: "/spot" } } },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
      queryClient.setQueryData(spotKeys.markers(), MARKERS);
      queryClient.setQueryData(mapPlaceKeys.list({ sort: "imageUrl,asc", size: MAP_PLACES_PAGE_SIZE }), {
        pages: [
          { content: MAP_PLACES, totalElements: MAP_PLACES.length, totalPages: 1, last: true, numberOfElements: MAP_PLACES.length },
        ],
        pageParams: [0],
      });
      return (
        <QueryClientProvider client={queryClient}>
          <WithFakeKakao>
            <Story />
          </WithFakeKakao>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof SpotContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 오른쪽 목록에서 장소를 누르면 지도가 그곳으로 옮겨가고 마커가 흔들린다. 마커나 "상세정보"를 눌러야 모달이 뜬다 */
export const SelectFromList: Story = { name: "목록 클릭 → 지도 이동 · 마커 딸랑" };

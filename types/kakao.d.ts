declare global {
  interface Window {
    kakao: typeof kakao;
  }

  namespace kakao.maps {
    function load(callback: () => void): void;

    class LatLng {
      constructor(lat: number, lng: number);
    }

    class LatLngBounds {
      extend(latlng: LatLng): void;
    }

    class Point {
      constructor(x: number, y: number);
      x: number;
      y: number;
    }

    interface MapProjection {
      pointFromCoords(latlng: LatLng): Point;
      coordsFromPoint(point: Point): LatLng;
    }

    class Map {
      constructor(container: HTMLElement, options: { center: LatLng; level: number });
      setBounds(bounds: LatLngBounds, paddingTop?: number, paddingRight?: number, paddingBottom?: number, paddingLeft?: number): void;
      panTo(latlng: LatLng): void;
      setCenter(latlng: LatLng): void;
      getLevel(): number;
      setLevel(level: number, options?: { anchor?: LatLng }): void;
      getProjection(): MapProjection;
      /** 컨테이너 크기가 바뀐 뒤 지도 크기를 다시 계산한다 */
      relayout(): void;
    }

    class CustomOverlay {
      constructor(options: {
        position: LatLng;
        content: HTMLElement | string;
        yAnchor?: number;
        zIndex?: number;
      });
      setMap(map: Map | null): void;
    }

    class Polyline {
      constructor(options: {
        path: LatLng[];
        strokeWeight?: number;
        strokeColor?: string;
        strokeOpacity?: number;
        strokeStyle?: string;
      });
      setMap(map: Map | null): void;
    }

    class Polygon {
      constructor(options: {
        /** 단일 링(LatLng[]) 또는 멀티폴리곤(LatLng[][] — 섬이 있는 구) */
        path: LatLng[] | LatLng[][];
        strokeWeight?: number;
        strokeColor?: string;
        strokeOpacity?: number;
        strokeStyle?: string;
        fillColor?: string;
        fillOpacity?: number;
        zIndex?: number;
      });
      setMap(map: Map | null): void;
      setOptions(options: {
        strokeWeight?: number;
        strokeOpacity?: number;
        fillOpacity?: number;
      }): void;
    }

    namespace event {
      function addListener(
        target: Map | Polygon,
        type: string,
        handler: () => void
      ): void;
      function removeListener(
        target: Map | Polygon,
        type: string,
        handler: () => void
      ): void;
    }
  }
}

export {};
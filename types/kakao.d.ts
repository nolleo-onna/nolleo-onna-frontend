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

    namespace event {
      function addListener(
        target: Map,
        type: string,
        handler: () => void
      ): void;
      function removeListener(
        target: Map,
        type: string,
        handler: () => void
      ): void;
    }
  }
}

export {};
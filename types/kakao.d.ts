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

    class Map {
      constructor(container: HTMLElement, options: { center: LatLng; level: number });
      setBounds(bounds: LatLngBounds, paddingTop?: number, paddingRight?: number, paddingBottom?: number, paddingLeft?: number): void;
      panTo(latlng: LatLng): void;
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
  }
}

export {};
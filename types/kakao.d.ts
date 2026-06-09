declare global {
	interface Window {
		kakao: {
			maps: {
				load: (callback: () => void) => void;
				LatLng: new (lat: number, lng: number) => object;
				Map: new (container: HTMLElement, options: object) => object;
			};
		};
	}
}

export {};
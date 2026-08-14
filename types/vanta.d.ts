declare module "vanta/dist/vanta.waves.min" {
  interface VantaWavesOptions {
    el: HTMLElement;
    THREE?: unknown;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number;
    backgroundColor?: number;
    shininess?: number;
    waveHeight?: number;
    waveSpeed?: number;
    zoom?: number;
  }

  interface VantaWavesEffect {
    destroy: () => void;
  }

  export default function WAVES(options: VantaWavesOptions): VantaWavesEffect;
}

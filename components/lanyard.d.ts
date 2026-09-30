declare module './lanyard' {
  import { ComponentType } from 'react';
  const Lanyard: ComponentType<{
    position?: [number, number, number];
    gravity?: [number, number, number];
    fov?: number;
    transparent?: boolean;
    frontImage?: string;
    backImage?: string;
    imageFit?: string;
    lanyardImage?: string;
    lanyardWidth?: number;
    className?: string;
  }>;
  export default Lanyard;
}
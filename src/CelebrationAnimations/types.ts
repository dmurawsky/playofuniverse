import { ConfettiCanvas } from './Animations/confetti';
import { FireworksCanvas } from './Animations/fireworks';

export type CelebrationOptionsType = {
  debug?: boolean;
  duration?: number;
};

export type Color = { front: string; back: string };

export type FireworksConfig = {
  duration?: number;
  density?: number;
  amount?: number;
  frequency?: number;
  colors?: string[];
};

export type ConfettiConfig = {
  amount?: number;
  speed?: number;
  colors?: Color[];
};

export type CelebrationAnimationsType = {
  fireworks: FireworksCanvas;
  confetti: ConfettiCanvas;
};

export type CelebrationCanvasProps<T> = {
  on: boolean;
  options: T;
  version: keyof CelebrationAnimationsType;
};

export type UseCelebrationsResponseType = {
  celebrate: (options?: CelebrationOptionsType) => void;
} & {
  [K in keyof CelebrationAnimationsType]?: JSX.Element;
}

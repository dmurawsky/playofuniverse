import React, { useEffect, useRef, useState } from 'react';

// Components
import { ConfettiCanvas } from './Animations/confetti';
import { FireworksCanvas } from './Animations/fireworks';

// Utils
import { seconds } from '../time';

// Types
import { CelebrationAnimationsType, CelebrationCanvasProps, CelebrationOptionsType, ConfettiConfig, FireworksConfig, UseCelebrationsResponseType } from './types';

const style = {
  width: '100%',
  height: '100%',
  position: 'absolute' as const,
  pointerEvents: 'none' as const,
  left: 0,
  top: 0,
};

const CelebrationAnimations = {
  fireworks: FireworksCanvas,
  confetti: ConfettiCanvas,
} as const;

const CelebrationCanvas: React.FunctionComponent<CelebrationCanvasProps<FireworksConfig | ConfettiConfig>> = <T extends FireworksConfig | ConfettiConfig>({ on, options, version }: CelebrationCanvasProps<T>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const celebrationRef = useRef<{ ref: CelebrationAnimationsType[keyof CelebrationAnimationsType] | null }>({ ref: null });
  let resizeTimer: ReturnType<typeof setTimeout>;

  const handleResize = () => {
    const context = canvasRef.current?.getContext('2d');

    const dpr = window.devicePixelRatio || 1;

    const height = canvasRef.current?.parentElement?.clientHeight ?? 0;
    const width = canvasRef.current?.parentElement?.clientWidth ?? 0;

    if (canvasRef.current) canvasRef.current.height = height * dpr;
    if (canvasRef.current) canvasRef.current.width = width * dpr;

    if (canvasRef.current) canvasRef.current.style.height = `${height}px`;
    if (canvasRef.current) canvasRef.current.style.width = `${width}px`;

    if (context) context.scale(dpr, dpr);

    celebrationRef.current.ref?.resizeCanvas();
  };

  const debouncedResizer = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 100);
  };

  useEffect(() => {
    if (canvasRef.current) window.addEventListener('resize', debouncedResizer);

    return () => window.removeEventListener('resize', debouncedResizer);
  }, [canvasRef]);

  useEffect(() => {
    if (canvasRef.current && on) {
      celebrationRef.current.ref = new CelebrationAnimations[version](canvasRef.current!, { ...options } as any);

      handleResize();
      celebrationRef.current.ref.start();
    }
  }, [canvasRef, on]);

  // The container id is simply to make it easier to spot in the dev tools
  return <div id={`${version}-canvas-container`} style={style}><canvas ref={canvasRef} style={style} /></div>;
};

export function useCelebration<T extends FireworksConfig | ConfettiConfig>(
  version: keyof CelebrationAnimationsType,
  options: CelebrationOptionsType & T = {} as CelebrationOptionsType & T
): UseCelebrationsResponseType {
  const { debug } = options;
  const duration = options.duration ? seconds(options.duration).ms : seconds(2.5).ms;

  const [on, trigger] = useState(false);

  useEffect(() => {
    if (on) trigger(false);
  }, [on]);

  const celebrate = () => {
    trigger(true);
    if (debug) setTimeout(() => { debugger; }, duration / 2);
  };

  const celebration = <CelebrationCanvas on={on} options={options} version={version} />;

  return { [version]: celebration, celebrate };
};

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { resolveElement } from '@platform/core/element-registry';
import { RadiateStyleProps, StampSpec } from '../radiate-registry';

export type SpokeConfig = {
  stageWidth?:    number;  // default 1080
  stageHeight?:   number;  // default 1920
  centerRadius?:  number;  // default 32
  minRadius?:     number;  // default 240
  maxRadius?:     number;  // default 460
  spokeStagger?:  number;  // default 0.30 — seconds between each spoke starting
  spokeDrawDur?:  number;  // default 0.55 — seconds for spoke line to fully extend
  spokeSpring?:   { damping?: number; stiffness?: number }; // default 30 / 120
  chipSpring?:    { damping?: number; stiffness?: number }; // default 14 / 180
  stampSpring?:   { damping?: number; stiffness?: number }; // default 16 / 220
};

function spokeRadius(i: number, min: number, max: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  const t = x - Math.floor(x);
  return min + t * (max - min);
}

function shuffleIndices(n: number): number[] {
  const rank = new Array(n);
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = (i * 13 + 5) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  arr.forEach((chipIdx, staggerPos) => { rank[chipIdx] = staggerPos; });
  return rank;
}

function itemColor(item: any): string {
  const d = item.data as Record<string, unknown>;
  return typeof d?.color === 'string' ? d.color : '#9d5cff';
}

function renderStamp(stamp: StampSpec, opacity: number, scale: number): React.ReactNode {
  const renderer = resolveElement(stamp.element);
  const w = stamp.w ?? 1080;
  const h = stamp.h ?? 400;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(10,10,10,0.88)',
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center center',
      pointerEvents: 'none',
    }}>
      {renderer.render(stamp.data, w, h)}
    </div>
  );
}

export const SpokeEffect: React.FC<RadiateStyleProps & { config?: SpokeConfig }> = ({ items, stamp, config = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stageW       = config.stageWidth    ?? 1080;
  const stageH       = config.stageHeight   ?? 1920;
  const centerR      = config.centerRadius  ?? 32;
  const minRadius    = config.minRadius     ?? 240;
  const maxRadius    = config.maxRadius     ?? 460;
  const spokeStagger = config.spokeStagger  ?? 0.30;
  const spokeDrawDur = config.spokeDrawDur  ?? 0.55;

  const stageCX = stageW / 2;
  const stageCY = stageH / 2;

  const n           = items.length;
  const angles      = items.map((_, i) => (i / n) * 2 * Math.PI - Math.PI / 2);
  const staggerRank = useMemo(() => shuffleIndices(n), [n]);

  const stampStartFrame = stamp ? Math.round(stamp.at * fps) : 99999;
  const stampProgress   = spring({
    frame: frame - stampStartFrame, fps,
    config: {
      damping:   config.stampSpring?.damping   ?? 16,
      stiffness: config.stampSpring?.stiffness ?? 220,
    },
  });
  const stampOpacity = frame >= stampStartFrame ? interpolate(stampProgress, [0, 0.2], [0, 1]) : 0;
  const stampScale   = interpolate(stampProgress, [0, 1], [1.2, 1.0]);

  return (
    <div style={{ width: stageW, height: stageH, background: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
      {items.map((item, i) => {
        const angle    = angles[i];
        const radius   = spokeRadius(i, minRadius, maxRadius);
        const chipCX   = stageCX + radius * Math.cos(angle);
        const chipCY   = stageCY + radius * Math.sin(angle);
        const spokeDeg = (angle * 180) / Math.PI;
        const color    = itemColor(item);

        const spokeStartFrame = Math.round(staggerRank[i] * spokeStagger * fps);
        const chipStartFrame  = spokeStartFrame + Math.round(spokeDrawDur * fps);

        const spokeP     = spring({ frame: frame - spokeStartFrame, fps, config: { damping: config.spokeSpring?.damping ?? 30, stiffness: config.spokeSpring?.stiffness ?? 120 } });
        const spokeScale = frame < spokeStartFrame ? 0 : interpolate(spokeP, [0, 1], [0, 1]);

        const chipP       = spring({ frame: frame - chipStartFrame, fps, config: { damping: config.chipSpring?.damping ?? 14, stiffness: config.chipSpring?.stiffness ?? 180 } });
        const chipScale   = frame < chipStartFrame ? 0 : interpolate(chipP, [0, 1], [0, 1]);
        const chipOpacity = frame < chipStartFrame ? 0 : interpolate(chipP, [0, 0.15], [0, 1]);

        const renderer = resolveElement(item.element);

        return (
          <React.Fragment key={i}>
            <div style={{
              position: 'absolute',
              left: stageCX + centerR * Math.cos(angle),
              top:  stageCY + centerR * Math.sin(angle) - 1,
              width: radius - centerR,
              height: 2,
              background: `${color}55`,
              transformOrigin: 'left center',
              transform: `rotate(${spokeDeg}deg) scaleX(${spokeScale})`,
            }} />
            <div style={{
              position: 'absolute',
              left: chipCX,
              top:  chipCY,
              width: item.w,
              height: item.h,
              transform: `translate(-50%, -50%) scale(${chipScale})`,
              transformOrigin: 'center center',
              opacity: chipOpacity,
            }}>
              {renderer.render(item.data, item.w, item.h)}
            </div>
          </React.Fragment>
        );
      })}

      <div style={{
        position: 'absolute',
        left: stageCX - centerR,
        top:  stageCY - centerR,
        width: centerR * 2,
        height: centerR * 2,
        borderRadius: centerR * 2,
        background: '#0a0a0a',
      }} />

      {stamp && renderStamp(stamp, stampOpacity, stampScale)}
    </div>
  );
};

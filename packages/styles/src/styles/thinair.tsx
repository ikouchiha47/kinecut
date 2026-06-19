import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { resolveElement } from '@platform/core/element-registry';
import { RadiateStyleProps, StampSpec } from '../radiate-registry';

export type ThinAirConfig = {
  stageWidth?:    number;  // default 1080
  stageHeight?:   number;  // default 1920
  gapX?:          number;  // default 24 — horizontal gap between chips in a row
  gapY?:          number;  // default 32 — vertical gap between rows
  marginX?:       number;  // default 160 — total horizontal margin (80 each side)
  stagger?:       number;  // default 0.09 — seconds between each chip appearing
  chipSpring?:    { damping?: number; stiffness?: number }; // default 14 / 240
  stampSpring?:   { damping?: number; stiffness?: number }; // default 16 / 220
};

type SlotPosition = { x: number; y: number; w: number; h: number };
type ItemSize = { w: number; h: number };

function radiatePositions(items: ItemSize[], stageW: number, stageH: number, gapX: number, gapY: number, marginX: number): SlotPosition[] {
  const maxRowW = stageW - marginX;
  const rows: number[][] = [[]];

  for (let i = 0; i < items.length; i++) {
    const lastRow = rows[rows.length - 1];
    const rowW = lastRow.reduce((sum, j) => sum + items[j].w + gapX, 0) - (lastRow.length ? gapX : 0);
    if (lastRow.length > 0 && rowW + gapX + items[i].w > maxRowW) {
      rows.push([i]);
    } else {
      lastRow.push(i);
    }
  }

  const rowH   = Math.max(...items.map(it => it.h));
  const totalH = rows.length * rowH + (rows.length - 1) * gapY;
  const startY = (stageH - totalH) / 2;

  const positions: SlotPosition[] = new Array(items.length);
  rows.forEach((row, rowIdx) => {
    const rowW = row.reduce((sum, j) => sum + items[j].w, 0) + (row.length - 1) * gapX;
    let x = (stageW - rowW) / 2;
    const y = startY + rowIdx * (rowH + gapY);
    row.forEach(idx => {
      positions[idx] = { x, y, w: items[idx].w, h: items[idx].h };
      x += items[idx].w + gapX;
    });
  });

  return positions;
}

function shuffleIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = (i * 7 + 3) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const rank = new Array(n);
  arr.forEach((chipIdx, r) => { rank[chipIdx] = r; });
  return rank;
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

export const ThinAirEffect: React.FC<RadiateStyleProps & { config?: ThinAirConfig }> = ({ items, stamp, config = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stageW   = config.stageWidth  ?? 1080;
  const stageH   = config.stageHeight ?? 1920;
  const gapX     = config.gapX        ?? 24;
  const gapY     = config.gapY        ?? 32;
  const marginX  = config.marginX     ?? 160;
  const stagger  = config.stagger     ?? 0.09;

  const slots        = radiatePositions(items.map(it => ({ w: it.w, h: it.h })), stageW, stageH, gapX, gapY, marginX);
  const staggerRank  = useMemo(() => shuffleIndices(items.length), [items.length]);

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
        const slot          = slots[i];
        const staggerFrames = Math.round(staggerRank[i] * stagger * fps);
        const p             = spring({
          frame: frame - staggerFrames, fps,
          config: {
            damping:   config.chipSpring?.damping   ?? 14,
            stiffness: config.chipSpring?.stiffness ?? 240,
          },
        });
        const scale    = interpolate(p, [0, 1], [1.45, 1.0]);
        const opacity  = interpolate(p, [0, 0.12], [0, 1]);
        const renderer = resolveElement(item.element);

        return (
          <div key={i} style={{
            position: 'absolute',
            left: slot.x, top: slot.y,
            width: slot.w, height: slot.h,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            opacity,
          }}>
            {renderer.render(item.data, slot.w, slot.h)}
          </div>
        );
      })}

      {stamp && renderStamp(stamp, stampOpacity, stampScale)}
    </div>
  );
};

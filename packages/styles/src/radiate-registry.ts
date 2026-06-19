import React from 'react';
import { ElementSpec } from '@platform/types';

export type StampSpec = {
  at: number;       // seconds from scene start
  element: string;  // any registered element name e.g. 'radiate:text-accent', 'core:pill'
  data: unknown;    // passed to the element renderer
  w?: number;       // size hint for the renderer
  h?: number;
};

export type RadiateStyleProps = {
  items: ElementSpec[];
  stamp?: StampSpec;
  config?: Record<string, unknown>;
};

export type RadiateStyleRenderer = React.FC<RadiateStyleProps>;

const map = new Map<string, RadiateStyleRenderer>();

export function registerRadiateStyle(name: string, renderer: RadiateStyleRenderer): void {
  if (map.has(name)) throw new Error(`duplicate radiate style: ${name}`);
  map.set(name, renderer);
}

export function resolveRadiateStyle(name: string): RadiateStyleRenderer {
  const r = map.get(name);
  if (!r) throw new Error(`unknown radiate style: ${name}. Did you forget to register it?`);
  return r;
}

import React from 'react';
import { ElementSpec } from '@platform/types';
import { resolveRadiateStyle, StampSpec } from './radiate-registry';

export type RadiateSceneProps = {
  style:    string;        // registered style name: 'spoke' | 'thinair' | custom
  items:    ElementSpec[];
  stamp?:   StampSpec;
  config?:  Record<string, unknown>;
};

export const RadiateScene: React.FC<RadiateSceneProps> = ({ style, items, stamp, config }) => {
  const StyleRenderer = resolveRadiateStyle(style);
  return <StyleRenderer items={items} stamp={stamp} config={config} />;
};

import React from 'react';
import { staticFile } from 'remotion';
import { registerElement } from '@platform/core/element-registry';

type ImageData = {
  src:           string;   // relative to public/
  borderRadius?: number;   // default 0
  objectFit?:    'cover' | 'contain' | 'fill'; // default 'cover'
};

registerElement('radiate:image', {
  render(data: ImageData, w: number, h: number): React.ReactNode {
    return (
      <div style={{
        width: w, height: h,
        borderRadius: data.borderRadius ?? 0,
        overflow: 'hidden',
      }}>
        <img
          src={staticFile(data.src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: data.objectFit ?? 'cover',
            display: 'block',
          }}
        />
      </div>
    );
  },
});

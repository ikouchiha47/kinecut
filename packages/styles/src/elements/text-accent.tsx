import React from 'react';
import { registerElement } from '@platform/core/element-registry';

type TextAccentData = {
  text:          string;
  accentWord:    string;
  fontFamily?:   string;  // default 'Space Grotesk, sans-serif'
  fontSize?:     number;  // default 140
  lineHeight?:   number;  // default 0.92
  letterSpacing?: number; // default -5
  accentColor?:  string;  // default '#9d5cff'
};

registerElement('radiate:text-accent', {
  render(data: TextAccentData, w: number, h: number): React.ReactNode {
    return (
      <div style={{
        width: w, height: h,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily:    data.fontFamily    ?? 'Space Grotesk, sans-serif',
        fontSize:      data.fontSize      ?? 140,
        lineHeight:    data.lineHeight    ?? 0.92,
        letterSpacing: data.letterSpacing ?? -5,
        fontWeight: 800,
        textAlign: 'center',
        color: '#fff',
      }}>
        <span>{data.text}</span>
        <span style={{ color: data.accentColor ?? '#9d5cff' }}>{data.accentWord}</span>
      </div>
    );
  },
});

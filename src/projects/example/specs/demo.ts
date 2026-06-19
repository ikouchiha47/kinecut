import { createExampleBundle } from '../registry';
import { SceneSpec, VideoConfig } from '../types';
import { VideoPlayer } from '../../../platform/VideoPlayer';
import { RegistryContext } from '../../../platform/core/RegistryContext';
import React from 'react';

const bundle = createExampleBundle();

export const videoConfig: VideoConfig = {
  bgColor:             '#0a0a0a',
  transitionFillColor: '#0a0a0a',
  accentColor:         '#9d5cff',
  fontFamily:          "'Space Grotesk', sans-serif",
  fonts: [
    { type: 'file', family: 'Space Grotesk', path: 'fonts/SpaceGrotesk.woff2' },
  ],
};

// Replace example/screen.png and example/photo.png with your own images.
// Run: node scripts/collect-assets.js --dest public/example --manifest src/projects/example/assets.yaml \
//        --name screen --src /path/to/screenshot.png \
//        --name photo  --src /path/to/photo.png
export const scenes: SceneSpec[] = [
  {
    type: 'text',
    duration: 1.5,
    lines: [
      { text: 'your hook',  enter: 'slide-up' },
      { text: 'goes here',  enter: 'slide-up', accent: true },
    ],
    transition: 'cut',
  },
  {
    type: 'screenshot',
    duration: 3.0,
    src: 'example/screen.png',
    enter: { type: 'slide', direction: 'up' },
    preset: 'ken-burns',
    elements: [
      {
        id: 'badge',
        element: 'core:pill',
        x: 540, y: 900,
        w: 400, h: 80,
        at: 1.2,
        data: { label: 'Your Label', emoji: '✨', color: '#9d5cff' },
        effects: [
          { type: 'core:pop-in' },
          { type: 'core:bloom', color: '#9d5cff', delay: 0.3 },
        ],
      },
    ],
    transition: 'cut',
  },
  {
    type: 'chips',
    duration: 4.0,
    layout: 'radial-spoke',
    items: [
      { element: 'core:pill', w: 240, h: 80, data: { label: 'Tag One',   emoji: '🔥', color: '#ef4444' } },
      { element: 'core:pill', w: 240, h: 80, data: { label: 'Tag Two',   emoji: '👻', color: '#a78bfa' } },
      { element: 'core:pill', w: 240, h: 80, data: { label: 'Tag Three', emoji: '💛', color: '#facc15' } },
      { element: 'core:pill', w: 240, h: 80, data: { label: 'Tag Four',  emoji: '🌀', color: '#f472b6' } },
      { element: 'core:pill', w: 240, h: 80, data: { label: 'Tag Five',  emoji: '🃏', color: '#2dd4bf' } },
    ],
    stamp: { text: 'your closing', accentWord: 'stamp.', at: 3.0 },
    transition: 'cut',
  },
  {
    type: 'lockup',
    duration: 2.5,
    hook: 'your closing hook',
    name: 'your app',
    sub: 'your tagline here',
    overlays: [
      { type: 'core:confetti', startAt: 0.2, duration: 2.0, origin: 'sides', count: 80, gravity: 0.6 },
    ],
  },
];

const FPS = 30;
const totalFrames = scenes.reduce((s, sc) => s + Math.round(sc.duration * FPS), 0);

const ExampleDemo: React.FC = () =>
  React.createElement(RegistryContext.Provider, { value: bundle },
    React.createElement(VideoPlayer, { scenes, videoConfig }));

export const demoComposition = {
  id:               'ExampleDemo',
  component:        ExampleDemo,
  durationInFrames: totalFrames,
  fps:              FPS,
  width:            1080,
  height:           1920,
};

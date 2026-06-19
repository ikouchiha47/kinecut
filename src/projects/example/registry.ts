import '../../platform/effects/index';
import '../../platform/motion/register';
import '../../platform/overlays/index';
import '../../platform/presets/index';
import './elements/index';

import { createPlatformBundle } from '../../platform/registry';
import { ScreenshotScene } from './scenes/ScreenshotScene';
import { ChipsScene }      from './scenes/ChipsScene';
import { LockupScene }     from './scenes/LockupScene';
import { RadiateScene }    from '@roughcut/styles/radiate';

export function createExampleBundle() {
  const bundle = createPlatformBundle();
  bundle.scenes.register('screenshot', ScreenshotScene);
  bundle.scenes.register('chips',      ChipsScene);
  bundle.scenes.register('lockup',     LockupScene);
  bundle.scenes.register('radiate',    RadiateScene);
  return bundle;
}

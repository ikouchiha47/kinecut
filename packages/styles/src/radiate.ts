import './elements/text-accent';
import './elements/image';

import { registerRadiateStyle } from './radiate-registry';
import { SpokeEffect } from './styles/spoke';
import { ThinAirEffect } from './styles/thinair';

registerRadiateStyle('spoke',   SpokeEffect);
registerRadiateStyle('thinair', ThinAirEffect);

export { RadiateScene } from './RadiateScene';

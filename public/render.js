// public/render.js
// ============================================================================
// NATIVEPLANR MVP PRESENTATION TIER: STATELESS CANVAS TARGET TRANSLATOR
// ============================================================================

import { GardenLayoutEngine } from '../ui/engine/garden-layout-engine.js';
import { GardenGridRenderer } from '../ui/components/GardenGridRenderer.js';

export class ClientRenderBridge {
  public static executeDomProjection(domTargetElement, rawApiResponseData) {
    if (!domTargetElement) {
      throw new Error("Render Bridge Fault: Invalidation of target placement viewport container node.");
    }

    const presentationViewModel = GardenLayoutEngine.projectBlueprintToViewModel(rawApiResponseData);
    domTargetElement.removeAttribute('style');
    GardenGridRenderer.renderToContainer(domTargetElement, presentationViewModel);
  }
}

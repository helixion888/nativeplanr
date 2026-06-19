// ui/components/GardenGridRenderer.ts
// ============================================================================
// NATIVEPLANR PRODUCT LAYER: DETERMINISTIC DOM PRESENTATION GRID CANVAS
// ============================================================================

import { GardenRenderInput } from '../types/garden-ui.types';

export class GardenGridRenderer {
  public static renderToContainer(domTargetElement: HTMLElement, renderConfig: GardenRenderInput): void {
    if (!domTargetElement) {
      throw new Error("UI Component Fault: Designated DOM deployment canvas target is unreachable.");
    }

    domTargetElement.innerHTML = '';

    const totalColumnsCount = Math.ceil(renderConfig.plotWidthFt / 2);
    
    domTargetElement.style.display = 'grid';
    domTargetElement.style.gap = '6px';
    domTargetElement.style.padding = '12px';
    domTargetElement.style.backgroundColor = '#e7e5e4'; 
    domTargetElement.style.borderRadius = '8px';
    domTargetElement.style.width = '100%';
    domTargetElement.style.aspectRatio = `${renderConfig.plotWidthFt} / ${renderConfig.plotLengthFt}`;
    domTargetElement.style.gridTemplateColumns = `repeat(${totalColumnsCount}, 1fr)`;

    renderConfig.gridCells.forEach(cell => {
      const tileElement = document.createElement('div');
      
      tileElement.className = `garden-ui-tile ${cell.cssZoneClass}`;
      tileElement.setAttribute('data-x', cell.x.toString());
      tileElement.setAttribute('data-y', cell.y.toString());
      tileElement.title = cell.toolTipText;
      tileElement.textContent = cell.labelToken;

      tileElement.style.aspectRatio = '1';
      tileElement.style.borderRadius = '4px';
      tileElement.style.display = 'flex';
      tileElement.style.justifyContent = 'center';
      tileElement.style.alignItems = 'center';
      tileElement.style.fontWeight = '700';
      tileElement.style.fontSize = '0.75rem';
      tileElement.style.transition = 'transform 0.1s ease';
      tileElement.style.cursor = 'pointer';

      tileElement.addEventListener('mouseenter', () => {
        tileElement.style.transform = 'scale(1.05)';
        tileElement.style.zIndex = '10';
      });
      tileElement.addEventListener('mouseleave', () => {
        tileElement.style.transform = 'scale(1.0)';
        tileElement.style.zIndex = '1';
      });

      domTargetElement.appendChild(tileElement);
    });
  }
}

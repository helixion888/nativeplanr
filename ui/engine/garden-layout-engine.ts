// ui/engine/garden-layout-engine.ts
// ============================================================================
// NATIVEPLANR PRODUCT LAYER: STATELESS PRESENTATION MATRIX TRANSLATOR
// ============================================================================

import { GridCellViewModel, PlantRenderToken, GardenRenderInput } from '../types/garden-ui.types';

export class GardenLayoutEngine {
  public static projectBlueprintToViewModel(backendBlueprintPayload: any): GardenRenderInput {
    if (!backendBlueprintPayload || !Array.isArray(backendBlueprintPayload.grid_layout)) {
      throw new Error("UI Mapping Exception: Invalid or missing blueprint matrix array data source.");
    }

    const speciesIndexMap = new Map<string, PlantRenderToken>();
    
    if (Array.isArray(backendBlueprintPayload.plant_list)) {
      backendBlueprintPayload.plant_list.forEach((plant: any) => {
        let roleColorToken = '#e2e8f0'; 
        if (plant.ecological_role === 'buffer') roleColorToken = '#d6d3d1';
        if (plant.ecological_role === 'structural') roleColorToken = '#166534';
        if (plant.ecological_role === 'pollinator_magnet') roleColorToken = '#bbf7d0';

        speciesIndexMap.set(plant.id, {
          id: plant.id,
          commonName: plant.common_name,
          scientificName: plant.scientific_name,
          roleColorToken
        });
      });
    }

    const gridCells: GridCellViewModel[] = backendBlueprintPayload.grid_layout.map((cell: any) => {
      let cssZoneClass: 'cell-zone-edge' | 'cell-zone-center' | 'cell-zone-fill' = 'cell-zone-fill';
      if (cell.zone === 'edge') cssZoneClass = 'cell-zone-edge';
      if (cell.zone === 'center') cssZoneClass = 'cell-zone-center';

      const matchedPlant = speciesIndexMap.get(cell.plant_id);
      const displayLabel = cell.plant_id === 'empty' ? '.' : cell.plant_id.toUpperCase();
      const toolTipText = matchedPlant 
        ? `${matchedPlant.commonName} (${matchedPlant.scientificName}) [Position: ${cell.x}ft, ${cell.y}ft]`
        : `Empty Space Buffer Zone [Position: ${cell.x}ft, ${cell.y}ft]`;

      return {
        x: cell.x,
        y: cell.y,
        plantId: cell.plant_id,
        cssZoneClass,
        labelToken: displayLabel,
        toolTipText
      };
    });

    return {
      plotWidthFt: backendBlueprintPayload.width || 10,
      plotLengthFt: backendBlueprintPayload.length || 10,
      gridCells,
      speciesIndexList: speciesIndexMap
    };
  }
}

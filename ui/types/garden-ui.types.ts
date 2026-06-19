// ui/types/garden-ui.types.ts
// ============================================================================
// NATIVEPLANR PRODUCT LAYER: UNIFIED PRESENTATION DESIGN TYPES
// ============================================================================

export interface PlantRenderToken {
  readonly id: string;
  readonly commonName: string;
  readonly scientificName: string;
  readonly roleColorToken: string;
}

export interface GridCellViewModel {
  readonly x: number;
  readonly y: number;
  readonly plantId: string;
  readonly cssZoneClass: 'cell-zone-edge' | 'cell-zone-center' | 'cell-zone-fill';
  readonly labelToken: string;
  readonly toolTipText: string;
}

export interface GardenRenderInput {
  readonly plotWidthFt: number;
  readonly plotLengthFt: number;
  readonly gridCells: GridCellViewModel[];
  readonly speciesIndexList: Map<string, PlantRenderToken>;
}

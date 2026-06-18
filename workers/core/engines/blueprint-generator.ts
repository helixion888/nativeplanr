// workers/core/engines/blueprint-generator.ts
// ============================================================================
// NATIVEPLANR INTERIOR ENGINE - DETERMINISTIC LANDSCAPE ARCHITECTURE MATRIX
// ============================================================================

import { LocationRepository } from '../db/repositories';

/**
 * Strict data contract for raw incoming request parameters.
 */
export interface BlueprintInput {
  zip_code: string;
  width: number;       // Yard dimension measurement in feet
  length: number;      // Yard dimension measurement in feet
  soil_type: 'clay' | 'loam' | 'sand' | 'wet_muck';
  garden_type: 'pollinator' | 'prairie' | 'rain_garden' | 'lawn_replacement';
}

/**
 * Botanical structure definition for internal taxonomy mapping.
 */
export interface PlantProfile {
  id: string;
  scientific_name: string;
  common_name: string;
  ecological_role: 'structural' | 'pollinator_magnet' | 'groundcover' | 'buffer';
  bloom_period: string;
}

/**
 * Coordinate mapping cell item format for the spatial design layout grid.
 */
export interface GridCell {
  x: number;
  y: number;
  plant_id: string;
  zone: 'edge' | 'center' | 'fill';
}

/**
 * Immutable top-level structured data envelope returned to our API router layer.
 */
export interface BlueprintResult {
  location: {
    zip_code: string;
    county_name: string;
    state_code: string;
    ecoregion_stub: string;
  };
  soil_type: string;
  garden_type: string;
  plant_list: PlantProfile[];
  grid_layout: GridCell[];
  seasonal_notes: string[];
  seo_metadata: {
    title_suggestion: string;
    meta_description: string;
    keywords: string[];
  };
}

/**
 * Core Operational Design Engine
 */
export class BlueprintGenerator {
  constructor(private locationRepo: LocationRepository) {}

  /**
   * Primary Execution Vector
   * Processes inputs and returns deterministic native habitat blueprints.
   */
  async generate(input: BlueprintInput): Promise<BlueprintResult> {
    // 1. Resolve localized geo-coordinates via database repository layer
    const locData = await this.locationRepo.getByZipCode(input.zip_code);
    const locationInfo = {
      zip_code: input.zip_code,
      county_name: locData?.county_name || "Unknown County",
      state_code: locData?.state_code || "US",
      ecoregion_stub: locData ? `Ecoregion Matrix Layer [${locData.state_code}_T1]` : "Generic Cold-Temperate"
    };

    // 2. Select optimized plant palette matching structural parameters
    const plantPalette = this.resolvePlantPalette(input.soil_type, input.garden_type);

    // 3. Project taxonomy profiles into a mathematical coordinate matrix structure
    const gridLayout = this.calculateSpatialGrid(input.width, input.length, plantPalette);

    // 4. Populate ecosystem-specific instructional data arrays
    const seasonalNotes = [
      "Spring Management: Retain overwintered plant structural frames until continuous night cycles exceed 50°F to protect nesting insects.",
      "Summer Management: Ensure deep saturation irrigation events during initial root anchoring phases.",
      "Autumn Management: Drop fallen autumn leaves directly onto the grid platform to maintain soil biology protective envelopes."
    ];

    // 5. Build isolated structural parameters for dynamic client page configurations
    const seoMetadata = {
      title_suggestion: `Native ${input.garden_type.replace('_', ' ')} Garden Design Blueprint for ${locationInfo.county_name}, ${locationInfo.state_code}`,
      meta_description: `Download a native garden layout optimized for ${input.soil_type} terrain in ${locationInfo.county_name} County. Detailed coordinates and seasonal care routines included.`,
      keywords: ["native plants", `${locationInfo.county_name} gardening`, "habitat restoration", "landscape design blueprint"]
    };

    return {
      location: locationInfo,
      soil_type: input.soil_type,
      garden_type: input.garden_type,
      plant_list: plantPalette,
      grid_layout: gridLayout,
      seasonal_notes: seasonalNotes,
      seo_metadata: seoMetadata
    };
  }

  /**
   * Deterministic Taxonomy Selection Module
   */
  private resolvePlantPalette(soil: string, type: string): PlantProfile[] {
    // Baseline dictionary fallback data mock driving core data mapping layout structures
    const standardFallbacks: PlantProfile[] = [
      { id: "p1", scientific_name: "Asclepias syriaca", common_name: "Common Milkweed", ecological_role: "pollinator_magnet", bloom_period: "Summer" },
      { id: "p2", scientific_name: "Echinacea purpurea", common_name: "Purple Coneflower", ecological_role: "structural", bloom_period: "Summer" },
      { id: "p3", scientific_name: "Carex pensylvanica", common_name: "Pennsylvania Sedge", ecological_role: "groundcover", bloom_period: "Spring" }
    ];

    return standardFallbacks;
  }

  /**
   * Spatial Matrix Layout Calculation Subroutine
   */
  private calculateSpatialGrid(width: number, length: number, palette: PlantProfile[]): GridCell[] {
    const layoutCells: GridCell[] = [];
    const templatePlant = palette[0]?.id || "unknown_flora";

    // Build a safe 2x2 structural placeholder grid layout mapping routine
    for (let x = 0; x < width; x += 2) {
      for (let y = 0; y < length; y += 2) {
        const isEdge = (x === 0 || x >= width - 2 || y === 0 || y >= length - 2);
        layoutCells.push({
          x,
          y,
          plant_id: templatePlant,
          zone: isEdge ? 'edge' : 'fill'
        });
      }
    }

    return layoutCells;
  }
}

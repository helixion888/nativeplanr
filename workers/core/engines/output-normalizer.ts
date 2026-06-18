// workers/core/engines/output-normalizer.ts
// ============================================================================
// NATIVEPLANR ARCHITECTURE LAYER: ENHANCED OUTPUT CONFIGURATION NORMALIZER
// ============================================================================

import { BlueprintResult, GridCell, PlantProfile } from './blueprint-generator';

export class OutputNormalizer {
  /**
   * Enforces rigorous structural formatting, stable ordering indices, and data cleanliness
   */
  public static normalize(result: BlueprintResult): BlueprintResult {
    // 1. Enforce deep deterministic sorting of the active plant profile list by entity ID
    const stabilizedPlants: PlantProfile[] = [...result.plant_list].sort((a, b) => 
      a.id.localeCompare(b.id)
    );

    // 2. Enforce strict 2D space matrix layout sorting (primary x axis, secondary y axis)
    const stabilizedGrid: GridCell[] = [...result.grid_layout].sort((a, b) => {
      if (a.x !== b.x) return a.x - b.x;
      return a.y - b.y;
    });

    // 3. Normalize programmatic SEO metadata keywords into lowercased atomic elements
    const normalizedKeywords = Array.from(
      new Set(result.seo_metadata.keywords.map(kw => kw.trim().toLowerCase()))
    ).filter(kw => kw.length > 0);

    return {
      location: {
        zip_code: result.location.zip_code.trim(),
        county_name: result.location.county_name.trim(),
        state_code: result.location.state_code.trim().toUpperCase(),
        ecoregion_stub: result.location.ecoregion_stub.trim()
      },
      soil_type: result.soil_type,
      garden_type: result.garden_type,
      plant_list: stabilizedPlants,
      grid_layout: stabilizedGrid,
      seasonal_notes: result.seasonal_notes.map(note => note.trim()),
      seo_metadata: {
        title_suggestion: result.seo_metadata.title_suggestion.trim(),
        meta_description: result.seo_metadata.meta_description.trim(),
        keywords: normalizedKeywords
      }
    };
  }

  /**
   * Structural Perimeter Gate Validation Routine
   * Throws an explicit architectural execution error if any production constraint is compromised.
   */
  public static validateBlueprintResult(result: BlueprintResult): boolean {
    if (!result.plant_list || result.plant_list.length === 0) {
      throw new Error("Validation Breach: Plant taxonomy profile catalog list cannot be empty.");
    }

    for (const plant of result.plant_list) {
      if (!plant.id || plant.id.trim() === "") {
        throw new Error("Validation Breach: Detected an unassigned or anonymous plant ID key.");
      }
    }

    if (!result.grid_layout || result.grid_layout.length === 0) {
      throw new Error("Validation Breach: Spatial layout array canvas contains no valid structural cells.");
    }

    const validZones = new Set(['edge', 'center', 'fill']);
    for (const cell of result.grid_layout) {
      if (!cell.plant_id || cell.plant_id === "empty") {
        throw new Error(`Validation Breach: Unmapped plant assignment at grid location coordinate tracking [${cell.x}, ${cell.y}].`);
      }
      if (!validZones.has(cell.zone)) {
        throw new Error(`Validation Breach: Illegal structural zone definition encountered: '${cell.zone}'.`);
      }
    }

    if (!result.seo_metadata.keywords || result.seo_metadata.keywords.length === 0) {
      throw new Error("Validation Breach: SEO metadata keywords list array must possess non-empty criteria elements.");
    }

    return true;
  }
}

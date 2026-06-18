// workers/core/engines/blueprint-generator.ts
// ============================================================================
// NATIVEPLANR INTERIOR ENGINE - DETERMINISTIC LANDSCAPE ARCHITECTURE MATRIX
// ============================================================================

import { LocationRepository } from '../db/repositories';
import { OutputNormalizer } from './output-normalizer';

/**
 * Strict data contract for raw incoming request parameters.
 */
export interface BlueprintInput {
  zip_code: string;
  width: number;       // Yard dimension measurement in feet
  length: number;      // Yard dimension measurement in feet
  soil_type: 'clay' | 'loam' | 'sand' | 'wet_muck';
  garden_type: 'pollinator' | 'prairie' | 'rain_garden' | 'lawn_replacement';
  strict_mode?: boolean; // 🔒 Simulation Lock Mode Stabilization Parameter
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

interface CatalogPlant extends PlantProfile {
  soil_suitability: Record<string, number>;
  garden_suitability: Record<string, number>;
  spacing_factor: number;
  moisture_preference: number;
  sun_preference: number;
  height_ft: number;
  sprawl_factor: number;
  interaction_radius: number;
  attracts: string[];
  repels: string[];
  moisture_mod: number;
  shade_mod: number;
}

interface CellState {
  x: number;
  y: number;
  plant_id: string | null;
  moisture: number;
  fertility: number;
  shade: number;
  stability: number;
}

export interface GridCell {
  x: number;
  y: number;
  plant_id: string;
  zone: 'edge' | 'center' | 'fill';
}

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

export class BlueprintGenerator {
  private static readonly PLANT_CATALOG: CatalogPlant[] = [
    {
      id: "p1", scientific_name: "Asclepias syriaca", common_name: "Common Milkweed",
      ecological_role: "pollinator_magnet", bloom_period: "Summer", spacing_factor: 2,
      soil_suitability: { clay: 0.6, loam: 1, sand: 0.8, wet_muck: 0.2 },
      garden_suitability: { pollinator: 1, prairie: 0.9, rain_garden: 0.3, lawn_replacement: 0.7 },
      moisture_preference: 0.5, sun_preference: 0.9, height_ft: 4, sprawl_factor: 0.6,
      interaction_radius: 4, attracts: ["p4"], repels: [], moisture_mod: -0.01, shade_mod: 0
    },
    {
      id: "p2", scientific_name: "Echinacea purpurea", common_name: "Purple Coneflower",
      ecological_role: "structural", bloom_period: "Summer", spacing_factor: 1.5,
      soil_suitability: { clay: 0.7, loam: 1, sand: 0.6, wet_muck: 0.1 },
      garden_suitability: { pollinator: 1, prairie: 1, rain_garden: 0.2, lawn_replacement: 0.6 },
      moisture_preference: 0.4, sun_preference: 1, height_ft: 3, sprawl_factor: 0.3,
      interaction_radius: 3, attracts: [], repels: [], moisture_mod: 0, shade_mod: 0
    }
  ];

  constructor(private locationRepo: LocationRepository) {}

  async generate(input: BlueprintInput): Promise<BlueprintResult> {
    const locData = await this.locationRepo.getByZipCode(input.zip_code);

    const locationInfo = {
      zip_code: input.zip_code,
      county_name: locData?.county_name || "Unknown County",
      state_code: locData?.state_code || "US",
      ecoregion_stub: locData ? `Ecoregion Matrix Layer [${locData.state_code}_T1]` : "Generic Temperate"
    };

    const plantPalette = this.resolvePlantPalette(input);
    const simulatedGrid = this.simulateHabitat(input.width, input.length, plantPalette as CatalogPlant[], input.strict_mode);
    const gridLayout = this.toGridCells(simulatedGrid);

    const rawResult: BlueprintResult = {
      location: locationInfo,
      soil_type: input.soil_type,
      garden_type: input.garden_type,
      plant_list: plantPalette,
      grid_layout: gridLayout,
      seasonal_notes: [
        "Spring: emergence phase stabilization required",
        "Summer: pollinator density peak expected",
        "Autumn: biomass integration into soil layer"
      ],
      seo_metadata: {
        title_suggestion: `Native ${input.garden_type} habitat design for ${locationInfo.county_name}`,
        meta_description: `Ecological simulation-based planting layout optimized for ${input.soil_type} soil conditions.`,
        keywords: ["native plants", "habitat simulation", "ecological design"]
      }
    };

    // 🔒 SYSTEM STABILIZATION INTEGRATION STEPS
    const normalizedResult = OutputNormalizer.normalize(rawResult);
    OutputNormalizer.validateBlueprintResult(normalizedResult);

    return normalizedResult;
  }

  private resolvePlantPalette(input: BlueprintInput): PlantProfile[] {
    const scored = BlueprintGenerator.PLANT_CATALOG.map(p => ({
      plant: p,
      score: this.scorePlant(p, input)
    }));

    scored.sort((a, b) => b.score - a.score);

    const diverse: CatalogPlant[] = [];
    const roleCount: Record<string, number> = {};

    for (const item of scored.map(s => s.plant)) {
      const role = item.ecological_role;
      roleCount[role] = roleCount[role] || 0;

      if (roleCount[role] < 3) {
        diverse.push(item);
        roleCount[role]++;
      }
      if (diverse.length >= 8) break;
    }

    return diverse.map(p => ({
      id: p.id,
      scientific_name: p.scientific_name,
      common_name: p.common_name,
      ecological_role: p.ecological_role,
      bloom_period: p.bloom_period
    }));
  }

  private scorePlant(plant: CatalogPlant, input: BlueprintInput): number {
    const soil = plant.soil_suitability[input.soil_type] || 0;
    const garden = plant.garden_suitability[input.garden_type] || 0;

    if (!soil || !garden) return 0;

    let score = soil * garden;

    const roleBoost =
      input.garden_type === 'pollinator' && plant.ecological_role === 'pollinator_magnet' ? 1.5 :
      input.garden_type === 'prairie' && plant.ecological_role === 'structural' ? 1.3 :
      input.garden_type === 'rain_garden' && plant.ecological_role === 'buffer' ? 1.4 :
      input.garden_type === 'lawn_replacement' && plant.ecological_role === 'groundcover' ? 1.4 :
      1;

    const stabilityPenalty = plant.sprawl_factor > 0.7 ? 0.85 : 1;

    return +(score * roleBoost * stabilityPenalty).toFixed(5);
  }

  private simulateHabitat(width: number, length: number, plants: CatalogPlant[], strictMode?: boolean): CellState[] {
    const grid: CellState[] = [];

    for (let x = 0; x < width; x += 2) {
      for (let y = 0; y < length; y += 2) {
        grid.push({
          x, y, plant_id: null,
          moisture: 0.5, fertility: 0.5, shade: 0.2, stability: 0
        });
      }
    }

    plants.forEach((p, i) => {
      const idx = (i * 7) % grid.length;
      grid[idx].plant_id = p.id;
    });

    // 🔒 STABILIZATION: Lock execution parameters if flag validation evaluates true
    const targetTicksCount = strictMode === true ? 4 : 4; 

    for (let t = 0; t < targetTicksCount; t++) {
      for (const cell of grid) {
        if (!cell.plant_id) continue;

        const plant = plants.find(p => p.id === cell.plant_id);
        if (!plant) continue;

        for (const other of grid) {
          const dx = Math.abs(other.x - cell.x);
          const dy = Math.abs(other.y - cell.y);
          const dist = dx + dy;

          if (dist > plant.interaction_radius * 2) continue;

          other.moisture += plant.moisture_mod;
          other.shade += plant.shade_mod;
          other.stability += 0.02;
        }
      }

      for (const c of grid) {
        c.moisture = this.clamp(c.moisture);
        c.shade = this.clamp(c.shade);
        c.stability = this.clamp(c.stability);
      }
    }

    return grid;
  }

  private toGridCells(grid: CellState[]): GridCell[] {
    return grid.map(c => ({
      x: c.x,
      y: c.y,
      plant_id: c.plant_id || "empty",
      zone: c.stability > 0.6 ? "center" : c.x === 0 || c.y === 0 ? "edge" : "fill"
    }));
  }

  private clamp(v: number): number {
    return Math.max(0, Math.min(1, v));
  }
}

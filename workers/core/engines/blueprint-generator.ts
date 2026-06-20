// Define internal strict types for the engine
interface SiteContext {
  state: string;
  county: string;
  garden_type: string;
  pathway_choice: string;
  soil_type: string;
}

interface GeneratorPayload {
  width: number;
  height: number;
  length?: number; // Handle both key styles seamlessly
  density: number;
  site_context?: SiteContext;
  timestamp: string;
}

interface CellOutput {
  zone: 'EDGE' | 'CORE' | 'FILL' | 'MATRIX_GRASS';
  scientific_name: string;
  common_name: string;
  type: 'flower' | 'grass' | 'shrub';
}

/**
 * Ecosystem Blueprint Generator Matrix Engine
 * Implements Phase 1 Step 2: Clustered Ecological Drift Layouts
 */
export class BlueprintGenerator {
  
  /**
   * Main Generation Vector Routing Loop
   */
  public static generate(payload: GeneratorPayload): any {
    const width = Number(payload.width || 12);
    // Support consistent multi-naming mapping variables safely
    const length = Number(payload.length || payload.height || 12);
    const density = Number(payload.density || 0.5);
    const ctx = payload.site_context || {
      state: 'MI',
      county: '',
      garden_type: 'pollinator',
      pathway_choice: 'none',
      soil_type: 'rich-loam'
    };

    // Initialize an empty layout coordinate map matrix
    const matrix: CellOutput[][] = Array(length).fill(null).map(() => 
      Array(width).fill(null).map(() => ({
        zone: 'MATRIX_GRASS',
        scientific_name: 'Prairie Dropseed',
        common_name: 'Prairie Dropseed (Matrix)',
        type: 'grass'
      }))
    );

    // Track multi-tile footprints using a structural placement collision grid
    const structuralMask = Array(length).fill(null).map(() => Array(width).fill(false));

    // Determine target balance metrics based on structural Garden Theme Type
    const isWoodland = ctx.garden_type === 'woodland';
    const isMeadow = ctx.garden_type === 'meadow';
    const isRainGarden = ctx.garden_type === 'rain-garden';
    const isDeerResistant = ctx.garden_type === 'deer-resistant';

    // Establish dynamic composition limits scaled directly to Plot Size boundaries
    const totalSqFt = width * length;
    const maxDrifts = totalSqFt < 64 ? 2 : totalSqFt < 200 ? 5 : 9;
    const includeShrubs = totalSqFt >= 100 && (isWoodland || ctx.garden_type === 'low-maintenance' || isRainGarden);

    // Seed 1: Shrub Placement Logic (Anchors occupying 2x2 or larger footprints)
    if (includeShrubs) {
      const shrubCount = totalSqFt < 200 ? 1 : 2;
      for (let s = 0; s < shrubCount; s++) {
        // Position anchors near intermediate core-center boundaries
        const targetY = Math.floor(length / 3) + (s * 2);
        const targetX = Math.floor(width / 3) + (s * 2);

        if (targetY + 1 < length && targetX + 1 < width) {
          const shrubName = isWoodland ? "Serviceberry" : "Buttonbush";
          const shrubSci = isWoodland ? "Amelanchier laevis" : "Cephalanthus occidentalis";
          
          // Allocate a multi-tile block footprint configuration
          for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
              matrix[targetY + dy][targetX + dx] = {
                zone: 'CORE',
                scientific_name: shrubSci,
                common_name: `${shrubName} Shrub Anchor`,
                type: 'shrub'
              };
              structuralMask[targetY + dy][targetX + dx] = true;
            }
          }
        }
      }
    }

    // Seed 2: Deterministic Clustered Flower Drifts Engine (3-9 irregular cell groups)
    for (let d = 0; d < maxDrifts; d++) {
      // Deterministic generation values based on seed input matrices
      const seedY = Math.floor((Math.abs(Math.sin(d * 45.3 + 12.1)) * 100) % length);
      const seedX = Math.floor((Math.abs(Math.cos(d * 23.7 + 89.4)) * 100) % width);
      
      if (structuralMask[seedY][seedX]) continue;

      // Determine height stratification rules based on coordinate perimeter distance
      const distanceToEdgeY = Math.min(seedY, length - 1 - seedY);
      const distanceToEdgeX = Math.min(seedX, width - 1 - seedX);
      const minPerimeterDist = Math.min(distanceToEdgeY, distanceToEdgeX);

      let chosenZone: 'EDGE' | 'CORE' | 'FILL' = 'FILL';
      let speciesName = "Rough Blazing Star";
      let speciesSci = "Liatris aspera";

      if (minPerimeterDist === 0) {
        // Height Stratification: Edge Border Perennials (Short)
        chosenZone = 'EDGE';
        speciesName = isRainGarden ? "Fox Sedge" : isDeerResistant ? "Wild Bergamot" : "Common Milkweed";
        speciesSci = isRainGarden ? "Carex vulpinoidea" : isDeerResistant ? "Monarda fistulosa" : "Asclepias syriaca";
      } else if (minPerimeterDist > Math.floor(Math.min(width, length) / 4)) {
        // Height Stratification: Core Center Structural Backbones (Tall)
        chosenZone = 'CORE';
        speciesName = isRainGarden ? "Swamp Milkweed" : isMeadow ? "Big Bluestem" : "Purple Coneflower";
        speciesSci = isRainGarden ? "Asclepias incarnata" : isMeadow ? "Andropogon gerardii" : "Echinacea purpurea";
      }

      // Bleed Drift Cluster into neighboring coordinate points
      const driftSize = 3 + Math.floor((Math.abs(Math.sin(d * 14.2)) * 100) % 7); // Clustered group sizes of 3-9
      let placedInDrift = 0;

      for (let steps = 0; steps < driftSize * 2 && placedInDrift < driftSize; steps++) {
        const offsetX = Math.floor(Math.sin(steps * 1.5) * 1.9);
        const offsetY = Math.floor(Math.cos(steps * 1.5) * 1.9);
        const targetY = Math.max(0, Math.min(length - 1, seedY + offsetY));
        const targetX = Math.max(0, Math.min(width - 1, seedX + offsetX));

        if (!structuralMask[targetY][targetX]) {
          matrix[targetY][targetX] = {
            zone: chosenZone,
            scientific_name: speciesSci,
            common_name: speciesName,
            type: 'flower'
          };
          structuralMask[targetY][targetX] = true;
          placedInDrift++;
        }
      }
    }

    // Step 3: Construct Interstitial Matrix (Structural grasses weaving through remaining blocks)
    for (let y = 0; y < length; y++) {
      for (let x = 0; x < width; x++) {
        if (!structuralMask[y][x]) {
          // Select continuous local matrix grasses based on environmental variables
          const grassName = isRainGarden ? "Fox Sedge" : isWoodland ? "Bottlebrush Grass" : "Prairie Dropseed";
          const grassSci = isRainGarden ? "Carex vulpinoidea" : isWoodland ? "Elymus hystrix" : "Sporobolus heterolepis";

          matrix[y][x] = {
            zone: 'MATRIX_GRASS',
            scientific_name: grassSci,
            common_name: `${grassName} (Matrix)`,
            type: 'grass'
          };
        }
      }
    }

    // Reformat coordinate structure block maps into client payload
    const formattedCells = [];
    for (let y = 0; y < length; y++) {
      for (let x = 0; x < width; x++) {
        const targetCell = matrix[y][x];
        formattedCells.push({
          x: x,
          y: y,
          zone: targetCell.zone === 'MATRIX_GRASS' ? 'FILL' : targetCell.zone, // Maintain legacy frontend compatibility mapping
          plant_id: targetCell.zone,
          common_name: targetCell.common_name,
          scientific_name: targetCell.scientific_name
        });
      }
    }

    return {
      status: "success",
      message: "Landscape grid constraints initialized successfully.",
      timestamp: new Date().toISOString(),
      grid_layout: {
        width: width,
        length: length,
        density: density,
        cells: formattedCells
      },
      received: payload
    };
  }
}

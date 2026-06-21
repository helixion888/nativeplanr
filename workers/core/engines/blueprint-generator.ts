/**
 * NativePlanr Vanilla JavaScript Edge Engine
 * Core Layout, Rigid Allocation Caps & Variety Expansion Pipeline
 */
class BlueprintGenerator {
  static generate(payload) {
    const width = Number(payload.width || 12);
    const length = Number(payload.length || payload.height || 12);
    const density = Number(payload.density || 0.5);
    const ctx = payload.site_context || {
      state: 'MI',
      county: '',
      garden_type: 'pollinator',
      pathway_choice: 'none',
      soil_type: 'rich-loam'
    };

    const gardenType = ctx.garden_type || 'pollinator';
    const totalCells = width * length;

    // ==========================================
    // 1. STRICT USER-TESTING MAXIMUM GRASS CAPS
    // ==========================================
    const rulesets = {
      'pollinator':       { name: 'Butterfly & Pollinator Garden',  forb: [75, 80], grassMax: 20, shrub: [0, 10]  },
      'meadow':           { name: 'Native Meadow Garden',          forb: [45, 50], grassMax: 45, shrub: [0, 10]  },
      'woodland':         { name: 'Woodland Edge Garden',          forb: [35, 40], grassMax: 30, shrub: [25, 35] },
      'part-shade':       { name: 'Part Shade Flower Garden',      forb: [60, 65], grassMax: 25, shrub: [0, 15]  },
      'rain-garden':      { name: 'Wet Soil / Rain Garden',        forb: [60, 65], grassMax: 25, shrub: [0, 15]  },
      'low-maintenance':  { name: 'Low-Maintenance Native Garden', forb: [45, 50], grassMax: 45, shrub: [0, 10]  },
      'deer-resistant':   { name: 'Deer-Resistant Native Garden',  forb: [70, 75], grassMax: 25, shrub: [0, 10]  }
    };

    const activeRule = rulesets[gardenType] || rulesets['pollinator'];
    const maxGrassAllowedCells = Math.floor((activeRule.grassMax / 100) * totalCells);

    // Dynamic Scale Tiers
    let scaleTier = 'medium';
    let targetDriftSize = [5, 12];
    if (totalCells <= 16) {
      scaleTier = 'small';
      targetDriftSize = [1, 2]; // Force micro-drifts for small grids to maintain diversity
    } else if (totalCells <= 100) {
      scaleTier = 'medium-small';
      targetDriftSize = [3, 5];
    } else if (totalCells >= 400) {
      scaleTier = 'large';
      targetDriftSize = [12, 30];
    }

    const matrix = Array(length).fill(null).map(() => Array(width).fill(null));
    const structuralMask = Array(length).fill(null).map(() => Array(width).fill(false));

    const isWoodland = gardenType === 'woodland';
    const isMeadow = gardenType === 'meadow';
    const isRainGarden = gardenType === 'rain-garden';
    const isDeerResistant = gardenType === 'deer-resistant';
    const isLowMaint = gardenType === 'low-maintenance';
    const isPartShade = gardenType === 'part-shade';

    // ==========================================
    // 2. BACKEND INFRASTRUCTURE MAPPING
    // ==========================================
    const hasPath = ctx.pathway_choice && ctx.pathway_choice !== 'none';
    let pathCellCount = 0;

    // Map internal code tokens directly to readable user labels
    const pathLabelMap = {
      'grass': 'Grass Path',
      'woodchips': 'Woodchip Path',
      'gravel': 'Gravel Path',
      'pavers': 'Paver Path',
      'dirt': 'Dirt Path'
    };
    const publicPathLabel = pathLabelMap[ctx.pathway_choice] || 'Path';

    if (hasPath) {
      for (let y = 0; y < length; y++) {
        for (let x = 0; x < width; x++) {
          let isPathCell = false;
          if (scaleTier === 'small') {
            isPathCell = (y === x && y < 2);
          } else if (scaleTier === 'large') {
            const centerY = length / 2;
            const centerX = width / 2;
            const normDist = Math.pow((y - centerY) / (length / 3), 2) + Math.pow((x - centerX) / (width / 3), 2);
            isPathCell = (normDist >= 0.8 && normDist <= 1.2);
          } else {
            const centerLineX = Math.floor(width / 2) + Math.floor(Math.sin(y * 0.8) * (width / 4));
            isPathCell = (x === centerLineX);
          }

          if (isPathCell) {
            matrix[y][x] = {
              zone: 'PATH',
              scientific_name: 'Infrastructure Layer',
              common_name: publicPathLabel, // FIXED: Removed "Pathway Data Node"
              type: 'path'
            };
            structuralMask[y][x] = true;
            pathCellCount++;
          }
        }
      }
    }

    // ==========================================
    // 3. STRUCTURAL SHRUBS SEEDING
    // ==========================================
    let placedShrubCells = 0;
    if (activeRule.shrub && activeRule.shrub[0] > 0 && scaleTier !== 'small' && scaleTier !== 'medium-small') {
      const targetShrubY = Math.floor(length / 2);
      const targetShrubX = Math.floor(width / 2);

      if (!structuralMask[targetShrubY][targetShrubX]) {
        const shrubName = isWoodland ? "Serviceberry Shrub Anchor" : "Buttonbush Shrub Anchor";
        const shrubSci = isWoodland ? "Amelanchier laevis" : "Cephalanthus occidentalis";

        matrix[targetShrubY][targetShrubX] = {
          zone: 'CORE',
          scientific_name: shrubSci,
          common_name: shrubName,
          type: 'shrub'
        };
        structuralMask[targetShrubY][targetShrubX] = true;
        placedShrubCells++;
      }
    }

    // ==========================================
    // 4. DETAILED BOTANICAL PALETTE DEFINITIONS
    // ==========================================
    let pool = [];
    if (isWoodland) {
      pool = [
        { name: "Wild Columbine", sci: "Aquilegia canadensis" },
        { name: "Wild Ginger Groundcover", sci: "Asarum canadense" },
        { name: "Jacob's Ladder", sci: "Polemonium reptans" }
      ];
    } else if (isRainGarden) {
      pool = [
        { name: "Swamp Milkweed", sci: "Asclepias incarnata" },
        { name: "Marsh Marigold", sci: "Caltha palustris" },
        { name: "Blue Flag Iris", sci: "Iris versicolor" }
      ];
    } else if (isPartShade) {
      pool = [
        { name: "Cardinal Flower", sci: "Lobelia cardinalis" },
        { name: "Jacob's Ladder", sci: "Polemonium reptans" },
        { name: "Wild Columbine", sci: "Aquilegia canadensis" }
      ];
    } else {
      // Pollinator, Meadow, Low-Maint, Deer-Resistant baseline pools
      pool = [
        { name: "Purple Coneflower", sci: "Echinacea purpurea" },
        { name: "Rough Blazing Star", sci: "Liatris aspera" },
        { name: "Common Milkweed", sci: "Asclepias syriaca" },
        { name: "Wild Bergamot", sci: "Monarda fistulosa" },
        { name: "Black-Eyed Susan", sci: "Rudbeckia hirta" }
      ];
    }

    // DATASET LIMITATION SAFEGUARD CLAUSE
    const datasetNotice = pool.length < 5 ? "Notice: Limited local species array constraint active." : "Full palette optimized.";

    // ==========================================
    // 5. ALLOCATION QUOTA LOOP (Continuous Forbs)
    // ==========================================
    let placedForbCells = 0;
    let seedIndex = 0;
    // Target count claims all space minus path, shrubs, and maximum allowed grass cap
    const targetMinimumForbCells = totalCells - pathCellCount - placedShrubCells - maxGrassAllowedCells;

    while ((placedForbCells < targetMinimumForbCells || structuralMask.flat().includes(false)) && seedIndex < 300) {
      const seedY = Math.floor((Math.abs(Math.sin(seedIndex * 83.3 + 29.1)) * 1000) % length);
      const seedX = Math.floor((Math.abs(Math.cos(seedIndex * 47.1 + 61.4)) * 1000) % width);

      if (structuralMask[seedY][seedX]) {
        seedIndex++;
        continue;
      }

      // Rotate through species selection pool systematically to force max diversity
      const speciesIndex = seedIndex % pool.length;
      const chosenSpecies = pool[speciesIndex];

      const baseRandomSize = targetDriftSize[0] + Math.floor((Math.abs(Math.sin(seedIndex * 11.2)) * 100) % (targetDriftSize[1] - targetDriftSize[0] + 1));
      
      // Enforce strict 40% single species caps on small plots
      let allowedDriftLimit = baseRandomSize;
      if (scaleTier === 'small' || scaleTier === 'medium-small') {
        const maxSingleSpeciesCells = Math.max(2, Math.floor(0.4 * totalCells));
        allowedDriftLimit = Math.min(baseRandomSize, maxSingleSpeciesCells);
      }

      const queue = [[seedY, seedX]];
      let currentDriftPlaced = 0;
      const visited = Array(length).fill(null).map(() => Array(width).fill(false));
      visited[seedY][seedX] = true;

      while (queue.length > 0 && currentDriftPlaced < allowedDriftLimit) {
        const [cy, cx] = queue.shift();

        if (!structuralMask[cy][cx]) {
          matrix[cy][cx] = {
            zone: seedIndex % 3 === 0 ? 'CORE' : seedIndex % 3 === 1 ? 'EDGE' : 'FILL',
            scientific_name: chosenSpecies.sci,
            common_name: chosenSpecies.name,
            type: 'flower'
          };
          structuralMask[cy][cx] = true;
          currentDriftPlaced++;
          placedForbCells++;

          const neighbors = [[cy - 1, cx], [cy + 1, cx], [cy, cx - 1], [cy, cx + 1]];
          for (const [ny, nx] of neighbors) {
            if (ny >= 0 && ny < length && nx >= 0 && nx < width && !visited[ny][nx] && !structuralMask[ny][nx]) {
              visited[ny][nx] = true;
              queue.push([ny, nx]);
            }
          }
        }
      }
      seedIndex++;
    }

    // ==========================================
    // 6. WEAVE SUPPORTIVE MATRIX GRASSES LAST
    // ==========================================
    let placedGrassCells = 0;
    const grassName = isRainGarden ? "Fox Sedge (Matrix)" : isWoodland ? "Bottlebrush Grass (Matrix)" : "Prairie Dropseed (Matrix)";
    const grassSci = isRainGarden ? "Carex vulpinoidea" : isWoodland ? "Elymus hystrix" : "Sporobolus heterolepis";

    for (let y = 0; y < length; y++) {
      for (let x = 0; x < width; x++) {
        // Grass fills left over cells ONLY if we haven't breached the hard ceiling cap
        if (!structuralMask[y][x] && placedGrassCells < maxGrassAllowedCells) {
          matrix[y][x] = {
            zone: 'MATRIX_GRASS',
            scientific_name: grassSci,
            common_name: grassName,
            type: 'grass'
          };
          structuralMask[y][x] = true;
          placedGrassCells++;
        } else if (!structuralMask[y][x]) {
          // If grass limit is exhausted, emergency fill remainder with pool flowers
          const backupFlower = pool[x % pool.length];
          matrix[y][x] = {
            zone: 'FILL',
            scientific_name: backupFlower.sci,
            common_name: backupFlower.name,
            type: 'flower'
          };
          structuralMask[y][x] = true;
          placedForbCells++;
        }
      }
    }

    // Compile legacy response structure mapping arrays
    const formattedCells = [];
    const uniquePlantsFound = new Set();

    for (let y = 0; y < length; y++) {
      for (let x = 0; x < width; x++) {
        const cell = matrix[y][x];
        uniquePlantsFound.add(cell.common_name);

        formattedCells.push({
          x: x,
          y: y,
          zone: cell.zone === 'MATRIX_GRASS' ? 'FILL' : cell.zone,
          plant_id: cell.zone === 'MATRIX_GRASS' ? 'MATRIX_GRASS' : cell.zone,
          common_name: cell.common_name,
          scientific_name: cell.scientific_name
        });
      }
    }

    const actualForbPct  = Math.round((placedForbCells / totalCells) * 100);
    const actualGrassPct = Math.round((placedGrassCells / totalCells) * 100);
    const actualShrubPct = Math.round((placedShrubCells / totalCells) * 100);

    return {
      status: "success",
      message: "Landscape grid constraints initialized successfully.",
      timestamp: new Date().toISOString(),
      dataset_log: datasetNotice,
      
      diagnostics: {
        design_profile: activeRule.name,
        scale_tier_calculated: scaleTier,
        target_ratios: `Forb Target Minimum: ${targetMinimumForbCells} cells, Hard Grass Max Cap: ${maxGrassAllowedCells} cells`,
        actual_ratios_produced: `Forb: ${actualForbPct}%, Grass: ${actualGrassPct}%, Shrub: ${actualShrubPct}%`,
        unique_plant_count: uniquePlantsFound.size,
        pathway_cells_reserved: pathCellCount
      },

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

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url);

    if (url.pathname === "/api/import" && request.method === "POST") {
      try {
        const incomingPayload = await request.json();
        const generatedResult = BlueprintGenerator.generate(incomingPayload);

        return new Response(JSON.stringify(generatedResult), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid payload formatting structure" }), {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  },
};

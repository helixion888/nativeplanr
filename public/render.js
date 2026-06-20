window.renderBotanicalGrid = function(canvasInstance, apiResponse, siteContext) {
  const displayContainer = canvasInstance.matrixDisplay;
  if (!displayContainer) return;

  displayContainer.innerHTML = '';

  // Extract explicit layout boundaries
  const plotWidth = Number(apiResponse?.grid_layout?.width || siteContext?.width || 12);
  const plotLength = Number(apiResponse?.grid_layout?.length || apiResponse?.grid_layout?.height || siteContext?.length || 12);
  
  const backendCells = apiResponse?.grid_layout?.cells || [];
  
  // Guard Clause against empty or completely missing layout payloads
  if (!plotWidth || !plotLength || backendCells.length === 0) {
    displayContainer.innerHTML = `
      <div class="canvas-error-state">
        <h3>Ecosystem Design Blueprint Empty</h3>
        <p>The network pipeline completed successfully, but no habitat layout cells were returned from the backend. Please re-run selection matrix metrics.</p>
      </div>
    `;
    return;
  }

  // Label Dictionary Mappings for Summary Panel text strings
  const gardenTypeMap = {
    'pollinator': 'Butterfly & Pollinator Garden',
    'woodland': 'Woodland Edge Garden',
    'part-shade': 'Part Shade Flower Garden',
    'rain-garden': 'Wet Soil / Rain Garden',
    'meadow': 'Native Meadow Garden',
    'low-maintenance': 'Low-Maintenance Native Garden',
    'deer-resistant': 'Deer-Resistant Native Garden'
  };

  const soilTypeMap = {
    'rich-loam': 'Rich Loam',
    'sandy': 'Sandy / Fast Draining',
    'slight-clay': 'Slightly Clay',
    'heavy-clay': 'Heavy Clay',
    'wet-soggy': 'Wet / Soggy',
    'swampy': 'Swampy / Standing Water'
  };

  const pathTypeMap = {
    'none': 'No path through design',
    'grass': 'Grass Path',
    'woodchips': 'Woodchip Path',
    'gravel': 'Gravel Path',
    'pavers': 'Paver Path',
    'dirt': 'Dirt Path'
  };

  const stateName = siteContext.state;
  const countyName = siteContext.county ? `${siteContext.county} County, ` : '';
  const readableGardenType = gardenTypeMap[siteContext.gardenType] || 'Native Habitat';
  const readableSoilType = soilTypeMap[siteContext.soilType] || 'Unclassified Soil';
  const readablePathType = pathTypeMap[siteContext.pathwayChoice] || 'No Path';

  const globalPathStatus = siteContext.pathwayChoice !== 'none';

  let designRationale = `This design favors long-blooming native species, key host plants, and structural root configurations that support biodiversity through the season.`;
  if (siteContext.gardenType === 'pollinator') {
    designRationale = `This plan favors long-blooming native flowers, specialized monarch host plants (Asclepias), and structural prairie architectures that support pollinators from spring emergence through autumn migrations.`;
  } else if (siteContext.gardenType === 'rain-garden') {
    designRationale = `Optimized for hydric soil profiles, this arrangement selects species with deep, fibrous root vectors capable of processing rapid stormwater influxes while offering vital stabilizing habitat.`;
  } else if (siteContext.gardenType === 'deer-resistant') {
    designRationale = `This configuration highlights highly aromatic foliage, milky saps, and textured structural elements that naturally discourage foraging pressure without compromising pollinator resource value.`;
  }

  const dashboard = document.createElement('div');
  dashboard.className = 'simulation-dashboard';

  dashboard.innerHTML = `
    <div class="botanical-summary-panel">
      <h3 class="summary-headline">Site Habitat Profile</h3>
      <div class="summary-details-grid">
        <div class="summary-item"><strong>Location:</strong> <span>${countyName}${stateName}</span></div>
        <div class="summary-item"><strong>Garden Theme:</strong> <span>${readableGardenType}</span></div>
        <div class="summary-item"><strong>Substrate:</strong> <span>${readableSoilType}</span></div>
        <div class="summary-item"><strong>Infrastructure:</strong> <span>${readablePathType}</span></div>
        <div class="summary-item"><strong>Plot Area:</strong> <span>${plotWidth} ft × ${plotLength} ft</span></div>
        <div class="summary-item"><strong>Total Placements:</strong> <span id="summary-total-plugs-count">Calculating...</span></div>
      </div>
      <p class="summary-educational-text"><strong>Ecological Rationale:</strong> ${designRationale}</p>
    </div>

    <header class="blueprint-section-header">
      <h2 class="panel-headline">Your Ecosystem Planting Design</h2>
    </header>

    <div class="viewport-controls">
      <button type="button" class="zoom-btn" id="zoom-out-action">Zoom Out (-)</button>
      <button type="button" class="zoom-btn" id="zoom-reset-action">Reset View</button>
      <span id="zoom-percentage-label">100% Map Scale</span>
      <button type="button" class="zoom-btn" id="zoom-in-action">Zoom In (+)</button>
    </div>

    <div class="mobile-viewport-container">
      <div class="spatial-grid-matrix" id="interactive-matrix-canvas"></div>
    </div>

    <div class="zone-legend" id="dark-legend-container-box"></div>
  `;

  displayContainer.appendChild(dashboard);

  const gridContainer = document.getElementById('interactive-matrix-canvas');
  gridContainer.style.setProperty('--grid-cols', plotWidth);
  gridContainer.style.setProperty('--grid-rows', plotLength);

  let plantCounts = {};
  let pathCellCount = 0;

  const emojiInventory = {
    'Common Milkweed': '🌿',
    'Purple Coneflower': '🌸',
    'Rough Blazing Star': '🔮',
    'Prairie Dropseed (Matrix)': '🌾',
    'Fox Sedge (Matrix)': '🌾',
    'Bottlebrush Grass (Matrix)': '🌾',
    'Serviceberry Shrub Anchor': '🌳',
    'Buttonbush Shrub Anchor': '🌳'
  };

  const zoneStyleMap = {
    'EDGE': 'zone-edge',
    'CORE': 'zone-center',
    'FILL': 'zone-fill',
    'MATRIX_GRASS': 'zone-open'
  };

  const orderedCells = [...backendCells].sort((a, b) => (a.y - b.y) || (a.x - b.x));

  orderedCells.forEach((cellData) => {
    const tile = document.createElement('div');
    tile.className = 'matrix-tile';

    const currentY = cellData.y;
    const isPathRow = (currentY === Math.floor(plotLength / 2));

    if (globalPathStatus && isPathRow) {
      tile.classList.add(`path-style-${siteContext.pathwayChoice}`);
      tile.innerHTML = `
        <span class="tile-icon-element">🪵</span>
        <span class="tile-label">PATH</span>
      `;
      pathCellCount++;
    } else {
      const commonName = cellData.common_name || cellData.plant_id || 'Unknown Flora';
      const zoneKey = cellData.zone || 'FILL';
      
      let stylingClass = zoneStyleMap[zoneKey] || 'zone-fill';
      if (commonName.includes('(Matrix)')) {
        stylingClass = 'zone-open';
      }

      const iconSymbol = emojiInventory[commonName] || '🌱';

      tile.classList.add(stylingClass);
      tile.innerHTML = `
        <span class="tile-icon-element">${iconSymbol}</span>
        <span class="tile-label">${commonName}</span>
      `;

      plantCounts[commonName] = (plantCounts[commonName] || 0) + 1;
    }

    gridContainer.appendChild(tile);
  });

  let cumulativePlugs = 0;
  Object.values(plantCounts).forEach(c => cumulativePlugs += c);
  document.getElementById('summary-total-plugs-count').innerText = `${cumulativePlugs} Est. Plugs`;

  const legendElement = document.getElementById('dark-legend-container-box');
  legendElement.className = 'zone-legend';

  let legendMarkup = '';
  Object.

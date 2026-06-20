window.renderBotanicalGrid = function(canvasInstance, apiResponse, siteContext) {
  const displayContainer = canvasInstance.matrixDisplay;
  if (!displayContainer) return;

  displayContainer.innerHTML = '';

  // Extract explicit layout boundaries
  const plotWidth = Number(apiResponse?.grid_layout?.width || siteContext?.width || 12);
  const plotLength = Number(apiResponse?.grid_layout?.length || apiResponse?.grid_layout?.height || siteContext?.length || 12);
  
  // 1. EXTRACT LIVE SERVER ARRAY (Strictly utilize backend cells array payload)
  const backendCells = apiResponse?.grid_layout?.cells || [];
  
  // Guard Clause against empty or completely missing layout payloads
  if (!plotWidth || !plotLength || backendCells.length === 0) {
    displayContainer.innerHTML = `
      <div class="canvas-error-state">
        <h3>Ecosystem Design Blueprint Empty</h3>
        <p>The network pipeline was completed successfully, but no habitat layout cells were returned from the backend instance. Please re-run selection matrix metrics.</p>
      </div>
    `;
    return;
  }

  // 2. RUNTIME TELEMETRY DIAGNOSTICS GENERATION BLOCK
  const uniquePlantNames = [...new Set(backendCells.map(c => c.common_name || c.plant_id))];
  const diagnosticsSnippet = backendCells.slice(0, 5);

  const debugPanel = document.createElement('div');
  debugPanel.style.cssText = 'background:#faf0e6; border:2px dashed #2e5c3e; padding:1rem; font-family:monospace; font-size:0.8rem; margin-bottom:1.5rem; color:#2c2520; border-radius:4px; text-align:left; line-height:1.4;';
  debugPanel.innerHTML = `
    <strong>[TELEMETRY PIPELINE DIAGNOSTICS]</strong><br>
    • Source Authentication: <span style="color:#2e5c3e;font-weight:bold;">Backend layout received successfully.</span><br>
    • Total Backend Cells Received in Wire: <strong>${backendCells.length} cells</strong><br>
    • Unique Plant Varieties in Payload: <strong>${uniquePlantNames.length}</strong> (${uniquePlantNames.join(', ')})<br>
    • Raw Matrix Sample Data (First 5 Cells):
    <pre style="background:#fbf9f5; padding:0.5rem; margin-top:0.5rem; overflow:auto; border:1px solid #dfdacb; font-size:0.75rem;">${JSON.stringify(diagnosticsSnippet, null, 2)}</pre>
  `;
  displayContainer.appendChild(debugPanel);

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

  // Initialize tracking counts
  let plantCounts = {};
  let pathCellCount = 0;

  // Icon repository pulled cleanly from public domain field parameters
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

  // Sort and order incoming elements based strictly on coordinates array
  const orderedCells = [...backendCells].sort((a, b) => (a.y - b.y) || (a.x - b.x));

  // 3. MAP DIRECT ARRAY LAYER ITERATION (No client-side mathematical generation variables)
  orderedCells.forEach((cellData) => {
    const tile = document.createElement('div');
    tile.className = 'matrix-tile';

    const currentY = cellData.y;
    const isPathRow = (currentY === Math.floor(plotLength / 2));

    // frontend-only infrastructure pathway mask overlay injection logic
    if (globalPathStatus && isPathRow) {
      tile.classList.add(`path-style-${siteContext.pathwayChoice}`);
      tile.innerHTML = `
        <span class="tile-icon-element">🪵</span>
        <span class="tile-label">PATH</span>
      `;
      pathCellCount++;
    } else {
      // Pull structural variables directly derived from API cell entries
      const commonName = cellData.common_name || cellData.plant_id || 'Unknown Flora';
      const zoneKey = cellData.zone || 'FILL';
      
      // Determine structural class tokens smoothly
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

      // Track quantities matrices dynamically
      plantCounts[commonName] = (plantCounts[commonName] || 0) + 1;
    }

    gridContainer.appendChild(tile);
  });

  // Calculate live plugs count accurately
  let cumulativePlugs = 0;
  Object.values(plantCounts).forEach(c => cumulativePlugs += c);
  document.getElementById('summary-total-plugs-count').innerText = `${cumulativePlugs} Est. Plugs`;

  // Draw legend
  const legendElement = document.getElementById('dark-legend-container-box');
  legendElement.className = 'zone-legend';

  let legendMarkup = '';
  Object.entries(plantCounts).forEach(([name, count]) => {
    let swatchClass = 'zone-fill';
    if (name.includes('Milkweed')) swatchClass = 'zone-edge';
    if (name.includes('Coneflower') || name.includes('Shrub')) swatchClass = 'zone-center';
    if (name.includes('(Matrix)')) swatchClass = 'zone-open';

    legendMarkup += `
      <div class="legend-item">
        <span class="legend-color ${swatchClass}"></span>
        <div><strong>${name}:</strong> ${count} Plugs Ordered</div>
      </div>
    `;
  });

  if (globalPathStatus) {
    legendMarkup += `
      <div class="legend-item">
        <span class="legend-color path-style-${siteContext.pathwayChoice}"></span>
        <div><strong>Infrastructure:</strong> ${readablePathType} (${pathCellCount} sq ft)</div>
      </div>
    `;
  }

  legendElement.innerHTML = legendMarkup;

  // Track viewport dimensions map zooms actions
  attachInteractiveScaleActions(canvasInstance, gridContainer);
};

function attachInteractiveScaleActions(canvasInstance, gridContainer) {
  const zoomIn = document.getElementById('zoom-in-action');
  const zoomOut = document.getElementById('zoom-out-action');
  const zoomReset = document.getElementById('zoom-reset-action');
  const zoomLabel = document.getElementById('zoom-percentage-label');

  if (!zoomIn || !zoomOut || !zoomReset || !zoomLabel) return;

  canvasInstance.currentScale = 100;

  zoomIn.addEventListener('click', () => {
    if (canvasInstance.currentScale < 200) {
      canvasInstance.currentScale += 20;
      gridContainer.style.transform = `scale(${canvasInstance.currentScale / 100})`;
      zoomLabel.innerText = `${canvasInstance.currentScale}% Map Scale`;
    }
  });

  zoomOut.addEventListener('click', () => {
    if (canvasInstance.currentScale > 60) {
      canvasInstance.currentScale -= 20;
      gridContainer.style.transform = `scale(${canvasInstance.currentScale / 100})`;
      zoomLabel.innerText = `${canvasInstance.currentScale}% Map Scale`;
    }
  });

  zoomReset.addEventListener('click', () => {
    canvasInstance.currentScale = 100;
    gridContainer.style.transform = 'scale(1)';
    zoomLabel.innerText = '100% Map Scale';
  });
}

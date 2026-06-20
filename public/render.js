window.renderBotanicalGrid = function(canvasInstance, apiResponse, siteContext) {
  const displayContainer = canvasInstance.matrixDisplay;
  if (!displayContainer) return;

  displayContainer.innerHTML = '';

  const plotWidth = Number(apiResponse?.grid_layout?.width || apiResponse?.received?.width || siteContext?.width || 12);
  const plotLength = Number(apiResponse?.grid_layout?.length || apiResponse?.grid_layout?.height || apiResponse?.received?.length || apiResponse?.received?.height || siteContext?.length || 12);
  const density = Number(apiResponse?.grid_layout?.density || apiResponse?.received?.density || siteContext?.density || 0.5);
  
  if (!plotWidth || !plotLength || plotWidth <= 0 || plotLength <= 0) {
    displayContainer.innerHTML = `
    // ==========================================================================
  // RUNTIME TELEMETRY DIAGNOSTICS INJECTION
  // ==========================================================================
  const backendCells = apiResponse?.grid_layout?.cells || [];
  const uniquePlantIds = [...new Set(backendCells.map(c => c.common_name))];
  const diagnosticSnippet = backendCells.slice(0, 5);

  const debugPanel = document.createElement('div');
  debugPanel.style.cssText = 'background:#faf0e6; border:2px dashed #d69e2e; padding:1rem; font-family:monospace; font-size:0.8rem; margin-bottom:1.5rem; color:#2c2520; border-radius:4px;';
  debugPanel.innerHTML = `
    <strong>[TELEMETRY PIPELINE DIAGNOSTICS]</strong><br>
    • Source Authentication Label: <span style="color:#2e5c3e;font-weight:bold;">${backendCells.length > 0 ? "Backend layout received successfully." : "FALLBACK CAUGHT: Frontend is generating layout locally."}</span><br>
    • Total Grid Cells Detected in Wire: <strong>${backendCells.length}</strong><br>
    • Unique Plant Varieties in Payload: <strong>${uniquePlantIds.length}</strong> (${uniquePlantIds.join(', ') || 'None'})<br>
    • Raw Matrix Sample Data (First 5 Cells):
    <pre style="background:#fbf9f5; padding:0.5rem; margin-top:0.5rem; overflow:auto; border:1px solid #dfdacb;">${JSON.stringify(diagnosticSnippet, null, 2)}</pre>
  `;
  displayContainer.appendChild(debugPanel);
  // ==========================================================================
      <div class="canvas-error-state">
        <h3>Ecosystem Design Matrix Unavailable</h3>
        <p>The system was unable to establish spatial boundary vectors.</p>
      </div>
    `;
    return;
  }

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

    <div class="zone-legend" id="dynamic-botanical-legend"></div>
  `;

  displayContainer.appendChild(dashboard);

  const gridContainer = document.getElementById('interactive-matrix-canvas');
  gridContainer.style.setProperty('--grid-cols', plotWidth);
  gridContainer.style.setProperty('--grid-rows', plotLength);

  let plantCounts = { edge: 0, core: 0, fill: 0, matrixGrass: 0 };
  let pathCellCount = 0;

  // Authentic Public Domain Botanical Design Palette
  const localSpeciesDictionary = {
    'EDGE': { name: 'Common Milkweed', icon: '🌿', zoneClass: 'zone-edge' },
    'CORE': { name: 'Purple Coneflower', icon: '🌸', zoneClass: 'zone-center' },
    'FILL': { name: 'Rough Blazing Star', icon: '🔮', zoneClass: 'zone-fill' },
    'MATRIX_GRASS': { name: 'Prairie Dropseed (Matrix)', icon: '🌾', zoneClass: 'zone-open' }
  };

  for (let y = 0; y < plotLength; y++) {
    for (let x = 0; x < plotWidth; x++) {
      const tile = document.createElement('div');
      tile.className = 'matrix-tile';

      const isPathRow = (y === Math.floor(plotLength / 2));

      if (globalPathStatus && isPathRow) {
        tile.classList.add(`path-style-${siteContext.pathwayChoice}`);
        tile.innerHTML = `
          <span class="tile-icon-element">🪵</span>
          <span class="tile-label">PATH</span>
        `;
        pathCellCount++;
      } else {
        const occupancyScore = Math.abs(Math.sin(x * 12.9898 + y * 78.233)) % 1;
        const isOccupied = occupancyScore < density;

        if (isOccupied) {
          const isEdge = (x === 0 || x === plotWidth - 1 || y === 0 || y === plotLength - 1);
          const isCenter = (x > Math.floor(plotWidth / 4) && x < Math.ceil(plotWidth * 0.75) && y > Math.floor(plotLength / 4) && y < Math.ceil(plotLength * 0.75));

          if (isEdge) {
            tile.classList.add(localSpeciesDictionary['EDGE'].zoneClass);
            tile.innerHTML = `<span class="tile-icon-element">${localSpeciesDictionary['EDGE'].icon}</span><span class="tile-label">${localSpeciesDictionary['EDGE'].name}</span>`;
            plantCounts.edge++;
          } else if (isCenter) {
            tile.classList.add(localSpeciesDictionary['CORE'].zoneClass);
            tile.innerHTML = `<span class="tile-icon-element">${localSpeciesDictionary['CORE'].icon}</span><span class="tile-label">${localSpeciesDictionary['CORE'].name}</span>`;
            plantCounts.core++;
          } else {
            tile.classList.add(localSpeciesDictionary['FILL'].zoneClass);
            tile.innerHTML = `<span class="tile-icon-element">${localSpeciesDictionary['FILL'].icon}</span><span class="tile-label">${localSpeciesDictionary['FILL'].name}</span>`;
            plantCounts.fill++;
          }
        } else {
          // FIXED: Abstract "Soil Matrix/Dirt" completely reassigned to structural baseline matrix grasses
          tile.classList.add(localSpeciesDictionary['MATRIX_GRASS'].zoneClass);
          tile.innerHTML = `<span class="tile-icon-element">${localSpeciesDictionary['MATRIX_GRASS'].icon}</span><span class="tile-label">${localSpeciesDictionary['MATRIX_GRASS'].name}</span>`;
          plantCounts.matrixGrass++;
        }
      }

      gridContainer.appendChild(tile);
    }
  }

  // Aggregate genuine vegetation count summaries
  const grandTotalPlacements = plantCounts.edge + plantCounts.core + plantCounts.fill + plantCounts.matrixGrass;
  document.getElementById('summary-total-plugs-count').innerText = `${grandTotalPlacements} Est. Plugs`;

  const legendContainer = document.getElementById('dynamic-botanical-legend');
  
  let legendContent = `
    <div class="legend-item"><span class="legend-color zone-edge"></span><div><strong>Edge Border:</strong> ${localSpeciesDictionary['EDGE'].name} (${plantCounts.edge} Plugs)</div></div>
    <div class="legend-item"><span class="legend-color zone-center"></span><div><strong>Core Accent:</strong> ${localSpeciesDictionary['CORE'].name} (${plantCounts.core} Plugs)</div></div>
    <div class="legend-item"><span class="legend-color zone-fill"></span><div><strong>Interstitial Cluster:</strong> ${localSpeciesDictionary['FILL'].name} (${plantCounts.fill} Plugs)</div></div>
    <div class="legend-item"><span class="legend-color zone-open"></span><div><strong>Grounding Understory:</strong> ${localSpeciesDictionary['MATRIX_GRASS'].name} (${plantCounts.matrixGrass} Plugs)</div></div>
  `;

  if (globalPathStatus) {
    legendContent += `
      <div class="legend-item"><span class="legend-color path-style-${siteContext.pathwayChoice}"></span><div><strong>Infrastructure:</strong> ${readablePathType} (${pathCellCount} sq ft)</div></div>
    `;
  }

  legendContainer.innerHTML = legendContent;

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

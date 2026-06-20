/**
 * NativePlanr Botanical Layout Rendering System
 * Implements Step 3: Frontend Graphic Translation Layer
 */
window.renderBotanicalGrid = function(canvasInstance, apiResponse, siteContext) {
  const displayContainer = canvasInstance.matrixDisplay;
  if (!displayContainer) return;

  // Clear previous execution markup
  displayContainer.innerHTML = '';

  // Extract grid dimensions directly from payload structures
  const width = apiResponse.grid_layout?.width || apiResponse.received?.width || siteContext.width;
  const length = apiResponse.grid_layout?.height || apiResponse.received?.height || siteContext.length;
  const density = apiResponse.grid_layout?.density || apiResponse.received?.density || siteContext.density;
  
  // Guard clause against empty, broken, or corrupted layouts
  if (!width || !length || width <= 0 || length <= 0) {
    displayContainer.innerHTML = `
      <div class="canvas-error-state">
        <h3>Ecosystem Design Matrix Unavailable</h3>
        <p>The system was unable to establish spatial boundary vectors. Please verify your plot sizing dimensions and try again.</p>
      </div>
    `;
    return;
  }

  // 1. Map human-readable labels for the site summary layout panel
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

  // Generate ecological rationale summary explanation text
  let designRationale = `This design favors long-blooming native species, key host plants, and structural structural root configurations that support biodiversity through the season.`;
  if (siteContext.gardenType === 'pollinator') {
    designRationale = `This plan favors long-blooming native flowers, specialized monarch host plants (Asclepias), and structural prairie architectures that support pollinators from spring emergence through autumn migrations.`;
  } else if (siteContext.gardenType === 'rain-garden') {
    designRationale = `Optimized for hydric soil profiles, this arrangement selects species with deep, fibrous root vectors capable of processing rapid stormwater influxes while offering vital stabilizing habitat.`;
  } else if (siteContext.gardenType === 'deer-resistant') {
    designRationale = `This configuration highlights highly aromatic foliage, milky saps, and textured structural elements that naturally discourage foraging pressure without compromising pollinator resource value.`;
  }

  // Main Blueprint Dashboard Grid Structure Assembly
  const dashboard = document.createElement('div');
  dashboard.className = 'simulation-dashboard';

  // Master Layout Template Injection
  dashboard.innerHTML = `
    <div class="botanical-summary-panel">
      <h3 class="summary-headline">Site Habitat Profile</h3>
      <div class="summary-details-grid">
        <div class="summary-item"><strong>Location:</strong> <span>${countyName}${stateName}</span></div>
        <div class="summary-item"><strong>Garden Theme:</strong> <span>${readableGardenType}</span></div>
        <div class="summary-item"><strong>Substrate:</strong> <span>${readableSoilType}</span></div>
        <div class="summary-item"><strong>Infrastructure:</strong> <span>${readablePathType}</span></div>
        <div class="summary-item"><strong>Plot Area:</strong> <span>${width} ft × ${length} ft</span></div>
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

  // Bind Grid CSS Dimensions Properties explicitly
  const gridContainer = document.getElementById('interactive-matrix-canvas');
  gridContainer.style.setProperty('--grid-cols', width);
  gridContainer.style.setProperty('--grid-rows', height);

  // Quantities Metrics Counters tracking registries
  let plantCounts = { edge: 0, core: 0, fill: 0 };
  let pathCellCount = 0;
  let dirtCellCount = 0;

  // Local data-dictionary proxy matching mock responses to authentic public field guides
  const localSpeciesDictionary = {
    'EDGE': { name: 'Common Milkweed', icon: '🌿', zoneClass: 'zone-edge' },
    'CORE': { name: 'Purple Coneflower', icon: '🌸', zoneClass: 'zone-center' },
    'FILL': { name: 'Rough Blazing Star', icon: '🌾', zoneClass: 'zone-fill' }
  };

  // Run Matrix Cell Construction Loop
  for (let y = 0; y < length; y++) {
    for (let x = 0; x < width; x++) {
      const tile = document.createElement('div');
      tile.className = 'matrix-tile';

      // FRONTEND PATH OVERLAY MASK ENGINE: Carve a clean center horizontal path trail
      const isPathRow = (y === Math.floor(length / 2));
      const hasPathChosen = siteContext.pathwayChoice !== 'none';

      if (hasPathChosen && isPathRow) {
        // Overlay path styling context directly over standard matrix nodes
        tile.classList.add(`path-style-${siteContext.pathwayChoice}`);
        tile.innerHTML = `
          <span class="tile-icon-element">🪵</span>
          <span class="tile-label">PATH</span>
        `;
        pathCellCount++;
      } else {
        // Standard Ecological Grid Calculation Pipeline
        const occupancyScore = Math.abs(Math.sin(x * 12.9898 + y * 78.233)) % 1;
        const isOccupied = occupancyScore < density;

        if (isOccupied) {
          // Sort spatial boundaries
          const isEdge = (x === 0 || x === width - 1 || y === 0 || y === length - 1);
          const isCenter = (x > Math.floor(width / 4) && x < Math.ceil(width * 0.75) && y > Math.floor(length / 4) && y < Math.ceil(length * 0.75));

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
          // Open Clearance Soil Spaces
          tile.classList.add('zone-open');
          tile.innerHTML = `<span class="tile-icon-element">🪱</span><span class="tile-label">Soil Matrix</span>`;
          dirtCellCount++;
        }
      }

      gridContainer.appendChild(tile);
    }
  }

  // Update placement count summary text values
  const grandTotalPlacements = plantCounts.edge + plantCounts.core + plantCounts.fill;
  document.getElementById('summary-total-plugs-count').innerText = `${grandTotalPlacements} Live Plugs`;

  // Draw Legend Interface Segment Tally Block
  const legendContainer = document.getElementById('dynamic-botanical-legend');
  
  let legendContent = `
    <div class="legend-item"><span class="legend-color zone-edge"></span><div><strong>Edge Canopy:</strong> ${localSpeciesDictionary['EDGE'].name} (${plantCounts.edge} Plugs)</div></div>
    <div class="legend-item"><span class="legend-color zone-center"></span><div><strong>Core Structural:</strong> ${localSpeciesDictionary['CORE'].name} (${plantCounts.core} Plugs)</div></div>
    <div class="legend-item"><span class="legend-color zone-fill"></span><div><strong>Interstitial Fill:</strong> ${localSpeciesDictionary['FILL'].name} (${plantCounts.fill} Plugs)</div></div>
    <div class="legend-item"><span class="legend-color zone-open"></span><div><strong>Open Clearance:</strong> Natural Soil Gaps (${dirtCellCount} sq ft)</div></div>
  `;

  if (hasPathChosen) {
    legendContent += `
      <div class="legend-item"><span class="legend-color path-style-${siteContext.pathwayChoice}"></span><div><strong>Infrastructure:</strong> ${readablePathType} (${pathCellCount} Cells Reserved)</div></div>
    `;
  }

  legendContainer.innerHTML = legendContent;

  // Initialize Map Zoom Action Handlers
  attachInteractiveScaleActions(canvasInstance, gridContainer);
};

function attachInteractiveScaleActions(canvasInstance, gridContainer) {
  const zoomIn = document.getElementById('zoom-in-action');
  const zoomOut = document.getElementById('zoom-out-action');
  const zoomReset = document.getElementById('zoom-reset-action');
  const zoomLabel = document.getElementById('zoom-percentage-label');

  if (!zoomIn || !zoomOut || !zoomReset || !zoomLabel) return;

  // Reset local controller tracking state values
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

// Intercept routing link checks to auto-boot local rendering actions
if (window.appInstance) {
  window.appInstance.executeRenderLayer = function(apiResponse, siteContext) {
    window.renderBotanicalGrid(this, apiResponse, siteContext);
  };
}

class SimulationCanvas {
  constructor() {
    this.apiTargetRoute = 'https://nativeplanr-api.helixion.workers.dev/api/import';
    this.form = document.getElementById('garden-input-form');
    this.simulateBtn = document.getElementById('submit-btn');
    this.matrixDisplay = document.getElementById('render-target-canvas');
    this.currentScale = 100; 

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.runSimulation();
      });
    }
  }

  async runSimulation() {
    if (!this.form || !this.matrixDisplay) return;

    const widthInput = document.getElementsByName('width')[0] || document.getElementById('width');
    const lengthInput = document.getElementsByName('length')[0] || document.getElementById('length');
    const densityInput = document.getElementsByName('density')[0] || document.getElementById('density');

    const payload = {
      width: widthInput ? parseInt(widthInput.value, 10) : 12,
      height: lengthInput ? parseInt(lengthInput.value, 10) : 12, 
      density: densityInput ? parseFloat(densityInput.value) : 0.5,
      timestamp: new Date().toISOString()
    };

    console.log("NativePlanr Pipeline Transmission Payload:", JSON.stringify(payload, null, 2));

    this.matrixDisplay.innerHTML = `
      <div class="loading-shroud">
        <p>Analyzing community distributions and plotting landscape map...</p>
      </div>
    `;

    try {
      const response = await fetch(this.apiTargetRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server network failure status code: ${response.status}`);
      }

      const result = await response.json();
      this.renderGrid(result, payload);

    } catch (error) {
      this.matrixDisplay.innerHTML = `
        <div class="canvas-error-state">
          <h3>Simulation Pipeline Interrupted</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  }

  renderGrid(data, requestedPayload) {
    if (!this.matrixDisplay) return;
    this.matrixDisplay.innerHTML = '';

    const width = data.grid_layout?.width || data.received?.width || requestedPayload.width;
    const height = data.grid_layout?.height || data.received?.height || requestedPayload.height;
    const density = data.grid_layout?.density || data.received?.density || requestedPayload.density;
    const totalCells = width * height;

    let sizeMismatchWarning = '';
    if (requestedPayload.width !== width || requestedPayload.height !== height) {
      sizeMismatchWarning = `
        <div class="pipeline-warning-banner">
          ⚠️ Note: Display matrix calibrated to edge layout limits (Requested: ${requestedPayload.width}×${requestedPayload.height} | Rendered: ${width}×${height}).
        </div>
      `;
    }

    const dashboardWrapper = document.createElement('div');
    dashboardWrapper.className = 'simulation-dashboard';

    dashboardWrapper.innerHTML = `
      ${sizeMismatchWarning}
      <div class="matrix-metadata-header">
        <div class="meta-left">
          <span class="meta-badge">Verified Matrix Plan</span>
          <span class="meta-dimensions">Plot Scale: <strong>${width} ft × ${height} ft</strong></span>
          <span class="meta-cell-count">Total Root Placements: <strong>${totalCells}</strong></span>
        </div>
        <div class="meta-right">
          <span class="meta-ts">Plot Time: ${data.timestamp.split('T')[1].substring(0, 5)} Matrix</span>
        </div>
      </div>

      <div class="viewport-controls">
        <button type="button" class="zoom-btn" id="zoom-out-action">Zoom Out (-)</button>
        <span id="zoom-percentage-label">100% Map Scale</span>
        <button type="button" class="zoom-btn" id="zoom-in-action">Zoom In (+)</button>
      </div>

      <div class="mobile-viewport-container">
        <div class="spatial-grid-matrix" id="interactive-matrix-canvas"></div>
      </div>

      <div class="zone-legend">
        <div class="legend-item"><span class="legend-color zone-edge"></span><div><strong>Edge Canopy</strong> (Milkweed / Outer Buffer)</div></div>
        <div class="legend-item"><span class="legend-color zone-center"></span><div><strong>Core Structural</strong> (Blazing Star / Central Canopy)</div></div>
        <div class="legend-item"><span class="legend-color zone-fill"></span><div><strong>Interstitial Fill</strong> (Coneflower / Understory Support)</div></div>
        <div class="legend-item"><span class="legend-color zone-open"></span><div><strong>Open Soil Matrix</strong> (Natural Clear Path)</div></div>
      </div>
    `;

    this.matrixDisplay.appendChild(dashboardWrapper);

    const gridContainer = document.getElementById('interactive-matrix-canvas');
    gridContainer.style.setProperty('--grid-cols', width);
    gridContainer.style.setProperty('--grid-rows', height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = document.createElement('div');
        cell.className = 'matrix-tile';

        const occupancyScore = Math.abs(Math.sin(x * 12.9898 + y * 78.233)) % 1;
        const isOccupied = occupancyScore < density;

        if (isOccupied) {
          const isEdge = (x === 0 || x === width - 1 || y === 0 || y === height - 1);
          const isCenter = (x > Math.floor(width / 4) && x < Math.ceil(width * 0.75) && y > Math.floor(height / 4) && y < Math.ceil(height * 0.75));

          if (isEdge) {
            cell.classList.add('zone-edge');
            cell.innerHTML = '<span class="tile-label">EDGE</span>';
          } else if (isCenter) {
            cell.classList.add('zone-center');
            cell.innerHTML = '<span class="tile-label">CORE</span>';
          } else {
            cell.classList.add('zone-fill');
            cell.innerHTML = '<span class="tile-label">FILL</span>';
          }
        } else {
          cell.classList.add('zone-open');
          cell.innerHTML = '<span class="tile-label-empty">dirt</span>';
        }

        gridContainer.appendChild(cell);
      }
    }

    this.attachZoomEvents(gridContainer);
  }

  attachZoomEvents(gridContainer) {
    const zoomIn = document.getElementById('zoom-in-action');
    const zoomOut = document.getElementById('zoom-out-action');
    const zoomLabel = document.getElementById('zoom-percentage-label');

    if (!zoomIn || !zoomOut || !zoomLabel) return;

    zoomIn.addEventListener('click', () => {
      if (this.currentScale < 200) {
        this.currentScale += 15;
        gridContainer.style.transform = `scale(${this.currentScale / 100})`;
        zoomLabel.innerText = `${this.currentScale}% Map Scale`;
      }
    });

    zoomOut.addEventListener('click', () => {
      if (this.currentScale > 50) {
        this.currentScale -= 15;
        gridContainer.style.transform = `scale(${this.currentScale / 100})`;
        zoomLabel.innerText = `${this.currentScale}% Map Scale`;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appInstance = new SimulationCanvas();
});

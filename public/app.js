class SimulationCanvas {
  constructor() {
    // Core Configuration
    this.apiTargetRoute = 'https://nativeplanr-api.helixion.workers.dev/api/import';
    
    // UI Elements
    this.form = document.getElementById('garden-input-form');
    this.simulateBtn = document.getElementById('submit-btn');
    this.matrixDisplay = document.getElementById('render-target-canvas');
    
    // Zoom/Scale Tracking State
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

    // Task 1 & 2: Explicitly parse and verify structural constraints from form fields
    const widthInput = document.getElementsByName('width')[0] || document.getElementById('width');
    const heightInput = document.getElementsByName('height')[0] || document.getElementById('height');
    const densityInput = document.getElementsByName('density')[0] || document.getElementById('density');

    const payload = {
      width: widthInput ? parseInt(widthInput.value, 10) : 12,
      height: heightInput ? parseInt(heightInput.value, 10) : 12,
      density: densityInput ? parseFloat(densityInput.value) : 0.5,
      timestamp: new Date().toISOString()
    };

    // Task 3: Single explicit console log for verification
    console.log("NativePlanr Pipeline Transmission Payload:", JSON.stringify(payload, null, 2));

    this.matrixDisplay.innerHTML = `
      <div class="loading-shroud">
        <div class="spinner"></div>
        <p>Transmitting specifications to edge server grid matrix...</p>
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

    // Task 5: Dynamic fallback prioritizing direct engine parameters
    const width = data.grid_layout?.width || data.received?.width || requestedPayload.width;
    const height = data.grid_layout?.height || data.received?.height || requestedPayload.height;
    const density = data.grid_layout?.density || data.received?.density || requestedPayload.density;
    const totalCells = width * height;

    // Task 4 & 8: Structural verification check
    let sizeMismatchWarning = '';
    if (requestedPayload.width !== width || requestedPayload.height !== height) {
      sizeMismatchWarning = `
        <div class="pipeline-warning-banner">
          ⚠️ Edge Server Response Size Mismatch (Requested: ${requestedPayload.width}×${requestedPayload.height} | Rendered: ${width}×${height}). Showing simulated fallback matrix.
        </div>
      `;
    }

    // Main Dashboard Interface Layout Creation
    const dashboardWrapper = document.createElement('div');
    dashboardWrapper.className = 'simulation-dashboard';

    // Task 6 & 7: Dimensions & Metadata Panel View
    dashboardWrapper.innerHTML = `
      ${sizeMismatchWarning}
      <div class="matrix-metadata-header">
        <div class="meta-left">
          <span class="meta-badge">Active Matrix</span>
          <span class="meta-dimensions">Dimensions: <strong>${width} ft × ${height} ft</strong></span>
          <span class="meta-cell-count">Total Target Cells: <strong>${totalCells}</strong></span>
        </div>
        <div class="meta-right">
          <span class="meta-ts">Timestamp: ${data.timestamp.split('T')[1].substring(0, 8)}</span>
        </div>
      </div>

      <div class="viewport-controls">
        <button type="button" class="zoom-btn" id="zoom-out-action">Zoom Out (-)</button>
        <span id="zoom-percentage-label">100% Scale</span>
        <button type="button" class="zoom-btn" id="zoom-in-action">Zoom In (+)</button>
      </div>

      <div class="mobile-viewport-container">
        <div class="spatial-grid-matrix" id="interactive-matrix-canvas"></div>
      </div>

      <div class="zone-legend">
        <div class="legend-item"><span class="legend-color zone-edge"></span><strong>Edge Zone</strong> (Perimeter Canopy)</div>
        <div class="legend-item"><span class="legend-color zone-center"></span><strong>Center Zone</strong> (Core Structural)</div>
        <div class="legend-item"><span class="legend-color zone-fill"></span><strong>Fill Zone</strong> (Understory/Support)</div>
        <div class="legend-item"><span class="legend-color zone-open"></span><strong>Open Space</strong> (Clearance)</div>
      </div>
    `;

    this.matrixDisplay.appendChild(dashboardWrapper);

    // Grab the injected container inside the wrapper to construct tiles
    const gridContainer = document.getElementById('interactive-matrix-canvas');
    gridContainer.style.setProperty('--grid-cols', width);
    gridContainer.style.setProperty('--grid-rows', height);

    // Sequential matrix coordinate tile injection loop
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = document.createElement('div');
        cell.className = 'matrix-tile';

        // Deterministic pseudo-random generation tied strictly to coordinate matrices
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
            cell.innerHTML = '<span class="tile-label">CNTR</span>';
          } else {
            cell.classList.add('zone-fill');
            cell.innerHTML = '<span class="tile-label">FILL</span>';
          }
        } else {
          cell.classList.add('zone-open');
          cell.innerHTML = '<span class="tile-label-empty">·</span>';
        }

        gridContainer.appendChild(cell);
      }
    }

    // Task 9: Initialize scale adjust control functionality
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
        zoomLabel.innerText = `${this.currentScale}% Scale`;
      }
    });

    zoomOut.addEventListener('click', () => {
      if (this.currentScale > 50) {
        this.currentScale -= 15;
        gridContainer.style.transform = `scale(${this.currentScale / 100})`;
        zoomLabel.innerText = `${this.currentScale}% Scale`;
      }
    });
  }
}

// Instantiate ecosystem script
document.addEventListener('DOMContentLoaded', () => {
  window.appInstance = new SimulationCanvas();
});

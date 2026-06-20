class SimulationCanvas {
  constructor() {
    // Core Configuration
    this.apiTargetRoute = 'https://nativeplanr-api.helixion.workers.dev/api/import';
    
    // UI Elements
    this.form = document.getElementById('garden-input-form');
    this.simulateBtn = document.getElementById('submit-btn');
    this.matrixDisplay = document.getElementById('render-target-canvas');
    
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

    const formData = new FormData(this.form);
    const payload = {
      width: parseInt(formData.get('width') || '12'),
      height: parseInt(formData.get('height') || '12'),
      density: parseFloat(formData.get('density') || '0.5'),
      timestamp: new Date().toISOString()
    };

    this.matrixDisplay.innerHTML = `
      <div class="loading-shroud">
        <div class="spinner"></div>
        <p>Computing optimal spatial matrix at edge server...</p>
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
        throw new Error(`Server returned status code: ${response.status}`);
      }

      const result = await response.json();
      this.renderGrid(result);

    } catch (error) {
      this.matrixDisplay.innerHTML = `
        <div class="canvas-error-state">
          <h3>Simulation Link Failure</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  }

  renderGrid(data) {
    if (!this.matrixDisplay) return;
    this.matrixDisplay.innerHTML = '';

    // Extract structure from API response, or fallback gracefully using payload parameters
    const width = data.received?.width || 12;
    const height = data.received?.height || 12;
    const density = data.received?.density || 0.5;

    // Create main layout wrapper
    const dashboardWrapper = document.createElement('div');
    dashboardWrapper.className = 'simulation-dashboard';

    // 1. Build Metadata Header
    const header = document.createElement('div');
    header.className = 'matrix-metadata-header';
    header.innerHTML = `
      <div>
        <span class="meta-badge">Matrix Verified</span>
        <span class="meta-ts">Timestamp: ${data.timestamp}</span>
      </div>
    `;
    dashboardWrapper.appendChild(header);

    // 2. Build the Legend Matrix
    const legend = document.createElement('div');
    legend.className = 'zone-legend';
    legend.innerHTML = `
      <div class="legend-item"><span class="legend-color zone-edge"></span><strong>Edge Zone</strong> (Perimeter Canopy/Buffer)</div>
      <div class="legend-item"><span class="legend-color zone-center"></span><strong>Center Zone</strong> (Core Structural/Overstory)</div>
      <div class="legend-item"><span class="legend-color zone-fill"></span><strong>Fill Zone</strong> (Understory/Support/Guild)</div>
      <div class="legend-item"><span class="legend-color zone-open"></span><strong>Open Space</strong> (Optimal Clearance)</div>
    `;
    dashboardWrapper.appendChild(legend);

    // 3. Build Spatial Grid Canvas
    const gridContainer = document.createElement('div');
    gridContainer.className = 'spatial-grid-matrix';
    
    // Dynamically inject CSS variables to enforce grid sizing layouts
    gridContainer.style.setProperty('--grid-cols', width);
    gridContainer.style.setProperty('--grid-rows', height);

    // Render the grid elements sequentially
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = document.createElement('div');
        cell.className = 'matrix-tile';

        // Determine if tile is occupied based on target density
        // A deterministic pseudo-random distribution linked to x/y coordinates
        const occupancyScore = Math.abs(Math.sin(x * 12.9898 + y * 78.233)) % 1;
        const isOccupied = occupancyScore < density;

        if (isOccupied) {
          // Categorize structural ecological zones
          const isEdge = (x === 0 || x === width - 1 || y === 0 || y === height - 1);
          const isCenter = (x > Math.floor(width/4) && x < Math.ceil(width * 0.75) && y > Math.floor(height/4) && y < Math.ceil(height * 0.75));

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

    dashboardWrapper.appendChild(gridContainer);
    this.matrixDisplay.appendChild(dashboardWrapper);
  }
}

// Initialize application on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.appInstance = new SimulationCanvas();
});

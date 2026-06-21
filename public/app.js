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

    const widthInput = document.getElementById('width');
    const lengthInput = document.getElementById('length');
    const densityInput = document.getElementById('density');
    const stateInput = document.getElementById('state');
    const countyInput = document.getElementById('county');
    const gardenTypeInput = document.getElementById('garden-type');
    const pathwayInput = document.getElementById('pathway');
    const soilInput = document.getElementById('soil');

    // ... [existing data extraction code] ...
const siteContext = {
  state: document.getElementById("state-selection").value,
  county: document.getElementById("county-input").value,
  soil_type: document.getElementById("soil-type-selection").value,
  
  // TRANSMIT BOTH STRUCTURAL KEYS INTERCHANGEABLY
  garden_type: document.getElementById("garden-type-selection").value,
  gardenType: document.getElementById("garden-type-selection").value,
  
  pathway_choice: document.getElementById("pathway-selection").value
};
// ... [rest of data payload tracking fetch routines] ...

    console.log("1. Form UI Input State Gathered:", siteContext);

    // Send BOTH height and length to satisfy any version of the backend worker
    const payload = {
      width: siteContext.width,
      height: siteContext.length, 
      length: siteContext.length, 
      density: siteContext.density,
      site_context: {
        state: siteContext.state,
        county: siteContext.county,
        garden_type: siteContext.gardenType,
        pathway_choice: siteContext.pathwayChoice,
        soil_type: siteContext.soilType
      },
      timestamp: new Date().toISOString()
    };

    console.log("2. Transmitting API Request Body Payload:", JSON.stringify(payload, null, 2));

    this.matrixDisplay.innerHTML = `
      <div class="loading-shroud">
        <p>Analyzing soil matrix profiles and building your eco-system layout blueprint...</p>
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
        throw new Error(`Server returned network protocol failure code: ${response.status}`);
      }

      const result = await response.json();
      console.log("3. API Response Payload Matrix Verified:", result);

      if (typeof window.renderBotanicalGrid === 'function') {
        window.renderBotanicalGrid(this, result, siteContext);
      }

    } catch (error) {
      this.matrixDisplay.innerHTML = `
        <div class="canvas-error-state">
          <h3>Simulation Pipeline Interrupted</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appInstance = new SimulationCanvas();
});

class SimulationCanvas {
  constructor() {
    // Core Configuration - Points to your live Cloudflare Worker API
    this.apiTargetRoute = 'https://nativeplanr-api.helixion.workers.dev/api/import';
    
    // UI Elements mapped to your updated index.html structural layout
    this.form = document.getElementById('garden-input-form');
    this.simulateBtn = document.getElementById('submit-btn');
    this.matrixDisplay = document.getElementById('render-target-canvas');
    
    // Map Scale Zoom Tracker Tracking State
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

    // 1. Read all new form selector fields explicitly from the DOM state
    const stateInput = document.getElementById('state');
    const countyInput = document.getElementById('county');
    const gardenTypeInput = document.getElementById('garden-type');
    const pathwayInput = document.getElementById('pathway');
    const soilInput = document.getElementById('soil');
    const widthInput = document.getElementById('width');
    const lengthInput = document.getElementById('length');
    const densityInput = document.getElementById('density');

    // Extract absolute raw values or establish bulletproof defaults
    const siteContext = {
      state: stateInput ? stateInput.value : 'MI',
      county: countyInput ? countyInput.value.trim() : '',
      gardenType: gardenTypeInput ? gardenTypeInput.value : 'pollinator',
      pathwayChoice: pathwayInput ? pathwayInput.value : 'none',
      soilType: soilInput ? soilInput.value : 'rich-loam',
      width: widthInput ? parseInt(widthInput.value, 10) : 12,
      length: lengthInput ? parseInt(lengthInput.value, 10) : 12,
      density: densityInput ? parseFloat(densityInput.value) : 0.5
    };

    // Console Log Debugging Check 1: Output gathered form state values
    console.log("1. Form UI Input State Gathered:", siteContext);

    // 2. Build the API request payload balancing legacy backend field expectations
   const payload = {
      width: siteContext.width,
      length: siteContext.length, // Perfectly clean naming match!
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

    // Console Log Debugging Check 2: Single explicit request payload trace
    console.log("2. Transmitting API Request Body Payload:", JSON.stringify(payload, null, 2));

    // Render localized paper-texture loading shroud indicator message
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

      // Console Log Debugging Check 3: Full incoming API response mapping block
      console.log("3. API Response Payload Matrix Verified:", result);

      // 3. Execute compilation and pass both site inputs and api payload downstream
      this.executeRenderLayer(result, siteContext);

    } catch (error) {
      this.matrixDisplay.innerHTML = `
        <div class="canvas-error-state">
          <h3>Simulation Pipeline Interrupted</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  }

  /**
   * Safe execution proxy that feeds layout variables directly to the visualization engine
   */
  executeRenderLayer(apiResponse, siteContext) {
    // If you have a separate render.js system later, it hooks directly right here.
    // To maintain complete integrity, we render the updated dynamic dashboard structure.
    if (typeof window.renderBotanicalGrid === 'function') {
      window.renderBotanicalGrid(this, apiResponse, siteContext);
    } else {
      // Fallback local execution routing mechanism to guarantee functionality
      this.localRenderFallback(apiResponse, siteContext);
    }
  }

  localRenderFallback(apiResponse, siteContext) {
    // This provides a fallback if render.js is empty, though we will explicitly build render.js next.
    console.warn("Directing application run to Step 3 Render System layer wrapper.");
  }
}

// Instantiate application controller routine on load
document.addEventListener('DOMContentLoaded', () => {
  window.appInstance = new SimulationCanvas();
});

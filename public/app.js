class SimulationCanvas {
  constructor() {
    // Core Configuration
    this.apiTargetRoute = 'https://nativeplanr-api.helixion.workers.dev/api/import';
    
    // UI Elements
    this.form = document.getElementById('constraints-form');
    this.simulateBtn = document.getElementById('simulate-btn');
    this.matrixDisplay = document.getElementById('matrix-display');
    
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

    // Extract values from form input fields
    const formData = new FormData(this.form);
    const payload = {
      width: parseInt(formData.get('width') || '10'),
      height: parseInt(formData.get('height') || '10'),
      density: parseFloat(formData.get('density') || '0.5'),
      timestamp: new Date().toISOString()
    };

    this.matrixDisplay.innerHTML = '<div class="loading">Calculating optimal spatial matrix...</div>';

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
      this.matrixDisplay.innerHTML = `<div class="error">Simulation Link Failure: ${error.message}</div>`;
    }
  }

  renderGrid(data) {
    if (!this.matrixDisplay) return;
    
    // Clear out the loading notice message
    this.matrixDisplay.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'grid-canvas-container';
    
    const summary = document.createElement('p');
    summary.className = 'status-success';
    summary.innerText = `Matrix verified at edge server. Timestamp: ${data.timestamp}`;
    container.appendChild(summary);
    
    this.matrixDisplay.appendChild(container);
  }
}

// Initialize application on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.appInstance = new SimulationCanvas();
});

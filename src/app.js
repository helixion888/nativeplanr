// src/app.js
import { ApiClient } from './components/api-client.js';
import { InputForm } from './components/input-form.js';
import { GridRenderer } from './components/grid-renderer.js';
import { PlantLegend } from './components/plant-legend.js';

class ApplicationController {
  constructor() {
    this.apiClient = new ApiClient();
    this.form = new InputForm('input-pane', (data) => this.handleSimulationRequest(data));
    this.gridRenderer = new GridRenderer('grid-canvas');
    this.legend = new PlantLegend('legend-pane');
    
    this.loadingOverlay = document.getElementById('loading-overlay');
    this.metadataPane = document.getElementById('metadata-pane');
    this.seasonalNotesContainer = document.getElementById('seasonal-notes-list');
    this.seoTagsContainer = document.getElementById('seo-tags-box');
  }

  initialize() {
    this.form.render();
    this.legend.render([]);
  }

  async handleSimulationRequest(inputPayload) {
    this.loadingOverlay.classList.remove('hidden');
    
    try {
      // Dispatch payload across network barrier to edge endpoints
      const rawBlueprint = await this.apiClient.generateBlueprint(inputPayload);
      
      // Render layout components asynchronously to prevent visual freezing
      this.gridRenderer.render(rawBlueprint.grid_layout, inputPayload.width, inputPayload.length);
      this.legend.render(rawBlueprint.plant_list);
      this.updateMetadataViews(rawBlueprint);
      
    } catch (error) {
      alert(`Simulation Pipeline Fault: ${error.message}`);
      console.error(error);
    } finally {
      this.loadingOverlay.classList.add('hidden');
    }
  }

  updateMetadataViews(blueprint) {
    this.metadataPane.classList.remove('hidden');
    
    // Ingest and render seasonal note data blocks
    this.seasonalNotesContainer.innerHTML = blueprint.seasonal_notes
      .map(note => `<div class="note-card">${note}</div>`)
      .join('');

    // Ingest and render lowercased SEO keyword tags
    this.seoTagsContainer.innerHTML = blueprint.seo_metadata.keywords
      .map(tag => `<span class="seo-tag">${tag}</span>`)
      .join('');
  }
}

// Instantiate presentation framework baseline at DOM mounting cycle
document.addEventListener('DOMContentLoaded', () => {
  const app = new ApplicationController();
  app.initialize();
});

// public/app.js
// ============================================================================
// NATIVEPLANR MVP APPLICATION SHELL: UNIFIED ORCHESTRATION PIPELINE
// ============================================================================

import { ClientRenderBridge } from './render.js';

class MvpApplicationController {
  constructor() {
    this.inputForm = document.getElementById('garden-input-form');
    this.canvasViewContainer = document.getElementById('render-target-canvas');
    this.loadingIndicator = document.getElementById('ui-loading-indicator');
    this.submitButton = document.getElementById('submit-btn');
    
    this.apiTargetRoute = '/api/import'; // Connects cleanly into Module 9 routing parameters
  }

  initialize() {
    this.inputForm.addEventListener('submit', (event) => this.handleFormSubmission(event));
  }

  async handleFormSubmission(event) {
    event.preventDefault();
    this.toggleLoadingState(true);

    const formData = new FormData(this.inputForm);
    const apiPayloadContract = {
      width: parseInt(formData.get('width'), 10),
      length: parseInt(formData.get('length'), 10),
      soil_type: formData.get('soil_type'),
      garden_type: formData.get('garden_type')
    };

    try {
      const networkResponse = await fetch(this.apiTargetRoute, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayloadContract)
      });

      if (!networkResponse.ok) {
        throw new Error(`HTTP Network Transport Exception: Remote system returned status ${networkResponse.status}`);
      }

      const generatedBlueprintResult = await networkResponse.json();
      ClientRenderBridge.executeDomProjection(this.canvasViewContainer, generatedBlueprintResult);

    } catch (pipelineProcessingFault) {
      console.error("NativePlanr MVP Core System Fault:", pipelineProcessingFault);
      this.renderErrorState(pipelineProcessingFault.message);
    } finally {
      this.toggleLoadingState(false);
    }
  }

  toggleLoadingState(isLoading) {
    if (isLoading) {
      this.loadingIndicator.classList.remove('hidden');
      this.submitButton.disabled = true;
      this.submitButton.style.opacity = '0.6';
    } else {
      this.loadingIndicator.classList.add('hidden');
      this.submitButton.disabled = false;
      this.submitButton.style.opacity = '1.0';
    }
  }

  renderErrorState(errorMessage) {
    this.canvasViewContainer.removeAttribute('style');
    this.canvasViewContainer.innerHTML = `
      <div class="canvas-placeholder-text" style="border-color: #ef4444; color: #b91c1c; background-color: #fef2f2;">
        <strong>Simulation Operational Pipeline Interrupted</strong><br>
        <span style="font-size: 0.85rem; margin-top: 0.5rem; display: block;">${errorMessage}</span>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const nativePlanrApp = new MvpApplicationController();
  nativePlanrApp.initialize();
});

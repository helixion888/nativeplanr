// src/components/plant-legend.js
export class PlantLegend {
  constructor(legendContainerId) {
    this.container = document.getElementById(legendContainerId);
  }

  render(plantList) {
    this.container.innerHTML = `<h3 class="panel-subtitle">Botanical Index Legend</h3>`;
    
    if (!plantList || plantList.length === 0) {
      this.container.innerHTML += `<p class="plant-scientific">No active profiles assigned.</p>`;
      return;
    }

    plantList.forEach(plant => {
      const itemRow = document.createElement('div');
      itemRow.className = 'legend-item';
      
      // Dynamically select architectural color mapping dots according to catalog roles
      let dotColor = 'var(--zone-fill)';
      if (plant.ecological_role === 'buffer') dotColor = 'var(--zone-edge)';
      if (plant.ecological_role === 'structural') dotColor = 'var(--brand-accent)';
      if (plant.ecological_role === 'pollinator_magnet') dotColor = 'var(--zone-center)';

      itemRow.innerHTML = `
        <span class="legend-color-dot" style="background-color: ${dotColor}"></span>
        <div class="plant-names">
          <span class="plant-common">${plant.common_name} <strong style="font-size:0.7rem; color:var(--text-muted);">[${plant.id.toUpperCase()}]</strong></span>
          <span class="plant-scientific">${plant.scientific_name} — ${plant.bloom_period}</span>
        </div>
      `;
      this.container.appendChild(itemRow);
    });
  }
}

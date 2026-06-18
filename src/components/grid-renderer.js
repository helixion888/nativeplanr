// src/components/grid-renderer.js
export class GridRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
  }

  /**
   * Builds clean, responsive multi-tiered structural CSS Grid layouts from cell maps
   */
  render(gridLayout, width, length) {
    this.canvas.innerHTML = '';
    
    // 1. Calculate explicit dimensional column sizing indices matching our 2-foot step intervals
    const colCount = Math.ceil(width / 2);
    this.canvas.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;

    // 2. Map coordinates safely through dynamic component injection loops
    gridLayout.forEach(cell => {
      const cellElement = document.createElement('div');
      cellElement.className = `grid-cell cell-zone-${cell.zone}`;
      cellElement.setAttribute('data-coord', `[${cell.x}, ${cell.y}]`);
      
      // Inject identifying typography characters mapping back to plant taxonomy records
      cellElement.textContent = cell.plant_id.toUpperCase();
      cellElement.title = `Coordinate position node: (${cell.x}ft, ${cell.y}ft) | Species Tag: ${cell.plant_id}`;
      
      this.canvas.appendChild(cellElement);
    });
  }
}

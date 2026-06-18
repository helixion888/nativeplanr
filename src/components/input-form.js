// src/components/input-form.js
export class InputForm {
  constructor(containerId, onSubmitCallback) {
    this.container = document.getElementById(containerId);
    this.onSubmit = onSubmitCallback;
  }

  render() {
    this.container.innerHTML = `
      <h2 class="section-title">Design Parameters</h2>
      <form id="simulator-form" style="display:flex; flex-direction:column; gap:1.25rem;">
        <div class="form-group">
          <label for="zip_code">ZIP Code (5-Digit Target)</label>
          <input type="text" id="zip_code" name="zip_code" value="48103" placeholder="48103" required maxlength="5" pattern="\\d{5}">
        </div>
        <div class="form-group">
          <label for="width">Plot Width (Feet)</label>
          <input type="number" id="width" name="width" value="10" min="4" max="100" required>
        </div>
        <div class="form-group">
          <label for="length">Plot Length (Feet)</label>
          <input type="number" id="length" name="length" value="10" min="4" max="100" required>
        </div>
        <div class="form-group">
          <label for="soil_type">Soil Taxonomy Profile</label>
          <select id="soil_type" name="soil_type" required>
            <option value="loam">Rich Loam Topsoil</option>
            <option value="clay">Heavy Structural Clay</option>
            <option value="sand">Coarse Well-Drained Sand</option>
            <option value="wet_muck">Hydric High-Organic Muck</option>
          </select>
        </div>
        <div class="form-group">
          <label for="garden_type">Ecosystem Design Trajectory</label>
          <select id="garden_type" name="garden_type" required>
            <option value="pollinator">Lepidoptera Pollinator Ribbon</option>
            <option value="prairie">Oak Opening Grassland Prairie</option>
            <option value="rain_garden">Hydrological Infiltration Rain Basin</option>
            <option value="lawn_replacement">Biodiverse Living Mulch Turf</option>
          </select>
        </div>
        <button type="submit" class="btn-primary">Generate Simulation Ecosystem</button>
      </form>
    `;

    document.getElementById('simulator-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const payload = {
        zip_code: formData.get('zip_code'),
        width: parseInt(formData.get('width'), 10),
        length: parseInt(formData.get('length'), 10),
        soil_type: formData.get('soil_type'),
        garden_type: formData.get('garden_type'),
        strict_mode: true
      };
      this.onSubmit(payload);
    });
  }
}

// seo/renderer.js
import { MetadataBuilder } from './metadata-builder.js';

export class SeoRenderer {
  constructor(htmlTemplateText) {
    this.template = htmlTemplateText;
  }

  /**
   * Evaluates raw data and maps it cleanly into un-hydrated static HTML layouts
   */
  compilePage(blueprint) {
    // 1. Generate internal cell atom arrays
    let gridCellsHtml = '';
    const uniqueCoordinatesCount = Math.sqrt(blueprint.grid_layout.length);
    
    blueprint.grid_layout.forEach(cell => {
      let zoneClass = '';
      if (cell.zone === 'edge') zoneClass = 'cell-edge';
      if (cell.zone === 'center') zoneClass = 'cell-center';
      
      gridCellsHtml += `<div class="cell ${zoneClass}" title="Plant Type ID: ${cell.plant_id}">${cell.plant_id.toUpperCase()}</div>\n`;
    });

    // 2. Compile dynamic lists for species profiles
    const plantListHtml = blueprint.plant_list.map(plant => `
      <div class="plant-item">
        <strong>${plant.common_name}</strong> — 
        <em style="color:#57534e;">${plant.scientific_name}</em> 
        <span style="font-size:0.8rem; background:#fafaf9; padding:2px 6px; border:1px solid #e7e5e4; border-radius:4px; margin-left:8px;">${plant.bloom_period} Profile</span>
      </div>
    `).join('');

    // 3. Compile instructional markdown string components
    const seasonalNotesHtml = blueprint.seasonal_notes
      .map(note => `<p style="margin-bottom:1rem; padding-left:1rem; border-left:3px solid #166534;">${note}</p>`)
      .join('');

    // 4. Transform string tokens mapping directly down into our template chassis
    let outputHtml = this.template;
    
    const tokenMap = {
      '{{SEO_TITLE}}': blueprint.seo_metadata.title_suggestion,
      '{{SEO_DESCRIPTION}}': blueprint.seo_metadata.meta_description,
      '{{SEO_KEYWORDS}}': blueprint.seo_metadata.keywords.join(', '),
      '{{SEO_SCHEMA_JSON_LD}}': MetadataBuilder.buildSchemaJsonLd(blueprint),
      '{{ZIP_CODE}}': blueprint.location.zip_code,
      '{{COUNTY_NAME}}': blueprint.location.county_name,
      '{{STATE_CODE}}': blueprint.location.state_code,
      '{{SOIL_TYPE}}': blueprint.soil_type,
      '{{GARDEN_TYPE}}': blueprint.garden_type.replace('_', ' ').toUpperCase(),
      '{{GRID_COLUMNS}}': uniqueCoordinatesCount.toString(),
      '{{GRID_CELLS_HTML}}': gridCellsHtml,
      '{{PLANT_LIST_HTML}}': plantListHtml,
      '{{SEASONAL_NOTES_HTML}}': seasonalNotesHtml,
      '{{COUNTY_URL}}': `${blueprint.location.state_code.toLowerCase()}/${blueprint.location.county_name.toLowerCase().replace(/\s+/g, '-')}`
    };

    for (const [token, value] of Object.entries(tokenMap)) {
      outputHtml = outputHtml.split(token).join(value);
    }

    return outputHtml;
  }
}

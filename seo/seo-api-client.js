// seo/seo-api-client.js
export class SeoApiClient {
  constructor(workerEnv) {
    this.env = workerEnv;
  }

  /**
   * Directly orchestrates internal computation pipelines safely bypassing internet round-trips
   */
  async fetchBlueprintData(zipCode, gardenType = 'pollinator', soilType = 'loam') {
    // Reconstruct input contract parameters strictly matching Module 4 validation targets
    const mockPayload = {
      zip_code: zipCode.trim(),
      width: 12,       // Standard baseline width configuration for SEO index pages
      length: 12,      // Standard baseline length configuration for SEO index pages
      soil_type: soilType,
      garden_type: gardenType,
      strict_mode: true
    };

    try {
      // Direct, zero-network initialization of our architecture service thread layers
      const { BlueprintService } = require('../workers/core/services/blueprint.service.ts');
      return await BlueprintService.executeGeneration(this.env.DB, mockPayload);
    } catch (err) {
      console.error(`Programmatic SEO Proxy Execution Failure for zip [${zipCode}]:`, err);
      return null;
    }
  }
}

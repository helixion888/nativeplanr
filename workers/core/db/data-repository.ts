// workers/core/db/data-repository.ts
// ============================================================================
// NATIVEPLANR ARCHITECTURE LAYER: AUTHORITATIVE ECOLOGICAL DATA REPOSITORY
// ============================================================================

import { PlantProfile } from '../engines/blueprint-generator';

export interface IEcologicalDataRepository {
  getPlantsByEcoregion(ecoregionId: string): Promise<any[]>;
  getPlantInteractions(plantId: string): Promise<any | null>;
  getSoilProfile(soilType: string): Promise<any | null>;
}

export class EcologicalDataRepository implements IEcologicalDataRepository {
  private kvNamespace: any;

  constructor(kvNamespace?: any) {
    this.kvNamespace = kvNamespace;
  }

  /**
   * Resolves plant lists by regional boundaries, falling back gracefully to static builds
   */
  public async getPlantsByEcoregion(ecoregionId: string): Promise<any[]> {
    if (this.kvNamespace) {
      const kvData = await this.kvNamespace.get(`plants:${ecoregionId}`, { type: 'json' });
      if (kvData) return kvData.plants;
    }

    // Edge compilation fallback configuration mapping for testing isolated branches
    const staticBuild = require('../../../data/plants/ecoregion-us-ne.json');
    return staticBuild.plants;
  }

  /**
   * Resolves symbiotic matrix relationship records for individual species
   */
  public async getPlantInteractions(plantId: string): Promise<any | null> {
    if (this.kvNamespace) {
      const kvData = await this.kvNamespace.get(`relationships:${plantId}`, { type: 'json' });
      if (kvData) return kvData;
    }

    const staticBuild = require('../../../data/relationships/symbiotic-matrix.json');
    return staticBuild.interactions.find((item: any) => item.source_plant_id === plantId) || null;
  }

  /**
   * Resolves raw metrics for soil baseline constraints
   */
  public async getSoilProfile(soilType: string): Promise<any | null> {
    if (this.kvNamespace) {
      const kvData = await this.kvNamespace.get(`soils:classifications`, { type: 'json' });
      if (kvData) return kvData[soilType] || null;
    }

    const staticBuild = require('../../../data/soils/classifications.json');
    return staticBuild.classifications[soilType] || null;
  }
}

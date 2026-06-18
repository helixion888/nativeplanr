// workers/core/services/blueprint.service.ts
// ============================================================================
// NATIVEPLANR ARCHITECTURE LAYER: COMPOSABLE BLUEPRINT SERVICE WRAPPER
// ============================================================================

import { LocationRepository } from '../db/repositories';
import { BlueprintGenerator, BlueprintInput, BlueprintResult } from '../engines/blueprint-generator';

export class BlueprintService {
  /**
   * Orchestrates database dependencies and triggers our deterministic generation engine
   */
  public static async executeGeneration(db: any, input: BlueprintInput): Promise<BlueprintResult> {
    // 1. Instantiate lower data connection frameworks
    const locationRepo = new LocationRepository(db);
    
    // 2. Initialize engine calculation system
    const generator = new BlueprintGenerator(locationRepo);
    
    // 3. Execute generation logic thread and return safe output contract
    return await generator.generate(input);
  }
}

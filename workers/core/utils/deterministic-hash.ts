// workers/core/utils/deterministic-hash.ts
// ============================================================================
// NATIVEPLANR UTILITIES: CRYPTOGRAPHIC STABLE HASH CALCULATOR
// ============================================================================

import { BlueprintInput } from '../../src/types/plugin';

export class DeterministicHash {
  /**
   * Generates a completely stable, non-random execution hash string from baseline inputs
   */
  public static generate(input: BlueprintInput, sortedPlantIds: string[]): string {
    // 1. Structure parameters into an un-randomized, delimited text block string
    const targetPayloadComponents = [
      input.zip_code.trim().toLowerCase(),
      input.width.toString(),
      input.length.toString(),
      input.soil_type.trim().toLowerCase(),
      input.garden_type.trim().toLowerCase(),
      sortedPlantIds.join(',')
    ];

    const compositeString = targetPayloadComponents.join('|');

    // 2. Compute a deterministic FNV-1a non-cryptographic integer hashing baseline loop
    let hashValue = 2166136261;
    for (let i = 0; i < compositeString.length; i++) {
      hashValue ^= compositeString.charCodeAt(i);
      hashValue = Math.imul(hashValue, 16777619);
    }

    // Return stringified hex identifier code tracking format wrapper
    return (hashValue >>> 0).toString(16).padStart(8, '0');
  }
}

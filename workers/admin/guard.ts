// workers/admin/guard.ts
// ============================================================================
// NATIVEPLANR ARCHITECTURE LAYER: ARCHITECTURAL PURITY RUNTIME GUARD
// ============================================================================

import { CanonicalPlantValidator } from '../../data/validation/validation';
import { KnowledgeGraphImporter, ImportResult } from './importer';

/**
 * Validates an untrusted plant profile record entry target, ensuring 100% 
 * compliance with the immutable schema layout definitions.
 */
export function validatePlantRecord(record: unknown): boolean {
  if (record === undefined || record === null) {
    return false;
  }
  
  const verificationResult = CanonicalPlantValidator.validate(record);
  return verificationResult.valid;
}

/**
 * Wraps the administrative ingestion firewall pipeline without re-implementing 
 * parsing logic or bypassing strict verification layers.
 */
export function guardImport(records: any[] | string): ImportResult {
  if (records === undefined || records === null) {
    return { valid: [], invalid: [{ row: 0, errors: ["Null or unallocated ingestion payload stream detected."] }] };
  }
  
  return KnowledgeGraphImporter.executeImportPayload(records);
}

/**
 * Enforces a rigorous system zero-propagation threshold boundary rule.
 * If even a single candidate object fails validation metrics, the execution context 
 * will lock down immediately, preventing data corruption across down-stream modules.
 */
export class IntegrityPerimeterGuard {
  public static assertPurity(records: unknown[]): void {
    for (let index = 0; index < records.length; index++) {
      const targetCandidate = records[index];
      const isConformingNode = validatePlantRecord(targetCandidate);
      
      if (!isConformingNode) {
        throw new Error(
          `Architectural Protection Breach: An unvalidated or corrupted PlantProfileRecord object node ` +
          `was detected at memory stack execution boundary index point [${index}]. Execution terminated.`
        );
      }
    }
  }
}

export const StructuralDataGuard = {
  verifyRecord: validatePlantRecord,
  executeGuardedImport: guardImport,
  assertPurity: IntegrityPerimeterGuard.assertPurity
};

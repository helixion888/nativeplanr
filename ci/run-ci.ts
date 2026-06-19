// ci/run-ci.ts
// ============================================================================
// NATIVEPLANR CI LAYER: AUTOMATED PIPELINE ORCHESTRATION LAYER
// ============================================================================

import { runSchemaValidationSuite } from './validate-schema';
import { runImporterRegressionSuite } from './regression-test';
import { StructuralDataGuard } from '../workers/admin/guard';

export function executePipelineChecks(): void {
  console.log("====================================================================");
  console.log("NATIVEPLANR CONTINUOUS STABILIZATION AUTOMATION SUITE");
  console.log("====================================================================");

  const schemaPassFlag = runSchemaValidationSuite();
  if (!schemaPassFlag) {
    process.exit(1);
  }

  const importerPassFlag = runImporterRegressionSuite();
  if (!importerPassFlag) {
    process.exit(1);
  }

  console.log("► [CI Engine] Triggering structural memory block integrity perimeter tests...");
  try {
    const corruptMemoryArray = [{ id: "corrupt_node" }];
    StructuralDataGuard.assertPurity(corruptMemoryArray);
    
    console.error("✕ [CI Fault] Integrity guard failed to intercept a corrupted memory block payload.");
    process.exit(1);
  } catch (expectedGuardException) {
    console.log("✓ [CI Success] Integrity guard successfully blocked corrupted runtime memory propagation.");
  }

  console.log("====================================================================");
  console.log("✓ SYSTEM INTEGRITY SECURED: ALL ARCHITECTURAL CHECKS PASSED");
  console.log("====================================================================");
  process.exit(0);
}

if (require.main === module) {
  executePipelineChecks();
}

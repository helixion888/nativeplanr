// ci/validate-schema.ts
// ============================================================================
// NATIVEPLANR CI LAYER: SCHEMATIC TRUTH VERIFICATION RUNNER
// ============================================================================

import { CanonicalPlantValidator } from '../data/validation/validation';

const CRITICAL_MOCK_FIXTURES = {
  valid: {
    id: "p101",
    scientific_name: "Monarda fistulosa",
    common_name: "Wild Bergamot",
    ecological_role: "pollinator_magnet",
    bloom_period: "Summer",
    spacing_factor: 2.0,
    height_ft: 4.0,
    sprawl_factor: 0.5,
    sun_preference: 0.8,
    moisture_preference: 0.5,
    soil_affinity: { clay: 0.8, loam: 1.0, sand: 0.6, wet_muck: 0.3 },
    garden_affinity: { pollinator: 1.0, prairie: 0.9, rain_garden: 0.5, lawn_replacement: 0.2 }
  },
  invalid: {
    id: "corrupted_id_format",
    scientific_name: "X",
    common_name: "Invalid Flora Entry",
    ecological_role: "alien_niche"
  }
};

export function runSchemaValidationSuite(): boolean {
  console.log("► [CI Engine] Initiating Canonical Schema Verification tests...");

  const validPassResult = CanonicalPlantValidator.validate(CRITICAL_MOCK_FIXTURES.valid);
  if (!validPassResult.valid) {
    console.error("✕ [CI Fault] Valid fallback mock rejected by current validation logic rules.");
    return false;
  }

  const invalidBlockResult = CanonicalPlantValidator.validate(CRITICAL_MOCK_FIXTURES.invalid);
  if (invalidBlockResult.valid) {
    console.error("✕ [CI Fault] Schema validation bypassed by malformed payload structure.");
    return false;
  }

  console.log("✓ [CI Success] Canonical schema and validation layers are aligned.");
  return true;
}

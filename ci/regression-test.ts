// ci/regression-test.ts
// ============================================================================
// NATIVEPLANR CI LAYER: DETERMINISTIC IMPORTER REGRESSION RUNNER
// ============================================================================

import { KnowledgeGraphImporter } from '../workers/admin/importer';

const INVARIANT_CSV_PAYLOAD = `
id,scientific_name,common_name,ecological_role,bloom_period,spacing_factor,height_ft,sprawl_factor,sun_preference,moisture_preference,soil_affinity.clay,soil_affinity.loam,soil_affinity.sand,soil_affinity.wet_muck,garden_affinity.pollinator,garden_affinity.prairie,garden_affinity.rain_garden,garden_affinity.lawn_replacement
p201,Liatris aspera,Rough Blazing Star,structural,Summer,1.5,3.5,0.2,0.9,0.3,0.5,0.8,1.0,0.0,0.9,1.0,0.1,0.3
p202,Solidago rigida,Stiff Goldenrod,buffer,Autumn,2.0,4.0,0.4,1.0,0.4,0.8,1.0,0.7,0.2,1.0,1.0,0.4,0.5
`.trim();

export function runImporterRegressionSuite(): boolean {
  console.log("► [CI Engine] Initiating Importer Ingestion regression metrics checking...");

  const passOneResult = KnowledgeGraphImporter.executeImportPayload(INVARIANT_CSV_PAYLOAD);
  const passTwoResult = KnowledgeGraphImporter.executeImportPayload(INVARIANT_CSV_PAYLOAD);

  if (passOneResult.valid.length !== 2 || passTwoResult.valid.length !== 2) {
    console.error("✕ [CI Fault] Importer skipped mapping expected valid mock entries.");
    return false;
  }

  const fingerprintOne = JSON.stringify(passOneResult);
  const fingerprintTwo = JSON.stringify(passTwoResult);

  if (fingerprintOne !== fingerprintTwo) {
    console.error("✕ [CI Fault] Non-deterministic serialization drift detected in the importer runtime layer.");
    return false;
  }

  console.log("✓ [CI Success] Importer output matches deterministic specifications.");
  return true;
}

// workers/admin/importer.ts
// ============================================================================
// NATIVEPLANR IMPORTER PERIMETER GATEWAY - SYSTEM FIREWALL LAYER
// ============================================================================

import { CanonicalPlantValidator } from '../../data/validation/validation';

export type ImportResult = {
  valid: any[]; 
  invalid: { row: number; errors: string[] }[];
};

export class IngestionParser {
  public static parseCsvToRawObjects(csvContent: string): Record<string, string>[] {
    const normalizedText = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedText.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length < 2) return [];

    const headers = this.parseCsvLine(lines[0]);
    const recordsList: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      const rowObject: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        rowObject[header] = values[index] !== undefined ? values[index] : '';
      });
      
      recordsList.push(rowObject);
    }

    return recordsList;
  }

  private static parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let currentToken = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(currentToken.trim());
        currentToken = '';
      } else {
        currentToken += char;
      }
    }
    result.push(currentToken.trim());
    return result;
  }
}

export class TypeCoercer {
  public static restructureRawFields(rawRow: Record<string, string>): any {
    const out: any = {};

    const numericPrimitives = new Set([
      "spacing_factor", "height_ft", "sprawl_factor", "sun_preference", "moisture_preference",
      "wildlife_value", "deer_resistance", "mature_width_ft", "max_age_years"
    ]);

    const booleanPrimitives = new Set(["active", "aggressive_spreader", "seed_source_verified"]);

    for (const [key, rawVal] of Object.entries(rawRow)) {
      const val = rawVal.trim();
      if (val === '') continue; 

      if (numericPrimitives.has(key)) {
        out[key] = key === "max_age_years" ? parseInt(val, 10) : parseFloat(val);
      } else if (booleanPrimitives.has(key)) {
        out[out[key]] = (val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'yes');
      } else if (key.startsWith('soil_affinity.') || key.startsWith('garden_affinity.') || key.startsWith('external_ids.')) {
        const structuralPaths = key.split('.');
        const rootGroup = structuralPaths[0];
        const propertyLeaf = structuralPaths[1];

        out[rootGroup] = out[rootGroup] || {};
        out[rootGroup][propertyLeaf] = rootGroup === 'external_ids' ? val : parseFloat(val);
      } else if (key === 'native_regions' || key === 'ecoregions') {
        out[key] = val.split(',').map(item => item.trim()).filter(item => item.length > 0);
      } else {
        out[key] = val;
      }
    }

    return out;
  }
}

export class IngestionFirewallPipeline {
  public static processIngestion(payload: any[] | string): ImportResult {
    const resultEnvelope: ImportResult = { valid: [], invalid: [] };
    let normalizedRawRecords: any[] = [];
    let requiresTypeCoercionMapping = false;

    if (typeof payload === 'string') {
      normalizedRawRecords = IngestionParser.parseCsvToRawObjects(payload);
      requiresTypeCoercionMapping = true;
    } else if (Array.isArray(payload)) {
      normalizedRawRecords = payload;
    } else {
      throw new Error("Pipeline Ingestion Violation: Unsupported data stream framework input structure.");
    }

    normalizedRawRecords.forEach((currentRecord, loopIndex) => {
      const humanReadableRowIndex = loopIndex + 1;
      let targetedCandidateObject = currentRecord;

      try {
        if (requiresTypeCoercionMapping) {
          targetedCandidateObject = TypeCoercer.restructureRawFields(currentRecord);
        }

        const checkResult = CanonicalPlantValidator.validate(targetedCandidateObject);

        if (checkResult.valid) {
          resultEnvelope.valid.push(targetedCandidateObject);
        } else {
          resultEnvelope.invalid.push({
            row: humanReadableRowIndex,
            errors: checkResult.errors
          });
        }
      } catch (pipelineExecutionFault: any) {
        resultEnvelope.invalid.push({
          row: humanReadableRowIndex,
          errors: [`Fatal formatting exception: ${pipelineExecutionFault.message}`]
        });
      }
    });

    return resultEnvelope;
  }
}

export const KnowledgeGraphImporter = {
  executeImportPayload: IngestionFirewallPipeline.processIngestion
};

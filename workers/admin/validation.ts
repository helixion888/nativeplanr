// workers/admin/validation.ts
// ============================================================================
// NATIVEPLANR ARCHITECTURE LAYER: DETERMINISTIC SCHEMA VALIDATION ENGINE
// ============================================================================

export type ErrorCode = 
  | "MISSING_FIELD" 
  | "TYPE_MISMATCH" 
  | "OUT_OF_RANGE" 
  | "INVALID_ENUM" 
  | "PATTERN_MISMATCH" 
  | "UNEXPECTED_PROPERTY"
  | "MALFORMED_STRUCTURE";

export interface ValidationError {
  field: string;
  reason: string;
  code: ErrorCode;
}

 ZorValidationReport {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validates untrusted inbound objects against the strict, canonical structure
 * defined within /data/schema/plant.schema.json. Implements zero-fallback validation.
 */
export class ValidationEngine {
  
  // Valid options mirror the precise enum rules of the locked canonical schema
  private static readonly VALID_ROLES = new Set(["structural", "pollinator_magnet", "groundcover", "buffer"]);
  private static readonly VALID_SEASONS = new Set(["Spring", "Summer", "Autumn", "Winter"]);
  private static readonly VALID_CYCLES = new Set(["annual", "biennial", "perennial", "woody_perennial"]);

  /**
   * Primary Ingestion Point for Raw Objects (JSON or Coerced CSV Rows)
   */
  public static validateRecord(record: any): ZorValidationReport {
    const errors: ValidationError[] = [];

    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      return {
        valid: false,
        errors: [{ field: "root", reason: "Record must be a valid structured JSON object.", code: "MALFORMED_STRUCTURE" }]
      };
    }

    // 1. Verify structural limits and reject additional fields to protect isolation barriers
    const allowedKeys = new Set([
      "id", "scientific_name", "common_name", "ecological_role", "bloom_period",
      "spacing_factor", "height_ft", "sprawl_factor", "sun_preference", "moisture_preference",
      "soil_affinity", "garden_affinity", "schema_version", "active", "native_regions",
      "ecoregions", "wildlife_value", "deer_resistance", "aggressive_spreader", "max_age_years",
      "external_ids", "latin_family", "life_cycle", "mature_width_ft", "seed_source_verified"
    ]);

    for (const key of Object.keys(record)) {
      if (!allowedKeys.has(key)) {
        errors.push({
          field: key,
          reason: `Property '${key}' is not recognized by the canonical plant schema definition.`,
          code: "UNEXPECTED_PROPERTY"
        });
      }
    }

    // 2. Validate Root Required Fields
    const requiredFields: Array<keyof any> = [
      "id", "scientific_name", "common_name", "ecological_role", "bloom_period",
      "spacing_factor", "height_ft", "sprawl_factor", "sun_preference", "moisture_preference",
      "soil_affinity", "garden_affinity"
    ];

    for (const reqField of requiredFields) {
      if (record[reqField] === undefined || record[reqField] === null) {
        errors.push({
          field: reqField as string,
          reason: `Required core property '${reqField}' is absent from payload.`,
          code: "MISSING_FIELD"
        });
      }
    }

    // Fail immediately on missing critical elements to avoid executing validations against undefined blocks
    if (errors.some(e => e.code === "MISSING_FIELD")) {
      return { valid: false, errors };
    }

    // 3. Primative Value Structural Validation
    this.checkString(record.id, "id", true, /^p[0-9]+$/, errors);
    this.checkString(record.scientific_name, "scientific_name", true, null, errors, 2, 150);
    this.checkString(record.common_name, "common_name", true, null, errors, 2, 100);
    
    if (typeof record.ecological_role !== 'string' || !this.VALID_ROLES.has(record.ecological_role)) {
      errors.push({ field: "ecological_role", reason: "Invalid role enumeration assignment.", code: "INVALID_ENUM" });
    }
    if (typeof record.bloom_period !== 'string' || !this.VALID_SEASONS.has(record.bloom_period)) {
      errors.push({ field: "bloom_period", reason: "Invalid seasonal anthesis assignment.", code: "INVALID_ENUM" });
    }

    this.checkNumber(record.spacing_factor, "spacing_factor", 0.25, 50.0, errors);
    this.checkNumber(record.height_ft, "height_ft", 0.1, 150.0, errors);
    this.checkNumber(record.sprawl_factor, "sprawl_factor", 0.0, 1.0, errors);
    this.checkNumber(record.sun_preference, "sun_preference", 0.0, 1.0, errors);
    this.checkNumber(record.moisture_preference, "moisture_preference", 0.0, 1.0, errors);

    // 4. Nested Structural Matrix Affinities Check
    this.checkAffinityGroup(record.soil_affinity, "soil_affinity", ["clay", "loam", "sand", "wet_muck"], errors);
    this.checkAffinityGroup(record.garden_affinity, "garden_affinity", ["pollinator", "prairie", "rain_garden", "lawn_replacement"], errors);

    // 5. Optional Extensible Schema Properties Validation (If provided)
    if (record.schema_version !== undefined) this.checkString(record.schema_version, "schema_version", false, /^[0-9]+\.[0-9]+\.[0-9]+$/, errors);
    if (record.active !== undefined && typeof record.active !== 'boolean') errors.push({ field: "active", reason: "Property must resolve to a standard boolean type.", code: "TYPE_MISMATCH" });
    if (record.aggressive_spreader !== undefined && typeof record.aggressive_spreader !== 'boolean') errors.push({ field: "aggressive_spreader", reason: "Property must resolve to a standard boolean type.", code: "TYPE_MISMATCH" });
    if (record.seed_source_verified !== undefined && typeof record.seed_source_verified !== 'boolean') errors.push({ field: "seed_source_verified", reason: "Property must resolve to a standard boolean type.", code: "TYPE_MISMATCH" });
    
    if (record.wildlife_value !== undefined) this.checkNumber(record.wildlife_value, "wildlife_value", 0.0, 1.0, errors);
    if (record.deer_resistance !== undefined) this.checkNumber(record.deer_resistance, "deer_resistance", 0.0, 1.0, errors);
    if (record.mature_width_ft !== undefined) this.checkNumber(record.mature_width_ft, "mature_width_ft", 0.1, 100.0, errors);
    if (record.max_age_years !== undefined) this.checkInteger(record.max_age_years, "max_age_years", 1, 5000, errors);

    if (record.latin_family !== undefined) this.checkString(record.latin_family, "latin_family", false, null, errors, 0, 100);
    if (record.life_cycle !== undefined && (typeof record.life_cycle !== 'string' || !this.VALID_CYCLES.has(record.life_cycle))) {
      errors.push({ field: "life_cycle", reason: "Invalid standard biological lifecycle classification.", code: "INVALID_ENUM" });
    }

    if (record.native_regions !== undefined) this.checkStringArray(record.native_regions, "native_regions", 2, 50, errors);
    if (record.ecoregions !== undefined) this.checkStringArray(record.ecoregions, "ecoregions", 5, 30, errors, /^[A-Z]{2}_[A-Z0-9_]+$/);

    if (record.external_ids !== undefined) {
      this.checkNestedMap(record.external_ids, "external_ids", ["usda_id", "bonap_id", "npin_id"], errors);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Bulk Batch Processing Target Entry Route
   */
  public static validateBatch(records: any[]): ZorValidationReport[] {
    return records.map(record => this.validateRecord(record));
  }

  /**
   * Safe CSV Native Formatting String Row Ingestion Parser & Coercer
   */
  public static coerceCsvRow(row: Record<string, string>): any {
    const output: any = {};
    
    // Explicit numerical casting instructions array targeting core primitives
    const numericFields = new Set([
      "spacing_factor", "height_ft", "sprawl_factor", "sun_preference", "moisture_preference",
      "wildlife_value", "deer_resistance", "max_age_years", "mature_width_ft"
    ]);

    // Explicit boolean structural processing map
    const booleanFields = new Set(["active", "aggressive_spreader", "seed_source_verified"]);

    for (const [key, rawVal] of Object.entries(row)) {
      const val = rawVal ? rawVal.trim() : "";
      if (val === "") continue; // Pass empty entries down to enforce required checks or optional skips

      if (numericFields.has(key)) {
        const num = Number(val);
        output[key] = Number.isNaN(num) ? val : num; // Pass raw value string on if casting fails to trigger TYPE_MISMATCH
      } else if (booleanFields.has(key)) {
        const lower = val.toLowerCase();
        if (lower === "true" || lower === "1" || lower === "yes") output[key] = true;
        else if (lower === "false" || lower === "0" || lower === "no") output[key] = false;
        else output[key] = val; // Force type exception at strict validator
      } else if (key.startsWith("soil_affinity.") || key.startsWith("garden_affinity.") || key.startsWith("external_ids.")) {
        const parts = key.split(".");
        const parent = parts[0];
        const child = parts[1];
        
        output[parent] = output[parent] || {};
        const childNum = Number(val);
        output[parent][child] = parent.endsWith("_ids") ? val : (Number.isNaN(childNum) ? val : childNum);
      } else if (key === "native_regions" || key === "ecoregions") {
        output[key] = val.split(",").map(item => item.trim()).filter(item => item.length > 0);
      } else {
        output[key] = val;
      }
    }

    return output;
  }

  /* ==========================================================================
     INTERNAL STRUCTURAL LOWER LEVEL CHECKS
     ========================================================================== */

  private checkString(v: any, field: string, req: boolean, pattern: RegExp | null, errors: ValidationError[], min = 0, max = 500) {
    if (v === undefined || v === null) return;
    if (typeof v !== 'string') {
      errors.push({ field, reason: "Expected standard primitive string layout type.", code: "TYPE_MISMATCH" });
      return;
    }
    if (v.length < min || v.length > max) {
      errors.push({ field, reason: `Length bounding mismatch. Bounds: [${min}-${max}]. Received: ${v.length}`, code: "OUT_OF_RANGE" });
    }
    if (pattern && !pattern.test(v)) {
      errors.push({ field, reason: `Value '${v}' breaches structure format layout rule pattern criteria.`, code: "PATTERN_MISMATCH" });
    }
  }

  private checkNumber(v: any, field: string, min: number, max: number, errors: ValidationError[]) {
    if (v === undefined || v === null) return;
    if (typeof v !== 'number' || Number.isNaN(v)) {
      errors.push({ field, reason: "Expected numerical float data precision type primitive.", code: "TYPE_MISMATCH" });
      return;
    }
    if (v < min || v > max) {
      errors.push({ field, reason: `Numerical boundary breach. Limits: [${min}-${max}]. Extracted: ${v}`, code: "OUT_OF_RANGE" });
    }
  }

  private checkInteger(v: any, field: string, min: number, max: number, errors: ValidationError[]) {
    if (v === undefined || v === null) return;
    if (!Number.isInteger(v)) {
      errors.push({ field, reason: "Value configuration must resolve to a discrete base integer format.", code: "TYPE_MISMATCH" });
      return;
    }
    if (v < min || v > max) {
      errors.push({ field, reason: `Integer target index bounds exceeded [${min}-${max}].`, code: "OUT_OF_RANGE" });
    }
  }

  private checkAffinityGroup(obj: any, parentField: string, mandatoryKeys: string[], errors: ValidationError[]) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      errors.push({ field: parentField, reason: "Matrix parameter block map must resolve to an object.", code: "TYPE_MISMATCH" });
      return;
    }
    // Strict block check matching original additionalProperties: false schema settings
    for (const k of Object.keys(obj)) {
      if (!mandatoryKeys.includes(k)) {
        errors.push({ field: `${parentField}.${k}`, reason: "Extraneous matrix attribute rejected.", code: "UNEXPECTED_PROPERTY" });
      }
    }
    for (const key of mandatoryKeys) {
      this.checkNumber(obj[key], `${parentField}.${key}`, 0.0, 1.0, errors);
      if (obj[key] === undefined || obj[key] === null) {
        errors.push({ field: `${parentField}.${key}`, reason: "Missing absolute coordinate element.", code: "MISSING_FIELD" });
      }
    }
  }

  private checkNestedMap(obj: any, parentField: string, validKeys: string[], errors: ValidationError[]) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      errors.push({ field: parentField, reason: "Attribute configuration block must resolve to an object mapping structure.", code: "TYPE_MISMATCH" });
      return;
    }
    for (const k of Object.keys(obj)) {
      if (!validKeys.includes(k)) {
        errors.push({ field: `${parentField}.${k}`, reason: "Property key is not recognized under current specifications.", code: "UNEXPECTED_PROPERTY" });
      } else if (typeof obj[k] !== 'string') {
        errors.push({ field: `${parentField}.${k}`, reason: "Required standard alphanumeric reference assignment mapping string.", code: "TYPE_MISMATCH" });
      }
    }
  }

  private checkStringArray(arr: any, field: string, minItemLen: number, maxItemLen: number, errors: ValidationError[], pattern: RegExp | null = null) {
    if (!Array.isArray(arr)) {
      errors.push({ field, reason: "Required collection list formatting framework array structure array.", code: "TYPE_MISMATCH" });
      return;
    }
    const elementsSet = new Set();
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (typeof item !== 'string') {
        errors.push({ field: `${field}[${i}]`, reason: "Array configuration index elements must resolve to scalar strings.", code: "TYPE_MISMATCH" });
        continue;
      }
      if (item.length < minItemLen || item.length > maxItemLen) {
        errors.push({ field: `${field}[${i}]`, reason: `Element size violation constraints: [${minItemLen}-${maxItemLen}].`, code: "OUT_OF_RANGE" });
      }
      if (pattern && !pattern.test(item)) {
        errors.push({ field: `${field}[${i}]`, reason: `Value layout format validation failure matching pattern layout.`, code: "PATTERN_MISMATCH" });
      }
      if (elementsSet.has(item)) {
        errors.push({ field: `${field}[${i}]`, reason: `Duplicate list item reference entry found: '${item}' violates uniqueItems rule constraints.`, code: "MALFORMED_STRUCTURE" });
      }
      elementsSet.add(item);
    }
  }
}

// workers/core/validation/blueprint.schema.ts
// ============================================================================
// NATIVEPLANR SECURITY LAYER: INPUT SCHEMA VALIDATION GUARD
// ============================================================================

import { BlueprintInput } from '../../core/engines/blueprint-generator';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  validatedData?: BlueprintInput;
}

/**
 * Validates untrusted request data against strict BlueprintInput structural requirements
 */
export function validateBlueprintInput(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Invalid request payload format. Required a valid JSON object.'] };
  }

  // 1. Validate zip_code parameter (Strict 5-digit US pattern)
  if (typeof data.zip_code !== 'string' || !/^\d{5}$/.test(data.zip_code.trim())) {
    errors.push("Parameter 'zip_code' must be a valid 5-digit numerical string.");
  }

  // 2. Validate yard dimension width constraints
  if (typeof data.width !== 'number' || data.width < 4 || data.width > 100 || !Number.isInteger(data.width)) {
    errors.push("Parameter 'width' must be an integer between 4 and 100 feet.");
  }

  // 3. Validate yard dimension length constraints
  if (typeof data.length !== 'number' || data.length < 4 || data.length > 100 || !Number.isInteger(data.length)) {
    errors.push("Parameter 'length' must be an integer between 4 and 100 feet.");
  }

  // 4. Validate soil taxonomy enumerations
  const validSoilTypes = new Set(['clay', 'loam', 'sand', 'wet_muck']);
  if (!validSoilTypes.has(data.soil_type)) {
    errors.push("Parameter 'soil_type' must be one of: 'clay', 'loam', 'sand', 'wet_muck'.");
  }

  // 5. Validate garden system design layout categories
  const validGardenTypes = new Set(['pollinator', 'prairie', 'rain_garden', 'lawn_replacement']);
  if (!validGardenTypes.has(data.garden_type)) {
    errors.push("Parameter 'garden_type' must be one of: 'pollinator', 'prairie', 'rain_garden', 'lawn_replacement'.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    validatedData: errors.length === 0 ? {
      zip_code: data.zip_code.trim(),
      width: data.width,
      length: data.length,
      soil_type: data.soil_type,
      garden_type: data.garden_type,
      strict_mode: data.strict_mode === true
    } : undefined
  };
}

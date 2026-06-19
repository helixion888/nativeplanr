{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://nativeplanr.com/schemas/v1/plant.schema.json",
  "title": "PlantProfileRecord",
  "description": "Canonical Immutable Botanical Knowledge Object Schema. Enforces intrinsic real-world botanical facts only.",
  "type": "object",
  "required": [
    "id",
    "scientific_name",
    "common_name",
    "ecological_role",
    "bloom_period",
    "spacing_factor",
    "height_ft",
    "sprawl_factor",
    "sun_preference",
    "moisture_preference",
    "soil_affinity",
    "garden_affinity"
  ],
  "additionalProperties": false,
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^p[0-9]+$",
      "description": "Stable immutable system taxonomy primary index identifier key."
    },
    "scientific_name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 150,
      "description": "Binomial nomenclature standard botanical identifier."
    },
    "common_name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100,
      "description": "Primary vernacular horticultural descriptor."
    },
    "ecological_role": {
      "type": "string",
      "enum": ["structural", "pollinator_magnet", "groundcover", "buffer"],
      "description": "Primary wild functional niche footprint classification."
    },
    "bloom_period": {
      "type": "string",
      "enum": ["Spring", "Summer", "Autumn", "Winter"],
      "description": "Natural seasonal anthesis generation period window."
    },
    "spacing_factor": {
      "type": "number",
      "minimum": 0.25,
      "maximum": 50.0,
      "description": "Optimal biological root/canopy spacing clearance requirement in feet."
    },
    "height_ft": {
      "type": "number",
      "minimum": 0.1,
      "maximum": 150.0,
      "description": "Average adult terminal height specification metric under baseline conditions."
    },
    "sprawl_factor": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0,
      "description": "Rate of horizontal footprint enlargement via vegetative means."
    },
    "sun_preference": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0,
      "description": "Normalized solar radiation intensity saturation coefficient (0=Deep Shade, 1=Full Sun)."
    },
    "moisture_preference": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0,
      "description": "Normalized environmental hydrological requirement baseline matrix index."
    },
    "soil_affinity": {
      "type": "object",
      "required": ["clay", "loam", "sand", "wet_muck"],
      "additionalProperties": false,
      "properties": {
        "clay": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "loam": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "sand": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "wet_muck": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
      },
      "description": "Deterministic suitability score across standardized mineral texture variants."
    },
    "garden_affinity": {
      "type": "object",
      "required": ["pollinator", "prairie", "rain_garden", "lawn_replacement"],
      "additionalProperties": false,
      "properties": {
        "pollinator": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "prairie": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "rain_garden": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "lawn_replacement": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
      },
      "description": "Inherent baseline suitability scaling configurations across targeted macro design intents."
    },
    "schema_version": {
      "type": "string",
      "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$"
    },
    "active": {
      "type": "boolean"
    },
    "native_regions": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "type": "string",
        "minLength": 2,
        "maxLength": 50
      }
    },
    "ecoregions": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "type": "string",
        "pattern": "^[A-Z]{2}_[A-Z0-9_]+$"
      }
    },
    "wildlife_value": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0
    },
    "deer_resistance": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0
    },
    "aggressive_spreader": {
      "type": "boolean"
    },
    "max_age_years": {
      "type": "integer",
      "minimum": 1,
      "maximum": 5000
    },
    "external_ids": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "usda_id": { "type": "string" },
        "bonap_id": { "type": "string" },
        "npin_id": { "type": "string" }
      }
    },
    "latin_family": {
      "type": "string",
      "maxLength": 100
    },
    "life_cycle": {
      "type": "string",
      "enum": ["annual", "biennial", "perennial", "woody_perennial"]
    },
    "mature_width_ft": {
      "type": "number",
      "minimum": 0.1,
      "maximum": 100.0
    },
    "seed_source_verified": {
      "type": "boolean"
    }
  }
}

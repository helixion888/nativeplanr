// workers/api/generate-blueprint.ts
// ============================================================================
// NATIVEPLANR HTTP GATEWAY: GENERATE BLUEPRINT CONTROLLER ENDPOINT
// ============================================================================

import { validateBlueprintInput } from '../core/validation/blueprint.schema';
import { BlueprintService } from '../core/services/blueprint.service';

/**
 * Endpoint processing script for handling incoming habitat plan configurations
 */
export async function handleGenerateBlueprint(request: Request, env: any): Promise<Response> {
  const headers = { 'Content-Type': 'application/json' };

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed. Enforce POST queries.' }), { status: 405, headers });
  }

  try {
    // 1. Extract raw untrusted request body structure string
    const rawData = await request.json();
    
    // 2. Run payload data through our validation framework
    const validation = validateBlueprintInput(rawData);
    
    if (!validation.isValid) {
      return new Response(JSON.stringify({ 
        error: 'Validation Fault Protocol Triggered', 
        details: validation.errors 
      }), { status: 400, headers });
    }

    // 3. Orchestrate processing thread securely through our service boundary layer
    const result = await BlueprintService.executeGeneration(env.DB, validation.validatedData!);

    return new Response(JSON.stringify(result), { status: 200, headers });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: 'Malformed JSON parameters or network configuration conflict.',
      details: error.message 
    }), { status: 400, headers });
  }
}

// workers/api/router.ts
// ============================================================================
// NATIVEPLANR SERVERLESS EDGE INFRASTRUCTURE ROUTER GATEWAY
// ============================================================================

import { handleGenerateBlueprint } from './generate-blueprint';

export class ApiRouter {
  /**
   * Matches incoming HTTP routing contexts to explicit processing files at edge nodes
   */
  public async handleRequest(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const headers = { 'Content-Type': 'application/json' };

    // Route allocations boundary check
    if (url.pathname === '/api/blueprint/generate' || url.pathname === '/api/v1/blueprint/generate') {
      return await handleGenerateBlueprint(request, env);
    }

    // Standard fallback response layout mapping for unmapped routing requests
    return new Response(JSON.stringify({ 
      error: `Resource tracking point [${url.pathname}] not recognized across system registries.` 
    }), { status: 404, headers });
  }
}

// workers/api/worker.ts
// ============================================================================
// NATIVEPLANR CORE API LAYER - STATELESS EDGE ROUTER GATEWAY
// ============================================================================

import { CanonicalPlantValidator } from '../../data/validation/validation';
import { KnowledgeGraphImporter } from '../admin/importer';
import { StructuralDataGuard } from '../admin/guard';

const SYSTEM_API_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

function handleOptionsRequest(): Response {
  return new Response(null, {
    status: 204,
    headers: SYSTEM_API_HEADERS
  });
}

function buildErrorResponse(message: string, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, status }),
    { status, headers: SYSTEM_API_HEADERS }
  );
}

function handleHealthCheck(): Response {
  return new Response(
    JSON.stringify({
      status: "healthy",
      timestamp: Math.floor(Date.now() / 1000),
      subsystems: {
        validation_engine: "LOADED_IMMUTABLE",
        ingestion_firewall: "ACTIVE",
        integrity_guard: "ENFORCED"
      }
    }),
    { status: 200, headers: SYSTEM_API_HEADERS }
  );
}

async function handleValidateRoute(request: Request): Promise<Response> {
  try {
    const jsonPayload = await request.json();
    const result = CanonicalPlantValidator.validate(jsonPayload);
    return new Response(JSON.stringify(result), { status: 200, headers: SYSTEM_API_HEADERS });
  } catch (err: any) {
    return buildErrorResponse(`Malformed JSON target structure body payload: ${err.message}`, 400);
  }
}

async function handleImportRoute(request: Request): Promise<Response> {
  try {
    const contentType = request.headers.get('content-type') || '';
    let ingestionBody: any;

    if (contentType.includes('application/json')) {
      ingestionBody = await request.json();
    } else {
      ingestionBody = await request.text();
    }

    const importResult = KnowledgeGraphImporter.executeImportPayload(ingestionBody);
    return new Response(JSON.stringify(importResult), { status: 200, headers: SYSTEM_API_HEADERS });
  } catch (err: any) {
    return buildErrorResponse(`Ingestion track validation processing failure: ${err.message}`, 400);
  }
}

async function handleGuardRoute(request: Request): Promise<Response> {
  try {
    const memoryArray = await request.json();
    
    if (!Array.isArray(memoryArray)) {
      return buildErrorResponse("Guard payload contract requires a flat structural array of objects.", 400);
    }

    StructuralDataGuard.assertPurity(memoryArray);

    return new Response(
      JSON.stringify({ verified: true, count: memoryArray.length, rule: "IMMUTABLE_GRAPH_PURITY_SECURED" }),
      { status: 200, headers: SYSTEM_API_HEADERS }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ verified: false, breach_exception: err.message }),
      { status: 422, headers: SYSTEM_API_HEADERS }
    );
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    const routingContextUrl = new URL(request.url);
    const targetEndpointPath = routingContextUrl.pathname;

    if (request.method === 'OPTIONS') {
      return handleOptionsRequest();
    }

    switch (targetEndpointPath) {
      case '/api/health':
        if (request.method === 'GET') return handleHealthCheck();
        break;
      
      case '/api/validate':
        if (request.method === 'POST') return handleValidateRoute(request);
        break;
        
      case '/api/import':
        if (request.method === 'POST') return handleImportRoute(request);
        break;
        
      case '/api/guard':
        if (request.method === 'POST') return handleGuardRoute(request);
        break;
    }

    return buildErrorResponse(`API Endpoint route context path [${targetEndpointPath}] not registered across system maps.`, 404);
  }
};

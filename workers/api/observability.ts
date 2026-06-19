// workers/api/observability.ts
// ============================================================================
// NATIVEPLANR OBSERVABILITY LAYER - DETERMINISTIC RUNTIME MONITORING
// ============================================================================

export interface LogMetricEnvelope {
  endpoint: string;
  timestamp: number;
  trace_id: string;
  success: boolean;
  contract_breach: boolean;
  message?: string;
}

export function generateRequestFingerprint(endpoint: string, sanitizedHeaders: Record<string, string>, bodyText: string): string {
  const compositeString = [
    endpoint.trim().toLowerCase(),
    Object.keys(sanitizedHeaders).sort().map(k => `${k}:${sanitizedHeaders[k]}`).join(','),
    bodyText.trim()
  ].join('|');

  let hashValue = 2166136261;
  for (let i = 0; i < compositeString.length; i++) {
    hashValue ^= compositeString.charCodeAt(i);
    hashValue = Math.imul(hashValue, 16777619);
  }

  return (hashValue >>> 0).toString(16).padStart(8, '0');
}

export function verifyResponseContract(endpoint: string, jsonResponseBody: any): void {
  const normalizedPath = endpoint.split('?')[0];

  if (normalizedPath === '/api/validate') {
    if (typeof jsonResponseBody.valid !== 'boolean' || !Array.isArray(jsonResponseBody.errors)) {
      throw new TypeError(`Runtime Contract Violation [/api/validate]: Output schema missing payload structures.`);
    }
  } 
  else if (normalizedPath === '/api/import') {
    if (!Array.isArray(jsonResponseBody.valid) || !Array.isArray(jsonResponseBody.invalid)) {
      throw new TypeError(`Runtime Contract Violation [/api/import]: Output schema fails ImportResult requirements.`);
    }
  } 
  else if (normalizedPath === '/api/guard') {
    if (typeof jsonResponseBody.verified !== 'boolean') {
      throw new TypeError(`Runtime Contract Violation [/api/guard]: Output fails security validation signatures.`);
    }
  }
}

export function emitRuntimeLog(metric: LogMetricEnvelope): void {
  console.log(JSON.stringify({
    level: metric.success ? "INFO" : "ERROR",
    subsystem: "API_GATEWAY_OBSERVABILITY",
    ...metric
  }));
}

export async function executeObservabilityPipeline(
  request: Request,
  executeRouteHandler: () => Promise<Response>
): Promise<Response> {
  const requestUrl = new URL(request.url);
  const path = requestUrl.pathname;
  const timestamp = Math.floor(Date.now() / 1000);

  const cloneForFingerprint = request.clone();
  const rawBodyText = await cloneForFingerprint.text().catch(() => '');
  const targetHeaders: Record<string, string> = {};
  
  const whitelist = ['content-type', 'user-agent'];
  whitelist.forEach(h => {
    const v = request.headers.get(h);
    if (v) targetHeaders[h] = v;
  });

  const traceId = generateRequestFingerprint(path, targetHeaders, rawBodyText);

  try {
    const interceptedResponse = await executeRouteHandler();
    
    if (!path.startsWith('/api/') || path === '/api/health' || interceptedResponse.status >= 400) {
      emitRuntimeLog({ endpoint: path, timestamp, trace_id: traceId, success: interceptedResponse.ok, contract_breach: false });
      return interceptedResponse;
    }

    const cloneForContractCheck = interceptedResponse.clone();
    const jsonOutputBody = await cloneForContractCheck.json().catch(() => null);

    if (jsonOutputBody) {
      verifyResponseContract(path, jsonOutputBody);
    }

    emitRuntimeLog({ endpoint: path, timestamp, trace_id: traceId, success: true, contract_breach: false });
    return interceptedResponse;

  } catch (exception: any) {
    const isContractViolation = exception instanceof TypeError && exception.message.includes('Contract Violation');
    
    emitRuntimeLog({
      endpoint: path,
      timestamp,
      trace_id: traceId,
      success: false,
      contract_breach: isContractViolation,
      message: exception.message
    });

    if (isContractViolation) {
      return new Response(
        JSON.stringify({ error: "Deterministic Runtime Guard Interception: Response failed validation constraints.", trace: traceId }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    throw exception;
  }
}

export const RuntimeObservabilityLayer = {
  fingerprint: generateRequestFingerprint,
  assertContract: verifyResponseContract,
  log: emitRuntimeLog,
  intercept: executeObservabilityPipeline
};

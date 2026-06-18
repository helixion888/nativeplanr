// src/components/api-client.js
export class ApiClient {
  /**
   * Dispatches un-mutated parameter payloads down standard HTTP gateway paths
   */
  async generateBlueprint(inputData) {
    // Target deployment route binding to local Cloudflare edge framework instances
    const targetEndpoint = '/api/blueprint/generate';
    
    const response = await fetch(targetEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP Network Protocol Breach: ${response.status}`);
    }

    return await response.json();
  }
}

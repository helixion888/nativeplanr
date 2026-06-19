// workers/plugins/plugin-system.ts
// ============================================================================
// NATIVEPLANR ARCHITECTURE LAYER: IMMUTABLE PLUGIN FRAMEWORK INTERFACE
// ============================================================================

export type PluginCategory = 
  | 'seo_plugin' 
  | 'affiliate_plugin' 
  | 'ui_generator_plugin' 
  | 'calculator_plugin';

export interface PluginExecutionContext {
  readonly traceId: string;
  readonly env: Record<string, any>;
}

export interface NativePlanrPlugin<TInput = any, TOutput = any> {
  readonly name: string;
  readonly version: string;
  readonly category: PluginCategory;
  
  validateInput(input: unknown): boolean;
  execute(input: TInput, context: PluginExecutionContext): Promise<TOutput>;
}

export class PluginRegistry {
  private static readonly registeredModules = new Map<string, NativePlanrPlugin>();

  public static registerPlugin(plugin: NativePlanrPlugin): void {
    if (!plugin.name || !/^[a-z0-9-_]+$/.test(plugin.name)) {
      throw new Error(`Plugin Registry Fault: Illegal module name format string layout: '${plugin.name}'.`);
    }
    if (this.registeredModules.has(plugin.name)) {
      throw new Error(`Plugin Registry Fault: Module identifier resource collision matching name key: '${plugin.name}'.`);
    }

    this.registeredModules.set(plugin.name, plugin);
  }

  public static getPlugin(name: string): NativePlanrPlugin | null {
    return this.registeredModules.get(name) || null;
  }

  public static listPlugins(): Array<{ name: string; version: string; category: PluginCategory }> {
    return Array.from(this.registeredModules.values()).map(p => ({
      name: p.name,
      version: p.version,
      category: p.category
    }));
  }

  public static deconstructPlugin(name: string): boolean {
    return this.registeredModules.delete(name);
  }
}

export interface PluginExecutionEnvelope<T> {
  success: boolean;
  pluginName: string;
  durationMs: number;
  data: T | null;
  error?: string;
}

export class PluginSandboxEngine {
  public static async invokeSafely<TIn, TOut>(
    pluginName: string,
    rawPayload: TIn,
    context: PluginExecutionContext
  ): Promise<PluginExecutionEnvelope<TOut>> {
    const targetModule = PluginRegistry.getPlugin(pluginName);
    const timestampStart = Date.now();

    if (!targetModule) {
      return {
        success: false,
        pluginName,
        durationMs: 0,
        data: null,
        error: `Target application module execution token reference name [${pluginName}] not tracked.`
      };
    }

    try {
      const isConformingInput = targetModule.validateInput(rawPayload);
      if (!isConformingInput) {
        return {
          success: false,
          pluginName,
          durationMs: Date.now() - timestampStart,
          data: null,
          error: "Input validation block rejected incoming payload structure contract configuration rules."
        };
      }

      const frozenInputPayload = Object.freeze(JSON.parse(JSON.stringify(rawPayload)));
      const calculationOutput = await targetModule.execute(frozenInputPayload, context);

      return {
        success: true,
        pluginName,
        durationMs: Date.now() - timestampStart,
        data: calculationOutput
      };

    } catch (sandboxException: any) {
      return {
        success: false,
        pluginName,
        durationMs: Date.now() - timestampStart,
        data: null,
        error: `Plugin Runtime Interception Exception: ${sandboxException.message}`
      };
    }
  }
}

export const CoreFeatureSystemPluginMappingStub = {
  getInterfaceMapFingerprint: () => "nativeplanr.contract.plugin-layer.v1.0.0"
};

export const NativePlanrPluginSystem = {
  register: PluginRegistry.registerPlugin,
  get: PluginRegistry.getPlugin,
  list: PluginRegistry.listPlugins,
  unload: PluginRegistry.deconstructPlugin,
  execute: PluginSandboxEngine.invokeSafely,
  signature: CoreFeatureSystemPluginMappingStub.getInterfaceMapFingerprint
};

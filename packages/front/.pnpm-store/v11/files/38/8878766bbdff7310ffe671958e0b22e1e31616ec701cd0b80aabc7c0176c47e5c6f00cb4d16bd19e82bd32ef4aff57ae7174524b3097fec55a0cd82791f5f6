import VirtualModulesPlugin from "webpack-virtual-modules";
import { CompilationContext, JsPlugin } from "@farmfe/core";
import { RsbuildPlugin } from "@rsbuild/core";
import { Compilation, Compiler as RspackCompiler, LoaderContext, RspackPluginInstance } from "@rspack/core";
import { BunPlugin, Loader, PluginBuilder } from "bun";
import { BuildOptions, Loader as Loader$1, Plugin as EsbuildPlugin, PluginBuild } from "esbuild";
import { Plugin as RolldownPlugin } from "rolldown";
import { EmittedAsset, Plugin as RollupPlugin, PluginContextMeta, SourceMapInput } from "rollup";
import { Plugin as UnloaderPlugin } from "unloader";
import { Plugin as VitePlugin } from "vite";
import { Compilation as Compilation$1, Compiler as WebpackCompiler, LoaderContext as LoaderContext$1, WebpackPluginInstance } from "webpack";
//#region src/types.d.ts
export type Thenable<T> = T | Promise<T>;
/**
 * Null or whatever
 */
export type Nullable<T> = T | null | undefined;
/**
 * Array, or not yet
 */
export type Arrayable<T> = T | Array<T>;
export interface SourceMapCompact {
  file?: string | undefined;
  mappings: string;
  names: string[];
  sourceRoot?: string | undefined;
  sources: string[];
  sourcesContent?: (string | null)[] | undefined;
  version: number;
}
export type TransformResult = string | {
  code: string;
  map?: SourceMapInput | SourceMapCompact | null | undefined;
} | null | undefined | void;
export interface ExternalIdResult {
  id: string;
  external?: boolean | undefined;
}
export type NativeBuildContext = {
  framework: "webpack";
  compiler: WebpackCompiler;
  compilation?: Compilation$1 | undefined;
  loaderContext?: LoaderContext$1<{
    unpluginName: string;
  }> | undefined;
  inputSourceMap?: any;
} | {
  framework: "esbuild";
  build: PluginBuild;
} | {
  framework: "rspack";
  compiler: RspackCompiler;
  compilation: Compilation;
  loaderContext?: LoaderContext | undefined;
  inputSourceMap?: any;
} | {
  framework: "farm";
  context: CompilationContext;
} | {
  framework: "bun";
  build: PluginBuilder;
};
export interface UnpluginBuildContext {
  addWatchFile: (id: string) => void;
  emitFile: (emittedFile: EmittedAsset) => void;
  getWatchFiles: () => string[];
  parse: (input: string, options?: any) => any;
  getNativeBuildContext?: (() => NativeBuildContext) | undefined;
}
export type StringOrRegExp = string | RegExp;
export type FilterPattern = Arrayable<StringOrRegExp>;
export type StringFilter = FilterPattern | {
  include?: FilterPattern | undefined;
  exclude?: FilterPattern | undefined;
};
export interface ResolveIdHookFilter {
  id?: RegExp | undefined;
}
export interface LoadHookFilter {
  id?: StringFilter | undefined;
}
export interface TransformHookFilter extends LoadHookFilter {
  code?: StringFilter | undefined;
}
export interface ObjectHook<T extends HookFnMap[keyof HookFnMap], F> {
  filter?: F | undefined;
  handler: T;
}
export type Hook<T extends HookFnMap[keyof HookFnMap], F> = T | ObjectHook<T, F>;
export interface HookFnMap {
  buildStart: (this: UnpluginBuildContext) => Thenable<void>;
  buildEnd: (this: UnpluginBuildContext) => Thenable<void>;
  transform: (this: UnpluginBuildContext & UnpluginContext, code: string, id: string) => Thenable<TransformResult>;
  load: (this: UnpluginBuildContext & UnpluginContext, id: string) => Thenable<TransformResult>;
  resolveId: (this: UnpluginBuildContext & UnpluginContext, id: string, importer: string | undefined, options: {
    isEntry: boolean;
  }) => Thenable<string | ExternalIdResult | null | undefined>;
  writeBundle: (this: void) => Thenable<void>;
}
export interface UnpluginOptions {
  name: string;
  enforce?: "post" | "pre" | undefined;
  buildStart?: HookFnMap["buildStart"] | undefined;
  buildEnd?: HookFnMap["buildEnd"] | undefined;
  transform?: Hook<HookFnMap["transform"], TransformHookFilter> | undefined;
  load?: Hook<HookFnMap["load"], LoadHookFilter> | undefined;
  resolveId?: Hook<HookFnMap["resolveId"], ResolveIdHookFilter> | undefined;
  writeBundle?: HookFnMap["writeBundle"] | undefined;
  watchChange?: ((this: UnpluginBuildContext, id: string, change: {
    event: "create" | "update" | "delete";
  }) => void) | undefined;
  /**
   * Custom predicate function to filter modules to be loaded.
   * When omitted, all modules will be included (might have potential perf impact on Webpack).
   *
   * @deprecated Use `load.filter` instead.
   */
  loadInclude?: ((id: string) => boolean | null | undefined) | undefined;
  /**
   * Custom predicate function to filter modules to be transformed.
   * When omitted, all modules will be included (might have potential perf impact on Webpack).
   *
   * @deprecated Use `transform.filter` instead.
   */
  transformInclude?: ((id: string) => boolean | null | undefined) | undefined;
  rollup?: Partial<RollupPlugin> | undefined;
  webpack?: ((compiler: WebpackCompiler) => void) | undefined;
  rspack?: ((compiler: RspackCompiler) => void) | undefined;
  rsbuild?: Partial<RsbuildPlugin> | undefined;
  vite?: Partial<VitePlugin> | undefined;
  unloader?: Partial<UnloaderPlugin> | undefined;
  rolldown?: Partial<RolldownPlugin> | undefined;
  esbuild?: {
    onResolveFilter?: RegExp | undefined;
    onLoadFilter?: RegExp | undefined;
    loader?: Loader$1 | ((code: string, id: string) => Loader$1) | undefined;
    setup?: ((build: PluginBuild) => void | Promise<void>) | undefined;
    config?: ((options: BuildOptions) => void) | undefined;
  } | undefined;
  farm?: Partial<JsPlugin> | undefined;
  bun?: {
    loader?: Loader | ((code: string, id: string) => Loader) | undefined;
    setup?: ((build: PluginBuilder) => void | Promise<void>) | undefined;
  } | undefined;
}
export interface ResolvedUnpluginOptions extends UnpluginOptions {
  __vfs?: VirtualModulesPlugin | undefined;
  __vfsModules?: Map<string, Promise<unknown>> | Set<string> | undefined;
  __virtualModulePrefix: string;
}
export type UnpluginFactory<UserOptions, Nested extends boolean = boolean> = (options: UserOptions, meta: UnpluginContextMeta) => Nested extends true ? Array<UnpluginOptions> : UnpluginOptions;
export type UnpluginFactoryOutput<UserOptions, Return> = undefined extends UserOptions ? (options?: UserOptions | undefined) => Return : (options: UserOptions) => Return;
export interface UnpluginInstance<UserOptions, Nested extends boolean = boolean> {
  rollup: UnpluginFactoryOutput<UserOptions, Nested extends true ? Array<RollupPlugin> : RollupPlugin>;
  vite: UnpluginFactoryOutput<UserOptions, Nested extends true ? Array<VitePlugin> : VitePlugin>;
  rolldown: UnpluginFactoryOutput<UserOptions, Nested extends true ? Array<RolldownPlugin> : RolldownPlugin>;
  webpack: UnpluginFactoryOutput<UserOptions, WebpackPluginInstance>;
  rspack: UnpluginFactoryOutput<UserOptions, RspackPluginInstance>;
  rsbuild: UnpluginFactoryOutput<UserOptions, Nested extends true ? Array<RsbuildPlugin> : RsbuildPlugin>;
  esbuild: UnpluginFactoryOutput<UserOptions, EsbuildPlugin>;
  unloader: UnpluginFactoryOutput<UserOptions, Nested extends true ? Array<UnloaderPlugin> : UnloaderPlugin>;
  farm: UnpluginFactoryOutput<UserOptions, JsPlugin>;
  bun: UnpluginFactoryOutput<UserOptions, BunPlugin>;
  raw: UnpluginFactory<UserOptions, Nested>;
}
export type SupportedFramework = "rollup" | "vite" | "rolldown" | "farm" | "unloader" | "webpack" | "rspack" | "rsbuild" | "esbuild" | "bun";
export type UnpluginContextMeta = Partial<PluginContextMeta> & {
  /**
   * Version information for frameworks.
   * Access the current framework version via: `meta.versions[meta.framework]`
   *
   * For Vite, includes both Vite's version and the underlying bundler (Rollup/Rolldown).
   * For Rollup-compatible frameworks (vite, rollup, rolldown, unloader),
   * versions are only available after the `buildStart` hook.
   *
   * The `unplugin` version is always available for all frameworks.
   */
  versions: Partial<Record<SupportedFramework | "unplugin", string>>;
} & ({
  framework: "rollup" | "vite" | "rolldown" | "farm" | "unloader";
} | {
  framework: "webpack";
  webpack: {
    compiler: WebpackCompiler;
  };
} | {
  framework: "esbuild";
  /** Set the host plugin name of esbuild when returning multiple plugins */
  esbuildHostName?: string | undefined;
} | {
  framework: "bun";
  /** Set the host plugin name of bun when returning multiple plugins */
  bunHostName?: string | undefined;
} | {
  framework: "rspack";
  rspack: {
    compiler: RspackCompiler;
  };
} | {
  framework: "rsbuild";
});
export interface UnpluginMessage {
  name?: string | undefined;
  id?: string | undefined;
  message: string;
  stack?: string | undefined;
  code?: string | undefined;
  plugin?: string | undefined;
  pluginCode?: unknown | undefined;
  loc?: {
    column: number;
    file?: string | undefined;
    line: number;
  } | undefined;
  meta?: any;
}
export interface UnpluginContext {
  error: (message: string | UnpluginMessage) => void;
  warn: (message: string | UnpluginMessage) => void;
}
//#endregion
//#region src/define.d.ts
export declare function createUnplugin<UserOptions, Nested extends boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginInstance<UserOptions, Nested>;
export declare function createEsbuildPlugin<UserOptions, Nested extends boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginInstance<UserOptions>["esbuild"];
export declare function createRollupPlugin<UserOptions, Nested extends boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginInstance<UserOptions>["rollup"];
export declare function createVitePlugin<UserOptions, Nested extends boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginInstance<UserOptions>["vite"];
export declare function createRolldownPlugin<UserOptions, Nested extends boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginInstance<UserOptions>["rolldown"];
export declare function createWebpackPlugin<UserOptions, Nested extends boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginInstance<UserOptions>["webpack"];
export declare function createRspackPlugin<UserOptions, Nested extends boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginInstance<UserOptions>["rspack"];
export declare function createRsbuildPlugin<UserOptions, Nested extends boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginInstance<UserOptions, Nested>["rsbuild"];
export declare function createFarmPlugin<UserOptions, Nested extends boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginInstance<UserOptions>["farm"];
export declare function createUnloaderPlugin<UserOptions, Nested extends boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginInstance<UserOptions>["unloader"];
export declare function createBunPlugin<UserOptions, Nested extends boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginInstance<UserOptions>["bun"];
//#endregion
//#region src/utils/parse.d.ts
export declare function setParseImpl(customParse: (code: string, opts?: any) => any): void;
//#endregion
//#region src/index.d.ts
export declare const version: string;
//#endregion
export type { BunPlugin, EsbuildPlugin, RolldownPlugin, RollupPlugin, RsbuildPlugin, RspackCompiler, RspackPluginInstance, UnloaderPlugin, VitePlugin, WebpackCompiler, WebpackPluginInstance };
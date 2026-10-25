import * as vite from 'vite';
import { UserConfig as UserConfig$1, ResolvedConfig as ResolvedConfig$1, TransformResult, ViteDevServer, LogLevel, LoggerOptions, Logger as Logger$1 } from 'vite';
export { vite as Vite };
export { esbuildVersion, isCSSRequest, isFileLoadingAllowed, parseAst, parseAstAsync, rollupVersion, version as viteVersion } from 'vite';
import { IncomingMessage } from 'node:http';
import { R as ResolvedConfig, e as CliOptions, d as UserConfig, L as Logger, A as ApiConfig, P as PluginHarness, f as Vitest, g as ResolvedCoverageOptions, h as CoverageMap, i as ReportContext, j as TestProject, k as VitestOptions, l as VitestRunMode, m as TestSpecification, n as PoolWorker, o as PoolOptions, p as WorkerRequest, q as TestSequencer } from './chunks/plugin.d.C8mmycim.js';
export { M as AgentReporter, B as BaseCoverageOptions, r as BaseReporter, s as BenchmarkUserOptions, t as BrowserBuiltinProvider, u as BrowserCommand, v as BrowserCommandContext, w as BrowserConfigOptions, x as BrowserInstanceOption, y as BrowserModuleMocker, z as BrowserOrchestrator, D as BrowserProvider, E as BrowserProviderCloseOptions, G as BrowserProviderOption, H as BrowserScript, J as BrowserServerContribution, K as BrowserServerFactory, N as BrowserServerState, O as BrowserServerStateSession, Q as BrowserTraceViewOptions, S as BuiltinEnvironment, X as BuiltinReporterOptions, Y as BuiltinReporters, Z as CSSModuleScopeStrategy, _ as CacheKeyIdGenerator, $ as CacheKeyIdGeneratorContext, a0 as CachedTestFileResult, a1 as CoverageInstrumenter, a2 as CoverageIstanbulOptions, C as CoverageOptions, a3 as CoverageProvider, a4 as CoverageProviderModule, a5 as CoverageReporter, a6 as CoverageV8Options, a7 as CustomProviderOptions, a8 as DefaultReporter, a9 as DepsOptimizationOptions, aa as DotReporter, ab as EnvironmentOptions, ac as GithubActionsReporter, ad as HTMLOptions, ae as HangingProcessReporter, I as InlineConfig, af as InstrumenterOptions, ag as JUnitOptions, ah as JUnitReporter, ai as JsonAssertionResult, aj as JsonOptions, ak as JsonReporter, al as JsonTestResult, am as JsonTestResults, M as MinimalReporter, an as ModuleDiagnostic, ao as OnServerRestartHandler, ap as OnTestsRerunHandler, aq as ParentProjectBrowser, ar as Pool, as as PoolRunnerInitializer, at as PoolTask, au as ProjectBrowser, av as ProjectConfig, aw as Report, ax as ReportedHookContext, ay as Reporter, az as ReportersMap, aA as ResolveSnapshotPathHandler, aB as ResolveSnapshotPathHandlerContext, aC as ResolvedBrowserOptions, aD as ResolvedProjectConfig, aE as SerializedTestProject, aF as SuiteNameTemplateVariables, aG as TapFlatReporter, aH as TapReporter, aI as TaskOptions, aJ as TestCase, aK as TestCollection, aL as TestDiagnostic, aM as TestModule, aN as TestModuleState, aO as TestResult, aP as TestResultFailed, aQ as TestResultPassed, aR as TestResultPending, aS as TestResultSkipped, aT as TestRunEndReason, aU as TestRunResult, aV as TestSequencerConstructor, aW as TestSpecificationOptions, aX as TestState, aY as TestSuite, aZ as TestSuiteState, a_ as ToMatchScreenshotComparators, a$ as ToMatchScreenshotOptions, b0 as TypecheckConfig, b1 as UIOptions, U as UserWorkspaceConfig, b2 as VerboseReporter, b3 as VitestEnvironment, b4 as VitestPackageInstaller, V as VitestPluginContext, W as WatcherTriggerPattern, b5 as WorkerResponse, b6 as _BrowserNames, b7 as experimental_getRunnerTask, b8 as startVitest } from './chunks/plugin.d.C8mmycim.js';
import { EventEmitter } from 'events';
import { A as Awaitable } from './chunks/config.d.QBNYCgFU.js';
import { AfterSuiteRunMeta } from './index.js';
export { X as RunnerTask, aH as RunnerTaskResult, j as RunnerTaskResultPack, m as RunnerTestCase, a as RunnerTestFile, O as RunnerTestSuite, aI as RuntimeConfig, bf as SequenceHooks, bg as SequenceSetupFiles, aJ as SerializedError, bh as disableDefaultColors } from './chunks/config.d.QBNYCgFU.js';
import { RuntimeRPC } from './index.js';
import { Writable } from 'node:stream';
import { ContextRPC } from './index.js';
export { T as TestExecutionType } from './chunks/worker.d.BH-r1bPu.js';
import { Debugger } from 'obug';
export { g as generateFileHash } from './chunks/task-utils.d.PFh2BV6Q.js';
export { CDPSession } from 'vitest/browser';
import './chunks/browser.d.FGQ9_rK6.js';
import 'chai';
import 'vitest/optional-types.js';
import '@vitest/mocker';
import './chunks/source-map.d.kzFtk_dj.js';
import 'node:path';
import 'node:console';
import 'node:fs/promises';
import 'vitest/optional-runtime-types.js';
import 'tinybench';
import 'vite/module-runner';
import './chunks/environment.d.BY56MoGs.js';

declare function escapeTestName(label: string, dynamic: boolean): string;

type RawErrsMap = Map<string, TscErrorInfo[]>;
interface TscErrorInfo {
	filePath: string;
	errCode: number;
	errMsg: string;
	line: number;
	column: number;
}
interface CollectLineNumbers {
	target: number;
	next: number;
	prev?: number;
}
type CollectLines = { [key in keyof CollectLineNumbers]: string };
interface RootAndTarget {
	root: string;
	targetAbsPath: string;
}
type Context = RootAndTarget & {
	rawErrsMap: RawErrsMap;
	openedDirs: Set<string>;
	lastActivePath?: string;
};

declare function isValidApiRequest(config: ResolvedConfig, req: IncomingMessage): boolean;

interface OptionConfig {
    default?: any;
    type?: any;
}
declare class Option {
    rawName: string;
    description: string;
    /** Option name */
    name: string;
    /** Option name and aliases */
    names: string[];
    isBoolean?: boolean;
    required?: boolean;
    config: OptionConfig;
    negated: boolean;
    constructor(rawName: string, description: string, config?: OptionConfig);
}

interface CommandArg {
    required: boolean;
    value: string;
    variadic: boolean;
}
interface HelpSection {
    title?: string;
    body: string;
}
interface CommandConfig {
    allowUnknownOptions?: boolean;
    ignoreOptionDefaultValue?: boolean;
}
declare type HelpCallback = (sections: HelpSection[]) => void | HelpSection[];
declare type CommandExample = ((bin: string) => string) | string;
declare class Command {
    rawName: string;
    description: string;
    config: CommandConfig;
    cli: CAC;
    options: Option[];
    aliasNames: string[];
    name: string;
    args: CommandArg[];
    commandAction?: (...args: any[]) => any;
    usageText?: string;
    versionNumber?: string;
    examples: CommandExample[];
    helpCallback?: HelpCallback;
    globalCommand?: GlobalCommand;
    constructor(rawName: string, description: string, config: CommandConfig, cli: CAC);
    usage(text: string): this;
    allowUnknownOptions(): this;
    ignoreOptionDefaultValue(): this;
    version(version: string, customFlags?: string): this;
    example(example: CommandExample): this;
    /**
     * Add a option for this command
     * @param rawName Raw option name(s)
     * @param description Option description
     * @param config Option config
     */
    option(rawName: string, description: string, config?: OptionConfig): this;
    alias(name: string): this;
    action(callback: (...args: any[]) => any): this;
    /**
     * Check if a command name is matched by this command
     * @param name Command name
     */
    isMatched(name: string): boolean;
    get isDefaultCommand(): boolean;
    get isGlobalCommand(): boolean;
    /**
     * Check if an option is registered in this command
     * @param name Option name
     */
    hasOption(name: string): Option | undefined;
    outputHelp(): void;
    outputVersion(): void;
    checkRequiredArgs(): void;
    /**
     * Check if the parsed options contain any unknown options
     *
     * Exit and output error when true
     */
    checkUnknownOptions(): void;
    /**
     * Check if the required string-type options exist
     */
    checkOptionValue(): void;
}
declare class GlobalCommand extends Command {
    constructor(cli: CAC);
}

interface ParsedArgv {
    args: ReadonlyArray<string>;
    options: {
        [k: string]: any;
    };
}
declare class CAC extends EventEmitter {
    /** The program name to display in help and version message */
    name: string;
    commands: Command[];
    globalCommand: GlobalCommand;
    matchedCommand?: Command;
    matchedCommandName?: string;
    /**
     * Raw CLI arguments
     */
    rawArgs: string[];
    /**
     * Parsed CLI arguments
     */
    args: ParsedArgv['args'];
    /**
     * Parsed CLI options, camelCased
     */
    options: ParsedArgv['options'];
    showHelpOnExit?: boolean;
    showVersionOnExit?: boolean;
    /**
     * @param name The program name to display in help and version message
     */
    constructor(name?: string);
    /**
     * Add a global usage text.
     *
     * This is not used by sub-commands.
     */
    usage(text: string): this;
    /**
     * Add a sub-command
     */
    command(rawName: string, description?: string, config?: CommandConfig): Command;
    /**
     * Add a global CLI option.
     *
     * Which is also applied to sub-commands.
     */
    option(rawName: string, description: string, config?: OptionConfig): this;
    /**
     * Show help message when `-h, --help` flags appear.
     *
     */
    help(callback?: HelpCallback): this;
    /**
     * Show version number when `-v, --version` flags appear.
     *
     */
    version(version: string, customFlags?: string): this;
    /**
     * Add a global example.
     *
     * This example added here will not be used by sub-commands.
     */
    example(example: CommandExample): this;
    /**
     * Output the corresponding help message
     * When a sub-command is matched, output the help message for the command
     * Otherwise output the global one.
     *
     */
    outputHelp(): void;
    /**
     * Output the version number.
     *
     */
    outputVersion(): void;
    private setParsedInfo;
    unsetMatchedCommand(): void;
    /**
     * Parse argv
     */
    parse(argv?: string[], {
    /** Whether to run the action for matched command */
    run, }?: {
        run?: boolean | undefined;
    }): ParsedArgv;
    private mri;
    runMatchedCommand(): any;
}

interface CliParseOptions {
	allowUnknownOptions?: boolean;
}
declare function createCLI(options?: CliParseOptions): CAC;
declare function parseCLI(argv: string | string[], config?: CliParseOptions): {
	filter: string[];
	options: CliOptions;
};

declare function resolveApiServerConfig(config: UserConfig, defaultPort: number, logger: Logger): ApiConfig;
declare function resolveConfig(options?: UserConfig, viteOverrides?: UserConfig$1, pluginsHarness?: PluginHarness): Promise<ResolvedConfig$1>;

type Threshold = "lines" | "functions" | "statements" | "branches";
interface ResolvedThreshold {
	coverageMap: CoverageMap;
	name: string;
	thresholds: Partial<Record<Threshold, number | undefined>>;
	/** When `true`, check `thresholds` against each file instead of the aggregate. */
	perFile: boolean;
	/** Additional per-file-only minimums (object form of `perFile`), or `null`. */
	perFileThresholds: Partial<Record<Threshold, number | undefined>> | null;
}
/**
* Holds info about raw coverage results that are stored on file system:
*
* ```json
* "project-a": {
*   "web": {
*     "tests/math.test.ts": "coverage-1.json",
*     "tests/utils.test.ts": "coverage-2.json",
* //                          ^^^^^^^^^^^^^^^ Raw coverage on file system
*   },
*   "ssr": { ... },
*   "browser": { ... },
* },
* "project-b": ...
* ```
*/
type CoverageFiles = Map<NonNullable<AfterSuiteRunMeta["projectName"]> | symbol, Record<AfterSuiteRunMeta["environment"], {
	[TestFilenames: string]: string;
}>>;
declare class BaseCoverageProvider {
	ctx: Vitest;
	readonly name: "v8" | "istanbul";
	version: string;
	options: ResolvedCoverageOptions;
	globCache: Map<string, boolean>;
	autoUpdateMarker: string;
	globMatchers?: {
		matchExclude: (file: string) => boolean;
		matchInclude: (file: string) => boolean;
	};
	coverageFiles: CoverageFiles;
	coverageFilesDirectory: string;
	reportsDirectoryLock: ReportsDirectoryLock;
	roots: string[];
	changedFiles?: string[];
	_initialize(ctx: Vitest): void;
	/**
	* Check if file matches `coverage.include` but not `coverage.exclude`
	*/
	isIncluded(_filename: string, root?: string): boolean;
	/**
	* Compile `coverage.include`/`coverage.exclude` into reusable matchers once.
	* `picomatch.isMatch(file, patterns, options)` recompiles the patterns on
	* every call, which dominates the filtering step on large test suites.
	*/
	private getGlobMatchers;
	private getUntestedFilesByRoot;
	getUntestedFiles(testedFiles: string[]): Promise<string[]>;
	createCoverageMap(): CoverageMap;
	generateReports(_: CoverageMap, __: boolean | undefined): Promise<void>;
	parseConfigModule(_: string): Promise<{
		generate: () => {
			code: string;
		};
	}>;
	resolveOptions(): ResolvedCoverageOptions;
	clean(clean?: boolean): Promise<void>;
	onAfterSuiteRun({ coverage, environment, projectName, testFiles }: AfterSuiteRunMeta): void;
	readCoverageFiles<CoverageType>({ onFileRead, onFinished, onDebug }: {
		/** Callback invoked with a single coverage result */
		onFileRead: (data: CoverageType) => void;
		/** Callback invoked once all results of a project for specific transform mode are read */
		onFinished: (project: Vitest["projects"][number], environment: string) => Promise<void>;
		onDebug: ((...logs: any[]) => void) & {
			enabled: boolean;
		};
	}): Promise<void>;
	cleanAfterRun(): Promise<void>;
	onTestRunStart(): Promise<void>;
	onTestFailure(): Promise<void>;
	reportCoverage(coverageMap: unknown, { allTestsRun }: ReportContext): Promise<void>;
	reportThresholds(coverageMap: CoverageMap, allTestsRun: boolean | undefined): Promise<void>;
	/**
	* Constructs collected coverage and users' threshold options into separate sets
	* where each threshold set holds their own coverage maps. Threshold set is either
	* for specific files defined by glob pattern or global for all other files.
	*/
	private resolveThresholds;
	/**
	* Check collected coverage against configured thresholds. Sets exit code to 1 when thresholds not reached.
	*/
	private checkThresholds;
	private reportThresholdViolations;
	/**
	* Check if current coverage is above configured thresholds and bump the thresholds if needed
	*/
	updateThresholds({ thresholds: allThresholds, onUpdate, configurationFile }: {
		thresholds: ResolvedThreshold[];
		configurationFile: unknown;
		onUpdate: () => void;
	}): Promise<void>;
	mergeReports(coverageMaps: unknown[]): Promise<void>;
	hasTerminalReporter(reporters: ResolvedCoverageOptions["reporter"]): boolean;
	toSlices<T>(array: T[], size: number): T[][];
	transformFile(url: string, project: TestProject, viteEnvironment: string, isTransformedByVite?: boolean): Promise<TransformResult | null | undefined>;
	createUncoveredFileTransformer(ctx: Vitest): (filename: string) => Promise<TransformResult | null | undefined>;
}
declare class ReportsDirectoryLock {
	private readonly reportsDirectory;
	readonly lockFile: string;
	constructor(reportsDirectory: string);
	acquire(): Promise<void>;
	release(): Promise<void>;
	private tryWrite;
	private readOwner;
	private inUseError;
}

declare function createVitest(options: CliOptions, viteOverrides?: UserConfig$1, vitestOptions?: VitestOptions): Promise<Vitest>;
/**
* @deprecated The `mode` argument is no longer used. Use `createVitest(options, viteOverrides?, vitestOptions?)` instead.
*/
declare function createVitest(mode: VitestRunMode, options: CliOptions, viteOverrides?: UserConfig$1, vitestOptions?: VitestOptions): Promise<Vitest>;

declare class FilesNotFoundError extends Error {
	code: string;
	constructor();
}
declare class GitNotFoundError extends Error {
	code: string;
	constructor();
}
declare class BrowserConnectionError extends Error {
	code: string;
}

declare function resolveFsAllow(projectRoot: string, rootConfigFile: string | false | undefined): string[];

type RunWithFiles = (files: TestSpecification[], invalidates?: string[]) => Promise<void>;
interface ProcessPool {
	name: string;
	runTests: RunWithFiles;
	collectTests: RunWithFiles;
	close?: () => Awaitable<void>;
}
declare function getFilePoolName(project: TestProject): ResolvedConfig["pool"];

interface MethodsOptions {
	cacheFs?: boolean;
	collect?: boolean;
}
declare function createMethodsRPC(project: TestProject, methodsOptions?: MethodsOptions): RuntimeRPC;

/** @experimental */
declare class ForksPoolWorker implements PoolWorker {
	readonly name: string;
	readonly cacheFs: boolean;
	protected readonly entrypoint: string;
	protected execArgv: string[];
	protected env: Partial<NodeJS.ProcessEnv>;
	private _fork?;
	private stdout;
	private stderr;
	private _errorEmitter;
	private _pipeErrorTimer;
	constructor(options: PoolOptions);
	on(event: string, callback: (...args: any[]) => void): void;
	off(event: string, callback: (...args: any[]) => void): void;
	send(message: WorkerRequest): void;
	start(): Promise<void>;
	stop(): Promise<void>;
	deserialize(data: unknown): unknown;
	private emitError;
	private get fork();
}

/** @experimental */
declare class ThreadsPoolWorker implements PoolWorker {
	readonly name: string;
	protected readonly entrypoint: string;
	protected execArgv: string[];
	protected env: Partial<NodeJS.ProcessEnv>;
	private _thread?;
	private stdout;
	private stderr;
	constructor(options: PoolOptions);
	on(event: string, callback: (...args: any[]) => void): void;
	off(event: string, callback: (...args: any[]) => void): void;
	send(message: WorkerRequest): void;
	start(): Promise<void>;
	stop(): Promise<void>;
	deserialize(data: unknown): unknown;
	private get thread();
}

/** @experimental */
declare class TypecheckPoolWorker implements PoolWorker {
	readonly name: string;
	private readonly project;
	private _eventEmitter;
	constructor(options: PoolOptions);
	start(): Promise<void>;
	stop(): Promise<void>;
	canReuse(): boolean;
	send(message: WorkerRequest): void;
	on(event: string, callback: (arg: any) => any): void;
	off(event: string, callback: (arg: any) => any): void;
	deserialize(data: unknown): unknown;
}

/** @experimental */
declare class VmForksPoolWorker extends ForksPoolWorker {
	readonly name = "vmForks";
	readonly reportMemory = true;
	protected readonly entrypoint: string;
	constructor(options: PoolOptions);
	canReuse(): boolean;
}

/** @experimental */
declare class VmThreadsPoolWorker extends ThreadsPoolWorker {
	readonly name = "vmThreads";
	readonly reportMemory = true;
	protected readonly entrypoint: string;
	constructor(options: PoolOptions);
	canReuse(): boolean;
}

declare class BaseSequencer implements TestSequencer {
	protected ctx: Vitest;
	constructor(ctx: Vitest);
	shard(files: TestSpecification[]): Promise<TestSpecification[]>;
	sort(files: TestSpecification[]): Promise<TestSpecification[]>;
	private calculateShardRange;
}

declare function registerConsoleShortcuts(ctx: Vitest, stdin: NodeJS.ReadStream | undefined, stdout: NodeJS.WriteStream | Writable): () => void;

interface WorkerContext extends ContextRPC {}

/**
* Check if the url is allowed to be served, via the `server.fs` config.
* @deprecated Use the `isFileLoadingAllowed` function instead.
*/
declare function isFileServingAllowed(config: ResolvedConfig$1, url: string): boolean;
declare function isFileServingAllowed(url: string, server: ViteDevServer): boolean;

declare function createViteLogger(console: Logger, level?: LogLevel, options?: LoggerOptions): Logger$1;

declare const rootDir: string;
declare const distDir: string;

declare function createDebugger(namespace: `vitest:${string}`): Debugger | undefined;

declare const version: string;

declare const createViteServer: typeof vite.createServer;

declare const rolldownVersion: string | undefined;

export { ApiConfig, BaseCoverageProvider, BaseSequencer, BrowserConnectionError, CliOptions, ForksPoolWorker, GitNotFoundError, Logger, PluginHarness, PoolOptions, PoolWorker, ReportContext, ResolvedConfig, ResolvedCoverageOptions, TestProject, TestSequencer, TestSpecification, UserConfig as TestUserConfig, FilesNotFoundError as TestsNotFoundError, ThreadsPoolWorker, TypecheckPoolWorker, Vitest, VitestOptions, VitestRunMode, VmForksPoolWorker, VmThreadsPoolWorker, WorkerRequest, createCLI, createDebugger, createMethodsRPC, createViteLogger, createViteServer, createVitest, distDir, escapeTestName, getFilePoolName, isFileServingAllowed, isValidApiRequest, parseCLI, registerConsoleShortcuts, resolveApiServerConfig, resolveConfig, resolveFsAllow, rolldownVersion, rootDir, version };
export type { CliParseOptions, ProcessPool, CollectLineNumbers as TypeCheckCollectLineNumbers, CollectLines as TypeCheckCollectLines, Context as TypeCheckContext, TscErrorInfo as TypeCheckErrorInfo, RawErrsMap as TypeCheckRawErrorsMap, RootAndTarget as TypeCheckRootAndTarget, WorkerContext };

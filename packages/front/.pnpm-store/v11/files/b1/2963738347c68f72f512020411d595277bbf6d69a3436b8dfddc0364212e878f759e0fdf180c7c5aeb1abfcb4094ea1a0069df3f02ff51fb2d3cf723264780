import { r as runCli } from "./bindings-qpSSlUMn.js";
import Tinypool from "tinypool";
import { fileURLToPath, pathToFileURL } from "node:url";
import { extname } from "node:path";
//#region src-js/cli/worker-proxy.ts
let pool = null;
async function initExternalFormatter(numThreads) {
	pool = new Tinypool({
		filename: new URL("./cli-worker.js", import.meta.url).href,
		minThreads: numThreads,
		maxThreads: numThreads,
		runtime: "child_process",
		env: process.env
	});
}
async function disposeExternalFormatter() {
	await pool?.destroy();
	pool = null;
}
async function formatFile(options, code) {
	return pool.run({
		options,
		code
	}, { name: "formatFile" }).catch((err) => {
		if (err instanceof Error) throw err;
		if (err !== null && typeof err === "object") {
			const obj = err;
			const newErr = new Error(obj.message);
			newErr.name = obj.name;
			throw newErr;
		}
		throw new Error(String(err));
	});
}
async function formatEmbeddedCode(options, code) {
	return pool.run({
		options,
		code
	}, { name: "formatEmbeddedCode" }).catch(() => null);
}
async function formatEmbeddedDoc(options, texts) {
	return pool.run({
		options,
		texts
	}, { name: "formatEmbeddedDoc" }).catch(() => null);
}
async function sortTailwindClasses(options, classes) {
	return pool.run({
		classes,
		options
	}, { name: "sortTailwindClasses" }).catch(() => null);
}
//#endregion
//#region ../shared/src-js/node_version.ts
const NODE_TYPESCRIPT_SUPPORT_RANGE = "^20.19.0 || >=22.18.0";
const TS_MODULE_EXTENSIONS = new Set([
	".ts",
	".mts",
	".cts"
]);
function normalizeModuleSpecifierPath(specifier) {
	if (!specifier.startsWith("file:")) return specifier;
	try {
		return fileURLToPath(specifier);
	} catch {
		return specifier;
	}
}
function isTypeScriptModuleSpecifier(specifier) {
	const ext = extname(normalizeModuleSpecifierPath(specifier)).toLowerCase();
	return TS_MODULE_EXTENSIONS.has(ext);
}
function isUnknownFileExtensionError(err) {
	if (err?.code === "ERR_UNKNOWN_FILE_EXTENSION") return true;
	const message = err?.message;
	return typeof message === "string" && /unknown(?: or unsupported)? file extension/i.test(message);
}
function getErrorMessage(err) {
	if (err instanceof Error) return err.message;
	return String(err);
}
/**
* Returns a complete replacement string suitable for `Error.message` assignment
* (includes the original error message + appended hint), or `null` when the
* error is unrelated to TS module loading. Callers should overwrite, not append.
*/
function getUnsupportedTypeScriptModuleLoadHintForError(err, specifier, nodeVersion = process.version) {
	if (!isTypeScriptModuleSpecifier(specifier) || !isUnknownFileExtensionError(err)) return null;
	return `${getErrorMessage(err)}\n\nTypeScript config files require Node.js ${NODE_TYPESCRIPT_SUPPORT_RANGE}.\nDetected Node.js ${nodeVersion}.\nPlease upgrade Node.js or use a JSON config file instead.`;
}
//#endregion
//#region ../shared/src-js/js_config.ts
/**
* Import a JS/TS config file and return its `default` export.
*
* - Bypasses Node.js module cache (uses `?cache=<key>`) so changed files reload (used for LSP).
* - On `ERR_UNKNOWN_FILE_EXTENSION` for TS specifiers, overwrites `err.message` with a
*   Node.js upgrade hint that already includes the original message.
*
* @param path - Absolute path to the JS/TS config file
* @param cacheKey - Cache-busting key.
*   Callers decide whether to use a fresh value per call or share one across a batch.
* @throws When the file has no `default` export,
*   or import fails (with rewritten message for unsupported TS module load).
*/
async function importJsConfig(path, cacheKey) {
	const fileUrl = pathToFileURL(path);
	fileUrl.searchParams.set("cache", cacheKey.toString());
	let module;
	try {
		module = await import(fileUrl.href);
	} catch (err) {
		const hint = getUnsupportedTypeScriptModuleLoadHintForError(err, path);
		if (hint && err instanceof Error) err.message = hint;
		throw err;
	}
	if (module.default === void 0) throw new Error("Configuration file has no default export.");
	return module.default;
}
//#endregion
//#region src-js/cli/js_config.ts
const isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
/**
* Load and validate a standard oxfmt JS/TS config file.
* The default export must be a plain object containing oxfmt options.
*
* @param path - Absolute path to the JavaScript/TypeScript config file
* @returns Config object
*/
async function loadJsConfig(path) {
	const config = await importJsConfig(path, Date.now());
	if (!isObject(config)) throw new Error("Configuration file must have a default export that is an object.");
	return config;
}
const VITE_OXFMT_CONFIG_FIELD = "fmt";
/**
* Load a Vite+ config file (`vite.config.ts`) and extract the `.fmt` field.
*
* @param path - Absolute path to the Vite config file
* @returns Config object from `.fmt` field, or `null` to signal "skip"
*/
async function loadVitePlusConfig(path) {
	const config = await importJsConfig(path, Date.now());
	if (!isObject(config)) return null;
	const fmtConfig = config[VITE_OXFMT_CONFIG_FIELD];
	if (fmtConfig === void 0) return null;
	if (!isObject(fmtConfig)) throw new Error(`The \`${VITE_OXFMT_CONFIG_FIELD}\` field in the default export must be an object.`);
	return fmtConfig;
}
//#endregion
//#region src-js/cli.ts
(async () => {
	const args = process.argv.slice(2);
	if (!process.stdout.isTTY) process.stdout._handle?.setBlocking?.(true);
	if (!process.stdin.isTTY) process.stdin._handle?.setBlocking?.(true);
	if (args.includes("--lsp")) process.stdout.write = process.stderr.write.bind(process.stderr);
	const [mode, exitCode] = await runCli(args, process.env.VP_VERSION ? loadVitePlusConfig : loadJsConfig, initExternalFormatter, formatFile, formatEmbeddedCode, formatEmbeddedDoc, sortTailwindClasses);
	if (mode === "init") {
		await import("./init-BbKOMZ57.js").then((m) => m.runInit());
		return;
	}
	if (mode === "migrate:prettier") {
		await import("./migrate-prettier-CBzqnxHw.js").then((m) => m.runMigratePrettier());
		return;
	}
	if (mode === "migrate:biome") {
		await import("./migrate-biome-BMqs7-eg.js").then((m) => m.runMigrateBiome());
		return;
	}
	await disposeExternalFormatter();
	process.exitCode = exitCode;
	const [major, minor] = process.versions.node.split(".").map(Number);
	if (major < 25 || major === 25 && minor < 4) setTimeout(() => process.exit(), 50);
})();
//#endregion
export {};

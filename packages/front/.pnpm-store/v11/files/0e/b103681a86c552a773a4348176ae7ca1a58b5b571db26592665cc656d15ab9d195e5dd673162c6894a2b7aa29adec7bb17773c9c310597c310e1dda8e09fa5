import process from "node:process";
import { detect } from "package-manager-detector/detect";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { x } from "tinyexec";
//#region src/detect.ts
async function detectPackageManager(cwd = process.cwd()) {
	return (await detect({
		cwd,
		onUnknown(packageManager) {
			console.warn("[@antfu/install-pkg] Unknown packageManager:", packageManager);
		}
	}))?.agent || null;
}
//#endregion
//#region src/install.ts
async function installPackage(names, options = {}) {
	const detectedAgent = options.packageManager || await detectPackageManager(options.cwd) || "npm";
	const [agent] = detectedAgent.split("@");
	if (!Array.isArray(names)) names = [names];
	const args = (typeof options.additionalArgs === "function" ? options.additionalArgs(agent, detectedAgent) : options.additionalArgs) || [];
	if (options.preferOffline) {
		if (detectedAgent === "yarn@berry") args.unshift("--cached");
		else args.unshift("--prefer-offline");
	}
	if (agent === "pnpm") {
		args.unshift(
			/**
			* Prevent pnpm from removing installed devDeps while `NODE_ENV` is `production`.
			* Uses the `--config.` escape hatch instead of `--prod=false` because pnpm >=12.4.1
			* routes `install <pkg>` through its `add`-compatible parser, which rejects `--prod`.
			* @see https://pnpm.io/cli/install#--prod--p
			* @see https://github.com/pnpm/pnpm/issues/14868
			*/
			"--config.prod=false"
		);
		if (existsSync(resolve(options.cwd ?? process.cwd(), "pnpm-workspace.yaml"))) args.unshift("-w");
	}
	return x(agent, [
		agent === "yarn" ? "add" : "install",
		options.dev ? "-D" : "",
		...args,
		...names
	].filter(Boolean), {
		nodeOptions: {
			stdio: options.silent ? "ignore" : "inherit",
			cwd: options.cwd
		},
		throwOnError: true
	});
}
//#endregion
//#region src/uninstall.ts
async function uninstallPackage(names, options = {}) {
	const [agent] = (options.packageManager || await detectPackageManager(options.cwd) || "npm").split("@");
	if (!Array.isArray(names)) names = [names];
	const args = options.additionalArgs || [];
	if (agent === "pnpm" && existsSync(resolve(options.cwd ?? process.cwd(), "pnpm-workspace.yaml"))) args.unshift("-w");
	return x(agent, [
		agent === "yarn" ? "remove" : "uninstall",
		options.dev ? "-D" : "",
		...args,
		...names
	].filter(Boolean), {
		nodeOptions: {
			stdio: options.silent ? "ignore" : "inherit",
			cwd: options.cwd
		},
		throwOnError: true
	});
}
//#endregion
export { detectPackageManager, installPackage, uninstallPackage };

import { normalizePath } from "./hmr-utils.js";
import { camelize, pascalize, snakelize } from "../misc/strings.js";
import { promises } from "fs";
import { resolve } from "node:path";
/**
* @returns A {@link CustomIconLoader} for loading icons from a directory.
*/
function FileSystemIconLoader(dir, transform) {
	return async (name) => {
		return await resolveIcon(name, dir, transform).then((result) => result?.svg);
	};
}
/**
* Creates a {@link CustomHMRIconLoader} collection from a directory with HMR support.
*
* @example
* ```ts
* customCollections: {
*   ...FileSystemHMRIconLoader('./src/icons', 'custom-icons')
* }
* ```
*
* @param dir The directory relative to the root.
* @param collectionName The collection name.
* @param transform The SVG transformer.
*/
function FileSystemHMRIconLoader(dir, collectionName, transform) {
	const normalizedDir = normalizePath(resolve(dir));
	const pathToName = /* @__PURE__ */ new Map();
	const nameToPath = /* @__PURE__ */ new Map();
	const customCollection = {};
	customCollection[collectionName] = {
		__iconifyCustomHmrIconLoader: true,
		name: collectionName,
		iconLoader: async (name) => {
			const result = await resolveIcon(name, normalizedDir, transform);
			if (result) {
				pathToName.set(result.path, result.name);
				nameToPath.set(result.name, result.path);
			}
			return result?.svg;
		},
		resolveModuleIconName: (normalizedSVGPath) => {
			return pathToName.get(normalizedSVGPath);
		},
		resolveSVGIconPath: (name) => nameToPath.get(name)
	};
	return customCollection;
}
async function resolveIcon(name, dir, transform) {
	const candidates = [
		`${dir}/${name}.svg`,
		`${dir}/${camelize(name)}.svg`,
		`${dir}/${pascalize(name)}.svg`,
		`${dir}/${snakelize(name)}.svg`
	];
	for (const path of candidates) {
		let stat;
		try {
			stat = await promises.lstat(path);
		} catch {
			continue;
		}
		if (stat.isFile()) {
			let svg = await promises.readFile(path, "utf-8");
			const cleanupIdx = svg.indexOf("<svg");
			if (cleanupIdx > 0) svg = svg.slice(cleanupIdx);
			return {
				path,
				name,
				svg: typeof transform === "function" ? await transform(svg) : svg
			};
		}
	}
}
export { FileSystemHMRIconLoader, FileSystemIconLoader };

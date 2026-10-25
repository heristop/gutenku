const normalizeRegexp = /\\/g;
function normalizePath(path) {
	return path.replace(normalizeRegexp, "/");
}
function isCustomHMRIconLoader(loader) {
	return typeof loader === "function" ? false : "__iconifyCustomHmrIconLoader" in loader && loader.__iconifyCustomHmrIconLoader === true && "name" in loader && typeof loader.name === "string" && "iconLoader" in loader && typeof loader.iconLoader === "function" && "resolveModuleIconName" in loader && typeof loader.resolveModuleIconName === "function" && "resolveSVGIconPath" in loader && typeof loader.resolveSVGIconPath === "function";
}
function collectCustomHMRIconResolvers(customCollections = {}) {
	const hmrCustomIconResolversMap = /* @__PURE__ */ new Map();
	for (const collection of Object.values(customCollections)) if (isCustomHMRIconLoader(collection)) hmrCustomIconResolversMap.set(collection.name, collection);
	return hmrCustomIconResolversMap;
}
function createHMRHelper(collectIconModules, customCollections = {}) {
	const hmrCustomIconResolversMap = collectCustomHMRIconResolvers(customCollections);
	const hmrCustomIconResolvers = Array.from(hmrCustomIconResolversMap.values());
	return {
		hmrCustomIconResolvers,
		handleHotUpdate: (svgFilePath, findModules) => {
			const normalizedSVGPath = normalizePath(svgFilePath);
			for (const resolver of hmrCustomIconResolvers) {
				const icon = resolver.resolveModuleIconName(normalizedSVGPath);
				if (icon) {
					const modules = collectIconModules(resolver.name, icon, findModules);
					if (modules && modules.length > 0) return modules;
				}
			}
		},
		resolveSVGIconPath: (collectionName, iconName) => {
			return hmrCustomIconResolversMap.get(collectionName)?.resolveSVGIconPath(iconName);
		}
	};
}
export { collectCustomHMRIconResolvers, createHMRHelper, isCustomHMRIconLoader, normalizePath };

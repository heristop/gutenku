import { C as COVERAGE_STORE_KEY } from './constants-BCJfMgEg.js';

const BaseCoverageProviderModule = {
	takeCoverage() {
		// @ts-expect-error -- untyped global
		return globalThis[COVERAGE_STORE_KEY];
	},
	// Reset coverage map to prevent duplicate results if this is called twice in row
	startCoverage() {
		// @ts-expect-error -- untyped global
		const coverageMap = globalThis[COVERAGE_STORE_KEY];
		// When isolated, there are no previous results
		if (!coverageMap) {
			return;
		}
		for (const filename in coverageMap) {
			const branches = coverageMap[filename].b;
			for (const key in branches) {
				branches[key] = branches[key].map(() => 0);
			}
			for (const metric of ["f", "s"]) {
				const entry = coverageMap[filename][metric];
				for (const key in entry) {
					entry[key] = 0;
				}
			}
		}
	},
	async getProvider() {
		// to not bundle the provider
		const providerPath = "./provider.js";
		const { IstanbulCoverageProvider } = await import(
			/* @vite-ignore */
			providerPath
);
		return new IstanbulCoverageProvider();
	}
};

export { BaseCoverageProviderModule as B };

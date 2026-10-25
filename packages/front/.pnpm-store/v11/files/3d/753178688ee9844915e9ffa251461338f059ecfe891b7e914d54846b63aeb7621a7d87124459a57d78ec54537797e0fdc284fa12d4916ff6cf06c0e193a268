import { B as BaseCoverageProviderModule } from './base-BO8X8tRz.js';
import './constants-BCJfMgEg.js';

function triggerCommand(command, args = []) {
	return globalThis.__vitest_browser_runner__?.commands?.triggerCommand?.(command, args);
}
const mod = {
	takeCoverage() {
		const coverage = BaseCoverageProviderModule.takeCoverage();
		if (!coverage) {
			return;
		}
		return triggerCommand("__vitest_writeCoverageFile", [coverage]);
	},
	startCoverage() {
		BaseCoverageProviderModule.startCoverage();
	},
	getProvider() {
		return BaseCoverageProviderModule.getProvider();
	}
};

export { mod as default };

import assert from 'node:assert';
import { B as BaseCoverageProviderModule } from './base-BO8X8tRz.js';
import { w as writeCoverageFile } from './commands-DzErh2po.js';
import './constants-BCJfMgEg.js';
import 'node:crypto';
import 'node:fs';
import 'node:fs/promises';

const mod = {
	takeCoverage(options) {
		const coverage = BaseCoverageProviderModule.takeCoverage();
		if (!coverage) {
			return;
		}
		const coverageFilesDirectory = options?.coverageFilesDirectory;
		assert(coverageFilesDirectory, "coverageFilesDirectory is required");
		return writeCoverageFile(coverageFilesDirectory, coverage);
	},
	startCoverage() {
		BaseCoverageProviderModule.startCoverage();
	},
	getProvider() {
		return BaseCoverageProviderModule.getProvider();
	}
};

export { mod as default };

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupFileWatcher = void 0;
const chokidar_1 = require("chokidar");
const helpers_1 = require("./helpers");
function setupFileWatcher(params) {
    const { config, options, globPattern, onRestart } = params;
    const output = config.output;
    output.verbose = true;
    output.info('[Watching for file changes...]');
    const filesWatcher = (0, chokidar_1.watch)(globPattern);
    const tsconfigWatcher = (0, chokidar_1.watch)(config.configFile);
    const onFileChange = async (file) => await (0, helpers_1.replaceAlias)({ config, file, resolveFullPath: options === null || options === void 0 ? void 0 : options.resolveFullPaths });
    filesWatcher.on('add', onFileChange);
    filesWatcher.on('change', onFileChange);
    tsconfigWatcher.on('change', () => {
        output.clear();
        filesWatcher.close();
        tsconfigWatcher.close();
        onRestart(options);
    });
}
exports.setupFileWatcher = setupFileWatcher;
//# sourceMappingURL=watcher.js.map
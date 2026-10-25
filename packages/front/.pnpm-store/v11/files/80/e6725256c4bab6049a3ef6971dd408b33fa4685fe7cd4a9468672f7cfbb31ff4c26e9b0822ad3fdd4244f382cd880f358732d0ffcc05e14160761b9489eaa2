"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareConfig = exports.resolveTsConfigExtendsPath = exports.normalizeTsConfigExtendsOption = exports.loadConfig = void 0;
const fs_1 = require("fs");
const utils_1 = require("../utils");
const config_builder_1 = require("./config-builder");
const project_config_1 = require("./project-config");
const replacers_1 = require("./replacers");
var config_loader_1 = require("./config-loader");
Object.defineProperty(exports, "loadConfig", { enumerable: true, get: function () { return config_loader_1.loadConfig; } });
var tsconfig_extends_1 = require("./tsconfig-extends");
Object.defineProperty(exports, "normalizeTsConfigExtendsOption", { enumerable: true, get: function () { return tsconfig_extends_1.normalizeTsConfigExtendsOption; } });
Object.defineProperty(exports, "resolveTsConfigExtendsPath", { enumerable: true, get: function () { return tsconfig_extends_1.resolveTsConfigExtendsPath; } });
async function prepareConfig(options) {
    var _a;
    const output = (_a = options.output) !== null && _a !== void 0 ? _a : new utils_1.Output(options.verbose, options.debug);
    const configFile = (0, project_config_1.resolveConfigFilePath)(options.configFile);
    output.assert((0, fs_1.existsSync)(configFile), `Invalid file path => ${configFile}`);
    const { config, replacers } = (0, config_builder_1.buildProjectConfig)({
        configFile,
        output,
        options
    });
    await (0, replacers_1.importReplacers)({ config, replacers: replacers, cmdReplacers: options.replacers });
    return config;
}
exports.prepareConfig = prepareConfig;
//# sourceMappingURL=config.js.map
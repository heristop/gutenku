"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseProperties = parseProperties;
exports.serializeProperties = serializeProperties;
exports.writeProperties = writeProperties;
const utils_fs_1 = require("@ionic/utils-fs");
const ini_1 = __importDefault(require("ini"));
async function parseProperties(filename) {
    const data = await (0, utils_fs_1.readFile)(filename, { encoding: 'utf-8' });
    return ini_1.default.parse(data);
}
function serializeProperties(data) {
    return ini_1.default.stringify(data);
}
async function writeProperties(filename, data) {
    return (0, utils_fs_1.writeFile)(filename, serializeProperties(data));
}
//# sourceMappingURL=properties.js.map
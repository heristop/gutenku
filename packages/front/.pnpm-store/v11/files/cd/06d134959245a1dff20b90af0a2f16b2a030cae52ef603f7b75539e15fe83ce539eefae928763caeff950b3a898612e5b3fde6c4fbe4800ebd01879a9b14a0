"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringsFile = void 0;
const utils_fs_1 = require("@ionic/utils-fs");
const path_1 = require("path");
const logger_1 = require("./logger");
const fs_1 = require("./util/fs");
const strings_1 = require("./util/strings");
const vfs_1 = require("./vfs");
/**
 * iOS .strings files
 */
class StringsFile extends vfs_1.VFSStorable {
    constructor(path, vfs, project) {
        super();
        this.path = path;
        this.vfs = vfs;
        this.project = project;
        this.doc = [];
        this.commitFn = async (file) => {
            const src = file.getData().generate();
            await (0, fs_1.assertParentDirs)(file.getFilename());
            return (0, utils_fs_1.writeFile)(file.getFilename(), src);
        };
        this.diffFn = async (file) => {
            return {
                old: await (0, fs_1.readFileOrEmpty)(file.getFilename()),
                new: file.getData().generate(),
            };
        };
    }
    getDocument() {
        return this.doc;
    }
    async setFromJson(jsonFile) {
        const json = JSON.parse(await (0, utils_fs_1.readFile)(jsonFile, { encoding: 'utf-8' }));
        this.set(json);
    }
    async set(values) {
        if (!this.doc) {
            return;
        }
        logger_1.Logger.v('strings', 'update', `${this.path}`);
        Object.keys(values).forEach(k => {
            let found = false;
            this.doc = this.doc.map(e => {
                if (e.key === k) {
                    found = true;
                    return {
                        ...e,
                        value: values[k]
                    };
                }
                return e;
            });
            const lastEntry = this.doc[Math.max(0, this.doc.length - 1)];
            if (!found) {
                if (lastEntry) {
                    this.doc.push({
                        content: '\n\n',
                        startLine: lastEntry ? lastEntry.endLine + 1 : 0,
                        startCol: 0,
                        endLine: lastEntry ? lastEntry.endLine + 2 : 0,
                        endCol: 0
                    });
                }
                this.doc.push({
                    key: k,
                    value: values[k],
                    startLine: lastEntry ? lastEntry.endLine + 3 : 0,
                    startCol: 0,
                    endLine: lastEntry ? lastEntry.endLine + 4 : 0,
                    endCol: 0
                });
            }
        });
        this.vfs.markModified(this.path);
    }
    async load() {
        var _a, _b, _c, _d;
        if (this.vfs.isOpen(this.path)) {
            return;
        }
        if (!await (0, utils_fs_1.pathExists)(this.path)) {
            this.doc = [];
            // Add the file to the iOS project
            if (this.project) {
                const rel = (0, path_1.relative)((_b = (_a = this.project.config.ios) === null || _a === void 0 ? void 0 : _a.path) !== null && _b !== void 0 ? _b : '', this.path);
                (_d = (_c = this.project) === null || _c === void 0 ? void 0 : _c.ios) === null || _d === void 0 ? void 0 : _d.addFile(rel);
            }
        }
        else {
            this.doc = await this.parse(this.path);
        }
        logger_1.Logger.v('strings', 'load', `at ${this.path}`);
        this.vfs.open(this.path, this, this.commitFn, this.diffFn);
    }
    generate() {
        return (0, strings_1.generateStrings)(this.doc);
    }
    async parse(path) {
        const contents = await (0, utils_fs_1.readFile)(path, { encoding: 'utf-8' });
        return (0, strings_1.parseStrings)(contents);
    }
}
exports.StringsFile = StringsFile;
//# sourceMappingURL=strings.js.map
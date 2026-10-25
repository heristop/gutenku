"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesFile = void 0;
const utils_fs_1 = require("@ionic/utils-fs");
const lodash_1 = require("lodash");
const logger_1 = require("./logger");
const fs_1 = require("./util/fs");
const properties_1 = require("./util/properties");
const vfs_1 = require("./vfs");
class PropertiesFile extends vfs_1.VFSStorable {
    constructor(path, vfs) {
        super();
        this.path = path;
        this.vfs = vfs;
        this.commitFn = async (file) => {
            await (0, fs_1.assertParentDirs)(file.getFilename());
            return (0, properties_1.writeProperties)(file.getFilename(), file.getData().getProperties());
        };
        this.diffFn = async (file) => {
            return {
                old: await (0, fs_1.readFileOrEmpty)(file.getFilename()),
                new: (0, properties_1.serializeProperties)(file.getData().getProperties()),
            };
        };
    }
    getProperties() {
        return this.doc;
    }
    async updateProperties(properties) {
        if (!this.doc) {
            return;
        }
        logger_1.Logger.v('properties', 'update', `${this.path} - ${properties}`);
        const merged = (0, lodash_1.mergeWith)(this.doc, properties, (objValue, srcValue) => {
            // Override the default merge behavior for arrays of objects that have the
            // same sub-key. Otherwise lodash merge doesn't work how we need it to
            if (Array.isArray(objValue)) {
                //if (replace) {
                return srcValue;
                //}
                /*
                const firstObjValue = objValue[0];
                const firstSrcValue = srcValue[0];
        
                // https://github.com/ionic-team/capacitor-configure/issues/32
                // When merging an array of dicts, like when modifying
                // CFBundleURLTypes, we don't want to union the two arrays because that
                // would result in duplicated array of dicts. Instead, we want to merge as-is.
                // This check makes sure we're not trying to union an array of dicts
                if (typeof firstObjValue !== 'object' && typeof firstSrcValue !== 'object') {
                  return union(objValue, srcValue);
                }
                */
            }
            else if (typeof objValue === 'object' && objValue !== null) {
                //if (replace) {
                return srcValue;
                //}
            }
        });
        Object.assign(this.doc, merged);
        this.vfs.markModified(this.path);
    }
    async load() {
        if (this.vfs.isOpen(this.path)) {
            return;
        }
        if (!await (0, utils_fs_1.pathExists)(this.path)) {
            throw new Error(`Unable to locate file at ${this.path}`);
        }
        this.doc = await (0, properties_1.parseProperties)(this.path);
        logger_1.Logger.v('properties', 'load', `at ${this.path}`, this.doc);
        this.vfs.open(this.path, this, this.commitFn, this.diffFn);
    }
}
exports.PropertiesFile = PropertiesFile;
//# sourceMappingURL=properties.js.map
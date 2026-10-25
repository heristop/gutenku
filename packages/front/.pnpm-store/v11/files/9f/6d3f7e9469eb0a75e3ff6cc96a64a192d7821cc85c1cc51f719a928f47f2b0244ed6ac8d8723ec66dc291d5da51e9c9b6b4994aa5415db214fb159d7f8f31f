"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPackageTraitsRequirements = exports.checkSwiftToolsVersion = exports.addSceneManifestIfNeeded = exports.hasSceneManifest = exports.addInfoPlistDebugIfNeeded = exports.runCocoapodsDeintegrate = exports.generatePackageText = exports.removeCocoapodsFiles = exports.extractSPMPackageDirectory = exports.checkPluginsForPackageSwift = exports.generatePackageFile = exports.findPackageSwiftFile = exports.checkPackageManager = void 0;
const fs_extra_1 = require("fs-extra");
const os_1 = require("os");
const path_1 = require("path");
const plist_1 = require("plist");
const tar_1 = require("tar");
const common_1 = require("../common");
const errors_1 = require("../errors");
const common_2 = require("../ios/common");
const log_1 = require("../log");
const plugin_1 = require("../plugin");
const fs_1 = require("../util/fs");
const subprocess_1 = require("../util/subprocess");
/**
 * @deprecated use config.ios.packageManager
 * @param config
 * @returns 'Cocoapods' | 'SPM'
 */
async function checkPackageManager(config) {
    const iosDirectory = config.ios.nativeProjectDirAbs;
    if ((0, fs_extra_1.existsSync)((0, path_1.resolve)(iosDirectory, 'CapApp-SPM'))) {
        return 'SPM';
    }
    return 'Cocoapods';
}
exports.checkPackageManager = checkPackageManager;
async function findPackageSwiftFile(config) {
    const packageDirectory = (0, path_1.resolve)(config.ios.nativeProjectDirAbs, 'CapApp-SPM');
    return (0, path_1.resolve)(packageDirectory, 'Package.swift');
}
exports.findPackageSwiftFile = findPackageSwiftFile;
async function generatePackageFile(config, plugins) {
    const packageSwiftFile = await findPackageSwiftFile(config);
    try {
        log_1.logger.info('Writing Package.swift');
        const textToWrite = await generatePackageText(config, plugins);
        (0, fs_extra_1.writeFileSync)(packageSwiftFile, textToWrite);
    }
    catch (err) {
        log_1.logger.error(`Unable to write to ${packageSwiftFile}. Verify it is not already open. \n Error: ${err}`);
    }
}
exports.generatePackageFile = generatePackageFile;
async function checkPluginsForPackageSwift(config, plugins) {
    const iOSCapacitorPlugins = plugins.filter((p) => (0, plugin_1.getPluginType)(p, 'ios') === 0 /* PluginType.Core */);
    const packageSwiftPluginList = await pluginsWithPackageSwift(iOSCapacitorPlugins);
    if (iOSCapacitorPlugins.length == packageSwiftPluginList.length) {
        log_1.logger.debug(`Found ${iOSCapacitorPlugins.length} Capacitor iOS plugins, ${packageSwiftPluginList.length} have a Package.swift file`);
        log_1.logger.info('All Capacitor plugins have a Package.swift file and will be included in Package.swift');
    }
    else {
        log_1.logger.warn('Some installed Capacitor plugins are not compatible with SPM');
    }
    return packageSwiftPluginList;
}
exports.checkPluginsForPackageSwift = checkPluginsForPackageSwift;
async function extractSPMPackageDirectory(config) {
    const spmDirectory = (0, path_1.join)(config.ios.nativeProjectDirAbs, 'CapApp-SPM');
    const spmTemplate = (0, path_1.join)(config.cli.assetsDirAbs, 'ios-spm-template.tar.gz');
    const debugConfig = (0, path_1.join)(config.ios.platformDirAbs, 'debug.xcconfig');
    log_1.logger.info('Extracting ' + spmTemplate + ' to ' + spmDirectory);
    try {
        const tempCapDir = await (0, fs_extra_1.mkdtemp)((0, path_1.join)((0, os_1.tmpdir)(), 'cap-'));
        const tempCapSPM = (0, path_1.join)(tempCapDir, 'App', 'CapApp-SPM');
        const tempDebugXCConfig = (0, path_1.join)(tempCapDir, 'debug.xcconfig');
        await (0, tar_1.extract)({ file: spmTemplate, cwd: tempCapDir });
        await (0, fs_extra_1.move)(tempCapSPM, spmDirectory);
        await (0, fs_extra_1.move)(tempDebugXCConfig, debugConfig);
    }
    catch (err) {
        (0, errors_1.fatal)('Failed to create ' + spmDirectory + ' with error: ' + err);
    }
}
exports.extractSPMPackageDirectory = extractSPMPackageDirectory;
async function removeCocoapodsFiles(config) {
    const iosDirectory = config.ios.nativeProjectDirAbs;
    const podFile = (0, path_1.resolve)(iosDirectory, 'Podfile');
    const podlockFile = (0, path_1.resolve)(iosDirectory, 'Podfile.lock');
    const xcworkspaceFile = (0, path_1.resolve)(iosDirectory, 'App.xcworkspace');
    await (0, fs_extra_1.remove)(podFile);
    await (0, fs_extra_1.remove)(podlockFile);
    await (0, fs_extra_1.remove)(xcworkspaceFile);
}
exports.removeCocoapodsFiles = removeCocoapodsFiles;
async function generatePackageText(config, plugins) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    const iosPlatformVersion = await (0, common_1.getCapacitorPackageVersion)(config, config.ios.name);
    const iosVersion = (0, common_2.getMajoriOSVersion)(config);
    const packageTraits = (_d = (_c = (_b = (_a = config.app.extConfig.experimental) === null || _a === void 0 ? void 0 : _a.ios) === null || _b === void 0 ? void 0 : _b.spm) === null || _c === void 0 ? void 0 : _c.packageTraits) !== null && _d !== void 0 ? _d : {};
    const packageOptions = (_h = (_g = (_f = (_e = config.app.extConfig.experimental) === null || _e === void 0 ? void 0 : _e.ios) === null || _f === void 0 ? void 0 : _f.spm) === null || _g === void 0 ? void 0 : _g.packageOptions) !== null && _h !== void 0 ? _h : {};
    const swiftToolsVersion = (_m = (_l = (_k = (_j = config.app.extConfig.experimental) === null || _j === void 0 ? void 0 : _j.ios) === null || _k === void 0 ? void 0 : _k.spm) === null || _l === void 0 ? void 0 : _l.swiftToolsVersion) !== null && _m !== void 0 ? _m : '5.9';
    let packageSwiftText = `// swift-tools-version: ${swiftToolsVersion}
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v${iosVersion})],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "${iosPlatformVersion}")`;
    for (const plugin of plugins) {
        if ((0, plugin_1.getPluginType)(plugin, config.ios.name) === 1 /* PluginType.Cordova */) {
            const platformTag = (0, plugin_1.getPluginPlatform)(plugin, config.ios.name);
            if ((_o = platformTag.$) === null || _o === void 0 ? void 0 : _o.package) {
                const relPath = (0, fs_1.convertToUnixPath)((0, path_1.relative)(config.ios.nativeXcodeProjDirAbs, plugin.rootPath));
                packageSwiftText += `,\n        .package(name: "${plugin.id}", path: "${relPath}")`;
            }
            else {
                const sourceFiles = (0, plugin_1.getPlatformElement)(plugin, config.ios.name, 'source-file');
                const headerFiles = (0, plugin_1.getPlatformElement)(plugin, config.ios.name, 'header-file');
                if (sourceFiles.length === 0 && headerFiles.length === 0) {
                    continue;
                }
                packageSwiftText += `,\n        .package(name: "${plugin.name}", path: "../../capacitor-cordova-ios-plugins/sources/${plugin.name}")`;
            }
        }
        else {
            const options = packageOptions[plugin.id];
            const symlink = options === null || options === void 0 ? void 0 : options.symlink;
            const symlinkFolder = (0, path_1.join)('symlinks', plugin.name);
            const relPath = symlink
                ? symlinkFolder
                : (0, fs_1.convertToUnixPath)((0, path_1.relative)(config.ios.nativeXcodeProjDirAbs, plugin.rootPath));
            if (symlink) {
                await (0, fs_extra_1.ensureSymlink)(plugin.rootPath, (0, path_1.resolve)(config.ios.nativeProjectDirAbs, 'CapApp-SPM', symlinkFolder));
            }
            const traits = packageTraits[plugin.id];
            const traitsSuffix = (traits === null || traits === void 0 ? void 0 : traits.length)
                ? `, traits: [${traits
                    .map((t) => {
                    // Any trait is written with quotes, with the exception of .defaults
                    return /^\.?defaults?$/i.test(t) ? '.defaults' : `"${t}"`;
                })
                    .join(', ')}]`
                : '';
            packageSwiftText += `,\n        .package(name: "${(_p = plugin.ios) === null || _p === void 0 ? void 0 : _p.name}", path: "${relPath}"${traitsSuffix})`;
        }
    }
    packageSwiftText += `
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")`;
    for (const plugin of plugins) {
        const aliases = Object.entries((_r = (_q = packageOptions[plugin.id]) === null || _q === void 0 ? void 0 : _q.moduleAliases) !== null && _r !== void 0 ? _r : {});
        const aliasText = (aliases === null || aliases === void 0 ? void 0 : aliases.length)
            ? `, moduleAliases:  [${aliases
                .map(([target, replacement]) => {
                return `"${target}": "${replacement}"`;
            })
                .join(', ')}]`
            : '';
        let pluginText = `,\n                .product(name: "${(_s = plugin.ios) === null || _s === void 0 ? void 0 : _s.name}", package: "${(_t = plugin.ios) === null || _t === void 0 ? void 0 : _t.name}"${aliasText})`;
        if ((0, plugin_1.getPluginType)(plugin, config.ios.name) === 1 /* PluginType.Cordova */) {
            const platformTag = (0, plugin_1.getPluginPlatform)(plugin, config.ios.name);
            if ((_u = platformTag.$) === null || _u === void 0 ? void 0 : _u.package) {
                pluginText = `,\n                .product(name: "${plugin.id}", package: "${plugin.id}")`;
            }
            else {
                const sourceFiles = (0, plugin_1.getPlatformElement)(plugin, config.ios.name, 'source-file');
                const headerFiles = (0, plugin_1.getPlatformElement)(plugin, config.ios.name, 'header-file');
                if (sourceFiles.length === 0 && headerFiles.length === 0) {
                    pluginText = '';
                }
            }
        }
        packageSwiftText += pluginText;
    }
    packageSwiftText += `
            ]
        )
    ]
)
`;
    return packageSwiftText;
}
exports.generatePackageText = generatePackageText;
async function runCocoapodsDeintegrate(config) {
    const podPath = await config.ios.podPath;
    const projectFileName = config.ios.nativeXcodeProjDirAbs;
    const useBundler = (await config.ios.packageManager) === 'bundler';
    log_1.logger.info('Running pod deintegrate on project ' + projectFileName);
    if (useBundler) {
        log_1.logger.info('Found bundler, using it to run CocoaPods.');
        await (0, subprocess_1.runCommand)('bundle', ['exec', 'pod', 'deintegrate', projectFileName], {
            cwd: config.ios.nativeProjectDirAbs,
        });
    }
    else {
        await (0, subprocess_1.runCommand)(podPath, ['deintegrate', projectFileName], {
            cwd: config.ios.nativeProjectDirAbs,
        });
    }
}
exports.runCocoapodsDeintegrate = runCocoapodsDeintegrate;
async function addInfoPlistDebugIfNeeded(config) {
    const infoPlist = (0, path_1.resolve)(config.ios.nativeTargetDirAbs, 'Info.plist');
    log_1.logger.info('Checking ' + infoPlist + ' for CAPACITOR_DEBUG');
    if ((0, fs_extra_1.existsSync)(infoPlist)) {
        const infoPlistContents = (0, fs_extra_1.readFileSync)(infoPlist, 'utf-8');
        const plistEntries = (0, plist_1.parse)(infoPlistContents);
        if (plistEntries['CAPACITOR_DEBUG'] === undefined) {
            log_1.logger.info('Writing CAPACITOR_DEBUG to ' + infoPlist);
            plistEntries['CAPACITOR_DEBUG'] = '$(CAPACITOR_DEBUG)';
            const plistToWrite = (0, plist_1.build)(plistEntries);
            (0, fs_extra_1.writeFileSync)(infoPlist, plistToWrite);
        }
        else {
            log_1.logger.warn('Found CAPACITOR_DEBUG set to ' + plistEntries['CAPACITOR_DEBUG'] + ', skipping.');
        }
    }
    else {
        log_1.logger.warn(infoPlist + ' not found.');
    }
}
exports.addInfoPlistDebugIfNeeded = addInfoPlistDebugIfNeeded;
function hasSceneManifest(config) {
    const infoPlist = (0, path_1.resolve)(config.ios.nativeTargetDirAbs, 'Info.plist');
    if (!(0, fs_extra_1.existsSync)(infoPlist)) {
        return false;
    }
    const entries = (0, plist_1.parse)((0, fs_extra_1.readFileSync)(infoPlist, 'utf-8'));
    return entries['UIApplicationSceneManifest'] !== undefined;
}
exports.hasSceneManifest = hasSceneManifest;
async function addSceneManifestIfNeeded(config) {
    const infoPlist = (0, path_1.resolve)(config.ios.nativeTargetDirAbs, 'Info.plist');
    if (!(0, fs_extra_1.existsSync)(infoPlist)) {
        log_1.logger.warn(infoPlist + ' not found.');
        return;
    }
    const entries = (0, plist_1.parse)((0, fs_extra_1.readFileSync)(infoPlist, 'utf-8'));
    if (entries['UIApplicationSceneManifest'] !== undefined) {
        log_1.logger.warn('Found UIApplicationSceneManifest in ' + infoPlist + ', skipping.');
        return;
    }
    entries['UIApplicationSceneManifest'] = {
        UIApplicationSupportsMultipleScenes: false,
        UISceneConfigurations: {
            UIWindowSceneSessionRoleApplication: [
                {
                    UISceneConfigurationName: 'Default Configuration',
                    UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
                    UISceneStoryboardFile: 'Main',
                },
            ],
        },
    };
    (0, fs_extra_1.writeFileSync)(infoPlist, (0, plist_1.build)(entries));
}
exports.addSceneManifestIfNeeded = addSceneManifestIfNeeded;
async function checkSwiftToolsVersion(config, version) {
    if (!version) {
        return null;
    }
    const swiftToolsVersionRegex = /^[0-9]+\.[0-9]+(\.[0-9]+)?$/;
    if (!swiftToolsVersionRegex.test(version)) {
        return (`Invalid Swift tools version: "${version}".\n` +
            `The Swift tools version must be in major.minor or major.minor.patch format (e.g., "5.9", "6.0", "5.9.2").`);
    }
    return null;
}
exports.checkSwiftToolsVersion = checkSwiftToolsVersion;
async function checkPackageTraitsRequirements(config) {
    var _a, _b, _c, _d, _e, _f;
    const packageTraits = (_c = (_b = (_a = config.app.extConfig.experimental) === null || _a === void 0 ? void 0 : _a.ios) === null || _b === void 0 ? void 0 : _b.spm) === null || _c === void 0 ? void 0 : _c.packageTraits;
    const swiftToolsVersion = (_f = (_e = (_d = config.app.extConfig.experimental) === null || _d === void 0 ? void 0 : _d.ios) === null || _e === void 0 ? void 0 : _e.spm) === null || _f === void 0 ? void 0 : _f.swiftToolsVersion;
    const hasPackageTraits = packageTraits && Object.keys(packageTraits).some((key) => { var _a; return ((_a = packageTraits[key]) === null || _a === void 0 ? void 0 : _a.length) > 0; });
    if (!hasPackageTraits) {
        return null;
    }
    if (!swiftToolsVersion) {
        return (`Package traits require an explicit Swift tools version of 6.1 or higher.\n` +
            `Set experimental.ios.spm.swiftToolsVersion to '6.1' or higher in your Capacitor configuration.`);
    }
    const versionParts = swiftToolsVersion.split('.').map((part) => parseInt(part, 10));
    const major = versionParts[0] || 0;
    const minor = versionParts[1] || 0;
    if (major < 6 || (major === 6 && minor < 1)) {
        return (`Package traits require Swift tools version 6.1 or higher, but "${swiftToolsVersion}" was specified.\n` +
            `Update experimental.ios.spm.swiftToolsVersion to '6.1' or higher in your Capacitor configuration.`);
    }
    return null;
}
exports.checkPackageTraitsRequirements = checkPackageTraitsRequirements;
// Private Functions
async function pluginsWithPackageSwift(plugins) {
    const pluginList = [];
    for (const plugin of plugins) {
        const packageSwiftFound = await (0, fs_extra_1.pathExists)((0, path_1.join)(plugin.rootPath, 'Package.swift'));
        if (packageSwiftFound) {
            pluginList.push(plugin);
        }
        else {
            log_1.logger.warn(plugin.id + ' does not have a Package.swift');
        }
    }
    return pluginList;
}

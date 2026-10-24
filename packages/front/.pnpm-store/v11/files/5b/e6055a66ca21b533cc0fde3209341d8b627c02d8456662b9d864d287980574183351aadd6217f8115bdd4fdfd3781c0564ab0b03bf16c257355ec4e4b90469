"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.__testables = exports.migrateToUIScene = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const common_1 = require("../common");
const log_1 = require("../log");
const fs_1 = require("../util/fs");
const spm_1 = require("../util/spm");
const template_1 = require("../util/template");
const xcode_1 = require("../util/xcode");
async function migrateToUIScene(config) {
    const signals = readDetectionSignals(config);
    const state = classify(signals);
    switch (state) {
        case 'already-migrated':
            log_1.logger.info('UIScene migration: project already migrated, skipping.');
            return;
        case 'partial':
            log_1.logger.warn(`UIScene migration: project is in a partial state (${describeSignals(signals)}). ` +
                `Skipping automated migration — finish the migration by hand or reset to a clean 8.4 state first.`);
            return;
        case 'eligible':
            break;
    }
    const assets = await loadTemplateAssets(config);
    if (!assets) {
        log_1.logger.error('UIScene migration: could not read shipped iOS template assets; skipping.');
        return;
    }
    await (0, common_1.runTask)('Adding UIApplicationSceneManifest to Info.plist.', () => (0, spm_1.addSceneManifestIfNeeded)(config));
    await (0, common_1.runTask)('Writing SceneDelegate.swift.', async () => {
        const { written } = writeSceneDelegate(config, assets.sceneDelegate);
        if (!written) {
            log_1.logger.warn('SceneDelegate.swift already exists, skipping.');
        }
    });
    await (0, common_1.runTask)('Patching AppDelegate.swift with configurationForConnecting.', async () => {
        const { patched, reason } = patchAppDelegate(config, assets.configurationForConnectingSnippet);
        if (!patched && reason) {
            log_1.logger.warn(`AppDelegate.swift not patched: ${reason}`);
        }
    });
    await (0, common_1.runTask)('Registering SceneDelegate.swift with the Xcode App target.', async () => {
        var _a;
        const pbxprojPath = (0, path_1.join)(config.ios.nativeXcodeProjDirAbs, 'project.pbxproj');
        try {
            const { added } = (0, xcode_1.addSwiftFileToAppTarget)(pbxprojPath, 'App', 'SceneDelegate.swift');
            if (!added) {
                log_1.logger.warn('SceneDelegate.swift is already registered in the App target, skipping.');
            }
        }
        catch (err) {
            log_1.logger.warn(`Could not register SceneDelegate.swift automatically: ${(_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : err}. ` +
                'Add SceneDelegate.swift to the App target in Xcode manually.');
        }
    });
    await scanAndWarn(config);
    printNextSteps();
}
exports.migrateToUIScene = migrateToUIScene;
async function scanAndWarn(config) {
    const findings = [];
    const swiftFiles = await (0, fs_1.readdirp)(config.ios.platformDirAbs, {
        filter: (item) => {
            if (!item.stats.isFile())
                return false;
            if (!item.path.endsWith('.swift'))
                return false;
            const p = item.path;
            return (!p.includes(`${path_1.sep}Pods${path_1.sep}`) &&
                !p.includes(`${path_1.sep}build${path_1.sep}`) &&
                !p.includes(`${path_1.sep}DerivedData${path_1.sep}`) &&
                !p.includes(`${path_1.sep}.build${path_1.sep}`));
        },
    });
    const tokenPatterns = [
        { token: /UIApplication\.shared\.applicationState/, label: 'UIApplication.shared.applicationState' },
        { token: /\btmpWindow\b/, label: 'tmpWindow' },
        { token: /\bTmpViewController\b/, label: 'TmpViewController' },
    ];
    for (const filePath of swiftFiles) {
        const source = (0, fs_extra_1.readFileSync)(filePath, 'utf-8');
        source.split('\n').forEach((line, idx) => {
            for (const { token, label } of tokenPatterns) {
                if (token.test(line)) {
                    findings.push(`${filePath}:${idx + 1}: uses ${label}`);
                }
            }
        });
    }
    const appDelegatePath = (0, path_1.join)(config.ios.nativeTargetDirAbs, 'AppDelegate.swift');
    if ((0, fs_extra_1.existsSync)(appDelegatePath)) {
        const source = (0, fs_extra_1.readFileSync)(appDelegatePath, 'utf-8');
        if (hasCustomDelegateBody(source, /func application\([^)]*\bopen url:/)) {
            findings.push(`${appDelegatePath}: custom application(_:open:) body — review for UIScene compatibility`);
        }
        if (hasCustomDelegateBody(source, /func application\([^)]*\bcontinue userActivity:/)) {
            findings.push(`${appDelegatePath}: custom application(_:continue:) body — review for UIScene compatibility`);
        }
    }
    if (findings.length === 0)
        return;
    log_1.logger.warn('UIScene scan found patterns that may need manual review:');
    for (const finding of findings) {
        log_1.logger.warn(`  ${finding}`);
    }
}
function hasCustomDelegateBody(source, sigRegex) {
    const match = source.match(sigRegex);
    if (!match || match.index === undefined)
        return false;
    const openIdx = source.indexOf('{', match.index);
    if (openIdx === -1)
        return false;
    let depth = 1;
    let i = openIdx + 1;
    while (i < source.length && depth > 0) {
        const ch = source[i];
        if (ch === '{')
            depth++;
        else if (ch === '}')
            depth--;
        i++;
    }
    if (depth !== 0)
        return false;
    const body = source.slice(openIdx + 1, i - 1);
    const codeLines = body
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.startsWith('//'));
    if (codeLines.length === 0)
        return false;
    return codeLines.some((l) => !l.includes('ApplicationDelegateProxy.shared'));
}
function printNextSteps() {
    log_1.logger.info('');
    log_1.logger.info('UIScene migration next steps:');
    log_1.logger.info('  • Review any warnings above for legacy API usage or custom AppDelegate URL/activity handlers.');
    log_1.logger.info('  • Full guide: https://capacitorjs.com/docs/updating/8-5');
}
async function loadTemplateAssets(config) {
    const packageManager = await config.ios.packageManager;
    const archiveName = packageManager === 'SPM' ? 'ios-spm-template.tar.gz' : 'ios-pods-template.tar.gz';
    const archivePath = (0, path_1.join)(config.cli.assetsDirAbs, archiveName);
    const tempDir = (0, path_1.join)(config.cli.assetsDirAbs, 'tempUISceneTemplate');
    try {
        await (0, template_1.extractTemplate)(archivePath, tempDir);
        const sceneDelegatePath = (0, path_1.join)(tempDir, 'App', 'App', 'SceneDelegate.swift');
        const appDelegatePath = (0, path_1.join)(tempDir, 'App', 'App', 'AppDelegate.swift');
        if (!(0, fs_extra_1.existsSync)(sceneDelegatePath) || !(0, fs_extra_1.existsSync)(appDelegatePath)) {
            return null;
        }
        const sceneDelegate = (0, fs_extra_1.readFileSync)(sceneDelegatePath, 'utf-8');
        const appDelegateSource = (0, fs_extra_1.readFileSync)(appDelegatePath, 'utf-8');
        const configurationForConnectingSnippet = extractConfigurationForConnecting(appDelegateSource);
        if (!configurationForConnectingSnippet) {
            return null;
        }
        return { sceneDelegate, configurationForConnectingSnippet };
    }
    finally {
        (0, fs_1.deleteFolderRecursive)(tempDir);
    }
}
function writeSceneDelegate(config, contents) {
    const path = (0, path_1.join)(config.ios.nativeTargetDirAbs, 'SceneDelegate.swift');
    if ((0, fs_extra_1.existsSync)(path)) {
        return { written: false };
    }
    (0, fs_extra_1.writeFileSync)(path, contents);
    return { written: true };
}
function patchAppDelegate(config, snippet) {
    const path = (0, path_1.join)(config.ios.nativeTargetDirAbs, 'AppDelegate.swift');
    if (!(0, fs_extra_1.existsSync)(path)) {
        return { patched: false, reason: 'AppDelegate.swift not found.' };
    }
    const source = (0, fs_extra_1.readFileSync)(path, 'utf-8');
    if (source.includes('UISceneConfiguration(name:')) {
        return { patched: false, reason: 'configurationForConnecting already present.' };
    }
    const patched = insertBeforeAppDelegateClassEnd(source, snippet);
    if (!patched) {
        return { patched: false, reason: 'could not locate AppDelegate class body.' };
    }
    (0, fs_extra_1.writeFileSync)(path, patched);
    return { patched: true };
}
function extractConfigurationForConnecting(appDelegateSource) {
    const sigRegex = /^ {4}func application\(_ application: UIApplication,\n {21}configurationForConnecting\b/m;
    const sigMatch = appDelegateSource.match(sigRegex);
    if (!sigMatch || sigMatch.index === undefined) {
        return null;
    }
    const openIdx = appDelegateSource.indexOf('{', sigMatch.index);
    if (openIdx === -1) {
        return null;
    }
    let depth = 1;
    let i = openIdx + 1;
    while (i < appDelegateSource.length && depth > 0) {
        const ch = appDelegateSource[i];
        if (ch === '{')
            depth++;
        else if (ch === '}')
            depth--;
        i++;
    }
    if (depth !== 0) {
        return null;
    }
    return '\n' + appDelegateSource.slice(sigMatch.index, i) + '\n';
}
function insertBeforeAppDelegateClassEnd(source, snippet) {
    const classDeclRegex = /\bclass\s+AppDelegate\b[^{]*\{/;
    const match = source.match(classDeclRegex);
    if (!match || match.index === undefined) {
        return null;
    }
    const openIdx = source.indexOf('{', match.index);
    let depth = 1;
    let i = openIdx + 1;
    while (i < source.length && depth > 0) {
        const ch = source[i];
        if (ch === '{')
            depth++;
        else if (ch === '}')
            depth--;
        i++;
    }
    if (depth !== 0) {
        return null;
    }
    const closeIdx = i - 1;
    return source.slice(0, closeIdx) + snippet + source.slice(closeIdx);
}
function readDetectionSignals(config) {
    const sceneDelegatePath = (0, path_1.join)(config.ios.nativeTargetDirAbs, 'SceneDelegate.swift');
    const appDelegatePath = (0, path_1.join)(config.ios.nativeTargetDirAbs, 'AppDelegate.swift');
    return {
        hasManifest: (0, spm_1.hasSceneManifest)(config),
        hasSceneDelegate: (0, fs_extra_1.existsSync)(sceneDelegatePath),
        hasConfigurationForConnecting: (0, fs_extra_1.existsSync)(appDelegatePath) && (0, fs_extra_1.readFileSync)(appDelegatePath, 'utf-8').includes('UISceneConfiguration(name:'),
    };
}
function classify(signals) {
    const { hasManifest, hasSceneDelegate, hasConfigurationForConnecting } = signals;
    const trueCount = [hasManifest, hasSceneDelegate, hasConfigurationForConnecting].filter(Boolean).length;
    if (trueCount === 0)
        return 'eligible';
    if (trueCount === 3)
        return 'already-migrated';
    return 'partial';
}
function describeSignals({ hasManifest, hasSceneDelegate, hasConfigurationForConnecting, }) {
    const present = [];
    const missing = [];
    (hasManifest ? present : missing).push('UIApplicationSceneManifest');
    (hasSceneDelegate ? present : missing).push('SceneDelegate.swift');
    (hasConfigurationForConnecting ? present : missing).push('AppDelegate.configurationForConnecting');
    return `present: [${present.join(', ')}]; missing: [${missing.join(', ')}]`;
}
// Exported for tests.
exports.__testables = {
    classify,
    describeSignals,
    insertBeforeAppDelegateClassEnd,
    extractConfigurationForConnecting,
    hasCustomDelegateBody,
    scanAndWarn,
};

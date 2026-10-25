"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findGroupUuidByComment = exports.addSwiftFileToAppTarget = void 0;
const fs_extra_1 = require("fs-extra");
const xcode_1 = require("xcode");
/**
 * Register a Swift source file with the first native target of an Xcode project.
 *
 * Writes entries in PBXFileReference, PBXBuildFile, the named PBXGroup's children,
 * and the target's Sources build phase. Idempotent: a second call is a no-op.
 *
 * @param pbxprojPath   Absolute path to project.pbxproj
 * @param groupName     Comment/name of the PBXGroup the file belongs under (e.g. 'App')
 * @param fileRelPath   Path of the file relative to the group (e.g. 'SceneDelegate.swift')
 */
function addSwiftFileToAppTarget(pbxprojPath, groupName, fileRelPath) {
    const project = (0, xcode_1.project)(pbxprojPath);
    project.parseSync();
    if (project.hasFile(fileRelPath)) {
        return { added: false };
    }
    const groupUuid = findGroupUuidByComment(project, groupName);
    if (!groupUuid) {
        throw new Error(`Could not find PBXGroup with comment "${groupName}" in ${pbxprojPath}`);
    }
    const targetUuid = project.getFirstTarget().uuid;
    const result = project.addSourceFile(fileRelPath, { target: targetUuid }, groupUuid);
    if (!result) {
        throw new Error(`Failed to register ${fileRelPath} in ${pbxprojPath}`);
    }
    (0, fs_extra_1.writeFileSync)(pbxprojPath, project.writeSync(), 'utf-8');
    return { added: true };
}
exports.addSwiftFileToAppTarget = addSwiftFileToAppTarget;
// Exported for tests.
function findGroupUuidByComment(project, comment) {
    const groups = project.hash.project.objects.PBXGroup;
    const COMMENT_SUFFIX = '_comment';
    for (const key of Object.keys(groups)) {
        if (!key.endsWith(COMMENT_SUFFIX))
            continue;
        if (groups[key] === comment) {
            return key.substring(0, key.length - COMMENT_SUFFIX.length);
        }
    }
    return null;
}
exports.findGroupUuidByComment = findGroupUuidByComment;

/**
 * @license Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';
import { join } from 'path';
import childProcess from 'child_process';
import { mkdtempSync } from 'fs';
import isWsl from 'is-wsl';
export const LaunchErrorCodes = {
    ERR_LAUNCHER_PATH_NOT_SET: 'ERR_LAUNCHER_PATH_NOT_SET',
    ERR_LAUNCHER_INVALID_USER_DATA_DIRECTORY: 'ERR_LAUNCHER_INVALID_USER_DATA_DIRECTORY',
    ERR_LAUNCHER_UNSUPPORTED_PLATFORM: 'ERR_LAUNCHER_UNSUPPORTED_PLATFORM',
    ERR_LAUNCHER_NOT_INSTALLED: 'ERR_LAUNCHER_NOT_INSTALLED',
};
export function defaults(val, def) {
    return typeof val === 'undefined' ? def : val;
}
export async function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
export class LauncherError extends Error {
    constructor(message = 'Unexpected error', code) {
        super(message);
        this.message = message;
        this.code = code;
        this.stack = new Error().stack;
        return this;
    }
}
export class ChromePathNotSetError extends LauncherError {
    constructor() {
        super(...arguments);
        this.message = 'The CHROME_PATH environment variable must be set to a Chrome/Chromium executable no older than Chrome stable.';
        this.code = LaunchErrorCodes.ERR_LAUNCHER_PATH_NOT_SET;
    }
}
export class InvalidUserDataDirectoryError extends LauncherError {
    constructor() {
        super(...arguments);
        this.message = 'userDataDir must be false or a path.';
        this.code = LaunchErrorCodes.ERR_LAUNCHER_INVALID_USER_DATA_DIRECTORY;
    }
}
export class UnsupportedPlatformError extends LauncherError {
    constructor() {
        super(...arguments);
        this.message = `Platform ${getPlatform()} is not supported.`;
        this.code = LaunchErrorCodes.ERR_LAUNCHER_UNSUPPORTED_PLATFORM;
    }
}
export class ChromeNotInstalledError extends LauncherError {
    constructor() {
        super(...arguments);
        this.message = 'No Chrome installations found.';
        this.code = LaunchErrorCodes.ERR_LAUNCHER_NOT_INSTALLED;
    }
}
export function getPlatform() {
    return isWsl ? 'wsl' : process.platform;
}
export function makeTmpDir() {
    switch (getPlatform()) {
        case 'darwin':
        case 'linux':
            return makeUnixTmpDir();
        case 'wsl':
            // We populate the user's Windows temp dir so the folder is correctly created later
            process.env.TEMP = getWSLLocalAppDataPath(`${process.env.PATH}`);
        case 'win32':
            return makeWin32TmpDir();
        default:
            throw new UnsupportedPlatformError();
    }
}
function toWinDirFormat(dir = '') {
    const results = /\/mnt\/([a-z])\//.exec(dir);
    if (!results) {
        return dir;
    }
    const driveLetter = results[1];
    return dir.replace(`/mnt/${driveLetter}/`, `${driveLetter.toUpperCase()}:\\`)
        .replace(/\//g, '\\');
}
export function toWin32Path(dir = '') {
    if (/[a-z]:\\/iu.test(dir)) {
        return dir;
    }
    try {
        return childProcess.execFileSync('wslpath', ['-w', dir]).toString().trim();
    }
    catch {
        return toWinDirFormat(dir);
    }
}
export function toWSLPath(dir, fallback) {
    try {
        return childProcess.execFileSync('wslpath', ['-u', dir]).toString().trim();
    }
    catch {
        return fallback;
    }
}
function getLocalAppDataPath(path) {
    const userRegExp = /\/mnt\/([a-z])\/Users\/([^\/:]+)\/AppData\//;
    const results = userRegExp.exec(path) || [];
    return `/mnt/${results[1]}/Users/${results[2]}/AppData/Local`;
}
export function getWSLLocalAppDataPath(path) {
    const userRegExp = /\/([a-z])\/Users\/([^\/:]+)\/AppData\//;
    const results = userRegExp.exec(path) || [];
    return toWSLPath(`${results[1]}:\\Users\\${results[2]}\\AppData\\Local`, getLocalAppDataPath(path));
}
function makeUnixTmpDir() {
    return childProcess.execSync('mktemp -d -t lighthouse.XXXXXXX').toString().trim();
}
export function makeWin32TmpDir() {
    const winTmpPath = process.env.TEMP || process.env.TMP ||
        (process.env.SystemRoot || process.env.windir) + '\\temp';
    return mkdtempSync(join(winTmpPath, 'lighthouse.'));
}
export { childProcess as _childProcessForTesting };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUNILFlBQVksQ0FBQztBQUViLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDMUIsT0FBTyxZQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxJQUFJLENBQUM7QUFDL0IsT0FBTyxLQUFLLE1BQU0sUUFBUSxDQUFDO0FBRTNCLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHO0lBQzlCLHlCQUF5QixFQUFFLDJCQUEyQjtJQUN0RCx3Q0FBd0MsRUFBRSwwQ0FBMEM7SUFDcEYsaUNBQWlDLEVBQUUsbUNBQW1DO0lBQ3RFLDBCQUEwQixFQUFFLDRCQUE0QjtDQUNoRCxDQUFDO0FBR1gsTUFBTSxVQUFVLFFBQVEsQ0FBSSxHQUFnQixFQUFFLEdBQU07SUFDbEQsT0FBTyxPQUFPLEdBQUcsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQ2hELENBQUM7QUFFRCxNQUFNLENBQUMsS0FBSyxVQUFVLEtBQUssQ0FBQyxJQUFZO0lBQ3RDLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDM0QsQ0FBQztBQUVELE1BQU0sT0FBTyxhQUFjLFNBQVEsS0FBSztJQUl0QyxZQUFZLFVBQWtCLGtCQUFrQixFQUFFLElBQWE7UUFDN0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FB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
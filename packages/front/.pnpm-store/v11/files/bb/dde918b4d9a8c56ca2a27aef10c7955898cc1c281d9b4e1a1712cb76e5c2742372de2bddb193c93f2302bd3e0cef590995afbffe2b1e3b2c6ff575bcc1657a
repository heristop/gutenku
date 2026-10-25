'use strict';

var xvfb = require('./xvfb-BKRGwxlS.js');
var _ = require('lodash');
var commander = require('commander');
var commonTags = require('common-tags');
var logSymbols = require('log-symbols');
var Debug = require('debug');
var fs = require('fs-extra');
var path = require('path');
var Table = require('cli-table3');
var dayjs = require('dayjs');
var relativeTime = require('dayjs/plugin/relativeTime');
var chalk = require('chalk');
var Bluebird = require('bluebird');
var spawn = require('./spawn-BkpC5qQ4.js');
var os = require('os');
var listr2 = require('listr2');
var timers = require('timers/promises');
var fsp = require('fs/promises');
var assert = require('assert');
var request = require('@cypress/request');
var requestProgress = require('request-progress');
var proxyFromEnv = require('proxy-from-env');
var cp = require('child_process');
var yauzl = require('yauzl');
var fs$1 = require('fs');
var util = require('util');
var require$$0 = require('stream');
var readline = require('readline');
var prettyBytes = require('pretty-bytes');

const debug$8 = Debug('cypress:cli');
const defaultBaseUrl = 'https://download.cypress.io/';
const defaultMaxRedirects = 10;
const getProxyForUrlWithNpmConfig = (url) => {
    return proxyFromEnv.getProxyForUrl(url) ||
        process.env.npm_config_https_proxy ||
        process.env.npm_config_proxy ||
        null;
};
const getBaseUrl = () => {
    if (xvfb.util.getEnv('CYPRESS_DOWNLOAD_MIRROR')) {
        let baseUrl = xvfb.util.getEnv('CYPRESS_DOWNLOAD_MIRROR');
        if (!(baseUrl === null || baseUrl === void 0 ? void 0 : baseUrl.endsWith('/'))) {
            baseUrl += '/';
        }
        return baseUrl || defaultBaseUrl;
    }
    return defaultBaseUrl;
};
const getCA = () => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    if (process.env.npm_config_cafile) {
        try {
            const caFileContent = yield fs.readFile(process.env.npm_config_cafile, 'utf8');
            return caFileContent;
        }
        catch (error) {
            debug$8('error reading ca file', error);
            return;
        }
    }
    if (process.env.npm_config_ca) {
        return process.env.npm_config_ca;
    }
    return;
});
const prepend = (arch, urlPath, version) => {
    const endpoint = new URL(urlPath, getBaseUrl()).toString();
    const platform = os.platform();
    const pathTemplate = xvfb.util.getEnv('CYPRESS_DOWNLOAD_PATH_TEMPLATE', true);
    if ((platform === 'win32') && (arch === 'arm64')) {
        debug$8(`detected platform ${platform} architecture ${arch} combination`);
        arch = 'x64';
        debug$8(`overriding to download ${platform}-${arch} instead`);
    }
    return pathTemplate
        ? (pathTemplate
            .replace(/\\?\$\{endpoint\}/g, endpoint)
            .replace(/\\?\$\{platform\}/g, platform)
            .replace(/\\?\$\{arch\}/g, arch)
            .replace(/\\?\$\{version\}/g, version))
        : `${endpoint}?platform=${platform}&arch=${arch}`;
};
const getUrl = (arch, version) => {
    if (_.isString(version) && version.match(/^https?:\/\/.*$/)) {
        debug$8('version is already an url', version);
        return version;
    }
    const urlPath = version ? `desktop/${version}` : 'desktop';
    return prepend(arch, urlPath, version || '');
};
const statusMessage = (err) => {
    return (err.statusCode
        ? [err.statusCode, err.statusMessage].join(' - ')
        : err.toString());
};
const prettyDownloadErr = (err, url) => {
    const msg = commonTags.stripIndent `
    URL: ${url}
    ${statusMessage(err)}
  `;
    debug$8(msg);
    return xvfb.throwFormErrorText(xvfb.errors.failedDownload)(msg);
};
/**
 * Checks checksum and file size for the given file. Allows both
 * values or just one of them to be checked.
 */
const verifyDownloadedFile = (filename, expectedSize, expectedChecksum) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    if (expectedSize && expectedChecksum) {
        debug$8('verifying checksum and file size');
        return Bluebird.join(xvfb.util.getFileChecksum(filename), xvfb.util.getFileSize(filename), (checksum, filesize) => {
            if (checksum === expectedChecksum && filesize === expectedSize) {
                debug$8('downloaded file has the expected checksum and size ✅');
                return;
            }
            debug$8('raising error: checksum or file size mismatch');
            const text = commonTags.stripIndent `
          Corrupted download

          Expected downloaded file to have checksum: ${expectedChecksum}
          Computed checksum: ${checksum}

          Expected downloaded file to have size: ${expectedSize}
          Computed size: ${filesize}
        `;
            debug$8(text);
            throw new Error(text);
        });
    }
    if (expectedChecksum) {
        debug$8('only checking expected file checksum %d', expectedChecksum);
        const checksum = yield xvfb.util.getFileChecksum(filename);
        if (checksum === expectedChecksum) {
            debug$8('downloaded file has the expected checksum ✅');
            return;
        }
        debug$8('raising error: file checksum mismatch');
        const text = commonTags.stripIndent `
      Corrupted download

      Expected downloaded file to have checksum: ${expectedChecksum}
      Computed checksum: ${checksum}
    `;
        throw new Error(text);
    }
    if (expectedSize) {
        // maybe we don't have a checksum, but at least CDN returns content length
        // which we can check against the file size
        debug$8('only checking expected file size %d', expectedSize);
        const filesize = yield xvfb.util.getFileSize(filename);
        if (filesize === expectedSize) {
            debug$8('downloaded file has the expected size ✅');
            return;
        }
        debug$8('raising error: file size mismatch');
        const text = commonTags.stripIndent `
        Corrupted download

        Expected downloaded file to have size: ${expectedSize}
        Computed size: ${filesize}
      `;
        throw new Error(text);
    }
    debug$8('downloaded file lacks checksum or size to verify');
    return;
});
// downloads from given url
// return an object with
// {filename: ..., downloaded: true}
const downloadFromUrl = ({ url, downloadDestination, progress, ca, version, redirectTTL = defaultMaxRedirects }) => {
    if (redirectTTL <= 0) {
        return Promise.reject(new Error(commonTags.stripIndent `
          Failed downloading the Cypress binary.
          There were too many redirects. The default allowance is ${defaultMaxRedirects}.
          Maybe you got stuck in a redirect loop?
        `));
    }
    return new Bluebird((resolve, reject) => {
        const proxy = getProxyForUrlWithNpmConfig(url);
        debug$8('Downloading package', {
            url,
            proxy,
            downloadDestination,
        });
        if (ca) {
            debug$8('using custom CA details from npm config');
        }
        const reqOptions = Object.assign(Object.assign(Object.assign({ uri: url }, (proxy ? { proxy } : {})), (ca ? { agentOptions: { ca } } : {})), { method: 'GET', followRedirect: false });
        const req = request(reqOptions);
        // closure
        let started = null;
        let expectedSize;
        let expectedChecksum;
        requestProgress(req, {
            throttle: progress.throttle,
        })
            .on('response', (response) => {
            // we have computed checksum and filesize during test runner binary build
            // and have set it on the S3 object as user meta data, available via
            // these custom headers "x-amz-meta-..."
            // see https://github.com/cypress-io/cypress/pull/4092
            expectedSize = response.headers['x-amz-meta-size'] ||
                response.headers['content-length'];
            expectedChecksum = response.headers['x-amz-meta-checksum'];
            if (expectedChecksum) {
                debug$8('expected checksum %s', expectedChecksum);
            }
            if (expectedSize) {
                // convert from string (all Amazon custom headers are strings)
                expectedSize = Number(expectedSize);
                debug$8('expected file size %d', expectedSize);
            }
            // start counting now once we've gotten
            // response headers
            started = new Date();
            if (/^3/.test(response.statusCode)) {
                const redirectVersion = response.headers['x-version'];
                const redirectUrl = response.headers.location;
                debug$8('redirect version:', redirectVersion);
                debug$8('redirect url:', redirectUrl);
                downloadFromUrl({ url: redirectUrl, progress, ca, downloadDestination, version: redirectVersion, redirectTTL: redirectTTL - 1 })
                    .then(resolve).catch(reject);
                // if our status code does not start with 200
            }
            else if (!/^2/.test(response.statusCode)) {
                debug$8('response code %d', response.statusCode);
                const err = new Error(commonTags.stripIndent `
          Failed downloading the Cypress binary.
          Response code: ${response.statusCode}
          Response message: ${response.statusMessage}
        `);
                reject(err);
                // status codes here are all 2xx
            }
            else {
                // We only enable this pipe connection when we know we've got a successful return
                // and handle the completion with verify and resolve
                // there was a possible race condition between end of request and close of writeStream
                // that is made ordered with this Promise.all
                Bluebird.all([new Bluebird((r) => {
                        return response.pipe(fs.createWriteStream(downloadDestination).on('close', r));
                    }), new Bluebird((r) => response.on('end', r))])
                    .then(() => {
                    debug$8('downloading finished');
                    verifyDownloadedFile(downloadDestination, expectedSize, expectedChecksum)
                        .then(() => debug$8('verified'))
                        .then(() => resolve(version))
                        .catch(reject);
                });
            }
        })
            .on('error', (e) => {
            if (e.code === 'ECONNRESET')
                return; // sometimes proxies give ECONNRESET but we don't care
            reject(e);
        })
            .on('progress', (state) => {
            // total time we've elapsed
            // starting on our first progress notification
            const elapsed = +new Date() - +started;
            // request-progress sends a value between 0 and 1
            const percentage = xvfb.util.convertPercentToPercentage(state.percent);
            const eta = xvfb.util.calculateEta(percentage, elapsed);
            // send up our percent and seconds remaining
            progress.onProgress(percentage, xvfb.util.secsRemaining(eta));
        });
    });
};
/**
 * Download Cypress.zip from external versionUrl to local file.
 * @param [string] version Could be "3.3.0" or full URL
 * @param [string] downloadDestination Local filename to save as
 */
const start$3 = (opts) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    let { version, downloadDestination, progress, redirectTTL } = opts;
    if (!downloadDestination) {
        assert.ok(_.isString(downloadDestination) && !_.isEmpty(downloadDestination), 'missing download dir');
    }
    if (!progress) {
        progress = { onProgress: () => {
                return {};
            } };
    }
    const arch = yield xvfb.util.getRealArch();
    const versionUrl = getUrl(arch, version);
    progress.throttle = 100;
    debug$8('needed Cypress version: %s', version);
    debug$8('source url %s', versionUrl);
    debug$8(`downloading cypress.zip to "${downloadDestination}"`);
    try {
        // ensure download dir exists
        yield fs.ensureDir(path.dirname(downloadDestination));
        const ca = yield getCA();
        return downloadFromUrl(Object.assign({ url: versionUrl, downloadDestination, progress, ca, version }, (redirectTTL ? { redirectTTL } : {})));
    }
    catch (err) {
        return prettyDownloadErr(err, versionUrl);
    }
});
const downloadModule = {
    start: start$3,
    getUrl,
    getProxyForUrlWithNpmConfig,
    getCA,
};

const pipelineAsync = util.promisify(require$$0.pipeline);
// Unix file mode masks for entries stored in zip's externalFileAttributes
// (the high 16 bits when the file was zipped on a Unix host).
const S_IFMT = 0o170000;
const S_IFDIR = 0o040000;
const S_IFLNK = 0o120000;
// PATH_MAX on Linux/macOS is 4096; symlink targets larger than this are not
// legal filesystem paths and almost certainly indicate a malformed or
// malicious archive. The cap also prevents reading an arbitrarily large
// "symlink" entry into memory.
const MAX_SYMLINK_TARGET_BYTES = 4096;
/**
 * Extracts the contents of a zip archive into the given destination directory.
 * Recreates directories, regular files, and symlinks while preserving Unix
 * file modes encoded in each entry's external attributes. Calls `onEntry` once
 * per archive entry processed. Refuses entries whose resolved path would
 * escape the destination directory.
 */
const extractWithYauzl = (zipFilePath, destDir, onEntry) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const resolvedDest = path.resolve(destDir);
    yield new Promise((resolve, reject) => {
        // autoClose: false — `finish` below owns closing the zipfile, so we don't
        // want yauzl's internal end-listener closing it first and tripping a
        // double-close (EBADF) when we do.
        yauzl.open(zipFilePath, { lazyEntries: true, autoClose: false }, (err, zipFile) => {
            if (err) {
                return reject(err);
            }
            // `settled` guards against an in-flight `handleEntry` calling
            // `zipFile.readEntry()` on a now-closed handle when extraction has
            // already failed (e.g. yauzl emitted 'error' while we were writing
            // an entry to disk).
            let settled = false;
            const finish = _.once((err) => {
                var _a, _b;
                settled = true;
                (_a = zipFile.removeAllListeners) === null || _a === void 0 ? void 0 : _a.call(zipFile);
                (_b = zipFile.close) === null || _b === void 0 ? void 0 : _b.call(zipFile);
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
            // Normalize any thrown / emitted value into a real Error so that a
            // falsy rejection (e.g. `Promise.reject(undefined)`) doesn't get
            // misread by `finish` as a successful completion.
            const fail = (err) => {
                finish(err instanceof Error ? err : new Error(typeof err === 'string' && err ? err : 'zip extraction failed'));
            };
            zipFile.on('error', fail);
            zipFile.on('end', () => finish());
            zipFile.on('entry', (entry) => {
                handleEntry(zipFile, entry, resolvedDest)
                    .then(() => {
                    if (settled)
                        return;
                    onEntry();
                    zipFile.readEntry();
                })
                    .catch(fail);
            });
            zipFile.readEntry();
        });
    });
});
const handleEntry = (zipFile, entry, resolvedDest) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const fileDest = path.resolve(resolvedDest, entry.fileName);
    // refuse anything that would write outside the install dir
    if (fileDest !== resolvedDest &&
        !fileDest.startsWith(resolvedDest + path.sep)) {
        throw new Error(`Refusing to extract entry outside of destination: ${entry.fileName}`);
    }
    const unixMode = (entry.externalFileAttributes >>> 16) & 0xffff;
    // Some archivers mark directories by Unix mode bits instead of (or in
    // addition to) a trailing slash; honor both so we don't extract a
    // directory entry as a zero-byte file.
    const isDir = /\/$/.test(entry.fileName) || (unixMode & S_IFMT) === S_IFDIR;
    const isSymlink = (unixMode & S_IFMT) === S_IFLNK;
    if (isDir) {
        yield fsp.mkdir(fileDest, { recursive: true });
        return;
    }
    yield fsp.mkdir(path.dirname(fileDest), { recursive: true });
    if (isSymlink) {
        if (entry.uncompressedSize > MAX_SYMLINK_TARGET_BYTES) {
            throw new Error(`Refusing to extract symlink with target larger than ${MAX_SYMLINK_TARGET_BYTES} bytes: ${entry.fileName}`);
        }
        const linkTarget = yield readEntryAsString(zipFile, entry, MAX_SYMLINK_TARGET_BYTES);
        const resolvedTarget = path.resolve(path.dirname(fileDest), linkTarget);
        if (resolvedTarget !== resolvedDest &&
            !resolvedTarget.startsWith(resolvedDest + path.sep)) {
            throw new Error(`Refusing to extract symlink pointing outside of destination: ${entry.fileName} -> ${linkTarget}`);
        }
        yield fsp.rm(fileDest, { recursive: true, force: true });
        yield fsp.symlink(linkTarget, fileDest);
        return;
    }
    const readStream = yield new Promise((res, rej) => {
        zipFile.openReadStream(entry, (err, rs) => {
            if (err) {
                return rej(err);
            }
            return res(rs);
        });
    });
    // Preserve the Unix mode bits when present; otherwise fall back to a sane default.
    const fileMode = (unixMode & 0o7777) || 0o644;
    const writeStream = fs$1.createWriteStream(fileDest, { mode: fileMode });
    yield pipelineAsync(readStream, writeStream);
});
const readEntryAsString = (zipFile, entry, maxBytes) => {
    return new Promise((resolve, reject) => {
        zipFile.openReadStream(entry, (err, rs) => {
            if (err) {
                return reject(err);
            }
            const chunks = [];
            let received = 0;
            let bailed = false;
            const bail = (err) => {
                var _a;
                if (bailed)
                    return;
                bailed = true;
                (_a = rs.destroy) === null || _a === void 0 ? void 0 : _a.call(rs, err);
                reject(err);
            };
            rs.on('data', (chunk) => {
                received += chunk.length;
                if (received > maxBytes) {
                    bail(new Error(`Refusing to read entry body larger than ${maxBytes} bytes: ${entry.fileName}`));
                    return;
                }
                chunks.push(chunk);
            });
            rs.on('end', () => {
                if (bailed)
                    return;
                resolve(Buffer.concat(chunks).toString('utf8'));
            });
            rs.on('error', bail);
        });
    });
};

const debug$7 = Debug('cypress:cli:unzip');
const unzipTools = {
    extractWithYauzl,
};
// expose this function for simple testing
const unzip = (_a) => xvfb.__awaiter(void 0, [_a], void 0, function* ({ zipFilePath, installDir, progress }) {
    debug$7('unzipping from %s', zipFilePath);
    debug$7('into', installDir);
    if (!zipFilePath) {
        throw new Error('Missing zip filename');
    }
    const startTime = Date.now();
    let yauzlDoneTime = 0;
    yield fs.ensureDir(installDir);
    yield new Promise((resolve, reject) => {
        // Open with lazyEntries so yauzl doesn't auto-emit entries (which would
        // require the fd to stay open for the duration of the OS-tool extraction).
        // We only need the entryCount here for the progress calculation.
        return yauzl.open(zipFilePath, { lazyEntries: true }, (err, zipFile) => {
            yauzlDoneTime = Date.now();
            if (err) {
                debug$7('error using yauzl %s', err.message);
                return reject(err);
            }
            const total = zipFile.entryCount;
            debug$7('zipFile entries count', total);
            // Close the count-only handle — the Node fallback re-opens the zip for extraction.
            zipFile.close();
            const started = new Date();
            let percent = 0;
            let count = 0;
            const notify = (percent) => {
                const elapsed = +new Date() - +started;
                const eta = xvfb.util.calculateEta(percent, elapsed);
                progress.onProgress(percent, xvfb.util.secsRemaining(eta));
            };
            const tick = () => {
                count += 1;
                percent = ((count / total) * 100);
                const displayPercent = percent.toFixed(0);
                return notify(Number(displayPercent));
            };
            const unzipWithNode = () => xvfb.__awaiter(void 0, void 0, void 0, function* () {
                debug$7('unzipping with node.js (slow)');
                try {
                    yield unzipTools.extractWithYauzl(zipFilePath, installDir, tick);
                    debug$7('node unzip finished');
                    return resolve();
                }
                catch (err) {
                    const error = err || new Error('Unknown error with Node extract tool');
                    debug$7('error %s', error.message);
                    return reject(error);
                }
            });
            const unzipFallback = _.once(unzipWithNode);
            const unzipWithUnzipTool = () => {
                debug$7('unzipping via `unzip`');
                const inflatingRe = /inflating:/;
                const sp = cp.spawn('unzip', ['-o', zipFilePath, '-d', installDir]);
                sp.on('error', (err) => {
                    debug$7('unzip tool error: %s', err.message);
                    unzipFallback();
                });
                sp.on('close', (code) => {
                    debug$7('unzip tool close with code %d', code);
                    if (code === 0) {
                        percent = 100;
                        notify(percent);
                        return resolve();
                    }
                    debug$7('`unzip` failed %o', { code });
                    return unzipFallback();
                });
                sp.stdout.on('data', (data) => {
                    if (inflatingRe.test(data)) {
                        return tick();
                    }
                });
                sp.stderr.on('data', (data) => {
                    debug$7('`unzip` stderr %s', data);
                });
            };
            // we attempt to first unzip with the native osx
            // ditto because its less likely to have problems
            // with corruption, symlinks, or icons causing failures
            // and can handle resource forks
            // http://automatica.com.au/2011/02/unzip-mac-os-x-zip-in-terminal/
            const unzipWithOsx = () => {
                debug$7('unzipping via `ditto`');
                const copyingFileRe = /^copying file/;
                const sp = cp.spawn('ditto', ['-xkV', zipFilePath, installDir]);
                // f-it just unzip with node
                sp.on('error', (err) => {
                    debug$7(err.message);
                    unzipFallback();
                });
                sp.on('close', (code) => {
                    if (code === 0) {
                        // make sure we get to 100% on the progress bar
                        // because reading in lines is not really accurate
                        percent = 100;
                        notify(percent);
                        return resolve();
                    }
                    debug$7('`ditto` failed %o', { code });
                    return unzipFallback();
                });
                return readline.createInterface({
                    input: sp.stderr,
                })
                    .on('line', (line) => {
                    if (copyingFileRe.test(line)) {
                        return tick();
                    }
                });
            };
            switch (os.platform()) {
                case 'darwin':
                    return unzipWithOsx();
                case 'linux':
                    return unzipWithUnzipTool();
                case 'win32':
                    return unzipWithNode();
                default:
                    return;
            }
        });
    });
    debug$7('unzip completed %o', {
        yauzlMs: yauzlDoneTime - startTime,
        unzipMs: Date.now() - yauzlDoneTime,
    });
});
function isMaybeWindowsMaxPathLengthError(err) {
    return os.platform() === 'win32' && err.code === 'ENOENT' && err.syscall === 'realpath';
}
const start$2 = (_a) => xvfb.__awaiter(void 0, [_a], void 0, function* ({ zipFilePath, installDir, progress }) {
    assert.ok(_.isString(installDir) && !_.isEmpty(installDir), 'missing installDir');
    if (!progress) {
        progress = { onProgress: () => {
                return {};
            } };
    }
    try {
        const installDirExists = yield fs.pathExists(installDir);
        if (installDirExists) {
            debug$7('removing existing unzipped binary', installDir);
            yield fs.remove(installDir);
        }
        yield unzip({ zipFilePath, installDir, progress });
    }
    catch (err) {
        const errorTemplate = isMaybeWindowsMaxPathLengthError(err) ?
            xvfb.errors.failedUnzipWindowsMaxPathLength
            : xvfb.errors.failedUnzip;
        yield xvfb.throwFormErrorText(errorTemplate)(err);
    }
});
const unzipModule = {
    start: start$2,
    utils: {
        unzip,
        unzipTools,
    },
};

const debug$6 = Debug('cypress:cli:install');
function _getBinaryUrlFromBuildInfo(version, arch, { commitSha, commitBranch }) {
    const platform = os.platform();
    if ((platform === 'win32') && (arch === 'arm64')) {
        debug$6(`detected platform ${platform} architecture ${arch} combination`);
        arch = 'x64';
        debug$6(`overriding to download ${platform}-${arch} pre-release binary instead`);
    }
    return `https://cdn.cypress.io/beta/binary/${version}/${platform}-${arch}/${commitBranch}-${commitSha}/cypress.zip`;
}
const alreadyInstalledMsg = () => {
    if (!xvfb.util.isPostInstall()) {
        xvfb.loggerModule.log(commonTags.stripIndent `
      Skipping installation:

        Pass the ${chalk.yellow('--force')} option if you'd like to reinstall anyway.
    `);
    }
};
const displayCompletionMsg = () => {
    xvfb.loggerModule.log();
    xvfb.loggerModule.log('You can now open Cypress by running one of the following, depending on your package manager:');
    xvfb.loggerModule.log();
    xvfb.loggerModule.log(chalk.cyan('- npx cypress open'));
    xvfb.loggerModule.log(chalk.cyan('- yarn cypress open'));
    xvfb.loggerModule.log(chalk.cyan('- pnpm cypress open'));
    xvfb.loggerModule.log();
    xvfb.loggerModule.log(chalk.grey('https://on.cypress.io/opening-the-app'));
    xvfb.loggerModule.log();
};
const validateOS = () => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const platformInfo = yield xvfb.util.getPlatformInfo();
    return platformInfo.match(/(win32-x64|win32-arm64|linux-x64|linux-arm64|darwin-x64|darwin-arm64)/);
});
/**
 * Returns the version to install - either a string like `1.2.3` to be fetched
 * from the download server or a file path or HTTP URL.
 */
function getVersionOverride(version, { arch, envVarVersion, buildInfo }) {
    // let this environment variable reset the binary version we need
    if (envVarVersion) {
        return envVarVersion;
    }
    if (buildInfo && !buildInfo.stable) {
        xvfb.loggerModule.log(chalk.yellow(commonTags.stripIndent `
        ${logSymbols.warning} Warning: You are installing a pre-release build of Cypress.

        Bugs may be present which do not exist in production builds.

        This build was created from:
          * Commit SHA: ${buildInfo.commitSha}
          * Commit Branch: ${buildInfo.commitBranch}
          * Commit Timestamp: ${buildInfo.commitDate}
      `));
        xvfb.loggerModule.log();
        return _getBinaryUrlFromBuildInfo(version, arch, buildInfo);
    }
}
function getEnvVarVersion() {
    if (!xvfb.util.getEnv('CYPRESS_INSTALL_BINARY'))
        return;
    // because passed file paths are often double quoted
    // and might have extra whitespace around, be robust and trim the string
    const trimAndRemoveDoubleQuotes = true;
    const envVarVersion = xvfb.util.getEnv('CYPRESS_INSTALL_BINARY', trimAndRemoveDoubleQuotes);
    debug$6('using environment variable CYPRESS_INSTALL_BINARY "%s"', envVarVersion);
    return envVarVersion;
}
const start$1 = (...args_1) => xvfb.__awaiter(void 0, [...args_1], void 0, function* (options = {}) {
    debug$6('installing with options %j', options);
    const envVarVersion = getEnvVarVersion();
    if (envVarVersion === '0') {
        debug$6('environment variable CYPRESS_INSTALL_BINARY = 0, skipping install');
        xvfb.loggerModule.log(commonTags.stripIndent `
        ${chalk.yellow('Note:')} Skipping binary installation: Environment variable CYPRESS_INSTALL_BINARY = 0.`);
        xvfb.loggerModule.log();
        return;
    }
    const pkgPath = xvfb.relativeToRepoRoot('package.json');
    if (!pkgPath) {
        return xvfb.throwFormErrorText('Could not find package.json for Cypress package to determine build information')();
    }
    const { buildInfo, version } = JSON.parse(yield fsp.readFile(pkgPath, 'utf8'));
    _.defaults(options, {
        force: false,
        buildInfo,
    });
    if (xvfb.util.getEnv('CYPRESS_CACHE_FOLDER')) {
        const envCache = xvfb.util.getEnv('CYPRESS_CACHE_FOLDER');
        xvfb.loggerModule.log(commonTags.stripIndent `
        ${chalk.yellow('Note:')} Overriding Cypress cache directory to: ${chalk.cyan(envCache)}

              Previous installs of Cypress may not be found.
      `);
        xvfb.loggerModule.log();
    }
    const pkgVersion = xvfb.util.pkgVersion();
    const arch = yield xvfb.util.getRealArch();
    const versionOverride = getVersionOverride(version, { arch, envVarVersion, buildInfo: options.buildInfo });
    const versionToInstall = versionOverride || pkgVersion;
    debug$6('version in package.json is %s, version to install is %s', pkgVersion, versionToInstall);
    const installDir = xvfb.stateModule.getVersionDir(pkgVersion, options.buildInfo);
    const cacheDir = xvfb.stateModule.getCacheDir();
    const binaryDir = xvfb.stateModule.getBinaryDir(pkgVersion);
    if (!(yield validateOS())) {
        return xvfb.throwFormErrorText(xvfb.errors.invalidOS)();
    }
    try {
        yield fs.ensureDir(cacheDir);
    }
    catch (err) {
        if (err instanceof Error && 'code' in err && err.code === 'EACCES') {
            return xvfb.throwFormErrorText(xvfb.errors.invalidCacheDirectory)(commonTags.stripIndent `
          Failed to access ${chalk.cyan(cacheDir)}:

          ${err.message}
        `);
        }
        else {
            throw err;
        }
    }
    const binaryPkg = yield xvfb.stateModule.getBinaryPkgAsync(binaryDir);
    const binaryVersion = yield xvfb.stateModule.getBinaryPkgVersion(binaryPkg);
    const shouldInstall = () => {
        if (!binaryVersion) {
            debug$6('no binary installed under cli version');
            return true;
        }
        xvfb.loggerModule.log();
        xvfb.loggerModule.log(commonTags.stripIndent `
      Cypress ${chalk.green(binaryVersion)} is installed in ${chalk.cyan(installDir)}
      `);
        xvfb.loggerModule.log();
        if (options.force) {
            debug$6('performing force install over existing binary');
            return true;
        }
        if ((binaryVersion === versionToInstall) || !xvfb.util.isSemver(versionToInstall)) {
            // our version matches, tell the user this is a noop
            alreadyInstalledMsg();
            return false;
        }
        return true;
    };
    // noop if we've been told not to download
    if (!shouldInstall()) {
        return debug$6('Not downloading or installing binary');
    }
    if (envVarVersion) {
        xvfb.loggerModule.log(chalk.yellow(commonTags.stripIndent `
        ${logSymbols.warning} Warning: Forcing a binary version different than the default.

          The CLI expected to install version: ${chalk.green(pkgVersion)}

          Instead we will install version: ${chalk.green(versionToInstall)}

          These versions may not work properly together.
      `));
        xvfb.loggerModule.log();
    }
    const getLocalFilePath = () => xvfb.__awaiter(void 0, void 0, void 0, function* () {
        // see if version supplied is a path to a binary
        if (yield fs.pathExists(versionToInstall)) {
            return path.extname(versionToInstall) === '.zip' ? versionToInstall : false;
        }
        const possibleFile = xvfb.util.formAbsolutePath(versionToInstall);
        debug$6('checking local file', possibleFile, 'cwd', process.cwd());
        // if this exists return the path to it
        // else false
        if ((yield fs.pathExists(possibleFile)) && path.extname(possibleFile) === '.zip') {
            return possibleFile;
        }
        return false;
    });
    const pathToLocalFile = yield getLocalFilePath();
    const tasks = pathToLocalFile ?
        installFromLocal(pathToLocalFile, installDir) :
        installFromRemote(versionToInstall, installDir);
    if (options.force) {
        debug$6('Cypress already installed at', installDir);
        debug$6('but the installation was forced');
    }
    // let the user know what version of cypress we're downloading!
    xvfb.loggerModule.log(`Installing Cypress ${chalk.gray(`(version: ${versionToInstall})`)}`);
    xvfb.loggerModule.log();
    const taskRunner = new listr2.Listr(tasks, Object.assign(Object.assign({ 
        // In CI we want timestamped, line-per-event output. Locally,
        // the default in-place spinner is the better experience.
        renderer: xvfb.util.isCi() ? 'verbose' : 'default' }, (xvfb.util.isCi() && { rendererOptions: { timestamp: listr2.PRESET_TIMESTAMP } })), { silentRendererCondition: () => xvfb.loggerModule.logLevel() === 'silent' }));
    yield taskRunner.run();
    // delay 1 sec for UX, unless we are testing
    yield timers.setTimeout(1000);
    displayCompletionMsg();
});
function downloadArchive(version, downloadDestination) {
    const inProgressTitle = 'Downloading Cypress';
    const completedTitle = chalk.green('Downloaded Cypress');
    return {
        title: xvfb.util.titleize(inProgressTitle),
        task: (ctx, task) => xvfb.__awaiter(this, void 0, void 0, function* () {
            yield downloadModule.start({
                version,
                downloadDestination,
                progress: {
                    throttle: 100,
                    onProgress: (percentComplete, remaining) => {
                        task.title = progressTitle(inProgressTitle, percentComplete, remaining);
                    },
                },
            });
            debug$6(`finished downloading file: ${downloadDestination}`);
            task.title = xvfb.util.titleize(completedTitle);
        }),
    };
}
function installFromLocal(pathToLocalFile, installDir) {
    const zipFilePath = path.resolve(pathToLocalFile);
    debug$6('found local file at', zipFilePath);
    debug$6('skipping download');
    return [
        unzipArchive(zipFilePath, installDir),
    ];
}
function installFromRemote(version, installDir) {
    const downloadDestination = path.join(os.tmpdir(), `cypress-${process.pid}.zip`);
    debug$6('preparing to download and unzip version ', version, 'to path', installDir);
    return [
        downloadArchive(version, downloadDestination),
        unzipArchive(downloadDestination, installDir),
        cleanup(downloadDestination, installDir),
    ];
}
function unzipArchive(zipFilePath, installDir) {
    const inProgressTitle = 'Unzipping Cypress';
    const completedTitle = chalk.green('Unzipped Cypress');
    return {
        title: xvfb.util.titleize(inProgressTitle),
        task: (ctx, task) => xvfb.__awaiter(this, void 0, void 0, function* () {
            yield unzipModule.start({
                zipFilePath,
                installDir,
                progress: {
                    onProgress: (percentComplete, remaining) => {
                        task.title = progressTitle(inProgressTitle, percentComplete, remaining);
                    },
                },
            });
            task.title = xvfb.util.titleize(completedTitle);
        }),
    };
}
function cleanup(archiveLocation, installDir) {
    return {
        title: xvfb.util.titleize('Finishing Installation'),
        task: (ctx, task) => xvfb.__awaiter(this, void 0, void 0, function* () {
            debug$6('removing zip file %s', archiveLocation);
            yield fs.remove(archiveLocation);
            debug$6('finished installation in', installDir);
            task.title = xvfb.util.titleize(chalk.green('Finished Installation'), chalk.gray(installDir));
        }),
    };
}
function progressTitle(title, percentComplete, remaining) {
    return xvfb.util.titleize(title, chalk.white(` ${percentComplete}%`), chalk.gray(`${remaining}s`));
}
var installModule = {
    start: start$1,
    _getBinaryUrlFromBuildInfo,
};

/**
 * Throws an error with "details" property from
 * "errors" object.
 * @param {Object} details - Error details
 */
const throwInvalidOptionError = (details) => {
    if (!details) {
        details = xvfb.errors.unknownError;
    }
    // throw this error synchronously, it will be caught later on and
    // the details will be propagated to the promise chain
    const err = new Error();
    err.details = details;
    throw err;
};
/**
 * Selects exec args based on the configured `testingType`
 * @param {string} testingType The type of tests being executed
 * @returns {string[]} The array of new exec arguments
 */
const processTestingType = (options) => {
    if (options.e2e && options.component) {
        return throwInvalidOptionError(xvfb.errors.incompatibleTestTypeFlags);
    }
    if (options.testingType && (options.component || options.e2e)) {
        return throwInvalidOptionError(xvfb.errors.incompatibleTestTypeFlags);
    }
    if (options.testingType === 'component' || options.component || options.ct) {
        return ['--testing-type', 'component'];
    }
    if (options.testingType === 'e2e' || options.e2e) {
        return ['--testing-type', 'e2e'];
    }
    if (options.testingType) {
        return throwInvalidOptionError(xvfb.errors.invalidTestingType);
    }
    return [];
};
/**
 * Throws an error if configFile is string 'false' or boolean false
 * @param {*} options
 */
const checkConfigFile = (options) => {
    // CLI will parse as string, module API can pass in boolean
    if (options.configFile === 'false' || options.configFile === false) {
        throwInvalidOptionError(xvfb.errors.invalidConfigFile);
    }
};

const debug$5 = Debug('cypress:cli');
/**
 * Maps options collected by the CLI
 * and forms list of CLI arguments to the server.
 *
 * Note: there is lightweight validation, with errors
 * thrown synchronously.
 *
 * @returns {string[]} list of CLI arguments
 */
const processOpenOptions = (options = {}) => {
    // In addition to setting the project directory, setting the project option
    // here ultimately decides whether cypress is run in global mode or not.
    // It's first based off whether it's installed globally by npm/yarn (-g).
    // A global install can be overridden by the --project flag, putting Cypress
    // in project mode. A non-global install can be overridden by the --global
    // flag, putting it in global mode.
    if (!xvfb.util.isInstalledGlobally() && !options.global && !options.project) {
        options.project = process.cwd();
    }
    const args = [];
    if (options.config) {
        args.push('--config', options.config);
    }
    if (options.configFile !== undefined) {
        checkConfigFile(options);
        args.push('--config-file', options.configFile);
    }
    if (options.browser) {
        args.push('--browser', options.browser);
    }
    if (options.env) {
        args.push('--env', options.env);
    }
    if (options.expose) {
        args.push('--expose', options.expose);
    }
    if (options.port) {
        args.push('--port', options.port);
    }
    if (options.project) {
        args.push('--project', options.project);
    }
    if (options.global) {
        args.push('--global', options.global);
    }
    if (options.inspect) {
        args.push('--inspect');
    }
    if (options.inspectBrk) {
        args.push('--inspectBrk');
    }
    args.push(...processTestingType(options));
    debug$5('opening from options %j', options);
    debug$5('command line arguments %j', args);
    return args;
};
const start = (...args_1) => xvfb.__awaiter(void 0, [...args_1], void 0, function* (options = {}) {
    function open() {
        try {
            const args = processOpenOptions(options);
            return spawn.start$1(args, {
                dev: options.dev,
                detached: Boolean(options.detached),
            });
        }
        catch (err) {
            if (err.details) {
                return xvfb.exitWithError(err.details)();
            }
            throw err;
        }
    }
    if (options.dev) {
        return open();
    }
    yield spawn.start();
    return open();
});
var openModule = {
    start,
    processOpenOptions,
};

const debug$4 = Debug('cypress:cli:run');
/**
 * Typically a user passes a string path to the project.
 * But "cypress open" allows using `false` to open in global mode,
 * and the user can accidentally execute `cypress run --project false`
 * which should be invalid.
 */
const isValidProject = (v) => {
    if (typeof v === 'boolean') {
        return false;
    }
    if (v === '' || v === 'false' || v === 'true') {
        return false;
    }
    return true;
};
/**
 * Maps options collected by the CLI
 * and forms list of CLI arguments to the server.
 *
 * Note: there is lightweight validation, with errors
 * thrown synchronously.
 *
 * @returns {string[]} list of CLI arguments
 */
const processRunOptions = (options = {}) => {
    debug$4('processing run options %o', options);
    if (!isValidProject(options.project)) {
        debug$4('invalid project option %o', { project: options.project });
        return throwInvalidOptionError(xvfb.errors.invalidRunProjectPath);
    }
    const args = ['--run-project', options.project];
    if (options.autoCancelAfterFailures || options.autoCancelAfterFailures === 0 || options.autoCancelAfterFailures === false) {
        args.push('--auto-cancel-after-failures', options.autoCancelAfterFailures);
    }
    if (options.browser) {
        args.push('--browser', options.browser);
    }
    if (options.ciBuildId) {
        args.push('--ci-build-id', options.ciBuildId);
    }
    if (options.config) {
        args.push('--config', options.config);
    }
    if (options.configFile !== undefined) {
        checkConfigFile(options);
        args.push('--config-file', options.configFile);
    }
    if (options.env) {
        args.push('--env', options.env);
    }
    if (options.expose) {
        args.push('--expose', options.expose);
    }
    if (options.exit === false) {
        args.push('--no-exit');
    }
    if (options.group) {
        args.push('--group', options.group);
    }
    if (options.headed) {
        args.push('--headed', options.headed);
    }
    if (options.headless) {
        if (options.headed) {
            return throwInvalidOptionError(xvfb.errors.incompatibleHeadlessFlags);
        }
        args.push('--headed', String(!options.headless));
    }
    // if key is set use that - else attempt to find it by environment variable
    if (options.key == null) {
        debug$4('--key is not set, looking up environment variable CYPRESS_RECORD_KEY');
        options.key = xvfb.util.getEnv('CYPRESS_RECORD_KEY');
    }
    // if we have a key assume we're in record mode
    if (options.key) {
        args.push('--key', options.key);
    }
    if (options.outputPath) {
        args.push('--output-path', options.outputPath);
    }
    if (options.parallel) {
        args.push('--parallel');
    }
    if (options.passWithNoTests) {
        args.push('--pass-with-no-tests');
    }
    if (options.posixExitCodes) {
        args.push('--posix-exit-codes');
    }
    if (options.port) {
        args.push('--port', options.port);
    }
    if (options.quiet) {
        args.push('--quiet');
    }
    // if record is defined and we're not
    // already in ci mode, then send it up
    if (options.record != null) {
        args.push('--record', options.record);
    }
    // if we have a specific reporter push that into the args
    if (options.reporter) {
        args.push('--reporter', options.reporter);
    }
    // if we have a specific reporter push that into the args
    if (options.reporterOptions) {
        args.push('--reporter-options', options.reporterOptions);
    }
    if (options.runnerUi != null) {
        args.push('--runner-ui', options.runnerUi);
    }
    // if we have specific spec(s) push that into the args
    if (options.spec) {
        args.push('--spec', options.spec);
    }
    if (options.tag) {
        args.push('--tag', options.tag);
    }
    if (options.inspect) {
        args.push('--inspect');
    }
    if (options.inspectBrk) {
        args.push('--inspectBrk');
    }
    args.push(...processTestingType(options));
    return args;
};
const runModule = {
    processRunOptions,
    isValidProject,
    // resolves with the number of failed tests
    start() {
        return xvfb.__awaiter(this, arguments, void 0, function* (options = {}) {
            _.defaults(options, {
                key: null,
                spec: null,
                reporter: null,
                reporterOptions: null,
                project: process.cwd(),
            });
            function run() {
                try {
                    const args = processRunOptions(options);
                    debug$4('run to spawn.start args %j', args);
                    return spawn.start$1(args, {
                        dev: options.dev,
                    });
                }
                catch (err) {
                    if (err.details) {
                        return xvfb.exitWithError(err.details)();
                    }
                    throw err;
                }
            }
            if (options.dev) {
                return run();
            }
            yield spawn.start();
            return run();
        });
    },
};

/**
 * Get the size of a folder or a file.
 *
 * This function returns the actual file size of the folder (size), not the allocated space on disk (size on disk).
 * For more details between the difference, check this link:
 * https://www.howtogeek.com/180369/why-is-there-a-big-difference-between-size-and-size-on-disk/
 *
 * @param {string} path path to the file or the folder.
 */
function getSize(path$1) {
    return xvfb.__awaiter(this, void 0, void 0, function* () {
        const stat = yield fs.lstat(path$1);
        if (stat.isDirectory()) {
            const list = yield fs.readdir(path$1);
            return Bluebird.resolve(list).reduce((prev, curr) => xvfb.__awaiter(this, void 0, void 0, function* () {
                const currPath = path.join(path$1, curr);
                const s = yield fs.lstat(currPath);
                if (s.isDirectory()) {
                    return prev + (yield getSize(currPath));
                }
                return prev + s.size;
            }), 0);
        }
        return stat.size;
    });
}

var dist = {};

var tapContract = {};

var tapErrors = {};

var hasRequiredTapErrors;

function requireTapErrors () {
	if (hasRequiredTapErrors) return tapErrors;
	hasRequiredTapErrors = 1;
	(function (exports$1) {
		// The copy for every `cypress tap` failure, keyed by its code. Code is not usefacing and is
		// just used in debug logs and telemetry.
		Object.defineProperty(exports$1, "__esModule", { value: true });
		exports$1.UnknownTapError = exports$1.SpecInProgressTapError = exports$1.VersionSkewTapError = exports$1.MissingOptionTapError = exports$1.MissingArgumentsTapError = exports$1.UnknownOptionTapError = exports$1.UnknownCommandTapError = exports$1.MissingCompanionOptionTapError = exports$1.SnapshotNotFoundTapError = exports$1.AttemptNotFoundTapError = exports$1.CommandNotFoundTapError = exports$1.TestNotFoundTapError = exports$1.SessionNotFoundTapError = exports$1.InvalidValueTapError = exports$1.isTapError = exports$1.TapError = exports$1.tapErrorCopy = exports$1.TAP_ERROR_COPY = exports$1.TAP_TARGET = void 0;
		const UPDATE_COMMAND = '`npm install --save-dev cypress@latest`';
		/**
		 * What every failure calls the running Cypress a tap command targets.
		 */
		exports$1.TAP_TARGET = 'Cypress session';
		/**
		 * Several codes stand for one thing a reader has to do about them, and saying it
		 * four slightly different ways only reads as four different problems. Each keeps
		 * its own code — `status` and the help fallback branch on some of them, and
		 * telemetry counts them apart — so what is shared is the copy, never the identity.
		 * The jsdoc on each entry is where the condition it really stands for is written.
		 */
		const UNREACHABLE = {
		    description: `Could not reach the ${exports$1.TAP_TARGET}.`,
		    solution: 'Make sure Cypress is still open with a browser, then run the command again. If it was just started, it may still be loading.',
		};
		// No "if it keeps failing" clause here: the entries that ask for a report already
		// open theirs with one, and saying it twice reads as two separate escalations.
		const COMMAND_FAILED = {
		    description: `The ${exports$1.TAP_TARGET} failed while running the command.`,
		    solution: `Check the ${exports$1.TAP_TARGET} with \`cypress tap status\`, then try again.`,
		};
		/**
		 * Nothing worth saying, for the conditions that should not arise: a failure with no
		 * code of its own, and an answer this CLI cannot read. Retrying is the only remedy
		 * that fits either, and the report is how they stop standing in for something a
		 * reader could have acted on.
		 */
		const NOTHING_KNOWN = {
		    description: 'An error occurred.',
		    solution: 'Try running the command again.',
		};
		exports$1.TAP_ERROR_COPY = {
		    // Finding a session to drive
		    /** Raised when discovery found no session record at all, and none was named. */
		    NO_SESSION: {
		        description: `Could not find a ${exports$1.TAP_TARGET} to tap into.`,
		        solution: 'Start Cypress with `cypress open`, select a testing type and launch a browser, then try again.',
		    },
		    /**
		     * Raised when `--session` named a pid no record on disk matches.
		     *
		     * @deprecated - raise it with new SessionNotFoundTapError(), which writes its detail
		     */
		    SESSION_NOT_FOUND: {
		        description: `No ${exports$1.TAP_TARGET} matched the provided session id.`,
		        solution: `Run \`cypress tap sessions\` to list the ${exports$1.TAP_TARGET}s you can tap into.`,
		    },
		    /** Raised when records matched, but none answered its liveness probe. */
		    STALE_SESSION: { ...UNREACHABLE },
		    /** Raised when the session is live, but has no browser open to drive. */
		    NO_BROWSER_ATTACHED: {
		        description: `The ${exports$1.TAP_TARGET} is running, but no test browser is open.`,
		        solution: 'Open a Chromium-based browser in Cypress, then try again.',
		    },
		    /** Raised when every live session has a browser open that tap cannot drive. */
		    UNSUPPORTED_BROWSER: {
		        description: `The ${exports$1.TAP_TARGET} is running an unsupported browser.`,
		        solution: '`cypress tap` drives Chromium-based browsers only. Reopen Cypress in a supported browser and try again.',
		    },
		    /** Raised when a CDP call went unanswered until the timeout elapsed. */
		    RENDERER_UNRESPONSIVE: {
		        description: `The ${exports$1.TAP_TARGET} is reachable, but the page running it is not responding.`,
		        solution: 'It may be paused in DevTools, stuck in a loop, or starved of memory. Pass `--timeout <ms>` to wait longer.',
		    },
		    // Connecting to it
		    /** Raised when the CDP connection could not be opened, or dropped mid-command. */
		    CDP_UNREACHABLE: { ...UNREACHABLE },
		    /** Raised when no open page carries the tap binding. */
		    BINDING_NOT_FOUND: { ...UNREACHABLE },
		    /** Raised when a binding method threw while running the command. */
		    BINDING_THREW: {
		        ...COMMAND_FAILED,
		        recommendGhIssue: true,
		    },
		    /**
		     * Raised when the page navigated mid-call, and the retry hit it again. An
		     * expected race rather than a defect, so it asks for no report.
		     */
		    STALE_HANDLE: { ...COMMAND_FAILED },
		    // Agreeing on a protocol with it
		    /**
		     * Raised when the session replied in a shape this CLI has no handling for: an
		     * unreadable schema, an exec result that is neither outcome, a call whose args
		     * arrived as something other than a map. A version disagreement is not among
		     * them — the handshake compares versions and answers for that itself, naming
		     * both — so this is left with nothing it could tell a reader to do, and says so.
		     */
		    PROTOCOL_MISMATCH: {
		        ...NOTHING_KNOWN,
		        recommendGhIssue: true,
		    },
		    /** Raised when the handshake reported a schema version newer than this CLI's. */
		    CLI_OUTDATED: {
		        description: `The targeted ${exports$1.TAP_TARGET} is newer than this CLI.`,
		        solution: `Update the CLI with ${UPDATE_COMMAND}, then try again.`,
		    },
		    /** Raised when the handshake reported an older schema version, or GraphQL redirected. */
		    SESSION_OUTDATED: {
		        description: `The targeted ${exports$1.TAP_TARGET} is older than this CLI.`,
		        solution: `Update Cypress in the running project with ${UPDATE_COMMAND}, restart it, then try again.`,
		    },
		    // Reading its data
		    /** Raised when a GraphQL request never got an answer over HTTP. */
		    GRAPHQL_UNREACHABLE: { ...UNREACHABLE },
		    /** Raised when GraphQL answered, but with errors, no data, or not JSON. */
		    GRAPHQL_FAILED: {
		        ...COMMAND_FAILED,
		        recommendGhIssue: true,
		    },
		    // The spec lifecycle
		    /** Raised when a spec was read before any has run. */
		    SPEC_NOT_STARTED: {
		        description: 'No spec has run yet.',
		        solution: 'Start a spec with the `run` command, then read it once it has finished.',
		    },
		    /**
		     * Raised when a spec was read while it is still running.
		     *
		     * @deprecated - raise it with new SpecInProgressTapError(), which writes its copy
		     */
		    SPEC_IN_PROGRESS: {
		        solution: 'Use `cypress tap status` to verify when the spec has finished.',
		    },
		    /** Raised when the runSpec mutation failed, or answered with no result. */
		    SPEC_START_FAILED: {
		        description: `The ${exports$1.TAP_TARGET} could not start the spec.`,
		        solution: `Check the ${exports$1.TAP_TARGET} with \`cypress tap status\`, then try again.`,
		    },
		    /** Raised when the given path matches no spec the session can run. */
		    SPEC_NOT_FOUND: {
		        description: `The ${exports$1.TAP_TARGET} has no spec matching that path.`,
		        solution: `\`cypress tap specs\` lists the specs the ${exports$1.TAP_TARGET} can run. If the spec exists but is not listed, widen \`specPattern\` in the Cypress configuration.`,
		    },
		    /** Raised when the session is running with no project open. */
		    NO_PROJECT: {
		        description: `The ${exports$1.TAP_TARGET} has no project open.`,
		        solution: 'Open a project in Cypress, then try again.',
		    },
		    /** Raised when the spec's testing type is not one this project configures. */
		    TESTING_TYPE_NOT_CONFIGURED: {
		        description: 'That testing type is not configured for this project.',
		        solution: 'Configure it in the Cypress config, or start Cypress in a testing type the project supports.',
		        docs: '/configuration',
		    },
		    // Reading the app under test
		    /** Raised when the runner page holds no app-under-test frame to read. */
		    NO_AUT: {
		        description: `Failed to determine the app under test in the ${exports$1.TAP_TARGET}.`,
		        solution: 'Run the spec again with `cypress tap run <spec>`. To read the app as it was at an earlier command, pin that command with `cypress tap pin`.',
		    },
		    /** Raised when an injected script threw inside the AUT frame. */
		    FRAME_READ_FAILED: {
		        ...COMMAND_FAILED,
		        recommendGhIssue: true,
		    },
		    // Selecting a test, command, or snapshot of a spec
		    /**
		     * Raised when `--test-id` named a test this spec does not have.
		     *
		     * @deprecated - raise it with new TestNotFoundTapError(), which writes its detail
		     */
		    TEST_NOT_FOUND: {
		        description: 'No test in this spec matched that id.',
		        solution: 'Run `cypress tap reporter` to list the tests in the spec.',
		    },
		    /**
		     * Raised when `--attempt` named a number past the test's attempts.
		     *
		     * @deprecated - raise it with new AttemptNotFoundTapError(), which writes its detail
		     */
		    ATTEMPT_NOT_FOUND: {
		        description: 'No attempt of this test matched that number.',
		        solution: '`--attempt` selects an earlier attempt of a retried test; attempt 1 is the first run. Omit it for the latest.',
		    },
		    /**
		     * Raised when `--command-id` named a reporter row this test does not have.
		     *
		     * @deprecated - raise it with new CommandNotFoundTapError(), which writes its detail
		     */
		    COMMAND_NOT_FOUND: {
		        description: 'No command in this test matched that id.',
		    },
		    /** Raised when an unqualified row number matches rows in two different hooks. */
		    AMBIGUOUS_COMMAND: {
		        description: 'That command id matches more than one row of the test.',
		        solution: 'Qualify the id with the section it belongs to, as `cypress tap reporter` lists it.',
		    },
		    /**
		     * Raised when `--at` named neither a snapshot of the command nor a valid index.
		     *
		     * @deprecated - raise it with new SnapshotNotFoundTapError(), which writes its detail
		     */
		    SNAPSHOT_NOT_FOUND: {
		        description: 'No snapshot of this command matched that name or index.',
		        solution: '`--at` takes a snapshot name or a 1-based index; omit it to pin the command’s final state.',
		    },
		    /** Raised when the command captured no snapshot, or it has since been evicted. */
		    SNAPSHOT_UNAVAILABLE: {
		        description: 'That command has no DOM snapshot to pin.',
		        solution: 'Snapshots are captured in open mode and kept only for the most recent tests, as `numTestsKeptInMemory` sets. Run the spec again to capture fresh snapshots, or raise `numTestsKeptInMemory` to keep more.',
		    },
		    // Checking the invocation
		    /**
		     * Raised when the invocation named a command that does not exist.
		     *
		     * @deprecated - raise it with new UnknownCommandTapError(), which writes its copy
		     */
		    UNKNOWN_COMMAND: {
		        attachHelp: true,
		    },
		    /**
		     * Raised when the invocation passed a flag the command does not declare.
		     *
		     * @deprecated - raise it with new UnknownOptionTapError(), which writes its copy
		     */
		    UNKNOWN_OPTION: {
		        attachHelp: true,
		    },
		    /** Raised when an argument is unknown, or a required one is missing. */
		    INVALID_ARGUMENTS: {
		        description: 'The command was called with invalid arguments.',
		        solution: 'Run `cypress tap <command> --help` for the arguments it takes.',
		        attachHelp: true,
		    },
		    /** Raised when a required option is missing. */
		    INVALID_OPTIONS: {
		        description: 'The command was called with invalid options.',
		        solution: 'Run `cypress tap <command> --help` for the options it takes.',
		        attachHelp: true,
		    },
		    /**
		     * Raised when a flag was passed without the flag it depends on.
		     *
		     * @deprecated - raise it with new MissingCompanionOptionTapError(), which writes its copy
		     */
		    MISSING_COMPANION_OPTION: {},
		    /**
		     * Raised when a known input was given a value of the wrong type or range.
		     *
		     * @deprecated - raise it with new InvalidValueTapError(), which writes its copy
		     */
		    INVALID_VALUE: {
		        description: 'An invalid value was given.',
		    },
		    // Anything else
		    /**
		     * Raised when a failure reached the renderer with no code of its own, so nothing
		     * about it is known well enough to say. Retrying is the only remedy that fits
		     * every condition it stands in for, and the report is how it stops standing in
		     * for one of them.
		     */
		    UNKNOWN_ERROR: {
		        ...NOTHING_KNOWN,
		        recommendGhIssue: true,
		    },
		};
		// An unknown code is a protocol mismatch by definition: the session speaks of a
		// failure this CLI has no copy for, which is one more thing about its answer that
		// cannot be read.
		const FALLBACK = exports$1.TAP_ERROR_COPY.PROTOCOL_MISMATCH;
		/**
		 * Copy for a code, which arrives from the session over the wire — so anything that
		 * is not a code we ship falls back rather than being trusted: a non-string, an
		 * inherited name like `constructor`, or a code only a newer Cypress knows about.
		 */
		const tapErrorCopy = (code) => {
		    if (typeof code !== 'string' || !Object.prototype.hasOwnProperty.call(exports$1.TAP_ERROR_COPY, code)) {
		        return FALLBACK;
		    }
		    return exports$1.TAP_ERROR_COPY[code];
		};
		exports$1.tapErrorCopy = tapErrorCopy;
		/**
		 * The one error every tap failure is raised as, on both sides of the wire: the app
		 * throws it from a command handler, the CLI throws it from discovery, transport, and
		 * its own commands. `code` selects the copy; `detail` carries what the copy cannot
		 * know; `message` is the diagnostic, which stays out of the rendered output.
		 *
		 * The classes below name a condition rather than restate one, but only as it is
		 * built: a failure the other side raised arrives through `fromPayload` as this
		 * class, never as the subclass that wrote it over there. So a reader branches on
		 * `code`, never on which subclass an error is.
		 */
		class TapError extends Error {
		    constructor(code, options = {}) {
		        var _a;
		        super((_a = options.message) !== null && _a !== void 0 ? _a : code);
		        this.name = 'TapError';
		        this.code = code;
		        if (options.detail !== undefined) {
		            this.detail = options.detail;
		        }
		        if (options.cause !== undefined) {
		            this.cause = options.cause;
		        }
		    }
		    /**
		     * Re-raise a failure the session already named. The code is whatever crossed the
		     * wire — including one a subclass built over there, whose copy arrived with it —
		     * so this takes what the constructor will not.
		     */
		    static fromPayload(payload) {
		        return new TapError(payload.code, { detail: payload.detail });
		    }
		    /** The wire form: the code and the specifics, never the diagnostic. */
		    toPayload() {
		        return { code: this.code, ...(this.detail !== undefined ? { detail: this.detail } : {}) };
		    }
		}
		exports$1.TapError = TapError;
		const isTapError = (err) => {
		    return err instanceof TapError;
		};
		exports$1.isTapError = isTapError;
		// The one door through the constructor's guard, so that every code it keeps out is
		// still built the same way — with the copy its class below writes.
		class DetailedTapError extends TapError {
		    constructor(code, detail) {
		        super(code, { detail });
		    }
		}
		/**
		 * The one way to report a value a command cannot use: what was expected of the named
		 * input, then the value as it arrived. Both sides of the wire raise it through here,
		 * so a bad `--at` reads the same whether the CLI caught it or the session did.
		 */
		class InvalidValueTapError extends DetailedTapError {
		    constructor(name, expected, value) {
		        super('INVALID_VALUE', `Expected \`${name}\` to be ${expected}.\n\nInstead the value was: ${JSON.stringify(value)}`);
		    }
		}
		exports$1.InvalidValueTapError = InvalidValueTapError;
		/**
		 * A value that was read fine but matched nothing there is. Each entry states what
		 * was being looked for and where the real ones are listed; this writes the one line
		 * only the throw site can — which option was given what — plus whatever narrows the
		 * search. The option is the subclass's rather than the caller's, since each of these
		 * lookups is reached by exactly one flag.
		 */
		class NotFoundTapError extends DetailedTapError {
		    constructor(code, option, value, { context, remedy } = {}) {
		        const looked = `Looked for \`${option}\` ${JSON.stringify(value)}.${context ? ` ${context}` : ''}`;
		        super(code, remedy ? `${looked}\n\n${remedy}` : looked);
		    }
		}
		class SessionNotFoundTapError extends NotFoundTapError {
		    constructor(value) {
		        super('SESSION_NOT_FOUND', '--session', value);
		    }
		}
		exports$1.SessionNotFoundTapError = SessionNotFoundTapError;
		class TestNotFoundTapError extends NotFoundTapError {
		    constructor(value) {
		        super('TEST_NOT_FOUND', '--test-id', value);
		    }
		}
		exports$1.TestNotFoundTapError = TestNotFoundTapError;
		/**
		 * The one lookup whose remedy names a value the caller gave: the test whose commands
		 * to list. Which is why the test id is required rather than optional — the table
		 * holds no `solution` for this code to fall back on, since a `--test-id <id>` a
		 * reader has to substitute themselves is the thing being fixed here.
		 */
		class CommandNotFoundTapError extends NotFoundTapError {
		    constructor(value, testId) {
		        super('COMMAND_NOT_FOUND', '--command-id', value, {
		            remedy: `Run \`cypress tap reporter --test-id ${testId}\` to list the commands in the test.`,
		        });
		    }
		}
		exports$1.CommandNotFoundTapError = CommandNotFoundTapError;
		class AttemptNotFoundTapError extends NotFoundTapError {
		    constructor(value, context) {
		        super('ATTEMPT_NOT_FOUND', '--attempt', value, { context });
		    }
		}
		exports$1.AttemptNotFoundTapError = AttemptNotFoundTapError;
		class SnapshotNotFoundTapError extends NotFoundTapError {
		    constructor(value, context) {
		        super('SNAPSHOT_NOT_FOUND', '--at', value, { context });
		    }
		}
		exports$1.SnapshotNotFoundTapError = SnapshotNotFoundTapError;
		/**
		 * A flag that only means something alongside another one. Both are named here;
		 * `remedy` is the throw site's, because what dropping either one leaves you with
		 * is particular to the pair — a spec-wide view rather than one test's attempt.
		 */
		class MissingCompanionOptionTapError extends DetailedTapError {
		    constructor(given, required, remedy) {
		        super('MISSING_COMPANION_OPTION', `You passed the \`${given}\` flag without also passing the \`${required}\` flag.\n\n${remedy}`);
		    }
		}
		exports$1.MissingCompanionOptionTapError = MissingCompanionOptionTapError;
		/**
		 * A name no command answers to, and a flag no command declares: say which one was
		 * given, then list the real ones. The listing is the remedy, which is why neither
		 * carries a solution of its own — and it is the generated help of whatever was
		 * called, which the CLI holds and appends as it renders. `listing` is for a raiser
		 * with one of its own and no renderer to defer to.
		 */
		class UnknownCommandTapError extends DetailedTapError {
		    constructor(name, listing) {
		        super('UNKNOWN_COMMAND', listing ? `Unknown command "${name}"\n\n${listing}` : `Unknown command "${name}"`);
		    }
		}
		exports$1.UnknownCommandTapError = UnknownCommandTapError;
		class UnknownOptionTapError extends DetailedTapError {
		    constructor(flag, listing) {
		        super('UNKNOWN_OPTION', listing ? `Unknown option "${flag}"\n\n${listing}` : `Unknown option "${flag}"`);
		    }
		}
		exports$1.UnknownOptionTapError = UnknownOptionTapError;
		/**
		 * A required input the invocation left out. Both sides raise these through here —
		 * the CLI when its own grammar catches the omission, the session when a call
		 * reaches it without one — so an omission reads the same whichever side caught it.
		 * Their entries name no remedy of their own: the called command's help lists every
		 * input it takes, and the CLI appends it as it renders. The table describes both
		 * codes, so these write only the specifics rather than the opening line too.
		 */
		class MissingArgumentsTapError extends TapError {
		    constructor(command, params) {
		        const named = params.map((param) => `<${param}>`).join(' ');
		        const noun = params.length === 1 ? 'argument' : 'arguments';
		        super('INVALID_ARGUMENTS', { detail: `"${command}" is missing the required ${named} ${noun}.` });
		    }
		}
		exports$1.MissingArgumentsTapError = MissingArgumentsTapError;
		class MissingOptionTapError extends TapError {
		    constructor(command, option) {
		        super('INVALID_OPTIONS', { detail: `"${command}" is missing the required --${option} option.` });
		    }
		}
		exports$1.MissingOptionTapError = MissingOptionTapError;
		/**
		 * A CLI and a session that do not speak the same tap schema. Which of the two is
		 * behind is decided here rather than at the throw site, so the code and the copy
		 * cannot disagree about who has to update — the schema versions settle it, and the
		 * table describes both outcomes, so this writes only the specifics.
		 *
		 * Those specifics name the Cypress versions, not the schema versions: the schema is
		 * what disagreed, but it is not what anyone can act on. The schema numbers stay on
		 * the diagnostic. Construct this only for a genuine mismatch; equal versions are
		 * not a failure, and would read here as the session being behind.
		 */
		class VersionSkewTapError extends TapError {
		    constructor({ sessionSchema, cliSchema, sessionCypress, cliCypress }) {
		        super(sessionSchema > cliSchema ? 'CLI_OUTDATED' : 'SESSION_OUTDATED', {
		            detail: `The ${exports$1.TAP_TARGET} is running Cypress v${sessionCypress}; this CLI is v${cliCypress}.`,
		            message: `the ${exports$1.TAP_TARGET} speaks tap schema v${sessionSchema}; this CLI speaks v${cliSchema}.`,
		        });
		    }
		}
		exports$1.VersionSkewTapError = VersionSkewTapError;
		/**
		 * The spec that is mid-run, which is what makes the condition actionable: it names
		 * what to wait on. Both sides raise it through here — the CLI from its run-state
		 * gate, the app from the runner — and the spec is only unnamed in the moment
		 * between one being selected and its path being known.
		 */
		class SpecInProgressTapError extends DetailedTapError {
		    constructor(spec) {
		        super('SPEC_IN_PROGRESS', spec ? `The spec ${spec} is currently running.` : 'The spec is currently running.');
		    }
		}
		exports$1.SpecInProgressTapError = SpecInProgressTapError;
		/**
		 * Whatever reached the renderer without having been raised as a tap failure — a
		 * TypeError from a command handler, an ENOTDIR from a read that should not have
		 * failed. It has no specifics a reader was meant to see, so it carries none; the
		 * throw itself rides on `cause`, and its stack on the diagnostic `message`, for the
		 * debug log the report asks the reader to attach.
		 */
		class UnknownTapError extends TapError {
		    constructor(cause) {
		        var _a;
		        super('UNKNOWN_ERROR', { message: String((_a = cause === null || cause === void 0 ? void 0 : cause.stack) !== null && _a !== void 0 ? _a : cause), cause });
		    }
		}
		exports$1.UnknownTapError = UnknownTapError;
		
	} (tapErrors));
	return tapErrors;
}

var reporter = {};

var hasRequiredReporter;

function requireReporter () {
	if (hasRequiredReporter) return reporter;
	hasRequiredReporter = 1;
	// The `reporter` command's result contract. A command's result interface lives
	// here in `contracts/`, next to the command metadata in `../tap-contract`, so
	// the app-side serializer and the CLI-side rendering type against the same
	// shape. Optional fields are absent, never null, on the wire.
	Object.defineProperty(reporter, "__esModule", { value: true });
	
	return reporter;
}

var command = {};

var hasRequiredCommand;

function requireCommand () {
	if (hasRequiredCommand) return command;
	hasRequiredCommand = 1;
	// The `command` command's result contracts. A command's result interface lives
	// here in `contracts/`, next to the command metadata in `../tap-contract`, so
	// the app-side serializer and the CLI-side rendering type against the same
	// shape. Optional fields are absent, never null, on the wire.
	Object.defineProperty(command, "__esModule", { value: true });
	
	return command;
}

var pinned = {};

var hasRequiredPinned;

function requirePinned () {
	if (hasRequiredPinned) return pinned;
	hasRequiredPinned = 1;
	Object.defineProperty(pinned, "__esModule", { value: true });
	
	return pinned;
}

var pin = {};

var hasRequiredPin;

function requirePin () {
	if (hasRequiredPin) return pin;
	hasRequiredPin = 1;
	Object.defineProperty(pin, "__esModule", { value: true });
	
	return pin;
}

var resolveSelector = {};

var hasRequiredResolveSelector;

function requireResolveSelector () {
	if (hasRequiredResolveSelector) return resolveSelector;
	hasRequiredResolveSelector = 1;
	// The `resolve-selector` command's result contract. A command's result interface
	// lives here in `contracts/`, next to the command metadata in `../tap-contract`,
	// so the app-side command and the CLI-side rendering type against the same shape.
	Object.defineProperty(resolveSelector, "__esModule", { value: true });
	resolveSelector.MAX_DERIVED_SELECTORS = void 0;
	// Deriving a unique selector walks up from the element testing each candidate
	// against the whole document, so deriving one per match for a selector as broad
	// as `*` would hold the app's main thread for the size of the page. Past this
	// many matches the list is no longer one a caller picks out of anyway — so the
	// app derives up to here, and the CLI numbers up to here.
	resolveSelector.MAX_DERIVED_SELECTORS = 10;
	
	return resolveSelector;
}

var hasRequiredTapContract;

function requireTapContract () {
	if (hasRequiredTapContract) return tapContract;
	hasRequiredTapContract = 1;
	(function (exports$1) {
		var __createBinding = (tapContract && tapContract.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __exportStar = (tapContract && tapContract.__exportStar) || function(m, exports$1) {
		    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
		};
		Object.defineProperty(exports$1, "__esModule", { value: true });
		exports$1.KNOWN_COMMANDS = exports$1.TAP_NATIVE_COMMANDS = exports$1.buildTapSchema = exports$1.TAP_COMMANDS = exports$1.TAP_EXEC_METHOD = exports$1.TAP_SCHEMA_METHOD = exports$1.TAP_BINDING_GLOBAL = exports$1.TAP_SCHEMA_VERSION = void 0;
		exports$1.TAP_SCHEMA_VERSION = 1;
		exports$1.TAP_BINDING_GLOBAL = '__CYPRESS_TAP_BINDING__';
		exports$1.TAP_SCHEMA_METHOD = 'getSchema';
		exports$1.TAP_EXEC_METHOD = 'exec';
		// Options that recur across commands, defined once so their name, type, and help
		// text can't drift between the commands that expose them. `test-id` and
		// `command-id` are required in some commands and optional in others, so each use
		// spreads it and sets `required`; the rest are identical everywhere and used
		// directly.
		const testIdField = { name: 'test-id', alias: 't', type: 'string', description: 'test id, as listed by the reporter command' };
		const commandIdField = { name: 'command-id', alias: 'c', type: 'string', description: 'command id, as listed by the reporter command — a row number (test body first when duplicated), an e-prefixed event id, or hook-qualified like "h1:3"' };
		const attemptField = { name: 'attempt', alias: 'a', type: 'number', required: false, description: '1-based attempt (attempt 1 = first run); defaults to the latest' };
		const selectorField = { name: 'selector', alias: 'e', type: 'string', required: false, description: 'a CSS selector' };
		const commandMeta = {
		    name: 'command',
		    description: 'retrieve the reporter row, the pinnable DOM snapshots, and the console properties of a single command in a test',
		    details: `Retrieves a single command from a test's command log: its reporter row, the DOM
snapshots pinnable on it, and any associated console properties.`,
		    params: [],
		    options: [
		        { ...testIdField, required: true },
		        { ...commandIdField, required: true },
		        // `--json` is the CLI's own flag, but this command declares it because it
		        // also changes what the command returns: nothing is withheld from a payload
		        // that is not being rendered for reading room.
		        { name: 'json', type: 'boolean', required: false, description: 'print the raw JSON result instead of the human-readable rendering. This will output every console property in full regardless of length.' },
		        attemptField,
		        { name: 'depth', alias: 'd', type: 'string', required: false, description: 'how many levels of nested console properties to expand before summarizing the rest as "{n keys}" / "[n items]": a number or "all" (default 3, and a section over 8 rows folds at any depth unless this is passed)' },
		    ],
		};
		const reporterMeta = {
		    name: 'reporter',
		    description: 'retrieve the test runner reporter for the spec or a specific test',
		    details: `Shows test results the way the Cypress reporter panel does.

By default, this will output the spec-level overview featuring the spec's
pass/fail stats and every suite's tests including their IDs.

Provide a --test-id <id> to see one test's full story: its routes, the hooks
that ran, the complete command log, and the failure output when something went
wrong. Add --attempt to view an earlier retry.`,
		    params: [],
		    options: [
		        { ...testIdField, required: false },
		        attemptField,
		    ],
		};
		const pinMeta = {
		    name: 'pin',
		    description: 'pin a command’s DOM snapshot into the live application-under-test frame',
		    details: `Pins a command's DOM snapshot into the live application-under-test frame so the
dom/aria/inspect commands can read it. Pass --clear to release.`,
		    params: [],
		    options: [
		        { ...testIdField, required: false },
		        { ...commandIdField, required: false },
		        attemptField,
		        { name: 'at', type: 'string', required: false, description: 'which snapshot to pin: a name like "before"/"after" or a 1-based index; defaults to the last (the command’s final state). Re-run on the pinned command to switch snapshots without releasing the pin' },
		        { name: 'clear', type: 'boolean', required: false, description: 'release the current pin and restore the app to its pre-pin state' },
		    ],
		};
		const runStateMeta = {
		    name: 'run-state',
		    description: 'report where the Cypress session is in its run lifecycle',
		    params: [],
		    options: [],
		    hidden: true,
		};
		const resolveSelectorMeta = {
		    name: 'resolve-selector',
		    description: 'list a unique CSS selector for each element a selector matches, null for any match none could be derived for',
		    params: [
		        { name: 'selector', type: 'string', required: true, description: 'a CSS selector' },
		    ],
		    options: [],
		    hidden: true,
		};
		// The canonical command metadata, the single source both sides build a schema
		// from: the running session advertises it over the binding (see the app's
		// TapManager), and the CLI stamps it with its own version to render help with no
		// session attached. Order here is the order commands list in help.
		exports$1.TAP_COMMANDS = [
		    commandMeta,
		    reporterMeta,
		    pinMeta,
		    runStateMeta,
		    resolveSelectorMeta,
		];
		const buildTapSchema = (cypressVersion) => {
		    const commands = exports$1.TAP_COMMANDS.map((command) => {
		        return {
		            name: command.name,
		            description: command.description,
		            ...('details' in command ? { details: command.details } : {}),
		            params: command.params.map((param) => ({ ...param })),
		            options: command.options.map((option) => ({ ...option })),
		            ...('hidden' in command && command.hidden ? { hidden: true } : {}),
		        };
		    });
		    return {
		        schemaVersion: exports$1.TAP_SCHEMA_VERSION,
		        cypressVersion,
		        commands,
		    };
		};
		exports$1.buildTapSchema = buildTapSchema;
		const runMeta = {
		    name: 'run',
		    description: 'run (or rerun) a spec by its project-relative path',
		    details: `Runs (or reruns) a spec by its project-relative path, as listed by the specs
command. If no browser is open it launches one, switching to the spec's testing
type when needed, then requests the spec and returns immediately. This requests
the spec to begin, but completion of this command does not guarantee the spec
has started or finished.

Poll the 'status' command for progress. Read status first and keep its
startedAt: a verdict still carrying that same startedAt describes the spec
before this one, so wait for a verdict whose startedAt differs.`,
		    params: [
		        { name: 'spec', type: 'string', required: true, description: 'project-relative spec path, as listed by the specs command' },
		    ],
		};
		const sessionsMeta = {
		    name: 'sessions',
		    description: 'list the Cypress sessions this CLI can reach',
		    details: `Lists the Cypress sessions this CLI can reach. Cypress must be running locally,
support the \`tap\` command, and have an active Testing Type to be listed. A
session can be targeted by its PID in other commands using \`--session\`.

tap only supports Chromium based browsers (Chrome, Chromium, Edge, Electron).
A session running any other browser is listed as unsupported, and every other
tap command refuses it.`,
		};
		const statusMeta = {
		    name: 'status',
		    description: 'report where a Cypress session is in its lifecycle',
		    details: `Reports where a Cypress session is in its lifecycle, as JSON — for polling and
"where am I?" checks. Always exits 0 for a determinable stage (including "not
connected"); a poller branches on the \`status\` field.

Stages:
- not connected: Cypress cannot be reached.
- browser not selected: Cypress does not have a supported browser open.
- spec not selected: Cypress has a browser open but no spec is selected.
- loading: Cypress is loading the spec.
- running: Cypress is running the spec.
- passed: Cypress has completed the spec and all executed tests passed.
- failed: Cypress failed to run the spec, or has completed the spec and at least
  one test failed.

Statuses other than passed and failed are intermediate states, indicating that
Cypress requires additional instruction or is still processing. Loading stays
loading for as long as the spec takes to build, so a poller needs its own
timeout; a spec whose build fails reports failed and carries the reason as
error — it ran no tests, so it reports no counts either.

From loading onwards the output carries \`startedAt\`, the spec every other field
describes (null while loading). In the event of a rerun the previous spec's
verdict remains visible until the new one begins, identical on every other
field, so use \`startedAt\` to validate whether output describes the previous
spec or the new one.`,
		};
		const specsMeta = {
		    name: 'specs',
		    description: 'list the specs the Cypress session can run, most recently modified first',
		    details: `Lists the specs the connected Cypress session can run, in descending order by
last modified. To find other testing types you must connect to a Cypress
session with that testing type active.`,
		};
		// Every selector these three take must resolve to exactly one element, so a
		// reader is never silently shown one of several matches. Their help says so in
		// the same words, and names the remedy the ambiguity error offers.
		const SINGLE_ELEMENT_SELECTOR = 'a CSS selector matching exactly one element';
		const AMBIGUOUS_SELECTOR_HELP = `The selector must match exactly one element. If it matches multiple elements
nothing is read: the command answers with a numbered list of the matches (up to
10), each with a unique selector. Re-run with --at <index> to read one of them,
or with whichever selector you meant.`;
		// Where `dom` and `aria` read from with no selector: the document element only
		// adds a <head> of script and style text; `--selector html` still reads it.
		const TAP_DEFAULT_SELECTOR = 'body';
		// Shared by the three selector-taking reads, so the way you pick one match out
		// of several is identical across them.
		const atField = {
		    name: 'at',
		    type: 'number',
		    required: false,
		    description: 'When a selector matches multiple elements, the 0-based index of the match to read',
		};
		const domMeta = {
		    name: 'dom',
		    description: 'read the application-under-test DOM as HTML: the page body, or a single element with its children by providing a CSS Selector',
		    details: `Reads the application-under-test DOM as HTML: a single element matching a CSS
Selector, and all of its children. Without --selector it reads the page body;
pass --selector html for the entire document. Output is capped browser-side so a
heavy page never ships megabytes at once.

${AMBIGUOUS_SELECTOR_HELP}`,
		    params: [],
		    options: [
		        { ...selectorField, defaultValue: TAP_DEFAULT_SELECTOR, description: SINGLE_ELEMENT_SELECTOR },
		        { name: 'max-chars', alias: 'm', type: 'number', required: false, defaultValue: 30000, description: 'cap on returned HTML characters' },
		        atField,
		    ],
		};
		const ariaMeta = {
		    name: 'aria',
		    description: 'read the accessibility (ARIA) tree of the application-under-test page body, or the subtree at a selector',
		    details: `Reads the accessibility (ARIA) tree of the application under test, rooted at the
page body or at the element a CSS Selector matches. Structural and text-only
roles are dropped, leaving the compact role/name/state tree DevTools shows.

${AMBIGUOUS_SELECTOR_HELP}`,
		    params: [],
		    options: [
		        { ...selectorField, defaultValue: TAP_DEFAULT_SELECTOR, description: SINGLE_ELEMENT_SELECTOR },
		        // The accessibility tree of a real app is deep; the cap keeps the projection
		        // affordable for an LLM. A selector roots it at a subtree for finer reads.
		        { name: 'max-nodes', alias: 'm', type: 'number', required: false, defaultValue: 200, description: 'cap on the number of accessibility nodes returned' },
		        atField,
		    ],
		};
		const inspectMeta = {
		    name: 'inspect',
		    description: 'retrieve the tag, attributes, computed styles, box model, and accessibility node of a specific element',
		    details: `Inspects a single element matching a CSS Selector: outputs the tag, attributes,
curated computed styles, box model, and that element's own accessibility node
— where \`aria\` reads the whole tree, this reads the one node.

${AMBIGUOUS_SELECTOR_HELP}`,
		    params: [],
		    options: [
		        { ...selectorField, required: true, description: `${SINGLE_ELEMENT_SELECTOR}, identifying the element to inspect` },
		        atField,
		    ],
		};
		// CLI-native tap commands: implemented entirely in the CLI (session discovery
		// over the filesystem, DOM/ARIA reads over CDP), so — unlike TAP_COMMANDS — they
		// are never advertised by getSchema or exec'd on the session. Listed here in the
		// order they appear in help, ahead of the schema-driven commands.
		exports$1.TAP_NATIVE_COMMANDS = [
		    sessionsMeta,
		    statusMeta,
		    specsMeta,
		    runMeta,
		    domMeta,
		    ariaMeta,
		    inspectMeta,
		];
		const allTapCommands = [...exports$1.TAP_NATIVE_COMMANDS, ...exports$1.TAP_COMMANDS];
		/** Every command name this CLI ships, whether it dispatches to the session or handles it itself. */
		exports$1.KNOWN_COMMANDS = new Set(allTapCommands.map(({ name }) => name));
		// The failure catalogue and the error both sides raise. Re-exported here for the
		// same reason the result contracts are: this module is dependency-free, so the
		// browser-side app can import it where it cannot import the package barrel.
		__exportStar(requireTapErrors(), exports$1);
		// Per-command result contracts live in `./contracts/`; re-exported here so the
		// app's deep import of this module and the package barrel both reach them.
		__exportStar(requireReporter(), exports$1);
		__exportStar(requireCommand(), exports$1);
		__exportStar(requirePinned(), exports$1);
		__exportStar(requirePin(), exports$1);
		__exportStar(requireResolveSelector(), exports$1);
		
	} (tapContract));
	return tapContract;
}

var tapOperations = {};

var hasRequiredTapOperations;

function requireTapOperations () {
	if (hasRequiredTapOperations) return tapOperations;
	hasRequiredTapOperations = 1;
	Object.defineProperty(tapOperations, "__esModule", { value: true });
	tapOperations.tapRunSpecOperation = tapOperations.TapSpecsOperation = void 0;
	tapOperations.TapSpecsOperation = {
	    operationName: 'TapSpecs',
	    query: /* GraphQL */ `
    query TapSpecs {
      currentProject {
        specs {
          relative
          absolute
          gitInfo {
            lastModifiedHumanReadable
            lastModifiedTimestamp
          }
        }
      }
    }
  `,
	};
	const TAP_RUN_SPEC_QUERY = /* GraphQL */ `
  mutation TapRunSpec($specPath: String!) {
    runSpec(specPath: $specPath) {
      __typename
      ... on RunSpecResponse {
        testingType
        browser {
          displayName
        }
        spec {
          relative
        }
      }
      ... on RunSpecError {
        code
        detailMessage
      }
    }
  }
`;
	const tapRunSpecOperation = (specPath) => {
	    return {
	        operationName: 'TapRunSpec',
	        query: TAP_RUN_SPEC_QUERY,
	        variables: { specPath },
	    };
	};
	tapOperations.tapRunSpecOperation = tapRunSpecOperation;
	
	return tapOperations;
}

var hasRequiredDist;

function requireDist () {
	if (hasRequiredDist) return dist;
	hasRequiredDist = 1;
	(function (exports$1) {
		var __createBinding = (dist && dist.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __exportStar = (dist && dist.__exportStar) || function(m, exports$1) {
		    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
		};
		var __importDefault = (dist && dist.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports$1, "__esModule", { value: true });
		exports$1.isCompatibleRecord = exports$1.sessionProbePath = exports$1.recordPath = exports$1.cypressSessionsDir = exports$1.parseRecordPid = exports$1.recordFileName = exports$1.isTapSupportedBrowser = exports$1.TAP_SUPPORTED_BROWSER_FAMILY = exports$1.SESSION_ID_HEADER = exports$1.SESSIONS_ROUTE_PREFIX = exports$1.SESSIONS_DIRNAME = exports$1.MIN_SCHEMA_VERSION = exports$1.SCHEMA_VERSION = void 0;
		const path_1 = __importDefault(path);
		__exportStar(requireTapContract(), exports$1);
		__exportStar(requireTapOperations(), exports$1);
		exports$1.SCHEMA_VERSION = 1;
		exports$1.MIN_SCHEMA_VERSION = 1;
		exports$1.SESSIONS_DIRNAME = 'sessions';
		const RECORD_EXTENSION = '.json';
		exports$1.SESSIONS_ROUTE_PREFIX = '/__cypress/sessions/';
		exports$1.SESSION_ID_HEADER = 'x-cypress-session-id';
		exports$1.TAP_SUPPORTED_BROWSER_FAMILY = 'chromium';
		// tap drives the browser over CDP, which only Chromium-based browsers speak. A
		// null family means no browser is open yet — nothing to call unsupported.
		const isTapSupportedBrowser = (browserFamily) => {
		    return browserFamily === null || browserFamily === exports$1.TAP_SUPPORTED_BROWSER_FAMILY;
		};
		exports$1.isTapSupportedBrowser = isTapSupportedBrowser;
		const recordFileName = (pid) => {
		    return `${pid}${RECORD_EXTENSION}`;
		};
		exports$1.recordFileName = recordFileName;
		const parseRecordPid = (entry) => {
		    if (path_1.default.extname(entry) !== RECORD_EXTENSION) {
		        return null;
		    }
		    const pid = Number(path_1.default.basename(entry, RECORD_EXTENSION));
		    return Number.isInteger(pid) ? pid : null;
		};
		exports$1.parseRecordPid = parseRecordPid;
		const cypressSessionsDir = (cacheRoot) => {
		    return path_1.default.join(cacheRoot, exports$1.SESSIONS_DIRNAME);
		};
		exports$1.cypressSessionsDir = cypressSessionsDir;
		const recordPath = (cacheRoot, pid) => {
		    return path_1.default.join((0, exports$1.cypressSessionsDir)(cacheRoot), (0, exports$1.recordFileName)(pid));
		};
		exports$1.recordPath = recordPath;
		const sessionProbePath = (sessionId) => {
		    return `${exports$1.SESSIONS_ROUTE_PREFIX}${sessionId}`;
		};
		exports$1.sessionProbePath = sessionProbePath;
		const isValidTestingType = (value) => {
		    return value === 'e2e' || value === 'component' || value === null;
		};
		const isCompatibleRecord = (record) => {
		    return Boolean(record)
		        && typeof record.schemaVersion === 'number'
		        && record.schemaVersion >= exports$1.MIN_SCHEMA_VERSION
		        && typeof record.pid === 'number'
		        && typeof record.projectRoot === 'string'
		        && Number.isInteger(record.serverPort)
		        && typeof record.sessionId === 'string'
		        && record.sessionId.length > 0
		        && isValidTestingType(record.testingType);
		};
		exports$1.isCompatibleRecord = isCompatibleRecord;
		
	} (dist));
	return dist;
}

var distExports = requireDist();

const debug$3 = Debug('cypress:cli:cypress-sessions');
const PROBE_HOST = '127.0.0.1';
const DEFAULT_PROBE_TIMEOUT_MS = 2000;
const isPidAlive = (pid) => {
    try {
        process.kill(pid, 0);
        return true;
    }
    catch (err) {
        return (err === null || err === void 0 ? void 0 : err.code) === 'EPERM';
    }
};
// The server reports `cdpBrowserWsUrl` from in-memory state that it only clears
// when the browser *process* exits, so a closed browser window whose process
// lingers leaves the url stale. Hit the browser's own DevTools HTTP endpoint
// (Chromium exposes `/json/version` whenever the CDP port is open) to confirm
// the browser is really reachable before trusting the url.
const cdpEndpointReachable = (cdpBrowserWsUrl, timeoutMs) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    let versionUrl;
    try {
        const { protocol, host } = new URL(cdpBrowserWsUrl);
        versionUrl = `${protocol === 'wss:' ? 'https:' : 'http:'}//${host}/json/version`;
    }
    catch (err) {
        debug$3('could not derive a CDP version url from %s: %o', cdpBrowserWsUrl, err);
        return false;
    }
    try {
        const response = yield fetch(versionUrl, { signal: AbortSignal.timeout(timeoutMs) });
        return response.ok;
    }
    catch (err) {
        debug$3('CDP endpoint unreachable at %s: %o', versionUrl, err);
        return false;
    }
});
const verifySessionRecord = (record_1, ...args_1) => xvfb.__awaiter(void 0, [record_1, ...args_1], void 0, function* (record, timeoutMs = DEFAULT_PROBE_TIMEOUT_MS) {
    const url = `http://${PROBE_HOST}:${record.serverPort}${distExports.sessionProbePath(record.sessionId)}`;
    try {
        const response = yield fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
        if (response.status !== 200) {
            return null;
        }
        const live = yield response.json();
        if (live.sessionId !== record.sessionId) {
            return null;
        }
        const cdpBrowserWsUrl = typeof live.cdpBrowserWsUrl === 'string' ? live.cdpBrowserWsUrl : null;
        const attached = cdpBrowserWsUrl !== null && (yield cdpEndpointReachable(cdpBrowserWsUrl, timeoutMs));
        // The browser identity describes what the session has open, not what is
        // reachable over CDP — a browser tap cannot drive still has to be nameable.
        return Object.assign(Object.assign({}, record), { cdpBrowserWsUrl: attached ? cdpBrowserWsUrl : null, browserName: typeof live.browserName === 'string' ? live.browserName : null, browserFamily: typeof live.browserFamily === 'string' ? live.browserFamily : null, machineId: typeof live.machineId === 'string' ? live.machineId : null, userId: typeof live.userId === 'string' ? live.userId : null });
    }
    catch (err) {
        debug$3('liveness probe failed for pid %d on port %d: %o', record.pid, record.serverPort, err);
        return null;
    }
});

const debug$2 = Debug('cypress:cli:cypress-sessions');
const getSessionsDir = () => {
    return distExports.cypressSessionsDir(xvfb.stateModule.getCacheDir());
};
const listRecordFiles = (dir) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    let entries;
    try {
        entries = yield fs.readdir(dir);
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            return [];
        }
        throw err;
    }
    const files = [];
    for (const entry of entries) {
        const pid = distExports.parseRecordPid(entry);
        if (pid !== null) {
            files.push({ path: path.join(dir, entry), pid });
        }
    }
    return files;
});
const readCompatibleRecord = (filePath) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    let record;
    try {
        record = yield fs.readJson(filePath);
    }
    catch (err) {
        debug$2('could not read cypress sessions record %s: %o', filePath, err);
        return null;
    }
    if (!distExports.isCompatibleRecord(record)) {
        debug$2('incompatible cypress sessions record %s', filePath);
        return null;
    }
    return record;
});
// Reaps a record whose writer process is gone, returning whether it was dead.
// Removal is best-effort: a file we can't delete (permissions, a Windows lock)
// must not abort discovery of the other, live sessions, so the failure is
// swallowed and the record is still reported dead.
const reapIfDead = (file) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const { path, pid } = file;
    if (isPidAlive(pid)) {
        return false;
    }
    yield fs.remove(path).catch((err) => {
        debug$2('failed to reap dead cypress sessions record %s: %o', path, err);
    });
    return true;
});
/**
 * Reads all the current cypress session records that are still live (i.e. the writer process is still running).
 * Reaps any dead records.
 */
const readLiveSessions = () => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const files = yield listRecordFiles(getSessionsDir());
    const records = yield Promise.all(files.map((file) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
        const record = yield readCompatibleRecord(file.path);
        if (!record) {
            return null;
        }
        if (yield reapIfDead(file)) {
            return null;
        }
        return record;
    })));
    return records.filter((record) => record !== null);
});
const pruneDeadSessionRecords = () => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const files = yield listRecordFiles(getSessionsDir());
    const pruned = yield Promise.all(files.map((file) => reapIfDead(file)));
    const removed = pruned.filter(Boolean).length;
    debug$2('pruned %d dead cypress sessions record(s)', removed);
    return removed;
});

dayjs.extend(relativeTime);
// Subdirs under the cache root that are not binary version dirs. SESSIONS_DIRNAME
// is sourced from cypress-sessions so a rename there can't silently make prune
// treat the sessions dir as a stale binary cache and delete live records.
const EXTERNAL_CACHE_ENTRIES = new Set(['bundles', distExports.SESSIONS_DIRNAME]);
// output colors for the table
const colors = {
    titles: chalk.white,
    dates: chalk.cyan,
    values: chalk.green,
    size: chalk.gray,
};
const logCachePath = () => {
    xvfb.loggerModule.always(xvfb.stateModule.getCacheDir());
    return undefined;
};
const clear = () => {
    return fs.remove(xvfb.stateModule.getCacheDir());
};
const prune = () => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const cacheDir = xvfb.stateModule.getCacheDir();
    const checkedInBinaryVersion = xvfb.util.pkgVersion();
    let deletedBinary = false;
    try {
        const versions = yield fs.readdir(cacheDir);
        for (const version of versions) {
            if (EXTERNAL_CACHE_ENTRIES.has(version))
                continue;
            if (version !== checkedInBinaryVersion) {
                deletedBinary = true;
                const versionDir = path.join(cacheDir, version);
                yield fs.remove(versionDir);
            }
        }
        if (deletedBinary) {
            xvfb.loggerModule.always(`Deleted all binary caches except for the ${checkedInBinaryVersion} binary cache.`);
        }
        else {
            xvfb.loggerModule.always(`No binary caches found to prune.`);
        }
        yield pruneDeadSessionRecords();
    }
    catch (e) {
        if (e.code === 'ENOENT') {
            xvfb.loggerModule.always(`No Cypress cache was found at ${cacheDir}. Nothing to prune.`);
            return;
        }
        throw e;
    }
});
const fileSizeInMB = (size) => {
    return `${(size / 1024 / 1024).toFixed(1)}MB`;
};
/**
 * Collects all cached versions, finds when each was used
 * and prints a table with results to the terminal
 */
const list = (...args_1) => xvfb.__awaiter(void 0, [...args_1], void 0, function* (showSize = false) {
    const binaries = yield getCachedVersions(showSize);
    const head = [colors.titles('version'), colors.titles('last used')];
    if (showSize) {
        head.push(colors.titles('size'));
    }
    const table = new Table({
        head,
    });
    binaries.forEach((binary) => {
        const versionString = colors.values(binary.version);
        const lastUsed = binary.accessed ? colors.dates(binary.accessed) : 'unknown';
        const row = [versionString, lastUsed];
        if (showSize) {
            const size = colors.size(fileSizeInMB(binary.size));
            row.push(size);
        }
        return table.push(row);
    });
    xvfb.loggerModule.always(table.toString());
});
const getCachedVersions = (showSize) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const cacheDir = xvfb.stateModule.getCacheDir();
    const versions = yield fs.readdir(cacheDir);
    const filteredVersions = versions.filter(xvfb.util.isSemver).map((version) => {
        return {
            version,
            folderPath: path.join(cacheDir, version),
        };
    });
    const binaries = [];
    for (const binary of filteredVersions) {
        const binaryDir = xvfb.stateModule.getBinaryDir(binary.version);
        const executable = xvfb.stateModule.getPathToExecutable(binaryDir);
        try {
            const stat = yield fs.stat(executable);
            const lastAccessedTime = _.get(stat, 'atime');
            if (lastAccessedTime) {
                const accessed = dayjs(lastAccessedTime).fromNow();
                // @ts-expect-error - accessed is not defined in the type
                binary.accessed = accessed;
            }
            // if no lastAccessedTime
            // the test runner has never been opened
            // or could be a test simulating missing timestamp
        }
        catch (e) {
            // could not find the binary or gets its stats
            // no-op
        }
        if (showSize) {
            const binaryDir = xvfb.stateModule.getBinaryDir(binary.version);
            const size = yield getSize(binaryDir);
            binaries.push(Object.assign(Object.assign({}, binary), { size }));
        }
        else {
            binaries.push(binary);
        }
    }
    return binaries;
});
const cacheModule = {
    path: logCachePath,
    clear,
    prune,
    list,
    getCachedVersions,
};

const debug$1 = Debug('cypress:cli');
const getBinaryDirectory = () => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    if (xvfb.util.getEnv('CYPRESS_RUN_BINARY')) {
        let envBinaryPath = path.resolve(xvfb.util.getEnv('CYPRESS_RUN_BINARY'));
        try {
            const envBinaryDir = yield xvfb.stateModule.parseRealPlatformBinaryFolderAsync(envBinaryPath);
            if (!envBinaryDir) {
                const raiseErrorFn = xvfb.throwFormErrorText(xvfb.errors.CYPRESS_RUN_BINARY.notValid(envBinaryPath));
                yield raiseErrorFn();
            }
            debug$1('CYPRESS_RUN_BINARY has binaryDir:', envBinaryDir);
            return envBinaryDir;
        }
        catch (err) {
            const raiseErrorFn = xvfb.throwFormErrorText(xvfb.errors.CYPRESS_RUN_BINARY.notValid(envBinaryPath));
            yield raiseErrorFn(err.message);
        }
    }
    return xvfb.stateModule.getBinaryDir();
});
const getVersions = () => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const binDir = yield getBinaryDirectory();
    const pkg = yield xvfb.stateModule.getBinaryPkgAsync(binDir);
    const versions = {
        binary: xvfb.stateModule.getBinaryPkgVersion(pkg),
        electronVersion: xvfb.stateModule.getBinaryElectronVersion(pkg),
        electronNodeVersion: xvfb.stateModule.getBinaryElectronNodeVersion(pkg),
    };
    debug$1('binary versions %o', versions);
    const buildInfo = xvfb.util.pkgBuildInfo();
    let packageVersion = xvfb.util.pkgVersion();
    if (!buildInfo)
        packageVersion += ' (development)';
    else if (!buildInfo.stable)
        packageVersion += ' (pre-release)';
    const versionsFinal = {
        package: packageVersion,
        binary: versions.binary || 'not installed',
        electronVersion: versions.electronVersion || 'not found',
        electronNodeVersion: versions.electronNodeVersion || 'not found',
    };
    debug$1('combined versions %o', versions);
    return versionsFinal;
});
const versionsModule = {
    getVersions,
};

// color for numbers and show values
const g = chalk.green;
// color for paths
const p = chalk.cyan;
const red = chalk.red;
// urls
const link = chalk.blue.underline;
// to be exported
const methods = {};
methods.findProxyEnvironmentVariables = () => {
    return _.pick(process.env, ['HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY']);
};
const maskSensitiveVariables = (obj) => {
    const masked = Object.assign({}, obj);
    if (masked.CYPRESS_RECORD_KEY) {
        masked.CYPRESS_RECORD_KEY = '<redacted>';
    }
    return masked;
};
methods.findCypressEnvironmentVariables = () => {
    const isCyVariable = (val, key) => key.startsWith('CYPRESS_');
    return _.pickBy(process.env, isCyVariable);
};
const formatCypressVariables = () => {
    const vars = methods.findCypressEnvironmentVariables();
    return maskSensitiveVariables(vars);
};
methods.start = (...args_1) => xvfb.__awaiter(void 0, [...args_1], void 0, function* (options = {}) {
    const args = ['--mode=info'];
    yield spawn.start$1(args, {
        dev: options.dev,
    });
    console.log();
    const proxyVars = methods.findProxyEnvironmentVariables();
    if (_.isEmpty(proxyVars)) {
        console.log('Proxy Settings: none detected');
    }
    else {
        console.log('Proxy Settings:');
        _.forEach(proxyVars, (value, key) => {
            console.log('%s: %s', key, g(value));
        });
        console.log();
        console.log('Learn More: %s', link('https://on.cypress.io/proxy-configuration'));
        console.log();
    }
    const cyVars = formatCypressVariables();
    if (_.isEmpty(cyVars)) {
        console.log('Environment Variables: none detected');
    }
    else {
        console.log('Environment Variables:');
        _.forEach(cyVars, (value, key) => {
            console.log('%s: %s', key, g(value));
        });
    }
    console.log();
    console.log('Application Data:', p(xvfb.util.getApplicationDataFolder()));
    console.log('Browser Profiles:', p(xvfb.util.getApplicationDataFolder('browsers')));
    console.log('Binary Caches: %s', p(xvfb.stateModule.getCacheDir()));
    console.log();
    const osVersion = yield xvfb.util.getOsVersionAsync();
    const buildInfo = xvfb.util.pkgBuildInfo();
    const isStable = buildInfo && buildInfo.stable;
    console.log('Cypress Version: %s', g(xvfb.util.pkgVersion()), isStable ? g('(stable)') : red('(pre-release)'));
    console.log('System Platform: %s (%s)', g(os.platform()), g(osVersion));
    console.log('System Memory: %s free %s', g(prettyBytes(os.totalmem())), g(prettyBytes(os.freemem())));
    if (!buildInfo) {
        console.log();
        console.log('This is the', red('development'), '(un-built) Cypress CLI.');
    }
    else if (!isStable) {
        console.log();
        console.log('This is a', red('pre-release'), 'build of Cypress.');
        console.log('Build info:');
        console.log('  Commit SHA:', g(buildInfo.commitSha));
        console.log('  Commit Branch:', g(buildInfo.commitBranch));
        console.log('  Commit Date:', g(buildInfo.commitDate));
    }
});

const debug = Debug('cypress:cli:cli');
// patch "commander" method called when a user passed an unknown option
// we want to print help for the current command and exit with an error
function unknownOption(flag, type = 'option') {
    if (this._allowUnknownOption)
        return;
    xvfb.loggerModule.error();
    xvfb.loggerModule.error(`  error: unknown ${type}:`, flag);
    xvfb.loggerModule.error();
    this.outputHelp();
    // A command that took exitOverride() means to handle its own failure — exiting
    // here would skip the rest of its run, including anything it does on the way
    // out. `cypress tap` relies on this to report the invocation before leaving.
    if (this._exitCallback) {
        this._exitCallback(new commander.CommanderError(1, 'commander.unknownOption', `unknown ${type}: ${flag}`));
    }
    process.exit(1);
}
commander.Command.prototype.unknownOption = unknownOption;
const coerceFalse = (arg) => {
    return arg !== 'false';
};
const coerceAnyStringToInt = (arg) => {
    return typeof arg === 'string' ? parseInt(arg) : arg;
};
const spaceDelimitedArgsMsg = (flag, args) => {
    let msg = `
    ${logSymbols.warning} Warning: It looks like you're passing --${flag} a space-separated list of arguments:

    "${args.join(' ')}"

    This will work, but it's not recommended.

    If you are trying to pass multiple arguments, separate them with commas instead:
      cypress run --${flag} arg1,arg2,arg3
  `;
    if (flag === 'spec') {
        msg += `
    The most common cause of this warning is using an unescaped glob pattern. If you are
    trying to pass a glob pattern, escape it using quotes:
      cypress run --spec "**/*.spec.js"
    `;
    }
    xvfb.loggerModule.log();
    xvfb.loggerModule.warn(commonTags.stripIndent(msg));
    xvfb.loggerModule.log();
};
const parseVariableOpts = (fnArgs, args) => {
    const [opts, unknownArgs] = fnArgs;
    if ((unknownArgs && unknownArgs.length) && (opts.spec || opts.tag)) {
        // this will capture space-delimited args after
        // flags that could have possible multiple args
        // but before the next option
        // --spec spec1 spec2 or --tag foo bar
        const multiArgFlags = _.compact([
            opts.spec ? 'spec' : opts.spec,
            opts.tag ? 'tag' : opts.tag,
        ]);
        _.forEach(multiArgFlags, (flag) => {
            const argIndex = _.indexOf(args, `--${flag}`) + 2;
            const nextOptOffset = _.findIndex(_.slice(args, argIndex), (arg) => {
                return _.startsWith(arg, '--');
            });
            const endIndex = nextOptOffset !== -1 ? argIndex + nextOptOffset : args.length;
            const maybeArgs = _.slice(args, argIndex, endIndex);
            const extraArgs = _.intersection(maybeArgs, unknownArgs);
            if (extraArgs.length) {
                opts[flag] = [opts[flag]].concat(extraArgs);
                spaceDelimitedArgsMsg(flag, opts[flag]);
                opts[flag] = opts[flag].join(',');
            }
        });
    }
    debug('variable-length opts parsed %o', { args, opts });
    return xvfb.util.parseOpts(opts);
};
const descriptions = {
    autoCancelAfterFailures: 'overrides the project-level Cloud configuration to set the failed test threshold for auto cancellation or to disable auto cancellation when recording to the Cloud',
    browser: 'runs Cypress in the browser with the given name. if a filesystem path is supplied, Cypress will attempt to use the browser at that path.',
    cacheClear: 'delete all cached binaries',
    cachePrune: 'deletes all cached binaries except for the version currently in use',
    cacheList: 'list cached binary versions',
    cachePath: 'print the path to the binary cache',
    cacheSize: 'Used with the list command to show the sizes of the cached folders',
    ciBuildId: 'the unique identifier for a run on your CI provider. typically a "BUILD_ID" env var. this value is automatically detected for most CI providers',
    component: 'runs component tests',
    config: 'sets configuration values. separate multiple values with a comma. overrides any value in cypress.config.{js,ts,mjs,cjs}.',
    configFile: 'path to script file where configuration values are set. defaults to "cypress.config.{js,ts,mjs,cjs}".',
    detached: 'runs Cypress application in detached mode',
    dev: 'runs cypress in development and bypasses binary check',
    e2e: 'runs end to end tests',
    env: 'sets environment variables. separate multiple values with a comma. overrides any value in cypress.config.{js,ts,mjs,cjs} or cypress.env.json',
    expose: 'sets exposed public configuration variables. separate multiple values with a comma. overrides any value in cypress.config.{js,ts,mjs,cjs}',
    exit: 'keep the browser open after tests finish',
    forceInstall: 'force install the Cypress binary',
    global: 'force Cypress into global mode as if it were globally installed',
    group: 'a named group for recorded runs in Cypress Cloud',
    headed: 'displays the browser instead of running headlessly',
    headless: 'hide the browser instead of running headed (default for cypress run)',
    inspect: 'enable the Node.js inspector to debug the Cypress development process. only available when used with --dev',
    inspectBrk: 'enable the Node.js inspector and break before the Cypress development process starts. only available when used with --dev',
    session: 'target a local Cypress session by its process id (PID)',
    json: 'print the raw JSON result instead of the human-readable rendering',
    tapTimeout: 'how long to wait on any single call into the Cypress session, in milliseconds (default 30000)',
    key: 'your secret Record Key. you can omit this if you set a CYPRESS_RECORD_KEY environment variable.',
    parallel: 'enables concurrent runs and automatic load balancing of specs across multiple machines or processes',
    passWithNoTests: 'pass when no tests are found',
    port: 'runs Cypress on a specific port. overrides any value in cypress.config.{js,ts,mjs,cjs}.',
    project: 'path to the project',
    posixExitCodes: 'use POSIX exit codes for error handling',
    quiet: 'run quietly, using only the configured reporter',
    record: 'records the run. sends test results, screenshots and videos to Cypress Cloud.',
    reporter: 'runs a specific mocha reporter. pass a path to use a custom reporter. defaults to "spec"',
    reporterOptions: 'options for the mocha reporter. defaults to "null"',
    runnerUi: 'displays the Cypress Runner UI',
    noRunnerUi: 'hides the Cypress Runner UI',
    spec: 'runs specific spec file(s). defaults to "all"',
    tag: 'named tag(s) for recorded runs in Cypress Cloud',
    version: 'prints Cypress version',
};
const knownCommands = [
    'cache',
    'help',
    '-h',
    '--help',
    'install',
    'open',
    'run',
    'tap',
    'verify',
    '-v',
    '--version',
    'version',
    'info',
];
const text = (description) => {
    if (!descriptions[description]) {
        throw new Error(`Could not find description for: ${description}`);
    }
    return descriptions[description];
};
function includesVersion(args) {
    return (_.includes(args, '--version') ||
        _.includes(args, '-v'));
}
function showVersions(opts) {
    return xvfb.__awaiter(this, void 0, void 0, function* () {
        debug('printing Cypress version');
        debug('additional arguments %o', opts);
        debug('parsed version arguments %o', opts);
        const reportAllVersions = (versions) => {
            xvfb.loggerModule.always('Cypress package version:', versions.package);
            xvfb.loggerModule.always('Cypress binary version:', versions.binary);
            xvfb.loggerModule.always('Electron version:', versions.electronVersion);
            xvfb.loggerModule.always('Bundled Node version:', versions.electronNodeVersion);
        };
        const reportComponentVersion = (componentName, versions) => {
            const names = {
                package: 'package',
                binary: 'binary',
                electron: 'electronVersion',
                node: 'electronNodeVersion',
            };
            if (!names[componentName]) {
                throw new Error(`Unknown component name "${componentName}"`);
            }
            const name = names[componentName];
            if (!versions[name]) {
                throw new Error(`Cannot find version for component "${componentName}" under property "${name}"`);
            }
            const version = versions[name];
            xvfb.loggerModule.always(version);
        };
        const defaultVersions = {
            package: undefined,
            binary: undefined,
            electronVersion: undefined,
            electronNodeVersion: undefined,
        };
        try {
            const versions = (yield versionsModule.getVersions()) || defaultVersions;
            if (opts === null || opts === void 0 ? void 0 : opts.component) {
                reportComponentVersion(opts.component, versions);
            }
            else {
                reportAllVersions(versions);
            }
            process.exit(0);
        }
        catch (e) {
            xvfb.util.logErrorExit1(e);
        }
    });
}
const createProgram = () => {
    const program = new commander.Command();
    // bug in commander not printing name
    // in usage help docs
    program._name = 'cypress';
    program.usage('<command> [options]');
    return program;
};
const addCypressRunCommand = (program) => {
    return program
        .command('run')
        .usage('[options]')
        .description('Runs Cypress tests from the CLI without the GUI')
        .option('--auto-cancel-after-failures <test-failure-count || false>', text('autoCancelAfterFailures'))
        .option('-b, --browser <browser-name-or-path>', text('browser'))
        .option('--ci-build-id <id>', text('ciBuildId'))
        .option('--component', text('component'))
        .option('-c, --config <config>', text('config'))
        .option('-C, --config-file <config-file>', text('configFile'))
        .option('--e2e', text('e2e'))
        .option('-e, --env <env>', text('env'))
        .option('-x, --expose <expose>', text('expose'))
        .option('--group <name>', text('group'))
        .option('-k, --key <record-key>', text('key'))
        .option('--headed', text('headed'))
        .option('--headless', text('headless'))
        .option('--no-exit', text('exit'))
        .option('--parallel', text('parallel'))
        .option('--pass-with-no-tests', text('passWithNoTests'))
        .option('-p, --port <port>', text('port'))
        .option('-P, --project <project-path>', text('project'))
        .option('--posix-exit-codes', text('posixExitCodes'))
        .option('-q, --quiet', text('quiet'))
        .option('--record [bool]', text('record'), coerceFalse)
        .option('-r, --reporter <reporter>', text('reporter'))
        .option('--runner-ui', text('runnerUi'))
        .option('--no-runner-ui', text('noRunnerUi'))
        .option('-o, --reporter-options <reporter-options>', text('reporterOptions'))
        .option('-s, --spec <spec>', text('spec'))
        .option('-t, --tag <tag>', text('tag'));
};
const addCypressOpenCommand = (program) => {
    return program
        .command('open')
        .usage('[options]')
        .description('Opens Cypress in the interactive GUI.')
        .option('-b, --browser <browser-path>', text('browser'))
        .option('--component', text('component'))
        .option('-c, --config <config>', text('config'))
        .option('-C, --config-file <config-file>', text('configFile'))
        .option('-d, --detached [bool]', text('detached'), coerceFalse)
        .option('--e2e', text('e2e'))
        .option('-e, --env <env>', text('env'))
        .option('-x, --expose <expose>', text('expose'))
        .option('--global', text('global'))
        .option('-p, --port <port>', text('port'))
        .option('-P, --project <project-path>', text('project'));
};
// `--dev`, `--inspect` and `--inspect-brk` are internal flags used when
// developing Cypress itself. They are intentionally hidden from the public
// `--help` output and only registered when `--dev` is actually passed, so that
// released versions don't advertise flags that error for end users.
// See https://github.com/cypress-io/cypress/issues/21320
const maybeAddDevFlag = (program, args) => {
    if (args.includes('--dev')) {
        return program.option('--dev', text('dev'), coerceFalse);
    }
    return program;
};
const maybeAddInspectFlags = (program, args) => {
    if (args.includes('--dev')) {
        return program
            .option('--inspect', text('inspect'))
            .option('--inspect-brk', text('inspectBrk'));
    }
    return program;
};
/**
 * Casts known command line options for "cypress run" to their intended type.
 * For example if the user passes "--port 5005" the ".port" property should be
 * a number 5005 and not a string "5005".
 *
 * Returns a clone of the original object.
 */
const castCypressOptions = (opts) => {
    // only properties that have type "string | false" in our TS definition
    // require special handling, because CLI parsing takes care of purely
    // boolean arguments
    const castOpts = Object.assign({}, opts);
    if (_.has(opts, 'port')) {
        castOpts.port = coerceAnyStringToInt(opts.port);
    }
    return castOpts;
};
const cliModule = {
    /**
     * Parses `cypress run` command line option array into an object
     * with options that you can feed into a `cypress.run()` module API call.
     * @example
     *  const options = parseRunCommand(['cypress', 'run', '--browser', 'chrome'])
     *  // options is {browser: 'chrome'}
     */
    parseRunCommand(args) {
        return new Promise((resolve, reject) => {
            if (!Array.isArray(args)) {
                return reject(new Error('Expected array of arguments'));
            }
            // make a copy of the input arguments array
            // and add placeholders where "node ..." would usually be
            // also remove "cypress" keyword at the start if present
            const cliArgs = args[0] === 'cypress' ? [...args.slice(1)] : [...args];
            cliArgs.unshift(null, null);
            debug('creating program parser');
            const program = createProgram();
            maybeAddInspectFlags(maybeAddDevFlag(addCypressRunCommand(program), cliArgs), cliArgs)
                .action((...fnArgs) => {
                debug('parsed Cypress run %o', fnArgs);
                const options = parseVariableOpts(fnArgs, cliArgs);
                debug('parsed options %o', options);
                const casted = castCypressOptions(options);
                debug('casted options %o', casted);
                resolve(casted);
            });
            debug('parsing args: %o', cliArgs);
            program.parse(cliArgs);
        });
    },
    /**
     * Parses `cypress open` command line option array into an object
     * with options that you can feed into cy.openModeSystemTest test calls
     * @example
     *  const options = parseOpenCommand(['cypress', 'open', '--browser', 'chrome'])
     *  // options is {browser: 'chrome'}
     */
    parseOpenCommand(args) {
        return new Promise((resolve, reject) => {
            if (!Array.isArray(args)) {
                return reject(new Error('Expected array of arguments'));
            }
            // make a copy of the input arguments array
            // and add placeholders where "node ..." would usually be
            // also remove "cypress" keyword at the start if present
            const cliArgs = args[0] === 'cypress' ? [...args.slice(1)] : [...args];
            cliArgs.unshift(null, null);
            debug('creating program parser');
            const program = createProgram();
            maybeAddInspectFlags(maybeAddDevFlag(addCypressOpenCommand(program), cliArgs), cliArgs)
                .action((...fnArgs) => {
                debug('parsed Cypress open %o', fnArgs);
                const options = parseVariableOpts(fnArgs, cliArgs);
                debug('parsed options %o', options);
                const casted = castCypressOptions(options);
                debug('casted options %o', casted);
                resolve(casted);
            });
            debug('parsing args: %o', cliArgs);
            program.parse(cliArgs);
        });
    },
    /**
     * Parses the command line and kicks off Cypress process.
     */
    init(args) {
        return xvfb.__awaiter(this, void 0, void 0, function* () {
            if (!args) {
                args = process.argv;
            }
            const { CYPRESS_INTERNAL_ENV } = process.env;
            if (!xvfb.util.isValidCypressInternalEnvValue(CYPRESS_INTERNAL_ENV)) {
                debug('invalid CYPRESS_INTERNAL_ENV value', CYPRESS_INTERNAL_ENV);
                return xvfb.exitWithError(xvfb.errors.invalidCypressEnv)(`CYPRESS_INTERNAL_ENV=${CYPRESS_INTERNAL_ENV}`);
            }
            if (xvfb.util.isNonProductionCypressInternalEnvValue(CYPRESS_INTERNAL_ENV)) {
                debug('non-production CYPRESS_INTERNAL_ENV value', CYPRESS_INTERNAL_ENV);
                let msg = `
        ${logSymbols.warning} Warning: It looks like you're passing CYPRESS_INTERNAL_ENV=${CYPRESS_INTERNAL_ENV}

        The environment variable "CYPRESS_INTERNAL_ENV" is reserved and should only be used internally.

        Unset the "CYPRESS_INTERNAL_ENV" environment variable and run Cypress again.
      `;
                xvfb.loggerModule.log();
                xvfb.loggerModule.warn(commonTags.stripIndent(msg));
                xvfb.loggerModule.log();
            }
            const program = createProgram();
            program
                .command('help')
                .description('Shows CLI help and exits')
                .action(() => {
                program.help();
            });
            const handleVersion = (cmd) => {
                return cmd
                    .option('--component <package|binary|electron|node>', 'component to report version for')
                    .action((opts, ...other) => {
                    showVersions(xvfb.util.parseOpts(opts));
                });
            };
            handleVersion(program
                .storeOptionsAsProperties()
                .option('-v, --version', text('version'))
                .command('version')
                .description(text('version')));
            maybeAddInspectFlags(maybeAddDevFlag(addCypressOpenCommand(program), args), args)
                .action((opts) => xvfb.__awaiter(this, void 0, void 0, function* () {
                debug('opening Cypress');
                try {
                    const code = yield openModule.start(xvfb.util.parseOpts(opts));
                    process.exit(code);
                }
                catch (e) {
                    xvfb.util.logErrorExit1(e);
                }
            }));
            maybeAddInspectFlags(maybeAddDevFlag(addCypressRunCommand(program), args), args)
                .action((...fnArgs) => xvfb.__awaiter(this, void 0, void 0, function* () {
                debug('running Cypress with args %o', fnArgs);
                try {
                    const code = yield runModule.start(parseVariableOpts(fnArgs, args));
                    process.exit(code);
                }
                catch (e) {
                    xvfb.util.logErrorExit1(e);
                }
            }));
            program
                .command('install')
                .usage('[options]')
                .description('Installs the Cypress executable matching this package\'s version')
                .option('-f, --force', text('forceInstall'))
                .action((opts) => xvfb.__awaiter(this, void 0, void 0, function* () {
                try {
                    yield installModule.start(xvfb.util.parseOpts(opts));
                }
                catch (e) {
                    xvfb.util.logErrorExit1(e);
                }
            }));
            maybeAddDevFlag(program
                .command('verify')
                .usage('[options]')
                .description('Verifies that Cypress is installed correctly and executable'), args)
                .action((opts) => xvfb.__awaiter(this, void 0, void 0, function* () {
                const defaultOpts = { force: true, welcomeMessage: false };
                const parsedOpts = xvfb.util.parseOpts(opts);
                const options = _.extend(parsedOpts, defaultOpts);
                try {
                    yield spawn.start(options);
                }
                catch (e) {
                    xvfb.util.logErrorExit1(e);
                }
            }));
            program
                .command('cache')
                .usage('[command]')
                .description('Manages the Cypress binary cache')
                .option('list', text('cacheList'))
                .option('path', text('cachePath'))
                .option('clear', text('cacheClear'))
                .option('prune', text('cachePrune'))
                .option('--size', text('cacheSize'))
                .action(function (opts, args) {
                return xvfb.__awaiter(this, void 0, void 0, function* () {
                    if (!args || !args.length) {
                        this.outputHelp();
                        process.exit(1);
                    }
                    const [command] = args;
                    if (!_.includes(['list', 'path', 'clear', 'prune'], command)) {
                        unknownOption.call(this, `cache ${command}`, 'command');
                    }
                    if (command === 'list') {
                        debug('cache command %o', {
                            command,
                            size: opts.size,
                        });
                        try {
                            const result = yield cacheModule.list(opts.size);
                            return result;
                        }
                        catch (e) {
                            if (e.code === 'ENOENT') {
                                xvfb.loggerModule.always('No cached binary versions were found.');
                                process.exit(0);
                            }
                            xvfb.util.logErrorExit1(e);
                        }
                    }
                    cacheModule[command]();
                });
            });
            program
                .command('tap')
                .usage('[command] [args...]')
                .description('Discover, control, and query an open-mode Cypress session from the command line')
                .helpOption(false)
                .allowUnknownOption(true)
                .option('-s, --session <pid>', text('session'), coerceAnyStringToInt)
                .option('--json', text('json'))
                .option('--timeout <ms>', text('tapTimeout'), coerceAnyStringToInt)
                .action(function (opts, args) {
                return xvfb.__awaiter(this, void 0, void 0, function* () {
                    try {
                        const { default: tapModule } = yield Promise.resolve().then(function () { return require('./tap-BkTD6Abc.js'); });
                        const code = yield tapModule.start(args || [], _.pick(opts, ['session', 'json', 'timeout']));
                        process.exit(code);
                    }
                    catch (e) {
                        xvfb.util.logErrorExit1(e);
                    }
                });
            });
            maybeAddDevFlag(program
                .command('info')
                .usage('[command]')
                .description('Prints Cypress and system information'), args)
                .action((opts) => xvfb.__awaiter(this, void 0, void 0, function* () {
                try {
                    const code = yield methods.start(opts);
                    process.exit(code);
                }
                catch (e) {
                    xvfb.util.logErrorExit1(e);
                }
            }));
            debug('cli starts with arguments %j', args);
            xvfb.util.printNodeOptions();
            // if there are no arguments
            if (args.length <= 2) {
                debug('printing help');
                program.help();
                // exits
            }
            const firstCommand = args[2];
            if (!_.includes(knownCommands, firstCommand)) {
                debug('unknown command %s', firstCommand);
                xvfb.loggerModule.error('Unknown command', `"${firstCommand}"`);
                program.outputHelp();
                return process.exit(1);
            }
            if (includesVersion(args)) {
                // commander 2.11.0 changes behavior
                // and now does not understand top level options
                // .option('-v, --version').command('version')
                // so we have to manually catch '-v, --version'
                handleVersion(program);
            }
            debug('program parsing arguments');
            return program.parse(args);
        });
    },
};

exports.cliModule = cliModule;
exports.distExports = distExports;
exports.installModule = installModule;
exports.isPidAlive = isPidAlive;
exports.openModule = openModule;
exports.readLiveSessions = readLiveSessions;
exports.runModule = runModule;
exports.verifySessionRecord = verifySessionRecord;

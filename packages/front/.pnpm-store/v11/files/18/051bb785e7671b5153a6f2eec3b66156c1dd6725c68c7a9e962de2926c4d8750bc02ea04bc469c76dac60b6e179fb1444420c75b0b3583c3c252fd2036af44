'use strict';

var xvfb = require('./xvfb-BKRGwxlS.js');
var Debug = require('debug');
var commander = require('commander');
var path = require('path');
var cli = require('./cli-_xePNEPj.js');
var CRI = require('chrome-remote-interface');
var chalk = require('chalk');
var crypto = require('crypto');
require('os');
require('bluebird');
require('@cypress/xvfb');
require('common-tags');
require('lodash');
require('assert');
require('arch');
require('ospath');
require('hasha');
require('tty');
require('ci-info');
require('execa');
require('systeminformation');
require('cachedir');
require('log-symbols');
require('executable');
require('process');
require('supports-color');
require('is-installed-globally');
require('fs-extra');
require('fs');
require('untildify');
require('cli-table3');
require('dayjs');
require('dayjs/plugin/relativeTime');
require('./spawn-BkpC5qQ4.js');
require('child_process');
require('listr2');
require('readline');
require('stream');
require('string_decoder');
require('node:string_decoder');
require('timers/promises');
require('fs/promises');
require('@cypress/request');
require('request-progress');
require('proxy-from-env');
require('yauzl');
require('util');
require('pretty-bytes');

const matchesProject = (record, projectRoot) => {
    return path.resolve(record.projectRoot) === path.resolve(projectRoot);
};
// An undefined pid does not constrain, so an absent filter lists
// every pid.
const matchesSession = (record, session) => {
    return session === undefined || record.pid === session;
};
// A dead pid is skipped without a probe (it proves the writer is gone); the
// survivors carry the live browser CDP state from their probe response.
const probeMatches = (matches, probeTimeoutMs) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const probed = yield Promise.all(matches.map((record) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
        return cli.isPidAlive(record.pid) ? cli.verifySessionRecord(record, probeTimeoutMs) : null;
    })));
    return probed.filter((session) => session !== null);
});
const listLiveSessions = (...args_1) => xvfb.__awaiter(void 0, [...args_1], void 0, function* (options = {}) {
    const records = yield cli.readLiveSessions();
    const matches = records.filter((record) => matchesSession(record, options.session));
    return probeMatches(matches, options.probeTimeoutMs);
});
let lastResolvedIdentity = null;
// Read rather than threaded through every caller: each tap command resolves its
// own session, several of them below this module.
const resolvedSessionIdentity = () => lastResolvedIdentity;
const lowestPid = (sessions) => {
    return [...sessions].sort((a, b) => a.pid - b.pid)[0];
};
const selectSession = (candidates, options) => {
    if (candidates.length === 1) {
        const filtered = options.session !== undefined;
        return { session: candidates[0], reason: filtered ? 'explicit' : 'only' };
    }
    const cwdMatches = candidates.filter((record) => matchesProject(record, options.cwd));
    if (cwdMatches.length > 0) {
        return { session: lowestPid(cwdMatches), reason: 'cwd-match' };
    }
    return { session: lowestPid(candidates), reason: 'arbitrary' };
};
// Reads, filters by pid, and probes for liveness. Throws when nothing matches —
// SESSION_NOT_FOUND for a pid that named nothing, NO_SESSION when none was asked
// for — STALE_SESSION when matches exist but none responds, and
// UNSUPPORTED_BROWSER when every one that does has a browser tap cannot drive.
const liveMatches = (options) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const { session, probeTimeoutMs } = options;
    const records = yield cli.readLiveSessions();
    const matches = records.filter((record) => matchesSession(record, session));
    if (matches.length === 0) {
        throw session === undefined
            ? new cli.distExports.TapError('NO_SESSION')
            : new cli.distExports.SessionNotFoundTapError(session);
    }
    const live = yield probeMatches(matches, probeTimeoutMs);
    if (live.length === 0) {
        throw new cli.distExports.TapError('STALE_SESSION');
    }
    // Dropped before selection so a session running an unsupported browser never
    // shadows one that can serve the command; when it is the only candidate the
    // caller hears why rather than "no browser attached".
    const supported = live.filter((record) => cli.distExports.isTapSupportedBrowser(record.browserFamily));
    if (supported.length === 0) {
        throw new cli.distExports.TapError('UNSUPPORTED_BROWSER');
    }
    return supported;
});
// Resolves a live session without requiring a browser; `status` reports
// sessions that have no browser attached yet.
const resolveLiveSession = (options) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const live = yield liveMatches(options);
    const { session, reason } = selectSession(live, options);
    lastResolvedIdentity = { sessionId: session.sessionId, machineId: session.machineId, userId: session.userId };
    return { session, reason, candidateCount: live.length };
});
// Adds the browser-readiness requirement to resolveLiveSession: the session
// it returns is guaranteed to have a browser attached. Gate on the browser
// before selecting so a browserless session never shadows a ready one that
// could serve the command.
const resolveSession = (options) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const live = yield liveMatches(options);
    const ready = live.filter((record) => record.cdpBrowserWsUrl !== null);
    if (ready.length === 0) {
        throw new cli.distExports.TapError('NO_BROWSER_ATTACHED');
    }
    const { session: selected, reason } = selectSession(ready, options);
    lastResolvedIdentity = { sessionId: selected.sessionId, machineId: selected.machineId, userId: selected.userId };
    return { session: selected, reason, candidateCount: ready.length };
});

/** Bound for a protocol call, including one awaiting app-side work. */
const DEFAULT_CDP_TIMEOUT_MS = 30000;
/**
 * Bound for the calls that locate the runner page. A healthy renderer answers
 * these in milliseconds, so keeping them short is what lets the scan skip an
 * unresponsive target rather than stop on it.
 */
const FIND_SESSION_TIMEOUT_MS = 2000;
// Which call went unanswered is a protocol detail, so it stays on the diagnostic;
// how long we waited is the part the user can act on with `--timeout`.
const unresponsive = (what, ms) => {
    return new cli.distExports.TapError('RENDERER_UNRESPONSIVE', {
        detail: `No response within the specified timeout (${ms}ms).`,
        message: `No reply to ${what} within ${ms}ms.`,
    });
};
const isRendererUnresponsive = (err) => {
    return cli.distExports.isTapError(err) && err.code === 'RENDERER_UNRESPONSIVE';
};
/**
 * A pending CDP reply has no timer of its own, and the only thing that settles
 * one other than a matching reply is the browser-level socket closing — so a
 * target that stops answering leaves the promise orphaned forever. Stop waiting
 * on our side; the orphan settles when the connection closes its client.
 */
const withCdpDeadline = (work, what, ms) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    let timer;
    try {
        return yield Promise.race([
            work,
            new Promise((_resolve, reject) => {
                timer = setTimeout(() => reject(unresponsive(what, ms)), ms);
            }),
        ]);
    }
    finally {
        clearTimeout(timer);
    }
});
/**
 * Every domain shorthand (`client.Runtime.evaluate(...)`) is generated as a call
 * to `client.send`, so replacing that one method bounds every protocol call the
 * connection makes, including the raw-client ones the frame extractors issue. Event
 * subscriptions and `close` don't go through it and stay unbounded.
 */
const boundCdpCalls = (client, ms) => {
    const send = client.send.bind(client);
    client.send = ((method, ...rest) => {
        return withCdpDeadline(send(method, ...rest), method, ms);
    });
};

const debug$5 = Debug('cypress:cli:tap');
// Chrome reports these CDP failures under the generic -32000 "server error"
// protocol code, so the exact message text is the only way to recognize them.
const CdpErrorMessage = {
    objectNotFound: 'Could not find object with given id',
    contextNotFound: 'Cannot find context with specified id',
    contextDestroyed: 'Execution context was destroyed',
    targetGone: 'Inspected target navigated or closed',
    sessionNotFound: 'Session with given id not found',
};
const staleObjectMessages = [CdpErrorMessage.objectNotFound, CdpErrorMessage.contextNotFound, CdpErrorMessage.contextDestroyed];
const sessionGoneMessages = [CdpErrorMessage.targetGone, CdpErrorMessage.sessionNotFound];
const matchesAnyMessage = (err, messages) => {
    return err instanceof Error && messages.some((message) => err.message.includes(message));
};
/**
 * Raises a transport or protocol failure under the code its copy is registered
 * against. `message` is the diagnostic — the call that failed, the version that
 * disagreed — which reaches the logs rather than the rendered output.
 *
 * An unresponsive renderer is reported as itself rather than as whatever call
 * happened to time out: it is the condition worth waiting longer on.
 */
const throwTapError = (code, message, cause) => {
    if (isRendererUnresponsive(cause)) {
        throw cause;
    }
    throw new cli.distExports.TapError(code, { message, cause });
};
// The code is the whole of a failure envelope; `detail` is optional, so a payload
// carrying only a code is well-formed.
const isFailureError = (error) => {
    return !!error && typeof error === 'object' && typeof error.code === 'string';
};
const validateExecResult = (value) => {
    const outcome = value;
    const fail = () => throwTapError('PROTOCOL_MISMATCH', `${cli.distExports.TAP_EXEC_METHOD} returned an unrecognizable result.`);
    if (!outcome || typeof outcome !== 'object')
        return fail();
    if ('error' in outcome)
        return isFailureError(outcome.error) ? outcome : fail();
    if ('result' in outcome)
        return outcome;
    return fail();
};
const isStaleHandleError = (err) => {
    return matchesAnyMessage(err, staleObjectMessages);
};
const isSessionGoneError = (err) => {
    if (!(err instanceof Error)) {
        return false;
    }
    return matchesAnyMessage(err, sessionGoneMessages) || matchesAnyMessage(err.cause, sessionGoneMessages);
};
const connectToBrowser = (wsUrl) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield CRI({ target: wsUrl });
    }
    catch (err) {
        return throwTapError('CDP_UNREACHABLE', `Could not open a debugging connection to the browser: ${err.message}`, err);
    }
});
const listTargets = (client) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield client.Target.getTargets();
    }
    catch (err) {
        return throwTapError('CDP_UNREACHABLE', `Listing the browser's targets failed: ${err.message}`, err);
    }
});
const attachToPage = (client, targetId) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sessionId } = yield client.Target.attachToTarget({ targetId, flatten: true });
        return sessionId;
    }
    catch (err) {
        return throwTapError('CDP_UNREACHABLE', `Could not attach to the Cypress runner page: ${err.message}`, err);
    }
});
const evaluateBinding = (client, sessionId) => {
    return client.Runtime.evaluate({ expression: `window.${cli.distExports.TAP_BINDING_GLOBAL}` }, sessionId);
};
const probeForBinding = (client, sessionId, findSessionMs) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const { result, exceptionDetails } = yield withCdpDeadline(evaluateBinding(client, sessionId), 'the runner-page probe', findSessionMs);
    return !exceptionDetails && result.type !== 'undefined' && !!result.objectId;
});
const findRunnerPageSession = (client, targetInfos, findSessionMs) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    let unresponsive;
    for (const target of targetInfos) {
        if (target.type !== 'page') {
            continue;
        }
        let sessionId;
        try {
            sessionId = yield attachToPage(client, target.targetId);
            if (yield probeForBinding(client, sessionId, findSessionMs)) {
                debug$5('matched runner page target %o', { targetId: target.targetId, url: target.url });
                return sessionId;
            }
        }
        catch (err) {
            if (isRendererUnresponsive(err)) {
                unresponsive = err;
            }
            debug$5('probing target %s failed: %s', target.targetId, err.message);
        }
        if (sessionId) {
            yield client.Target.detachFromTarget({ sessionId }).catch(() => { });
        }
    }
    // A page that never answered the probe is a different failure from a browser
    // holding no runner page at all, and only the former is worth waiting longer on.
    if (unresponsive) {
        throw unresponsive;
    }
    return throwTapError('BINDING_NOT_FOUND', `Failed to connect to the runner page.`);
});
const resolveBindingObjectId = (client, sessionId) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    let evaluated;
    try {
        evaluated = yield evaluateBinding(client, sessionId);
    }
    catch (err) {
        if (isStaleHandleError(err) || isSessionGoneError(err)) {
            throw err;
        }
        return throwTapError('CDP_UNREACHABLE', `Evaluating the tap binding failed: ${err.message}`, err);
    }
    const { result, exceptionDetails } = evaluated;
    if (exceptionDetails) {
        return throwTapError('CDP_UNREACHABLE', `Failed to connect to the session.`);
    }
    if (result.type === 'undefined' || !result.objectId) {
        return throwTapError('BINDING_NOT_FOUND', `Connected to an unsupported session.`);
    }
    return result.objectId;
});
const callBindingMethod = (client, sessionId, objectId, method, args) => {
    return client.Runtime.callFunctionOn({
        objectId,
        functionDeclaration: `function (method, ...args) { return this[method](...args) }`,
        arguments: [method, ...args].map((value) => ({ value })),
        returnByValue: true,
        awaitPromise: true,
    }, sessionId);
};
const throwCdpError = (method, err) => {
    return throwTapError('CDP_UNREACHABLE', `The CDP call for ${method} failed: ${err.message}`, err);
};
const callBindingWithRetry = (client, sessionId, method, args) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const attempt = () => xvfb.__awaiter(void 0, void 0, void 0, function* () {
        const objectId = yield resolveBindingObjectId(client, sessionId);
        try {
            return yield callBindingMethod(client, sessionId, objectId, method, args);
        }
        catch (err) {
            if (isStaleHandleError(err)) {
                throw err;
            }
            return throwCdpError(method, err);
        }
    });
    try {
        return yield attempt();
    }
    catch (err) {
        if (!isStaleHandleError(err)) {
            throw err;
        }
        debug$5('stale binding handle; re-acquiring and retrying once');
        try {
            return yield attempt();
        }
        catch (retryErr) {
            if (isStaleHandleError(retryErr)) {
                return throwTapError('STALE_HANDLE', retryErr.message, retryErr);
            }
            throw retryErr;
        }
    }
});
const withTapConnection = (session, fn, timeoutMs) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const callMs = timeoutMs !== null && timeoutMs !== void 0 ? timeoutMs : DEFAULT_CDP_TIMEOUT_MS;
    const findSessionMs = timeoutMs !== null && timeoutMs !== void 0 ? timeoutMs : FIND_SESSION_TIMEOUT_MS;
    debug$5('opening tap connection for session %o', { pid: session.pid, cdpBrowserWsUrl: session.cdpBrowserWsUrl, callMs, findSessionMs });
    const client = yield connectToBrowser(session.cdpBrowserWsUrl);
    boundCdpCalls(client, callMs);
    try {
        const attach = () => xvfb.__awaiter(void 0, void 0, void 0, function* () {
            const { targetInfos } = yield listTargets(client);
            return findRunnerPageSession(client, targetInfos, findSessionMs);
        });
        let sessionId = yield attach();
        const call = (method_1, ...args_1) => xvfb.__awaiter(void 0, [method_1, ...args_1], void 0, function* (method, args = []) {
            var _a;
            let response;
            try {
                response = yield callBindingWithRetry(client, sessionId, method, args);
            }
            catch (err) {
                if (!isSessionGoneError(err)) {
                    throw err;
                }
                debug$5('session gone (%s); re-attaching to the runner page', err.message);
                sessionId = yield attach();
                try {
                    response = yield callBindingWithRetry(client, sessionId, method, args);
                }
                catch (retryErr) {
                    if (isSessionGoneError(retryErr)) {
                        return throwTapError('STALE_HANDLE', retryErr.message, retryErr);
                    }
                    throw retryErr;
                }
            }
            if (response === null || response === void 0 ? void 0 : response.exceptionDetails) {
                return throwTapError('BINDING_THREW', `${method} threw: ${((_a = response.exceptionDetails.exception) === null || _a === void 0 ? void 0 : _a.description) || response.exceptionDetails.text}`);
            }
            return response.result.value;
        });
        const connection = {
            call,
            client,
            get sessionId() {
                return sessionId;
            },
        };
        return yield fn(connection);
    }
    finally {
        yield client.close().catch(() => { });
    }
});

// The shared formatting vocabulary every tap command's human-readable renderer
// borrows from, so their output reads as one tool: the reporter's palette, its
// state icons, and the table / definition-list / heading / block primitives.
// A renderer composes these into `string[][]` blocks and hands them to `layout`.
// The reporter's own palette (packages/reporter/src/lib/variables.scss and
// commands.scss), so the CLI rendering matches the app: $pass/$fail map to
// jade-400/red-400, assert messages render jade-300/red-400 with jade-200/
// red-300 emphasis, the network dots use the command-message-indicator colors,
// and aliases take the purple badge hue. chalk downsamples the hex values on
// terminals without truecolor.
const color = {
    pass: chalk.hex('#1fa971'), // $jade-400
    fail: chalk.hex('#e45770'), // $red-400
    passMessage: chalk.hex('#69d3a7'), // $jade-300
    passStrong: chalk.hex('#a3e7cb'), // $jade-200
    failStrong: chalk.hex('#f59aa9'), // $red-300
    errHeaderText: chalk.hex('#f59aa9'), // $err-header-text = $red-300
    aborted: chalk.hex('#db7903'), // $orange-400
    warn: chalk.hex('#edbb4a'), // $warn-text = $orange-300
    bad: chalk.hex('#c62b49'), // $red-500
    pending: chalk.hex('#6470f3'), // $indigo-400
    alias: chalk.hex('#c8a7f5'), // $purple-300
    aliasDom: chalk.hex('#9aa2fc'), // $indigo-300 — the reporter colors dom aliases indigo
    muted: chalk.hex('#9095ad'), // $gray-500
    fadedId: chalk.hex('#5a5f7a'), // $gray-700 — event ids sit back from the command numbers
};
const stateBadge = {
    passed: { icon: color.pass('✓'), word: color.pass('passed') },
    failed: { icon: color.fail('✖'), word: color.fail('failed') },
    pending: { icon: color.pending('○'), word: color.pending('pending') },
    skipped: { icon: color.muted('-'), word: color.muted('skipped') },
};
// The app header renders a zero count as `--` (its stats strip's `count`
// helper); skipped has no strip slot there, so it only appears when non-zero.
const count = (num) => (num > 0 ? String(num) : '--');
// The reporter's per-outcome strip: `✓ 2  ✖ 1  ○ 1  - 3`. Shared by the reporter
// header and the status command's results line.
const countsLine = (counts) => {
    return [
        `${stateBadge.passed.icon} ${count(counts.passed)}`,
        `${stateBadge.failed.icon} ${count(counts.failed)}`,
        `${stateBadge.pending.icon} ${count(counts.pending)}`,
        ...(counts.skipped > 0 ? [`${stateBadge.skipped.icon} ${counts.skipped}`] : []),
    ].join('  ');
};
// A dim panel title, optionally carrying its row count: `ROUTES (2)`.
const heading = (title, itemCount) => {
    return chalk.dim(itemCount === undefined ? title : `${title} (${itemCount})`);
};
// A bold title line led by a state/action icon, e.g. `✓ App > loads  passed`.
const titleLine = (icon, text, suffix) => {
    return `${icon} ${chalk.bold(text)}${suffix ? `  ${suffix}` : ''}`;
};
// The clock time a run started, trailing a spec title. Local time reads against
// the terminal's own clock; the ISO instant stays in --json for machines.
const startedAtLabel = (startedAt) => {
    return color.muted(`(started at ${new Date(startedAt).toLocaleTimeString('en-US')})`);
};
// A dim note standing in for an absent panel, e.g. `No specs to run.`
const emptyState = (message) => chalk.dim(message);
// A selector, quoted so it pastes straight back into a shell as one argument.
// Single quotes throughout, since attribute selectors carry double ones
// (`[data-test="x"]`); a single quote in the value becomes `'\''`.
const quoted = (selector) => `'${selector.split('\'').join('\'\\\'\'')}'`;
const indent = (depth) => '  '.repeat(depth);
// The column count to lay a row out against, falling back to a readable width
// when the output is piped and the terminal reports none.
const terminalWidth = () => process.stdout.columns || 120;
// Keep a value on its own row: a soft-wrapped line breaks out of the column it
// was padded into, so anything longer than the room left for it ends in an
// ellipsis. Clamp before coloring, the way the tables pad before coloring.
const clamp = (text, width) => {
    return text.length <= width ? text : `${text.slice(0, Math.max(1, width - 1))}…`;
};
// Pad before coloring: the escape codes chalk adds would otherwise count
// toward the column width. `colorize` styles the padded cells — it also gets the
// row index, since a padded cell no longer compares equal to the value it holds
// — and defaults to leaving them plain for the tables that don't tint a column.
const columns = (header, rows, colorize = (cells) => cells) => {
    const widths = header.map((cell, column) => Math.max(cell.length, ...rows.map((row) => row[column].length)));
    const pad = (cells) => cells.map((cell, column) => cell.padEnd(widths[column]));
    return [
        pad(header).map((cell) => chalk.dim(cell)).join('  '),
        ...rows.map((row, index) => colorize(pad(row), index).join('  ')),
    ];
};
// Columns rendered as a standalone nested block.
const tableRows = (header, rows, colorize) => {
    return columns(header, rows, colorize).map((line) => `${indent(1)}${line}`);
};
// A counted panel title with its content indented beneath it. Content rendered
// on its own — no title to sit under — keeps the left margin.
const panel = (title, count, lines) => {
    return [heading(title, count), ...lines.map((line) => `${indent(1)}${line}`)];
};
// Columns under a counted panel title.
const table = (title, header, rows, colorize) => {
    return panel(title, rows.length, columns(header, rows, colorize));
};
// Aligned `label  value` rows. Values arrive already styled — callers color
// them before padding matters, since only the labels share a column width.
const definitionList = (entries) => {
    const width = Math.max(0, ...entries.map(([label]) => label.length));
    return entries.map(([label, value]) => `  ${label.padEnd(width)}  ${value}`);
};
// Assemble rendered blocks into the final string: lines within a block on their
// own rows, blocks separated by a blank line, trailing whitespace trimmed.
const layout = (blocks) => {
    return blocks.map((block) => block.map((line) => line.trimEnd()).join('\n')).join('\n\n');
};

// dom, aria, and inspect all answer an ambiguous selector the same way, so they
// render it the same way: what went wrong, then the matches. Either column
// re-runs the read — `--at <index>`, or the unique selector.
const renderAmbiguousHuman = (result) => {
    const headline = color.warn(`⚠ selector ${chalk.bold(quoted(result.selector))} matched ${chalk.bold(result.count)} elements but must be unique`);
    const note = color.warn(`provide ${chalk.bold('--at')} with an index to select an element from the list or update the selector.`);
    // Number no further than the session derives selectors for: `*` on a real
    // page matches thousands, and every row past the cap could only ever be a
    // bare index. --at still reads any of them, so say what the list leaves out.
    const numbered = Math.min(result.count, cli.distExports.MAX_DERIVED_SELECTORS);
    // A match no unique selector could be derived for still keeps its row, since
    // --at reads it either way.
    const derived = new Map(result.selectors.flatMap(({ index, selector }) => (selector ? [[index, quoted(selector)]] : [])));
    const rows = Array.from({ length: numbered }, (_, index) => { var _a; return [String(index), (_a = derived.get(index)) !== null && _a !== void 0 ? _a : '-']; });
    const colorize = (cells, index) => (derived.has(index) ? cells : [cells[0], color.muted(cells[1])]);
    const table = [headline, note, ...columns(['index', 'selector'], rows, colorize)];
    // Only a null the session reported says a match has no derivable selector. A
    // list that stops short — the lookup failed, or never reached the app under
    // test — leaves its rows as dashes with nothing known about why, so there is
    // nothing to send the reader back to their selector config over.
    const underivable = result.selectors.some(({ selector }) => !selector);
    const notes = [
        ...(numbered === result.count ? [] : [`showing the first ${numbered} of ${result.count} matches — --at takes any index up to ${result.count - 1}.`]),
        ...(underivable ? ['- means no unique selector could be derived for that match — you may need to adjust your Cypress.ElementSelector config, or the element may be one no standard CSS selector can identify.'] : []),
    ].map((line) => color.muted(line));
    return layout(notes.length ? [table, notes] : [table]);
};

// The title of a hook section of the command log. The hook id in the title is
// the qualifier a duplicated row number needs (`pin r8 h1:1`), since numbers
// restart per section.
const sectionHeading = (hookName, hookId) => {
    const qualifier = hookId ? ` · ${hookId}` : '';
    return heading(`${(hookName !== null && hookName !== void 0 ? hookName : 'commands').toUpperCase()}${qualifier}`);
};
// The reporter's status dot for a network row.
const INDICATORS = {
    successful: color.pass('●'),
    pending: color.pending('○'),
    aborted: color.aborted('●'),
    bad: color.bad('●'),
};
// The reporter's tag palette: dom aliases indigo, everything else
// (route/agent/primitive) purple.
const aliasColor = (aliasType) => (aliasType === 'dom' ? color.aliasDom : color.alias);
// The reporter badges a `.as()` handle with the `@` you'd pass to `cy.get()`, and
// leaves route and agent aliases bare.
const aliasBadge = (alias, aliasType) => {
    const handle = aliasType === 'route' || aliasType === 'agent' ? alias : `@${alias}`;
    return aliasColor(aliasType)(handle);
};
// Driver messages emphasize with markdown-style `**`; render the emphasis
// instead of the markers, on one line.
const emphasize = (message, strong) => {
    return message
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\*\*([^*]+)\*\*/g, (_, part) => strong(part));
};
// The `@name`s a row references (cy.get('@x') / cy.wait('@x')) appear verbatim
// in its message — give them the alias badge color in place.
const colorizeAliasReferences = (message, command) => {
    const { referencedAliases, aliasType } = command;
    if (!(referencedAliases === null || referencedAliases === void 0 ? void 0 : referencedAliases.length)) {
        return message;
    }
    const names = new Set(referencedAliases);
    return message.replace(/@([\w-]+)/g, (match, name) => (names.has(name) ? aliasColor(aliasType)(match) : match));
};
// Asserts take the reporter's state colors — passing green, failing red —
// while other messages keep the default text with bold emphasis.
const formatMessage = (command) => {
    var _a;
    const message = (_a = command.message) !== null && _a !== void 0 ? _a : '';
    if (!message) {
        return '';
    }
    if (command.name === 'assert') {
        if (command.state === 'passed') {
            return color.passMessage(emphasize(message, (part) => color.passStrong.bold(part)));
        }
        if (command.state === 'failed') {
            return color.fail(emphasize(message, (part) => color.failStrong.bold(part)));
        }
    }
    return colorizeAliasReferences(emphasize(message, (part) => chalk.bold(part)), command);
};
// Child commands render dash-prefixed, the way the reporter marks a command
// chained off the previous subject.
const commandLabel = (command) => {
    var _a;
    return `${command.type === 'child' ? '-' : ''}${(_a = command.name) !== null && _a !== void 0 ? _a : ''}`;
};
const networkDot = (network) => {
    return (network === null || network === void 0 ? void 0 : network.indicator) ? `${INDICATORS[network.indicator]} ` : '';
};
// A row's alias badge(s): its own aliases (`.as()` definitions, spy/stub call
// rows) or the alias its request matched.
const aliasSuffix = (command, network) => {
    var _a, _b;
    const badges = (_b = (_a = command.aliases) === null || _a === void 0 ? void 0 : _a.map((name) => aliasBadge(name, command.aliasType))) !== null && _b !== void 0 ? _b : ((network === null || network === void 0 ? void 0 : network.alias) != null ? [aliasBadge(network.alias, 'route')] : []);
    return badges.length ? `  ${badges.join(' ')}` : '';
};
const networkSuffix = (network) => {
    return (network === null || network === void 0 ? void 0 : network.stubbed) ? `  ${chalk.dim('(stubbed)')}` : '';
};
const cleanedSuffix = (command) => {
    return command.cleanedUp ? `  ${chalk.dim('(cleaned up)')}` : '';
};

// The panel's status badge colors: red for a failed session, orange while one
// is being recreated, the reporter's jade otherwise.
const sessionStatus = (status) => {
    if (status === undefined) {
        return '';
    }
    if (status === 'failed') {
        return color.fail(status);
    }
    if (status.startsWith('recreat')) {
        return color.aborted(status);
    }
    return color.passMessage(status);
};
const sessionsPanel = (sessions) => {
    return [
        heading('SESSIONS', sessions.length),
        ...sessions.map((session) => {
            const global = session.global ? `  ${chalk.dim('(global)')}` : '';
            return `  ${session.name}${global}  ${sessionStatus(session.status)}`;
        }),
    ];
};
const agentsTable = (agents) => {
    const rows = agents.map((agent) => {
        var _a, _b, _c;
        return [
            (_a = agent.type) !== null && _a !== void 0 ? _a : '',
            (_b = agent.functionName) !== null && _b !== void 0 ? _b : '',
            ((_c = agent.aliases) !== null && _c !== void 0 ? _c : []).join(', '),
            agent.callCount ? String(agent.callCount) : '-',
        ];
    });
    return table('SPIES / STUBS', ['TYPE', 'FUNCTION', 'ALIAS(ES)', 'CALLS'], rows, (cells) => {
        return [chalk.bold(cells[0]), cells[1], color.alias(cells[2]), cells[3]];
    });
};
const routesTable = (routes) => {
    const rows = routes.map((route) => {
        var _a, _b, _c;
        return [
            (_a = route.method) !== null && _a !== void 0 ? _a : '',
            (_b = route.url) !== null && _b !== void 0 ? _b : '',
            route.stubbed ? 'yes' : 'no',
            (_c = route.alias) !== null && _c !== void 0 ? _c : '',
            route.numResponses ? String(route.numResponses) : '-',
        ];
    });
    return table('ROUTES', ['METHOD', 'MATCHER', 'STUBBED', 'ALIAS', '#'], rows, (cells) => {
        return [
            chalk.bold(cells[0]),
            cells[1],
            cells[2].startsWith('yes') ? color.aborted(cells[2]) : cells[2],
            color.alias(cells[3]),
            cells[4],
        ];
    });
};
// Consecutive rows sharing a hookId form one section, preserving the true
// chronology of the log rather than re-bucketing it.
const sectionize = (commands) => {
    const sections = [];
    for (const command of commands) {
        const current = sections[sections.length - 1];
        if (current && current.hookId === command.hookId) {
            current.rows.push(command);
        }
        else {
            sections.push({ hookId: command.hookId, rows: [command] });
        }
    }
    return sections;
};
const isEventRow = (command) => {
    return command.event === true || command.type === 'system';
};
const stateSuffix = (command) => {
    if (command.state === 'failed') {
        return ` ${color.fail('✖')}`;
    }
    if (command.state === 'pending') {
        return ` ${chalk.dim('…')}`;
    }
    return '';
};
const rowParts = (command) => {
    var _a;
    return {
        groupIndent: '  '.repeat((_a = command.groupLevel) !== null && _a !== void 0 ? _a : 0),
        dot: networkDot(command.network),
        message: formatMessage(command),
        cleaned: cleanedSuffix(command),
    };
};
// Event logs render the way the reporter shows them: labeled by their display
// name, as an annotation of the surrounding command — but with their own tap id,
// so an xhr or uncaught-exception row is referenceable like any command. A
// failed event (an uncaught exception) takes the failure red, like the reporter.
const renderEventRow = (command, idWidth) => {
    var _a, _b;
    const { groupIndent, dot, message, cleaned } = rowParts(command);
    const failed = command.state === 'failed';
    const labelColor = failed ? color.fail : chalk.dim;
    const label = labelColor(`(${(_b = (_a = command.displayName) !== null && _a !== void 0 ? _a : command.name) !== null && _b !== void 0 ? _b : '?'})`);
    const id = color.fadedId(command.id.padStart(idWidth));
    const text = failed ? color.fail(chalk.italic(message)) : chalk.italic(message);
    return `  ${id}  ${groupIndent}  ${label} ${dot}${text}${aliasSuffix(command, command.network)}${networkSuffix(command.network)}${stateSuffix(command)}${cleaned}`;
};
const renderCommandRow = (command, idWidth, nameWidth) => {
    const { groupIndent, dot, message, cleaned } = rowParts(command);
    const id = chalk.dim(command.id.padStart(idWidth));
    const name = commandLabel(command).padEnd(nameWidth);
    const styledName = command.state === 'failed' ? color.fail.bold(name) : chalk.bold(name);
    return `  ${id}  ${groupIndent}${styledName}  ${dot}${message}${aliasSuffix(command, command.network)}${networkSuffix(command.network)}${stateSuffix(command)}${cleaned}`;
};
const renderRow = (command, idWidth, nameWidth) => {
    return isEventRow(command)
        ? renderEventRow(command, idWidth)
        : renderCommandRow(command, idWidth, nameWidth);
};
const renderSection = (section, hookName, idWidth) => {
    const commandRows = section.rows.filter((command) => !isEventRow(command));
    const nameWidth = Math.max(0, ...commandRows.map((command) => commandLabel(command).length));
    return [
        sectionHeading(hookName, section.hookId),
        ...section.rows.map((command) => renderRow(command, idWidth, nameWidth)),
    ];
};
// One hook section on its own, for the surfaces that show a slice of the command
// log rather than a whole attempt (the pinned command). Ids align within the
// rows given, since there is no wider log to line up with.
const renderCommandSection = (rows, hookName) => {
    var _a;
    const idWidth = Math.max(2, ...rows.map((command) => command.id.length));
    return renderSection({ hookId: (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.hookId, rows }, hookName !== null && hookName !== void 0 ? hookName : 'commands', idWidth);
};
// The reporter's error panel: name, message, and the code frame with its
// `>`-marked failing line.
const renderError = (error) => {
    var _a;
    const lines = [`${color.fail('✖')} ${color.fail.bold((_a = error.name) !== null && _a !== void 0 ? _a : 'Error')}`];
    if (error.message) {
        lines.push(...error.message.split('\n').map((line) => `  ${color.errHeaderText(line)}`));
    }
    const { codeFrame } = error;
    if (codeFrame === null || codeFrame === void 0 ? void 0 : codeFrame.file) {
        lines.push('', `  ${chalk.dim([codeFrame.file, codeFrame.line, codeFrame.column].filter((part) => part != null).join(':'))}`);
    }
    if (codeFrame === null || codeFrame === void 0 ? void 0 : codeFrame.frame) {
        lines.push(...codeFrame.frame.replace(/\n+$/, '').split('\n').map((line) => {
            return `  ${line.startsWith('>') ? color.fail(line) : color.muted(line)}`;
        }));
    }
    return lines;
};
const renderReporterHuman = (view) => {
    const { icon, word } = stateBadge[view.test.state];
    const hookNames = new Map(view.hooks.map(({ hookId, hookName }) => [hookId, hookName]));
    const sections = sectionize(view.commands);
    const idWidth = Math.max(2, ...view.commands.map((command) => command.id.length));
    const blocks = [
        [titleLine(icon, view.test.fullTitle, word)],
        ...(view.sessions.length ? [sessionsPanel(view.sessions)] : []),
        ...(view.agents.length ? [agentsTable(view.agents)] : []),
        ...(view.routes.length ? [routesTable(view.routes)] : []),
        ...sections.map((section) => { var _a, _b; return renderSection(section, (_b = hookNames.get((_a = section.hookId) !== null && _a !== void 0 ? _a : '')) !== null && _b !== void 0 ? _b : 'commands', idWidth); }),
    ];
    if (!view.commands.length) {
        blocks.push([emptyState('No commands were logged for this test.')]);
    }
    if (view.error) {
        blocks.push(renderError(view.error));
    }
    return layout(blocks);
};
// The reporter header's clock format (packages/reporter/src/lib/util.ts
// formatDuration, inlined — the CLI can't import the reporter bundle).
const formatDuration = (duration) => {
    if (!duration) {
        return '--';
    }
    if (duration < 1000) {
        return `${duration}ms`;
    }
    const seconds = Math.round(duration / 1000);
    const displaySeconds = String(seconds % 60).padStart(2, '0');
    const displayMinutes = String(Math.floor((seconds / 60) % 60)).padStart(2, '0');
    const displayHours = String(Math.floor(seconds / (60 * 60)));
    return displayHours === '0' ? `${displayMinutes}:${displaySeconds}` : `${displayHours}:${displayMinutes}:${displaySeconds}`;
};
const statsLine = (stats) => {
    return `${countsLine(stats)}  ${chalk.dim(formatDuration(stats.duration))}`;
};
// Sub-second durations keep their ms precision; longer ones read as seconds,
// the way the run-mode spec output reports test times.
const testDuration = (duration) => {
    if (duration == null) {
        return '';
    }
    return `  ${chalk.dim(duration < 1000 ? `${duration}ms` : `${+(duration / 1000).toFixed(1)}s`)}`;
};
const renderSpecTests = (tests, indent) => {
    return tests.flatMap((test) => {
        var _a, _b;
        // Only a retried test carries attempts, so the count is always 2 or more.
        const attempts = ((_a = test.attempts) === null || _a === void 0 ? void 0 : _a.length) ? `  ${color.aborted(`(${test.attempts.length} attempts)`)}` : '';
        return [
            `${indent}${chalk.dim(test.id.padStart(3))}  ${stateBadge[test.state].icon} ${test.title}${testDuration(test.duration)}${attempts}`,
            // Nested under the title, the way the app reporter lists a retried
            // test's attempts; the id column stays empty so the rows read as one test.
            ...((_b = test.attempts) !== null && _b !== void 0 ? _b : []).map((attempt) => {
                return `${indent}       ${stateBadge[attempt.state].icon} ${chalk.dim(`attempt ${attempt.attempt}`)}${testDuration(attempt.duration)}`;
            }),
        ];
    });
};
// The app reporter renders each suite as its own section headed by the full
// suite path — depth shows in the breadcrumb, not in indentation. The wire shape
// is already flattened that way: one entry per suite with direct tests, title
// pre-joined. Titles keep the case the spec wrote them in, so they can be pasted
// into a case-sensitive search; only the hook sections are upper-cased, since
// those names are ours rather than the author's.
const specSuiteSections = (suites) => {
    return suites.map((suite) => [heading(suite.title), ...renderSpecTests(suite.tests, '  ')]);
};
const renderReporterSpecHuman = (view) => {
    const specTitle = view.startedAt ? `${chalk.bold(view.spec)}  ${startedAtLabel(view.startedAt)}` : chalk.bold(view.spec);
    const header = [
        ...(view.spec ? [specTitle] : []),
        statsLine(view.stats),
    ];
    const sections = [
        ...(view.tests.length ? [renderSpecTests(view.tests, '  ')] : []),
        ...specSuiteSections(view.suites),
    ];
    const blocks = [
        header,
        ...(sections.length ? sections : [[emptyState('No tests were found in this spec.')]]),
    ];
    return layout(blocks);
};

// The run command starts a spec and returns immediately (poll `status` for
// progress), so this confirms what was launched rather than reporting an outcome.
const renderRunHuman = (result) => {
    return layout([
        [titleLine(color.pass('▶'), result.spec)],
        definitionList([
            ['testing type', result.testingType],
            ['browser', result.browser],
        ]),
    ]);
};

// An open browser reads by its name alone only when tap can actually drive it;
// each way that can fail — a browser tap does not support, one it has lost its
// connection to, one whose page will not answer — is the state every other
// command fails in, so each says which.
const browserState = (session) => {
    if (session.browserSupported === false) {
        return 'unsupported';
    }
    if (session.browserAttached === false) {
        return 'not attached';
    }
    return session.rendererResponsive === false ? 'not responding' : null;
};
const browserCell = (session) => {
    if (session.browserName === null) {
        return '—';
    }
    const state = browserState(session);
    return state === null ? session.browserName : `${session.browserName} (${state})`;
};
const browserColor = (session) => {
    if (session.browserName === null) {
        return color.muted;
    }
    const state = browserState(session);
    if (state === null) {
        return color.pass;
    }
    return state === 'unsupported' ? color.warn : color.aborted;
};
// One row per session. PID is bold — it's the handle the other tap commands
// accept via `--session` — and an attached browser reads green by its name, an
// absent one (or testing type) as a muted dash.
const sessionColumns = (sessions) => {
    const rows = sessions.map((session) => {
        var _a;
        return [
            String(session.pid),
            session.projectRoot,
            (_a = session.testingType) !== null && _a !== void 0 ? _a : '—',
            browserCell(session),
        ];
    });
    return columns(['PID', 'PROJECT', 'TYPE', 'BROWSER'], rows, (cells, index) => [
        chalk.bold(cells[0]),
        cells[1],
        cells[2],
        browserColor(sessions[index])(cells[3]),
    ]);
};
// The reachable open-mode sessions under a counted heading.
const renderSessionsHuman = (sessions) => {
    return layout([panel('SESSIONS', sessions.length, sessionColumns(sessions))]);
};

// A flat, headed list of runnable specs. The git last-modified time trails each
// path, aligned into a muted column; the machine-facing timestamp stays in --json.
// An empty project keeps the same `SPECS (n)` frame so the shape reads the same
// whether or not any specs exist.
const renderSpecsHuman = (specs) => {
    if (!specs.length) {
        return layout([[heading('SPECS', 0), `  ${emptyState('[EMPTY PROJECT]')}`]]);
    }
    const width = Math.max(...specs.map((spec) => spec.relativePath.length));
    const rows = specs.map((spec) => {
        const modified = spec.lastModified ? `  ${color.muted(spec.lastModified)}` : '';
        return `  ${spec.relativePath.padEnd(width)}${modified}`;
    });
    return layout([[heading('SPECS', specs.length), ...rows]]);
};

/** The pin glyph every pin line leads with — pinned, cleared, or failed to clear. */
const PIN_ICON = '⚲';
// A pin reads as its own reporter row: which snapshot of the command is showing,
// then the row itself under its hook section, exactly as `reporter` prints it.
// Shared so `pin` and `status` can't drift.
const pinnedBlock = (view) => {
    const { index, total, name } = view.at;
    const snapshot = `(${index}/${total})${name ? ` ${name}` : ''}`;
    return [
        color.alias(`${PIN_ICON} PINNED - ${snapshot}`),
        ...renderCommandSection([view.command], view.hookName),
    ];
};

// The lifecycle phase's dot and tint: a filled green/red check for a finished
// run, indigo while running, a muted ring for the pre-run "coming up" stages.
const PHASE = {
    passed: { icon: stateBadge.passed.icon, tint: color.pass },
    failed: { icon: stateBadge.failed.icon, tint: color.fail },
    running: { icon: color.pending('●'), tint: color.pending },
};
const phaseOf = (status) => { var _a; return (_a = PHASE[status]) !== null && _a !== void 0 ? _a : { icon: color.muted('●'), tint: color.muted }; };
// Where the session is: the selected spec led by its phase icon and trailed by
// the run's start time, or — before a spec is selected — the phase on its own.
// The icon carries the phase over a spec, so the line doesn't also spell it out.
const phaseLine = (status) => {
    const { icon, tint } = phaseOf(status.status);
    if (!status.spec) {
        return `${icon} ${tint(status.status)}`;
    }
    return titleLine(icon, status.spec, status.startedAt ? startedAtLabel(status.startedAt) : undefined);
};
const renderStatusHuman = (status) => {
    var _a, _b;
    const { pid, projectRoot } = status;
    // Nothing to target — the phase is the whole answer.
    if (pid === undefined || projectRoot === undefined) {
        return phaseLine(status);
    }
    const session = {
        pid,
        projectRoot,
        testingType: (_a = status.testingType) !== null && _a !== void 0 ? _a : null,
        browserName: (_b = status.browserName) !== null && _b !== void 0 ? _b : null,
        browserAttached: status.browserAttached,
    };
    const progress = [phaseLine(status)];
    if (status.results) {
        progress.push(countsLine(status.results));
    }
    const blocks = [sessionColumns([session]), progress];
    // A spec that failed to build has no results to show, so the failure is the
    // only thing the run has to say.
    if (status.error) {
        blocks.push([color.fail(status.error)]);
    }
    if (status.pinned) {
        blocks.push(pinnedBlock(status.pinned));
    }
    return layout(blocks);
};

/**
 * `outerHTML` starts at the element but its inner lines keep the indentation
 * they had in the document, so a deeply nested element arrives ragged — first
 * line at the margin, the rest pushed right. Removing the smallest indent they
 * all share pulls the markup back to the margin without touching its internal
 * shape. Rendering-only: `--json` keeps the document's own whitespace.
 */
const dedent = (html) => {
    const [first, ...rest] = html.split('\n');
    const shared = rest
        .filter((line) => line.trim().length)
        .reduce((min, line) => Math.min(min, line.length - line.trimStart().length), Infinity);
    if (!rest.length || shared === Infinity || shared === 0) {
        return html;
    }
    return [first, ...rest.map((line) => line.slice(shared))].join('\n');
};
// Nothing but the HTML — no title framing it, so the output reads (and pipes)
// as the markup it is. A browser-side clip still adds a muted trailer, since
// silently handing back half a document would be worse than a little furniture.
const renderDomHuman = (result) => {
    if (result.found === false) {
        return emptyState('No element matched the selector.');
    }
    return layout([
        ...(result.html !== undefined ? [[dedent(result.html)]] : []),
        ...(result.truncated ? [[color.muted('(output truncated)')]] : []),
    ]);
};

// One node per line, indented by its own depth so the root sits flush: bold
// role, then its accessible name, an `= value` for value-bearing controls, and
// any notable states as a muted bracketed list — the compact role/name tree
// DevTools shows.
const renderNode = (node) => {
    var _a;
    const name = node.name ? `  ${node.name}` : '';
    const value = node.value !== undefined ? ` = ${node.value}` : '';
    const states = ((_a = node.states) === null || _a === void 0 ? void 0 : _a.length) ? `  ${color.muted(`[${node.states.join(', ')}]`)}` : '';
    return `${indent(node.depth)}${chalk.bold(node.role)}${name}${value}${states}`;
};
const renderAriaHuman = (result) => {
    if (!result.nodes.length) {
        return emptyState('No accessibility nodes found.');
    }
    const blocks = [result.nodes.map(renderNode)];
    if (result.truncated) {
        blocks.push([color.muted('(output truncated)')]);
    }
    return layout(blocks);
};

// A record renders as a counted heading over an aligned key/value list; an empty
// or absent record contributes no block.
const recordBlock = (title, record) => {
    const entries = Object.entries(record !== null && record !== void 0 ? record : {});
    return entries.length ? [[heading(title, entries.length), ...definitionList(entries)]] : [];
};
const ariaBlock = (aria) => {
    var _a;
    const rows = [
        ['role', aria === null || aria === void 0 ? void 0 : aria.role],
        ['name', aria === null || aria === void 0 ? void 0 : aria.name],
        ['states', ((_a = aria === null || aria === void 0 ? void 0 : aria.states) === null || _a === void 0 ? void 0 : _a.length) ? aria.states.join(', ') : undefined],
    ];
    const entries = rows.filter((row) => row[1] !== undefined);
    return entries.length ? [[heading('ACCESSIBILITY'), ...definitionList(entries)]] : [];
};
const boxBlock = (box) => {
    return box ? [[heading('BOX'), `  x ${box.x}   y ${box.y}   width ${box.width}   height ${box.height}`]] : [];
};
const renderInspectHuman = (result) => {
    if (!result.found) {
        return `${chalk.bold(quoted(result.selector))}  ${color.muted('not found')}`;
    }
    return layout([
        ...recordBlock('ATTRIBUTES', result.attributes),
        ...ariaBlock(result.aria),
        ...boxBlock(result.box),
        ...recordBlock('STYLES', result.styles),
    ]);
};

// A pin prints the same block wherever it's reported, so `pin` and `status`
// agree; `--clear` has nothing to show but whether the pin let go.
const renderCleared = (result) => {
    return result.cleared
        ? chalk.dim(`${PIN_ICON} PIN CLEARED`)
        : color.fail(`${PIN_ICON} FAILED TO CLEAR PIN`);
};
const renderPinHuman = (result) => {
    return 'pinned' in result ? layout([pinnedBlock(result.pinned)]) : renderCleared(result);
};

// A command's console properties are the deepest payload the tap returns — a
// `cy.request` row carries its matcher, request, response and every header of
// each. Printed whole it is pages of indentation, so this renders the shape
// first, the way the browser console panel opens collapsed: a few levels expand,
// and a section that is deeper or too long to read at a glance is summarized as
// `{n keys}` / `[n items]` until --depth asks for it. The full payload is one
// --json away.
// Deep enough that a request's matcher, its response and that response's body
// all read without asking, since a payload is usually consulted for something
// several levels in. The row budget below is what keeps that from running away.
const DEFAULT_DEPTH = 3;
// A header map runs to twenty-odd rows and buries everything around it, so the
// default view folds any section that long however shallow it sits. An explicit
// --depth is taken at its word and lifts the cap: it asked for levels, not for a
// judgement about size.
const DEFAULT_ROW_BUDGET = 8;
// However narrow the terminal, a value keeps enough room to be worth reading.
const MIN_VALUE_WIDTH = 24;
// Console prop labels are short prose (`Request Headers`); anything past this is
// a key carrying data, and it does not get to own the level's whole row.
const MAX_KEY_WIDTH = 32;
const isRecord = (value) => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};
const isContainer = (value) => typeof value === 'object' && value !== null;
// The serializer names a value too long to ship by its length rather than
// returning it (see the driver's `withheld`); color the marker so it doesn't
// read as content.
const WITHHELD = /^\[[\d,]+ characters? withheld — pass --json to include it\]$/;
// A response body or stack trace carries its own newlines; inlining it would
// break the aligned column, so it reads as a block under its key.
const isBlock = (value) => typeof value === 'string' && value.includes('\n');
// A response body or header value arrives with whatever bytes the server sent.
// A tab re-tabulates the row and a lone carriage return overwrites it, so on a
// row — where the alignment is the only thing holding the output together — they
// read as spaces. Escape codes are dropped rather than passed through: they would
// tint a row the renderer never meant to and their bytes count toward the clamp.
const onOneRow = (text) => {
    let sanitized = '';
    for (let index = 0; index < text.length; index++) {
        const code = text.charCodeAt(index);
        if (code === 0x1B && text.charCodeAt(index + 1) === 0x5B) {
            let end = index + 2;
            while (end < text.length) {
                const sequenceCode = text.charCodeAt(end);
                const isParameter = (sequenceCode >= 0x30 && sequenceCode <= 0x39) || sequenceCode === 0x3B;
                const isTerminator = (sequenceCode >= 0x41 && sequenceCode <= 0x5A)
                    || (sequenceCode >= 0x61 && sequenceCode <= 0x7A);
                if (isTerminator) {
                    index = end;
                    break;
                }
                if (!isParameter) {
                    break;
                }
                end++;
            }
            if (index === end) {
                continue;
            }
        }
        sanitized += code <= 0x09 || (code >= 0x0B && code <= 0x1F) ? ' ' : text[index];
    }
    return sanitized;
};
// A key is always one row, newline or not — the control range above spares `\n`
// for the values that render as a block under their key.
const asKey = (text) => onOneRow(text).replace(/\n/g, ' ').trim();
const scalarInline = (value) => {
    if (value === null) {
        return { text: 'null', style: chalk.dim };
    }
    const text = onOneRow(String(value));
    if (typeof value === 'string' && WITHHELD.test(text)) {
        return { text, style: color.aborted };
    }
    if (!text.length) {
        return { text: '(empty string)', style: chalk.dim };
    }
    return { text, clampable: true };
};
const emptyContainerInline = (value) => {
    if (Array.isArray(value) && !value.length) {
        return { text: '[]', style: chalk.dim };
    }
    if (isRecord(value) && !Object.keys(value).length) {
        return { text: '{}', style: chalk.dim };
    }
    return undefined;
};
// What a collapsed container reads as: its size, so the shape is still legible
// and the cost of expanding it is known before you do.
const summaryInline = (value) => {
    const isArray = Array.isArray(value);
    const size = isArray ? value.length : Object.keys(value).length;
    const unit = isArray ? 'item' : 'key';
    const [open, close] = isArray ? ['[', ']'] : ['{', '}'];
    return { text: `${open}${size} ${unit}${size === 1 ? '' : 's'}${close}`, style: chalk.dim };
};
// A cell keeps the column alignment that makes a table readable, so it stays one
// line of bounded width.
const MAX_CELL = 40;
const cell = (value) => {
    if (value === undefined) {
        return '';
    }
    if (Array.isArray(value)) {
        return '[…]';
    }
    if (isRecord(value)) {
        return '{…}';
    }
    // A cell cannot hold the newlines of a multi-line value: they would end the
    // row the table is aligning.
    const text = String(value).replace(/\s+/g, ' ').trim();
    return WITHHELD.test(text) ? text : clamp(text, MAX_CELL);
};
// Rows of like-shaped objects are what the driver's `table` console prop holds
// (its keyboard/mouse event tables) — render them the way the reporter renders a
// table, the row keys themselves as the column headers. A lone row reads better
// as plain key/values, so it is left to the caller.
const rowsTable = (values, indent) => {
    if (values.length < 2 || !values.every(isRecord)) {
        return undefined;
    }
    const columnKeys = [...new Set(values.flatMap((row) => Object.keys(row)))];
    if (!columnKeys.length) {
        return undefined;
    }
    const rows = values.map((row) => columnKeys.map((column) => cell(row[column])));
    // Cells are plain here, so coloring them after padding is a no-op width-wise;
    // the withheld marker still needs its hue.
    return tableRows(columnKeys, rows, (cells) => cells.map((text) => (WITHHELD.test(text.trim()) ? color.aborted(text) : text)))
        .map((line) => `${indent}${line}`);
};
const entriesOf = (value) => {
    return Array.isArray(value)
        ? value.map((item, index) => [String(index + 1), item])
        : Object.entries(value);
};
const createPropsRenderer = (maxDepth, rowBudget) => {
    let collapsedCount = 0;
    const block = (text, indent) => blockLines(text, indent);
    const rows = (values, indent) => rowsTable(values, indent);
    // Scalars align in one column with their sibling scalars; a container gets its
    // own key line with its children indented beneath it, so nesting reads as
    // structure rather than punctuation.
    const renderProps = (value, level) => {
        const indent = '  '.repeat(level + 1);
        const childIndent = '  '.repeat(level + 2);
        const entries = entriesOf(value);
        const inlined = new Map(entries.flatMap(([key, child]) => {
            if (isBlock(child)) {
                return [];
            }
            if (!isContainer(child)) {
                return [[key, scalarInline(child)]];
            }
            const empty = emptyContainerInline(child);
            if (empty) {
                return [[key, empty]];
            }
            if (level < maxDepth && entriesOf(child).length <= rowBudget) {
                return [];
            }
            collapsedCount++;
            return [[key, summaryInline(child)]];
        }));
        // One outlier key would otherwise push every value on the level out past the
        // terminal, so the column it shares stops at a width a row can carry.
        const label = (key) => clamp(asKey(key) || '(empty key)', MAX_KEY_WIDTH);
        const width = Math.max(0, ...[...inlined.keys()].map((key) => label(key).length));
        const valueWidth = Math.max(MIN_VALUE_WIDTH, terminalWidth() - indent.length - width - 2);
        return entries.flatMap(([key, child]) => {
            const inline = inlined.get(key);
            const keyLine = `${indent}${chalk.dim(label(key))}`;
            if (inline) {
                const text = inline.clampable ? clamp(inline.text, valueWidth) : inline.text;
                return [`${indent}${chalk.dim(label(key).padEnd(width))}  ${inline.style ? inline.style(text) : text}`];
            }
            if (isBlock(child)) {
                return [keyLine, ...block(child, childIndent)];
            }
            const table = Array.isArray(child) ? rows(child, indent) : undefined;
            return [keyLine, ...(table !== null && table !== void 0 ? table : renderProps(child, level + 1))];
        });
    };
    return { renderProps, block, rows, collapsedCount: () => collapsedCount };
};
const blockLines = (text, indent) => {
    const width = Math.max(MIN_VALUE_WIDTH, terminalWidth() - indent.length);
    // A body split on its newlines still carries the `\r` of a CRLF payload, which
    // would drag the cursor back over the line it just printed.
    return text.split('\n').map((line) => `${indent}${clamp(onOneRow(line), width)}`);
};
const readDepth = (value) => {
    const byDefault = { depth: DEFAULT_DEPTH, rowBudget: DEFAULT_ROW_BUDGET };
    if (value === undefined) {
        return byDefault;
    }
    if (value.toLowerCase() === 'all') {
        return { depth: Infinity, rowBudget: Infinity };
    }
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) {
        return Object.assign(Object.assign({}, byDefault), { note: `--depth takes a whole number or "all"; showing depth ${DEFAULT_DEPTH}.` });
    }
    return { depth: parsed, rowBudget: Infinity };
};
// The driver wraps every log's console properties in a fixed envelope
// (see wrapConsoleProps): the command's own key/values live under `props`, with
// `table`/`groups`/`error`/`args` as siblings. Rendering the envelope rather
// than the raw payload is what lifts the interesting keys to the top level, the
// way the browser console panel shows them.
const ENVELOPE_KEYS = new Set(['name', 'type', 'props', 'table', 'groups', 'error', 'args']);
const propsHeader = () => heading('CONSOLE PROPS');
// The reporter's failure palette (see its error panel): a red title over the
// lighter hue it prints a failure's own text in.
const ERROR_TINT = { title: color.fail, line: color.errHeaderText };
// An envelope key beside `props`, as its own titled section. A tinted section
// colors its title and its lines — the error arrives as a stack, so what carries
// the color is the block, not a props tree.
const extraSection = (title, value, render, tint) => {
    if (value == null) {
        return [];
    }
    const sectionTitle = tint ? tint.title(title) : heading(title);
    if (isContainer(value)) {
        return emptyContainerInline(value) ? [] : [[sectionTitle, ...render.renderProps(value, 0)]];
    }
    const lines = render.block(String(value), '  ');
    return [[sectionTitle, ...(tint ? lines.map((line) => tint.line(line)) : lines)]];
};
// Each table the driver logged is a slot in `table`, keyed by the order it
// should render in and carrying its own display name — the reporter's tables,
// straight across.
const tableSections = (value, render) => {
    if (!isRecord(value)) {
        return extraSection('TABLE', value, render);
    }
    return Object.keys(value)
        .sort((a, b) => Number(a) - Number(b))
        .flatMap((slot) => {
        const entry = value[slot];
        if (!isRecord(entry)) {
            return [];
        }
        const title = (typeof entry.name === 'string' ? entry.name : `table ${slot}`).toUpperCase();
        const data = entry.data;
        const table = Array.isArray(data) ? render.rows(data, '') : undefined;
        if (table) {
            return [[heading(title, data.length), ...table]];
        }
        const body = isContainer(data) ? data : entry;
        return [[heading(title), ...render.renderProps(body, 0)]];
    });
};
const collapsedFooter = (count) => {
    if (!count) {
        return [];
    }
    const sections = `${count} section${count === 1 ? '' : 's'}`;
    return [[chalk.dim(`${sections} collapsed — open all of it with --depth all`)]];
};
// A section can be present and hold nothing. A heading with a void under it
// reads as a rendering bug, so the emptiness is stated.
const withBody = (lines) => {
    return lines.length ? lines : [`  ${emptyState('(nothing here)')}`];
};
const renderConsolePropsHuman = (envelope, options = {}) => {
    if (!Object.keys(envelope).length) {
        return emptyState('This command logged no console properties.');
    }
    const { depth, rowBudget, note } = readDepth(options.depth);
    const noteBlock = note ? [[emptyState(note)]] : [];
    const render = createPropsRenderer(depth, rowBudget);
    const props = envelope.props;
    // A payload with no envelope — the driver's stand-in for a command whose
    // details it has since evicted — is rendered as it arrives.
    if (!isRecord(props)) {
        return layout([[heading('CONSOLE PROPS'), ...withBody(render.renderProps(envelope, 0))], ...collapsedFooter(render.collapsedCount()), ...noteBlock]);
    }
    const { table: tables, groups, error, args } = envelope;
    const unexpected = Object.fromEntries(Object.entries(envelope).filter(([key]) => !ENVELOPE_KEYS.has(key)));
    return layout([
        [propsHeader(), ...withBody(render.renderProps(props, 0))],
        ...(tables === undefined ? [] : tableSections(tables, render)),
        ...(groups === undefined ? [] : extraSection('GROUPS', groups, render)),
        ...(args === undefined ? [] : extraSection('ARGS', args, render)),
        ...(error === undefined ? [] : extraSection('ERROR', error, render, ERROR_TINT)),
        ...(Object.keys(unexpected).length ? extraSection('OTHER', unexpected, render) : []),
        ...collapsedFooter(render.collapsedCount()),
        ...noteBlock,
    ]);
};

// The reporter's inline network detail, expanded into its own panel: the row
// message already summarizes the request, so this is where the parts a consumer
// might act on — matcher, status, alias — read individually. Ordered the way the
// reporter's ROUTES table columns are.
const networkEntries = (network) => {
    const entries = [];
    const add = (label, value) => {
        if (value) {
            entries.push([label, value]);
        }
    };
    add('METHOD', network.method && chalk.bold(network.method));
    add('URL', network.url);
    add('STATUS', network.status != null ? String(network.status) : undefined);
    add('INDICATOR', network.indicator && `${networkDot(network)}${network.indicator}`);
    add('STUBBED', network.stubbed === undefined ? undefined : network.stubbed ? color.aborted('yes') : 'no');
    add('RESPONSES', network.numResponses != null ? String(network.numResponses) : undefined);
    add('ALIAS', network.alias && color.alias(`@${network.alias}`));
    return entries;
};
// One command rendered as the reporter renders its row — state icon, id, name
// (dash-prefixed when chained), network dot, styled message, alias badge — with
// the state spelled out the way the reporter's test header does. A row with no
// state yet (a route registration) simply has no icon and no word.
const entryHeader = (entry) => {
    const state = entry.state ? stateBadge[entry.state] : undefined;
    const name = commandLabel(entry);
    const styledName = entry.state === 'failed' ? color.fail.bold(name) : chalk.bold(name);
    // Unlike the reporter's log, a lone row has no columns to align to, so the
    // parts a row happens to lack close up instead of leaving a gap.
    const head = [
        state === null || state === void 0 ? void 0 : state.icon,
        entry.id && chalk.dim(entry.id),
        styledName,
        `${networkDot(entry.network)}${formatMessage(entry)}`.trim(),
    ].filter(Boolean).join('  ');
    const suffixes = `${aliasSuffix(entry, entry.network)}${networkSuffix(entry.network)}${cleanedSuffix(entry)}`;
    return `${head}${suffixes}${state ? `  ${state.word}` : ''}`;
};
// Which section of the reporter panel the row sits under, printed above it as
// the reporter's own log prints its section titles — the context a lone row has
// no way to show, and what its `<hookId>:<number>` handle qualifies.
const hookLine = (hook) => sectionHeading(hook.hookName, hook.hookId);
// Wall clock rather than an offset: a snapshot's time is only useful lined up
// against something else — another command's snapshots, a server log — and the
// row itself carries no start to offset from.
const snapshotTime = (timestamp) => {
    if (timestamp === undefined) {
        return '—';
    }
    const at = new Date(timestamp);
    const clock = [at.getHours(), at.getMinutes(), at.getSeconds()].map((part) => String(part).padStart(2, '0')).join(':');
    return `${clock}.${String(at.getMilliseconds()).padStart(3, '0')}`;
};
// The DOM snapshots this row captured, addressed the way `pin --at` takes them:
// by name or by position. Always rendered — a row with none is the answer to
// "can I pin this?", so it keeps the panel rather than dropping it.
const snapshotsBlock = (snapshots) => {
    if (!snapshots.length) {
        return [heading('SNAPSHOTS', 0), `${indent(1)}${emptyState('[NO SNAPSHOTS]')}`];
    }
    const rows = snapshots.map((snapshot) => {
        var _a;
        return [
            String(snapshot.index),
            (_a = snapshot.name) !== null && _a !== void 0 ? _a : '—',
            snapshotTime(snapshot.timestamp),
        ];
    });
    // Mute from the snapshot rather than the padded cell: what reads as absent is
    // the field being unset, which only the row's own data knows.
    return table('SNAPSHOTS', ['#', 'NAME', 'TIME'], rows, (cells, index) => {
        const { name, timestamp } = snapshots[index];
        return [cells[0], name === undefined ? color.muted(cells[1]) : cells[1], timestamp === undefined ? color.muted(cells[2]) : cells[2]];
    });
};
// The console panel's payload, closing the view the way the app's does: the row
// above, its properties below. A row that logged none keeps the section rather
// than dropping it, so the output reads the same shape either way.
const consolePropsBlock = (props, options) => {
    if (!props) {
        return [heading('CONSOLE PROPS'), `${indent(1)}${emptyState('[NO CONSOLE PROPS]')}`];
    }
    return renderConsolePropsHuman(props, options).split('\n');
};
const renderCommandHuman = (result, options = {}) => {
    const network = result.network && networkEntries(result.network);
    return layout([
        [hookLine(result.hook), entryHeader(result)],
        ...((network === null || network === void 0 ? void 0 : network.length) ? [[heading('NETWORK'), ...definitionList(network)]] : []),
        snapshotsBlock(result.snapshots),
        consolePropsBlock(result.consoleProps, options),
    ]);
};

// The selector-taking AUT reads answer an ambiguous selector in place of the
// read they were asked for, so each one renders that answer instead of its own.
const orAmbiguous = (render) => {
    return (result) => {
        const ambiguous = result;
        return ambiguous.ambiguous ? renderAmbiguousHuman(ambiguous) : render(result);
    };
};
const renderings = {
    reporter: {
        renderHuman: (result) => {
            // Only the no-test spec overview carries `stats`; the single-test view never does.
            const view = result;
            return 'stats' in view ? renderReporterSpecHuman(view) : renderReporterHuman(view);
        },
    },
    command: {
        renderHuman: (result, options) => {
            return renderCommandHuman(result, {
                depth: options.depth,
            });
        },
    },
    run: { renderHuman: (result) => renderRunHuman(result) },
    sessions: { renderHuman: (result) => renderSessionsHuman(result) },
    specs: { renderHuman: (result) => renderSpecsHuman(result) },
    status: { renderHuman: (result) => renderStatusHuman(result) },
    dom: { renderHuman: orAmbiguous(renderDomHuman) },
    aria: { renderHuman: orAmbiguous(renderAriaHuman) },
    inspect: { renderHuman: orAmbiguous(renderInspectHuman) },
    pin: { renderHuman: (result) => renderPinHuman(result) },
};
const renderingFor = (command) => {
    return renderings[command];
};

var dist = {};

var hasRequiredDist;

function requireDist () {
	if (hasRequiredDist) return dist;
	hasRequiredDist = 1;
	(function (exports$1) {
		Object.defineProperty(exports$1, "__esModule", { value: true });
		exports$1.isAgent = exports$1.detectAgent = void 0;
		const envMatcher = (key, regex, opts = {}) => {
		    return (env) => {
		        var _a, _b;
		        // Some vars are set by both an IDE's integrated terminal and its CLI agent. A TTY on
		        // either end means a human is at the terminal, not an agent-spawned subprocess. Both
		        // ends are checked because redirecting one still leaves the other attached, as in
		        // `cypress run | tee log.txt`.
		        if (opts.noTTY && (((_a = process.stdout) === null || _a === void 0 ? void 0 : _a.isTTY) || ((_b = process.stdin) === null || _b === void 0 ? void 0 : _b.isTTY))) {
		            return false;
		        }
		        const value = env[key];
		        return value ? regex.test(value) : false;
		    };
		};
		// IDEs are checked last so an agent running inside one is reported as the agent.
		const AGENTS = [
		    ['claude', ['CLAUDECODE', 'CLAUDE_CODE']],
		    ['replit', ['REPL_ID']],
		    ['gemini', ['GEMINI_CLI']],
		    ['codex', ['CODEX_SANDBOX', 'CODEX_THREAD_ID']],
		    ['opencode', ['OPENCODE']],
		    ['pi', [envMatcher('PATH', /\.pi[\\/]agent/)]],
		    ['auggie', ['AUGMENT_AGENT']],
		    ['goose', ['GOOSE_PROVIDER']],
		    ['junie', ['JUNIE_DATA', 'JUNIE_SHIM_PATH']],
		    ['devin', [envMatcher('EDITOR', /(^|[\\/])devin(\.exe)?$/)]],
		    ['cursor', ['CURSOR_AGENT']],
		    ['kiro', [envMatcher('TERM_PROGRAM', /kiro/, { noTTY: true })]],
		];
		const KNOWN_NAMES = AGENTS.map(([name]) => name);
		// AI_AGENT is free-form and often carries a version (Claude Code sets
		// "claude-code_2-1-221_agent"), so narrow it to a known name instead of passing it
		// along verbatim — callers report this value, and only fixed names may leave the machine.
		const fromAiAgent = (value) => {
		    var _a;
		    const normalized = value.toLowerCase();
		    // The name has to end where it ends, so a short one like `pi` cannot claim an
		    // unrelated `pipecat`.
		    return (_a = KNOWN_NAMES.find((name) => new RegExp(`^${name}($|[^a-z0-9])`).test(normalized))) !== null && _a !== void 0 ? _a : 'other';
		};
		const detectAgent = (env = process.env) => {
		    for (const [name, checks] of AGENTS) {
		        for (const check of checks) {
		            if (typeof check === 'string' ? env[check] : check(env)) {
		                return name;
		            }
		        }
		    }
		    return env.AI_AGENT ? fromAiAgent(env.AI_AGENT) : undefined;
		};
		exports$1.detectAgent = detectAgent;
		const isAgent = (env = process.env) => {
		    return !!(0, exports$1.detectAgent)(env);
		};
		exports$1.isAgent = isAgent;
		
	} (dist));
	return dist;
}

var distExports = requireDist();

const debug$4 = Debug('cypress:cli:tap');
const CAMPAIGN = 'Tap Command';
const MEDIUM = 'tap-cli';
const POST_TIMEOUT_MS = 2000;
// Only flags a command declares reach a trace, and no command declares close to
// this many, so the cap is a backstop rather than the real bound.
const MAX_REPORTED_FLAGS = 25;
// Duplicated from packages/data-context/src/util/cloudUrls.ts, which the CLI
// cannot import.
const CLOUD_URLS = {
    development: 'http://localhost:3000',
    staging: 'https://cloud-staging.cypress.io',
    production: 'https://cloud.cypress.io',
};
// Which collector the environment names, if it names one this CLI has a URL for:
// the collector variable the app reads (see EventCollectorActions), then the
// internal environment it is normally derived from. An unrecognized value is no
// collector at all, so a typo cannot pass for naming one and land a source
// checkout's traffic in the production analytics.
const namedCollectorEnv = () => {
    var _a;
    const named = ((_a = process.env.CYPRESS_INTERNAL_EVENT_COLLECTOR_ENV) !== null && _a !== void 0 ? _a : process.env.CYPRESS_INTERNAL_ENV);
    return Object.prototype.hasOwnProperty.call(CLOUD_URLS, named) ? named : undefined;
};
const eventCollectorUrl = (includeMachineId = false) => {
    var _a;
    return `${CLOUD_URLS[(_a = namedCollectorEnv()) !== null && _a !== void 0 ? _a : 'production']}/${includeMachineId ? 'machine-collect' : 'anon-collect'}`;
};
const newTrace = (command = 'none', flags = []) => ({
    messageId: crypto.randomUUID(),
    startedAt: Date.now(),
    command,
    flags,
});
let trace = newTrace();
const beginTapTrace = ({ command, flags }) => {
    trace = newTrace(command, flags);
};
// Names only: an option's value carries selectors, spec paths and test titles,
// so the trace takes the keys of what commander parsed, never the values.
const noteTapCommand = (dispatched, ...parsed) => {
    trace.command = dispatched;
    trace.flags = [...new Set([...trace.flags, ...parsed.flatMap((values) => Object.keys(values))])];
};
const noteTapFailure = (code) => {
    trace.errorCode = code;
};
// Tap error messages interpolate selectors, spec paths and project roots, and so
// do option values, so the payload is a fixed field list of names and codes —
// spelled out here rather than spread from the trace, so a new trace field
// cannot silently become a new wire field.
const reportTapTrace = (exitCode) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    // This runs from the `finally` the CLI exits on, so nothing here may throw: a
    // failure while assembling the event would replace the command's own outcome.
    try {
        // Read through getEnv so the opt-out can also come from npm config, the way
        // the CLI's other public variables are set.
        if (xvfb.util.getEnv('CYPRESS_DISABLE_GUEST_TELEMETRY')) {
            debug$4('skipped tap event: telemetry disabled');
            return;
        }
        const cypressVersion = xvfb.util.pkgVersion();
        // Local development reports nothing unless it names the collector to use, so
        // working on tap cannot put its own traffic in the production analytics.
        if (cypressVersion === xvfb.DEVELOPMENT_VERSION && !namedCollectorEnv()) {
            debug$4('skipped tap event: development build');
            return;
        }
        const identity = resolvedSessionIdentity();
        const payload = {
            command: trace.command,
            flags: trace.flags.slice(0, MAX_REPORTED_FLAGS),
            agent: distExports.detectAgent(),
            sessionId: (_a = identity === null || identity === void 0 ? void 0 : identity.sessionId) !== null && _a !== void 0 ? _a : undefined,
            userId: (_b = identity === null || identity === void 0 ? void 0 : identity.userId) !== null && _b !== void 0 ? _b : undefined,
            exitCode,
            errorCode: trace.errorCode,
            durationMs: Date.now() - trace.startedAt,
        };
        // The identity travels in the session probe response, so an invocation that
        // never resolved a session has no machineId and stays on the anonymous
        // collector, mirroring EventCollectorActions.recordEvent app-side.
        const machineId = (_c = identity === null || identity === void 0 ? void 0 : identity.machineId) !== null && _c !== void 0 ? _c : undefined;
        const url = eventCollectorUrl(machineId !== undefined);
        yield fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-cypress-version': cypressVersion,
            },
            body: JSON.stringify({ campaign: CAMPAIGN, medium: MEDIUM, messageId: trace.messageId, machineId, payload }),
            signal: AbortSignal.timeout(POST_TIMEOUT_MS),
        });
        debug$4('recorded tap event to %s %o', url, payload);
    }
    catch (err) {
        debug$4('failed to record tap event for %o due to error %o', trace, err);
    }
});

const debug$3 = Debug('cypress:cli:tap');
// The registry keeps its copy dependency-free, so the commands it names arrive in
// backticks for the CLI to colour the way the rest of the catalogue already does.
const highlight = (copy) => copy.replace(/`([^`]+)`/g, (_match, command) => chalk.cyan(command));
/**
 * The remedy and the trailing blocks an entry asks for, so guidance repeated across
 * errors is declared once per entry rather than written out again in each one. An
 * entry that asks for the help takes it in place of its solution, which is written
 * to point at the very help now being printed.
 */
const remedyFor = (copy, help) => {
    const attached = copy.attachHelp && help ? help.trimEnd() : undefined;
    const solution = attached !== null && attached !== void 0 ? attached : (copy.solution ? highlight(copy.solution) : undefined);
    const parts = solution ? [solution] : [];
    if (copy.docs) {
        parts.push(`Learn more:\n\n  ${chalk.blue(`${xvfb.docsUrl}${copy.docs}`)}`);
    }
    if (copy.recommendGhIssue) {
        parts.push(`If the problem persists, search for an existing issue or open a GitHub issue at\n\n  ${chalk.blue(xvfb.util.issuesUrl)}`);
    }
    return parts;
};
/**
 * The single exit for every tap failure, whether the CLI raised it or it arrived
 * from the session as a wire payload: the code selects the copy and `detail`
 * carries whatever was specific to this one. It prints as paragraphs — the
 * condition, then the specifics that explain it, then what to do about it. The code
 * itself is never printed.
 *
 * Anything else — a TypeError from a command handler, an ENOTDIR from a read that
 * should not have failed — was never raised as a tap failure, so there is no
 * condition to state and nothing on it is copy a reader was meant to see: it renders
 * as UNKNOWN_ERROR, and its stack goes to the debug log, which is where whoever is
 * asked for one after reading the report will look.
 *
 * Which is why a code alone does not make a failure ours: `err.code` is a string on
 * every Node system error too, and rendering an ENOENT against the registry would
 * pick whatever the fallback copy happens to be. Only a TapError, or the wire payload
 * the session sends and its raisers pass here as-is, is read for its code.
 *
 * `help` is the generated help of the command that was called, passed by the callers
 * that have a parsed program to hand. Only a failure about the invocation prints it;
 * the session raises those too, and has no help of its own to send.
 */
const renderTapFailure = (err, help) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const raised = cli.distExports.isTapError(err) || (!(err instanceof Error) && typeof (err === null || err === void 0 ? void 0 : err.code) === 'string');
    const failure = raised ? err : new cli.distExports.UnknownTapError(err);
    if (!raised) {
        debug$3('rendering an unrecognized failure as %s: %s', failure.code, failure.message);
    }
    noteTapFailure(failure.code);
    const copy = cli.distExports.tapErrorCopy(failure.code);
    const condition = copy.description ? [highlight(copy.description)] : [];
    const detail = typeof failure.detail === 'string' && failure.detail !== '' ? [highlight(failure.detail)] : [];
    xvfb.loggerModule.errorToStderr([...condition, ...detail, ...remedyFor(copy, help)].join('\n\n'));
    return 1;
});
/**
 * The help for the command that was called, or the whole program's when the name
 * matched nothing — which is the case a reader who mistyped a command needs.
 */
const helpFor = (program, command) => {
    const subcommand = program.commands.find((sub) => sub.name() === command);
    return (subcommand !== null && subcommand !== void 0 ? subcommand : program).helpInformation();
};
const renderResult = (result) => {
    xvfb.loggerModule.always(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
};
/**
 * Print a command's result: its human-readable rendering when the command
 * defines one (see `./render`), the raw JSON otherwise or when `--json` asks
 * for it explicitly. The invoked options are forwarded because a command's
 * result shape can depend on them (`command --json`) — as can whether a
 * rendering applies at all, which a renderer signals by returning undefined.
 */
const renderOutcome = (command, result, json, options = {}) => {
    var _a;
    const rendered = json ? undefined : (_a = renderingFor(command)) === null || _a === void 0 ? void 0 : _a.renderHuman(result, options);
    if (rendered !== undefined) {
        xvfb.loggerModule.always(rendered);
        return;
    }
    renderResult(result);
};
const renderNativeHelp = (program, command) => {
    xvfb.loggerModule.always(program.commands.find((subcommand) => subcommand.name() === command).helpInformation());
};
const sessionBanner = (schema, selection) => {
    const { session, candidateCount } = selection;
    const target = `Target:
  ${session.projectRoot}
  v${schema.cypressVersion}
  pid:${session.pid}`;
    if (candidateCount > 1) {
        return `${target}\n${candidateCount} running sessions matched; targeting pid ${session.pid}. Pass --session <pid> to target another.`;
    }
    return target;
};
const renderHelp = (program, schema, command, banner) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const prefix = banner ? `${banner}\n\n` : '';
    if (command) {
        const subcommand = program.commands.find((sub) => sub.name() === command);
        if (!subcommand) {
            return yield renderTapFailure(new cli.distExports.UnknownCommandTapError(command, program.helpInformation()));
        }
        // Standalone help is the only place a schema command's full `details` prose
        // renders, so it stands in for the one-line `description` — the same swap
        // buildNativeProgram does for CLI-native commands.
        const details = (_a = schema.commands.find(({ name }) => name === command)) === null || _a === void 0 ? void 0 : _a.details;
        if (details) {
            subcommand.description(details);
        }
        xvfb.loggerModule.always(`${prefix}${subcommand.helpInformation()}`);
        return 0;
    }
    xvfb.loggerModule.always(`${prefix}${program.helpInformation()}`);
    return 0;
});
const renderSchemaHelp = (program, schema, selection, command) => {
    return renderHelp(program, schema, command, sessionBanner(schema, selection));
};
const renderStaticHelp = (program, schema, command) => {
    return renderHelp(program, schema, command);
};

/**
 * Authoring helper for one CLI-native tap subcommand. The command's declarative
 * schema lives in the shared TAP_NATIVE_COMMANDS contract so it can't drift from
 * the help it renders; this pairs that metadata with the CLI-side handler and
 * types the handler against the named entry, mirroring the app's defineCommand —
 * no annotations, `handler: (options, { spec }) => …`.
 */
const defineNativeCommand = (name, handler) => {
    const meta = cli.distExports.TAP_NATIVE_COMMANDS.find((command) => command.name === name);
    return Object.assign(Object.assign({}, meta), { name, handler });
};

const NO_SESSIONS_GUIDANCE = `No running ${cli.distExports.TAP_TARGET} found. Start Cypress in open mode (e.g. \`cypress open\`) and select a testing type to get started.`;
// Bounded, and never throws: `sessions` is what a caller reaches for when
// everything else is failing, so an unanswered probe is a reported fact rather
// than an error. Absent means there was nothing to ask, not that it went unasked.
const probeRenderer = (session, timeoutMs) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    if (session.cdpBrowserWsUrl === null) {
        return undefined;
    }
    try {
        return yield withTapConnection(session, () => xvfb.__awaiter(void 0, void 0, void 0, function* () { return true; }), timeoutMs);
    }
    catch (err) {
        return isRendererUnresponsive(err) ? false : undefined;
    }
});
const listSessions = (options) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const sessions = yield listLiveSessions({ session: options.session });
    if (sessions.length === 0) {
        renderResult(NO_SESSIONS_GUIDANCE);
        return 0;
    }
    const timeoutMs = (_a = options.timeout) !== null && _a !== void 0 ? _a : FIND_SESSION_TIMEOUT_MS;
    const responsive = yield Promise.all(sessions.map((session) => probeRenderer(session, timeoutMs)));
    const summaries = sessions.map((session, index) => (Object.assign({ pid: session.pid, projectRoot: session.projectRoot, testingType: session.testingType, browserAttached: session.cdpBrowserWsUrl !== null, browserName: session.browserName, browserSupported: cli.distExports.isTapSupportedBrowser(session.browserFamily) }, (responsive[index] === undefined ? {} : { rendererResponsive: responsive[index] }))));
    renderOutcome('sessions', summaries, options.json);
    return 0;
});
const sessionsCommand = defineNativeCommand('sessions', listSessions);

// The ways a session can fail to resolve that are lifecycle stages `status`
// reports rather than failures it exits on; anything else really did fail — a
// browser tap cannot drive is not a stage polling can outlast, so it is absent.
// A named `--session` that has gone is one of them, so a poller watching one pid
// keeps reading `not connected` after it exits rather than starting to error.
const NOT_CONNECTED_CODES = new Set(['NO_SESSION', 'SESSION_NOT_FOUND', 'STALE_SESSION']);
const mergeRunState = (base, runState) => {
    var _a;
    const pinned = runState.pinned ? { pinned: runState.pinned } : {};
    if (runState.state === undefined) {
        return Object.assign(Object.assign(Object.assign({}, base), { status: 'spec not selected', totalSpecs: runState.totalSpecs }), pinned);
    }
    return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, base), { status: runState.state, totalSpecs: runState.totalSpecs }), (runState.spec !== null ? { spec: runState.spec } : {})), { startedAt: (_a = runState.startedAt) !== null && _a !== void 0 ? _a : null, totalTests: runState.totalTests, results: runState.results }), (runState.error ? { error: runState.error } : {})), pinned);
};
const reportStatus = (options) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    let selection;
    try {
        selection = yield resolveLiveSession({ session: options.session, cwd: process.cwd() });
    }
    catch (err) {
        // No live session is a status a poller waits on, not a failure.
        if (cli.distExports.isTapError(err) && NOT_CONNECTED_CODES.has(err.code)) {
            renderOutcome('status', { status: 'not connected' }, options.json);
            return 0;
        }
        throw err;
    }
    const { session } = selection;
    const browserAttached = session.cdpBrowserWsUrl !== null;
    const base = {
        status: 'browser not selected',
        pid: session.pid,
        projectRoot: session.projectRoot,
        testingType: session.testingType,
        browserAttached,
        browserName: session.browserName,
    };
    if (!browserAttached) {
        renderOutcome('status', base, options.json);
        return 0;
    }
    try {
        const outcome = yield withTapConnection(session, (connection) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
            return validateExecResult(yield connection.call(cli.distExports.TAP_EXEC_METHOD, ['run-state', {}, {}]));
        }), options.timeout);
        if ('error' in outcome) {
            return yield renderTapFailure(outcome.error);
        }
        renderOutcome('status', mergeRunState(base, outcome.result), options.json);
        return 0;
    }
    catch (err) {
        // A degraded session reached this far (e.g. an unresponsive renderer); the
        // earlier catch only covers sessions that never resolved.
        return yield renderTapFailure(err);
    }
});
const statusCommand = defineNativeCommand('status', reportStatus);

const debug$2 = Debug('cypress:cli:tap');
const GRAPHQL_HOST = '127.0.0.1';
const GRAPHQL_PATH = '/__cypress/graphql';
const DEFAULT_QUERY_TIMEOUT_MS = 4000;
const firstErrorMessage = (envelopeErrors) => {
    const first = Array.isArray(envelopeErrors) ? envelopeErrors[0] : undefined;
    if (first === undefined) {
        return null;
    }
    return typeof (first === null || first === void 0 ? void 0 : first.message) === 'string' ? first.message : 'The session reported an unnamed GraphQL error.';
};
const validateEnvelope = (operationName, envelope) => {
    if (!envelope || typeof envelope !== 'object') {
        return throwTapError('GRAPHQL_FAILED', `The session answered ${operationName} with an unrecognizable response.`);
    }
    const errorMessage = firstErrorMessage(envelope.errors);
    if (errorMessage !== null) {
        return throwTapError('GRAPHQL_FAILED', `The session failed to run ${operationName}: ${errorMessage}`);
    }
    if (!envelope.data || typeof envelope.data !== 'object') {
        return throwTapError('GRAPHQL_FAILED', `The session answered ${operationName} without data.`);
    }
    return envelope.data;
};
const querySessionGraphql = (session_1, operation_1, ...args_1) => xvfb.__awaiter(void 0, [session_1, operation_1, ...args_1], void 0, function* (session, operation, timeoutMs = DEFAULT_QUERY_TIMEOUT_MS) {
    const { operationName, query, variables } = operation;
    const url = `http://${GRAPHQL_HOST}:${session.serverPort}${GRAPHQL_PATH}/${operationName}`;
    let response;
    try {
        response = yield fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/json', [cli.distExports.SESSION_ID_HEADER]: session.sessionId },
            body: JSON.stringify({ operationName, query, variables: variables !== null && variables !== void 0 ? variables : {} }),
            signal: AbortSignal.timeout(timeoutMs),
        });
    }
    catch (err) {
        debug$2('graphql request %s to pid %d failed: %o', operationName, session.pid, err);
        return throwTapError('GRAPHQL_UNREACHABLE', `Could not reach the session to run ${operationName}: ${err.message}`, err);
    }
    // A valid request passes the server's force-proxy guard untouched; a redirect
    // means the guard sent us to the runner page because the session doesn't allow
    // direct tap GraphQL — an older Cypress that predates it (or one that rejected
    // our session-id). Report that instead of the runner HTML as a data error.
    if (response.redirected) {
        return throwTapError('SESSION_OUTDATED', `The session redirected the ${operationName} request instead of answering it, so it does not support direct tap GraphQL.`);
    }
    if (response.status !== 200) {
        // express-graphql answers parse/validation failures with 400 + { errors: [...] };
        // log it for debugging, but still report unreachable to the user.
        const envelope = yield response.json().catch(() => null);
        debug$2('graphql request %s to pid %d answered %d: %o', operationName, session.pid, response.status, envelope);
        return throwTapError('GRAPHQL_UNREACHABLE', `The session answered ${operationName} with status ${response.status}.`);
    }
    const envelope = yield response.json().catch((err) => {
        return throwTapError('GRAPHQL_FAILED', `The session answered ${operationName} with a non-JSON response.`, err);
    });
    return validateEnvelope(operationName, envelope);
});

const modifiedAt = (spec) => {
    const parsed = spec.lastModifiedTimestamp === undefined ? NaN : Date.parse(spec.lastModifiedTimestamp);
    return Number.isNaN(parsed) ? -Infinity : parsed;
};
const byMostRecentlyModified = (a, b) => {
    const left = modifiedAt(a);
    const right = modifiedAt(b);
    return left === right ? 0 : right - left;
};
// `TapSpecsQuery` is the schema shape, but the value crosses the wire unvalidated,
// so entries are guarded against nulls and non-string fields before rendering.
const toSpecList = (data) => {
    var _a, _b;
    const specs = (_b = (_a = data.currentProject) === null || _a === void 0 ? void 0 : _a.specs) !== null && _b !== void 0 ? _b : [];
    return specs
        .filter((spec) => typeof (spec === null || spec === void 0 ? void 0 : spec.relative) === 'string')
        .map((spec) => {
        var _a, _b;
        const lastModified = (_a = spec.gitInfo) === null || _a === void 0 ? void 0 : _a.lastModifiedHumanReadable;
        const lastModifiedTimestamp = (_b = spec.gitInfo) === null || _b === void 0 ? void 0 : _b.lastModifiedTimestamp;
        return Object.assign(Object.assign({ relativePath: spec.relative.replace(/\\/g, '/') }, (typeof lastModified === 'string' ? { lastModified } : {})), (typeof lastModifiedTimestamp === 'string' ? { lastModifiedTimestamp } : {}));
    })
        .sort(byMostRecentlyModified);
};
const listSpecs = (options) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { session } = yield resolveLiveSession({ session: options.session, cwd: process.cwd() });
        const data = yield querySessionGraphql(session, cli.distExports.TapSpecsOperation);
        renderOutcome('specs', toSpecList(data), options.json);
        return 0;
    }
    catch (err) {
        return yield renderTapFailure(err);
    }
});
const specsCommand = defineNativeCommand('specs', listSpecs);

const RUN_SPEC_TIMEOUT_MS = 60000;
// The session's runSpec mutation names its failures with its own codes; each maps
// to the tap code whose copy describes it. A code this CLI does not know reads as
// the session failing to start the spec, which is what it observed.
const RUN_SPEC_FAILURES = {
    GENERAL_ERROR: 'SPEC_START_FAILED',
    NO_PROJECT: 'NO_PROJECT',
    NO_SPEC_PATTERN_MATCH: 'SPEC_NOT_FOUND',
    SPEC_NOT_FOUND: 'SPEC_NOT_FOUND',
    TESTING_TYPE_NOT_CONFIGURED: 'TESTING_TYPE_NOT_CONFIGURED',
};
const findTargetSpec = (session, relative) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const specsData = yield querySessionGraphql(session, cli.distExports.TapSpecsOperation);
    const wanted = xvfb.posixify(relative);
    return ((_b = (_a = specsData.currentProject) === null || _a === void 0 ? void 0 : _a.specs) !== null && _b !== void 0 ? _b : []).find((spec) => xvfb.posixify(spec.relative) === wanted);
});
const runSpec = (options, args) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { session } = yield resolveLiveSession({ session: options.session, cwd: process.cwd() });
        const match = yield findTargetSpec(session, args.spec);
        if (!match) {
            return yield renderTapFailure({ code: 'SPEC_NOT_FOUND', detail: `Looked for "${args.spec}".` });
        }
        const { runSpec: result } = yield querySessionGraphql(session, cli.distExports.tapRunSpecOperation(match.absolute), RUN_SPEC_TIMEOUT_MS);
        if ((result === null || result === void 0 ? void 0 : result.__typename) === 'RunSpecResponse') {
            const launched = {
                spec: xvfb.posixify(result.spec.relative),
                testingType: result.testingType,
                browser: result.browser.displayName,
            };
            renderOutcome('run', launched, options.json);
            return 0;
        }
        const failure = (result === null || result === void 0 ? void 0 : result.__typename) === 'RunSpecError'
            ? { code: (_a = RUN_SPEC_FAILURES[result.code]) !== null && _a !== void 0 ? _a : 'SPEC_START_FAILED', detail: (_b = result.detailMessage) !== null && _b !== void 0 ? _b : undefined }
            : { code: 'SPEC_START_FAILED', detail: `The ${cli.distExports.TAP_TARGET} returned no result for "${args.spec}".` };
        return yield renderTapFailure(failure);
    }
    catch (err) {
        return yield renderTapFailure(err);
    }
});
const runCommand = defineNativeCommand('run', runSpec);

const debug$1 = Debug('cypress:cli:tap');
// The app names the AUT iframe deterministically (packages/app/src/runner/
// aut-iframe.ts): its name is `Your project: '<name>'`. That prefix is how we
// pick it out of the runner page's frame tree — distinct from the snapshot
// double-buffer frames (`AUT Snapshot - N`) and the spec bridge (`Your Spec`).
const AUT_FRAME_NAME_PREFIX = 'Your project:';
// Three readers reject a malformed selector (the match counter, the DOM reader, and
// the single-node lookup), and the app-side `resolve-selector` reports the same
// condition over the wire — they must all say it the same way.
const invalidSelectorError = (selector) => {
    return new cli.distExports.InvalidValueTapError('--selector', 'a valid CSS selector', selector);
};
const findAutFrame = (node) => {
    var _a, _b, _c;
    if (((_a = node.frame.name) !== null && _a !== void 0 ? _a : '').startsWith(AUT_FRAME_NAME_PREFIX)) {
        return { id: node.frame.id, url: (_b = node.frame.url) !== null && _b !== void 0 ? _b : '' };
    }
    for (const child of (_c = node.childFrames) !== null && _c !== void 0 ? _c : []) {
        const found = findAutFrame(child);
        if (found) {
            return found;
        }
    }
    return undefined;
};
/**
 * Locates the app-under-test frame within the runner page. Verified empirically:
 * the AUT is a same-process child frame of the runner-page target, so one
 * attached connection reaches it — no separate target attach. A pinned snapshot is
 * always same-super-domain, so it is reliably this child frame too.
 */
const resolveAutFrame = (client, sessionId) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    yield client.Page.enable({}, sessionId);
    // getFrameTree takes no params, so its typed signature is (sessionId?); CRI
    // routes the string arg to sessionId by type, not position.
    const { frameTree } = yield client.Page.getFrameTree(sessionId);
    const found = findAutFrame(frameTree);
    if (!found) {
        throw new cli.distExports.TapError('NO_AUT');
    }
    debug$1('resolved AUT frame %o', found);
    return { frameId: found.id };
});
/**
 * Gates the AUT-frame reads on the same run lifecycle `status` reports. The
 * frame is only worth reading once a spec has settled: while a spec is running
 * the app is in flux — commands are still executing, snapshots are swapping,
 * the page may still be navigating — so a read captures a transient page; and
 * short of a verdict, with no run of its own to read, the resolved frame is the
 * runner shell or the run this one displaces. Both are rejected with typed
 * errors a poller can branch on, mirroring the `status` lifecycle contract
 * (wait until `passed`/`failed`).
 */
const assertFrameReadable = (connection) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const outcome = validateExecResult(yield connection.call(cli.distExports.TAP_EXEC_METHOD, ['run-state', {}, {}]));
    if ('error' in outcome) {
        // The session already named the condition; re-raise it as ours so it renders
        // through the one path rather than being reported as a frame read failure.
        throw cli.distExports.TapError.fromPayload(outcome.error);
    }
    const { state, spec } = outcome.result;
    if (state === 'running') {
        throw new cli.distExports.SpecInProgressTapError(spec);
    }
    if (state !== 'passed' && state !== 'failed') {
        throw new cli.distExports.TapError('SPEC_NOT_STARTED');
    }
});
/**
 * Shared flow for the AUT-frame commands: resolve a running session, open a
 * tap connection, gate on the run lifecycle, locate the AUT frame, run `read`, and
 * render the result. Every failure along the way — the read's own, the run-state
 * gate's, discovery's, transport's — is a `TapError`, so one catch renders them
 * all the way the schema commands render theirs.
 */
const withResolvedAutFrame = (options, read, command) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const selection = yield resolveSession({ session: options.session, cwd: process.cwd() });
        return yield withTapConnection(selection.session, (connection) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
            yield assertFrameReadable(connection);
            const frame = yield resolveAutFrame(connection.client, connection.sessionId);
            const result = yield read(connection, frame);
            renderOutcome(command, result, options.json);
            // The ambiguity answer is still a result — it names the matches to
            // choose between, so it prints on stdout like any other. But it is not
            // the read that was asked for, and the exit code has to say so.
            return result.ambiguous ? 1 : 0;
        }), options.timeout);
    }
    catch (err) {
        return yield renderTapFailure(err);
    }
});

const WHOLE_NUMBER = /^\d+$/;
const parseWholeNumber = (raw) => {
    if (typeof raw !== 'string' || !WHOLE_NUMBER.test(raw)) {
        return undefined;
    }
    const value = Number(raw);
    return Number.isSafeInteger(value) ? value : undefined;
};
const parseIndex = (raw) => {
    if (raw === undefined) {
        return undefined;
    }
    const value = parseWholeNumber(raw);
    if (value === undefined) {
        throw new cli.distExports.InvalidValueTapError('--at', 'a whole number, 0 or greater', raw);
    }
    return value;
};
const parsePositiveInt = (raw, label) => {
    const value = parseWholeNumber(raw);
    if (value === undefined || value <= 0) {
        throw new cli.distExports.InvalidValueTapError(`--${label}`, 'a positive integer', raw);
    }
    return value;
};

// A separate JS context that shares the frame's DOM but not its globals, so
// nothing the tap reads pollutes the page.
const TAP_WORLD_NAME = 'cypress-tap';
const createFrameIsolatedWorld = (connection, frame) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const { client, sessionId } = connection;
    const { executionContextId } = yield client.Page.createIsolatedWorld({
        frameId: frame.frameId,
        worldName: TAP_WORLD_NAME,
    }, sessionId);
    return executionContextId;
});
/**
 * Resolves a CSS selector to the matched element's CDP objectId, querying in an
 * isolated world on the AUT frame. `index` picks one of several matches
 * (`--at`), already checked against the match count by the caller. Throws
 * `INVALID_VALUE` when the selector is malformed; returns undefined when the
 * selector is valid but nothing matched.
 */
const querySelectorObjectId = (connection, frame, selector, index) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const { client, sessionId } = connection;
    const executionContextId = yield createFrameIsolatedWorld(connection, frame);
    const { result, exceptionDetails } = yield client.Runtime.callFunctionOn({
        functionDeclaration: 'function (selector, index) { return document.querySelectorAll(selector)[index] }',
        executionContextId,
        arguments: [{ value: selector }, { value: index }],
    }, sessionId);
    if (exceptionDetails) {
        throw invalidSelectorError(selector);
    }
    // querySelector returned null — a real "nothing matched" answer, not an error.
    if (!result.objectId || result.subtype === 'null') {
        return undefined;
    }
    return result.objectId;
});
/**
 * The subset of a node's boolean accessibility properties present in `reported`
 * and currently true — the states worth surfacing; the rest are rarely
 * actionable.
 */
const collectTrueStates = (properties, reported) => {
    return (properties !== null && properties !== void 0 ? properties : [])
        .filter((property) => { var _a; return reported.has(property.name) && ((_a = property.value) === null || _a === void 0 ? void 0 : _a.value) === true; })
        .map((property) => property.name);
};

/**
 * Functions injected into the AUT frame over CDP `Runtime.callFunctionOn`,
 * serialized with `fn.toString()`. They read the app-under-test's live DOM, so
 * they run in the browser, not in this Node process — two constraints follow
 * and MUST hold, or the injected copy diverges from this (tested) source:
 *
 *   1. Fully self-contained. A function may reference only its own parameters
 *      and browser globals (`document`, `getComputedStyle`, `Math`); never an
 *      import or module-scope binding, which does not exist in the AUT frame.
 *      (This is why `readElementInfo` takes the style list as an argument
 *      rather than closing over a constant.)
 *   2. ES2015 syntax only. The shipped bundle targets es2016 (tsconfig.build),
 *      where object spread / async / optional chaining lower to `tslib` helpers
 *      that reference module scope — those would be `undefined` once injected.
 *      `const`/`let`, template literals, `for…of`, and `Array.from` all emit
 *      verbatim at es2016, so keep to those.
 *
 * Because they touch only a few DOM globals, the unit tests stub those globals
 * and call the real functions directly.
 */
// Caps output, so a heavy page never serializes megabytes across CDP. Returns a
// tagged object rather than throwing, so a bad selector round-trips as data
// instead of a CDP exception. `index` picks one of several matches (`--at`); the
// caller has already checked it against the match count.
function readDom(selector, maxChars, index) {
    let el;
    try {
        el = document.querySelectorAll(selector)[index];
    }
    catch (_e) {
        return { invalidSelector: true };
    }
    if (!el) {
        return { found: false };
    }
    const html = el.outerHTML;
    return html.length > maxChars ? { found: true, html: html.slice(0, maxChars), truncated: true } : { found: true, html };
}
// Counts matches without serializing any of them, so the single-element guard
// costs one number however heavy the page. Tags a bad selector as data, the way
// `readDom` does.
function countMatches(selector) {
    try {
        return { count: document.querySelectorAll(selector).length };
    }
    catch (_e) {
        return { invalidSelector: true };
    }
}
// Reads the element's tag, attributes, curated computed styles, and box rect in
// one call on the element itself (bound as `this` via the CDP objectId) —
// avoiding the DOM/CSS node-id dance (`requestNode` needs a fetched document
// tree and is brittle across worlds). `reportedStyles` is the curated property
// list, passed in to keep this function self-contained (see file header).
function readElementInfo(reportedStyles) {
    const computed = getComputedStyle(this);
    const styles = {};
    // Report every curated property verbatim rather than filtering: the list is
    // already hand-picked, and a truthiness guard would drop meaningful values
    // (a resolved `0`, an empty `content`) and make the output non-deterministic.
    for (const prop of reportedStyles) {
        styles[prop] = computed.getPropertyValue(prop);
    }
    const attributes = {};
    for (const attr of Array.from(this.attributes)) {
        attributes[attr.name] = attr.value;
    }
    const rect = this.getBoundingClientRect();
    return {
        tag: this.tagName.toLowerCase(),
        attributes,
        styles,
        box: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
    };
}

/**
 * A unique selector for each match, to offer in place of the ambiguous one.
 * Best effort: these come from the session itself, which derives them the way
 * its Selector Playground does — so they honor any selectorPriority the project
 * configured, and are selectors the user's own tests would use. A session that
 * can't reach its app under test (a secondary origin inside `cy.origin`) just
 * leaves the match count to speak for itself.
 */
const disambiguatingSelectors = (connection, selector) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const outcome = validateExecResult(yield connection.call(cli.distExports.TAP_EXEC_METHOD, ['resolve-selector', { selector }, {}]));
        return 'error' in outcome ? [] : outcome.result.selectors;
    }
    catch (_a) {
        return [];
    }
});
const resolveAmbiguity = (connection, frame, selector, at) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { client, sessionId } = connection;
    const executionContextId = yield createFrameIsolatedWorld(connection, frame);
    const { result, exceptionDetails } = yield client.Runtime.callFunctionOn({
        functionDeclaration: countMatches.toString(),
        executionContextId,
        arguments: [{ value: selector }],
        returnByValue: true,
    }, sessionId);
    if (exceptionDetails) {
        throw new cli.distExports.TapError('FRAME_READ_FAILED', { message: `resolving "${selector}" in the app under test failed: ${((_a = exceptionDetails.exception) === null || _a === void 0 ? void 0 : _a.description) || exceptionDetails.text}` });
    }
    const { count, invalidSelector } = result.value;
    if (invalidSelector) {
        throw invalidSelectorError(selector);
    }
    // Nothing matched: each command reports that in its own shape, and an `--at`
    // has no range to be out of.
    if (count === undefined || count === 0) {
        return undefined;
    }
    if (at !== undefined) {
        if (at >= count) {
            throw new cli.distExports.InvalidValueTapError('--at', `0 to ${count - 1}, since "${selector}" matched ${count} element${count === 1 ? '' : 's'}`, at);
        }
        return undefined;
    }
    if (count === 1) {
        return undefined;
    }
    return {
        ambiguous: true,
        selector,
        count,
        selectors: yield disambiguatingSelectors(connection, selector),
    };
});
const withAmbiguous = (connection, frame, selector, at, read) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const ambiguous = yield resolveAmbiguity(connection, frame, selector, at);
    return ambiguous !== null && ambiguous !== void 0 ? ambiguous : read();
});

const extractDom = (connection, frame, selector, maxChars, at) => withAmbiguous(connection, frame, selector, at, () => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { client, sessionId } = connection;
    const executionContextId = yield createFrameIsolatedWorld(connection, frame);
    const { result, exceptionDetails } = yield client.Runtime.callFunctionOn({
        functionDeclaration: readDom.toString(),
        executionContextId,
        arguments: [{ value: selector }, { value: maxChars }, { value: at !== null && at !== void 0 ? at : 0 }],
        returnByValue: true,
    }, sessionId);
    if (exceptionDetails) {
        throw new cli.distExports.TapError('FRAME_READ_FAILED', { message: `reading the app-under-test DOM failed: ${((_a = exceptionDetails.exception) === null || _a === void 0 ? void 0 : _a.description) || exceptionDetails.text}` });
    }
    const value = result.value;
    // Only a selector the reader was given can come back rejected.
    if (value.invalidSelector) {
        throw invalidSelectorError(selector);
    }
    return Object.assign(Object.assign(Object.assign({}, (value.found !== undefined ? { found: value.found } : {})), (value.html !== undefined ? { html: value.html } : {})), (value.truncated ? { truncated: true } : {}));
}));
// The options are read before a session is resolved, so a value this command
// cannot use is reported as itself rather than as whatever the search for a
// Cypress to run it against happened to find.
const domCommand = defineNativeCommand('dom', (options, _args, commandOptions) => {
    const maxChars = parsePositiveInt(commandOptions['max-chars'], 'max-chars');
    const at = parseIndex(commandOptions.at);
    return withResolvedAutFrame(options, (connection, frame) => {
        return extractDom(connection, frame, commandOptions.selector, maxChars, at);
    }, 'dom');
});

// Structural/text roles carry no semantic signal on their own — dropping them
// yields the compact role/name tree DevTools shows, not the raw render tree.
const NOISE_ROLES = new Set(['InlineTextBox', 'StaticText', 'LineBreak', 'generic', 'none', 'GenericContainer', 'paragraph']);
// The boolean states worth reporting when true; the rest are rarely actionable.
const REPORTED_STATES$1 = new Set(['focused', 'disabled', 'required', 'invalid', 'checked', 'expanded', 'selected', 'pressed', 'readonly', 'hidden', 'modal', 'busy']);
const projectNode = (node, depth) => {
    var _a, _b, _c;
    const role = (_a = node.role) === null || _a === void 0 ? void 0 : _a.value;
    if (typeof role !== 'string' || node.ignored || NOISE_ROLES.has(role)) {
        return undefined;
    }
    const out = { depth, role };
    const name = (_b = node.name) === null || _b === void 0 ? void 0 : _b.value;
    if (typeof name === 'string' && name.length > 0) {
        out.name = name;
    }
    const value = (_c = node.value) === null || _c === void 0 ? void 0 : _c.value;
    if (value !== undefined && value !== null && value !== '') {
        out.value = String(value);
    }
    const states = collectTrueStates(node.properties, REPORTED_STATES$1);
    if (states.length) {
        out.states = states;
    }
    return out;
};
/**
 * Walks the AX forest from `rootId` depth-first. A node that projects to a
 * meaningful role deepens the indent for its descendants; a noise node is
 * skipped but its children keep flowing, so the output is a clean semantic
 * tree rather than the raw render tree. Stops at `maxNodes`.
 */
const projectTree = (byId, rootId, maxNodes) => {
    const nodes = [];
    let truncated = false;
    const walk = (id, depth) => {
        var _a;
        if (truncated) {
            return;
        }
        const node = byId.get(id);
        if (!node) {
            return;
        }
        const projected = projectNode(node, depth);
        if (projected) {
            if (nodes.length >= maxNodes) {
                truncated = true;
                return;
            }
            nodes.push(projected);
        }
        const childDepth = projected ? depth + 1 : depth;
        for (const childId of (_a = node.childIds) !== null && _a !== void 0 ? _a : []) {
            walk(childId, childDepth);
        }
    };
    walk(rootId, 0);
    return { nodes, truncated };
};
const resolveSelectorBackendNodeId = (connection, frame, selector, index) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const { client, sessionId } = connection;
    const objectId = yield querySelectorObjectId(connection, frame, selector, index);
    if (objectId === undefined) {
        return undefined;
    }
    const { node } = yield client.DOM.describeNode({ objectId }, sessionId);
    return node.backendNodeId;
});
const extractAria = (connection, frame, selector, maxNodes, at) => {
    // Ahead of the tree fetch: an ambiguous selector shouldn't cost a full AX tree.
    return withAmbiguous(connection, frame, selector, at, () => xvfb.__awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { client, sessionId } = connection;
        yield client.DOM.enable({}, sessionId);
        yield client.Accessibility.enable(sessionId);
        const { nodes: axNodes } = yield client.Accessibility.getFullAXTree({ frameId: frame.frameId }, sessionId);
        const byId = new Map();
        for (const node of axNodes) {
            byId.set(node.nodeId, node);
        }
        const base = { nodes: [], nodeCount: 0 };
        const backendNodeId = yield resolveSelectorBackendNodeId(connection, frame, selector, at !== null && at !== void 0 ? at : 0);
        if (backendNodeId === undefined) {
            // Selector matched nothing, or the match is absent from the a11y tree.
            return base;
        }
        const rootId = (_a = axNodes.find((node) => node.backendDOMNodeId === backendNodeId)) === null || _a === void 0 ? void 0 : _a.nodeId;
        if (rootId === undefined) {
            return base;
        }
        const { nodes, truncated } = projectTree(byId, rootId, maxNodes);
        return Object.assign(Object.assign(Object.assign({}, base), { nodes, nodeCount: nodes.length }), (truncated ? { truncated: true } : {}));
    }));
};
const ariaCommand = defineNativeCommand('aria', (options, _args, commandOptions) => {
    const maxNodes = parsePositiveInt(commandOptions['max-nodes'], 'max-nodes');
    const at = parseIndex(commandOptions.at);
    return withResolvedAutFrame(options, (connection, frame) => {
        return extractAria(connection, frame, commandOptions.selector, maxNodes, at);
    }, 'aria');
});

// A full computed style is ~350 properties; this curated set answers the
// "why does it look/behave this way" questions (layout, visibility, box).
const REPORTED_STYLES = [
    'display', 'visibility', 'opacity', 'position', 'top', 'right', 'bottom', 'left',
    'width', 'height', 'margin', 'padding', 'border', 'box-sizing',
    'color', 'background-color', 'font-size', 'font-weight', 'line-height', 'text-align',
    'z-index', 'overflow', 'pointer-events', 'cursor',
];
const REPORTED_STATES = new Set(['focused', 'disabled', 'required', 'invalid', 'checked', 'expanded', 'selected', 'pressed', 'readonly', 'hidden']);
const projectAria = (node) => {
    var _a, _b;
    if (!node || node.ignored) {
        return undefined;
    }
    const aria = {};
    const role = (_a = node.role) === null || _a === void 0 ? void 0 : _a.value;
    if (typeof role === 'string') {
        aria.role = role;
    }
    const name = (_b = node.name) === null || _b === void 0 ? void 0 : _b.value;
    if (typeof name === 'string' && name.length > 0) {
        aria.name = name;
    }
    const states = collectTrueStates(node.properties, REPORTED_STATES);
    if (states.length) {
        aria.states = states;
    }
    return Object.keys(aria).length ? aria : undefined;
};
const readAriaNode = (connection, objectId) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { client, sessionId } = connection;
    try {
        const { node } = yield client.DOM.describeNode({ objectId }, sessionId);
        const { nodes } = yield client.Accessibility.getPartialAXTree({ backendNodeId: node.backendNodeId, fetchRelatives: false }, sessionId);
        const axNodes = nodes;
        return projectAria((_a = axNodes.find((candidate) => candidate.backendDOMNodeId === node.backendNodeId)) !== null && _a !== void 0 ? _a : axNodes[0]);
    }
    catch (err) {
        if (isRendererUnresponsive(err)) {
            throw err;
        }
        return undefined;
    }
});
const extractInspect = (connection, frame, selector, at) => withAmbiguous(connection, frame, selector, at, () => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { client, sessionId } = connection;
    yield client.DOM.enable({}, sessionId);
    yield client.Accessibility.enable(sessionId);
    const base = { selector, found: false };
    const objectId = yield querySelectorObjectId(connection, frame, selector, at !== null && at !== void 0 ? at : 0);
    if (!objectId) {
        return base;
    }
    const info = yield client.Runtime.callFunctionOn({
        functionDeclaration: readElementInfo.toString(),
        objectId,
        arguments: [{ value: REPORTED_STYLES }],
        returnByValue: true,
    }, sessionId);
    if (info.exceptionDetails) {
        throw new cli.distExports.TapError('FRAME_READ_FAILED', { message: `inspecting the element failed: ${((_a = info.exceptionDetails.exception) === null || _a === void 0 ? void 0 : _a.description) || info.exceptionDetails.text}` });
    }
    const { tag, attributes, styles, box } = info.result.value;
    const aria = yield readAriaNode(connection, objectId);
    return Object.assign(Object.assign(Object.assign(Object.assign({}, base), { found: true, tag,
        attributes }), (aria ? { aria } : {})), { box,
        styles });
}));
const inspectCommand = defineNativeCommand('inspect', (options, _args, commandOptions) => {
    const at = parseIndex(commandOptions.at);
    return withResolvedAutFrame(options, (connection, frame) => {
        return extractInspect(connection, frame, commandOptions.selector, at);
    }, 'inspect');
});

/**
 * The tap subcommands implemented entirely in the CLI, in the order they
 * appear in help output — ahead of the commands the running session's
 * schema advertises.
 */
const tapCliCommands = [sessionsCommand, statusCommand, specsCommand, runCommand, domCommand, ariaCommand, inspectCommand];

const argumentsOf = (params) => {
    return params.map(({ name, required }) => required ? `<${name}>` : `[${name}]`).join(' ');
};
const argumentDescriptions = (params) => {
    return Object.fromEntries(params.map(({ name, description }) => [name, description]));
};
const JSON_DESCRIPTION = 'print the raw JSON result instead of the human-readable rendering';
// commander wraps the option and command descriptions it renders but prints a
// program description verbatim, so this one is wrapped to the same width by hand.
const PROGRAM_DESCRIPTION = `Discover, control, and query an open-mode Cypress session from the command
line. Programmatically run specs, review results, and inspect the
application-under-test through the full test lifecycle.`;
// commander both applies a declared default and appends `(default: …)` to the
// help it generates, which is the whole reason a schema carries one. Its types
// cap the value at a string, but it stores and renders whatever it is handed,
// and a number has to arrive as one to render as 30000 rather than "30000".
const declareOption = (command, flags, description, defaultValue) => {
    command.option(flags, description, defaultValue);
};
// Every tap command accepts `--session`, `--json` and `--timeout`; all are
// consumed by the top-level `cypress tap` command before a subprogram parses, so
// declaring them on a command is purely so they render in its generated help.
// `--timeout` keeps no alias: `-t` is worth more to `--test-id`, which is typed
// far more often, and the shared flags have to spell the same on every command.
const declareSharedOptions = (command, jsonDescription) => {
    command.option('-s, --session <pid>', 'target a local Cypress session by its process id (PID)');
    command.option('--json', jsonDescription);
    declareOption(command, '--timeout <ms>', 'how long to wait on any single call into the Cypress session, in milliseconds', DEFAULT_CDP_TIMEOUT_MS);
};
const declareOptions = (command, options) => {
    var _a;
    // A command that declares `--json` in its schema does so to receive it, not to
    // add a second flag — it is declared below with the ones every command shares,
    // so the schema contributes only its description.
    const json = options.find(({ name }) => name === 'json');
    for (const option of options.filter((candidate) => candidate !== json)) {
        const { name, alias, type, required, description } = option;
        const lead = alias ? `-${alias}, ` : '';
        const flags = type === 'boolean' ? `${lead}--${name}` : `${lead}--${name} <${name}>`;
        if (required && type !== 'boolean') {
            command.requiredOption(flags, description);
        }
        else {
            declareOption(command, flags, description, option.defaultValue);
        }
    }
    declareSharedOptions(command, (_a = json === null || json === void 0 ? void 0 : json.description) !== null && _a !== void 0 ? _a : JSON_DESCRIPTION);
};
const forwardedArgs = (params, args) => {
    const forwarded = {};
    args.forEach((arg, index) => {
        const param = params[index];
        if (param) {
            forwarded[param.name] = arg;
        }
    });
    return forwarded;
};
const answerUnknownOption = (command) => {
    command.unknownOption = function (flag) {
        if (this._allowUnknownOption) {
            return;
        }
        throw new cli.distExports.UnknownOptionTapError(flag);
    };
};
const answerUnknownCommand = (program) => {
    program.unknownCommand = function () {
        throw new cli.distExports.UnknownCommandTapError(this.args[0]);
    };
};
// The flag as the reader would have typed it: every tap option declares a long
// form, and the raw flags stand in for anything that somehow does not.
const flagOf = (option) => option.long || option.flags;
/**
 * The three ways commander finds an invocation short of what the command declares.
 * A missing positional is reported for all of them at once — commander announces
 * only the first, while the reader is better served by the whole list — hence the
 * declared params rather than the name commander passed, which stands in only if
 * nothing else can be matched to it.
 */
const answerMissingInput = (command, name, params) => {
    const handlers = command;
    handlers.missingArgument = function (missing) {
        const absent = params.filter(({ required }, index) => required && this.args[index] === undefined).map((param) => param.name);
        throw new cli.distExports.MissingArgumentsTapError(name, absent.length ? absent : [missing]);
    };
    handlers.optionMissingArgument = function (option) {
        throw new cli.distExports.TapError('INVALID_OPTIONS', { detail: `"${name}" was given the ${flagOf(option)} option without a value.` });
    };
    handlers.missingMandatoryOptionValue = function (option) {
        throw new cli.distExports.MissingOptionTapError(name, flagOf(option).replace(/^--/, ''));
    };
};
const rejectExcessArguments = (name, params, args) => {
    if (args.length <= params.length) {
        return;
    }
    const given = args.length === 1 ? '1 argument was' : `${args.length} arguments were`;
    const takes = params.length === 0 ? 'takes none' : `takes at most ${params.length}`;
    throw new cli.distExports.TapError('INVALID_ARGUMENTS', { detail: `${given} passed to "${name}", but it ${takes}.` });
};
const forwardedOptions = (command, options) => {
    const opts = command.opts();
    const declared = command.options;
    const forwarded = {};
    // commander stores `--dry-run` under opts().dryRun, so resolve each schema
    // name to its declared option's attribute key rather than assuming they match
    for (const { name } of options) {
        const option = declared.find((declaredOption) => declaredOption.long === `--${name}`);
        const value = option && opts[option.attributeName()];
        if (value !== undefined) {
            forwarded[name] = String(value);
        }
    }
    return forwarded;
};
const declareCommand = (program, spec, dispatch) => {
    const { name, description, params = [], options = [] } = spec;
    const command = program.command(name);
    // Keep option values in opts() so schema names such as `command` cannot
    // collide with Command instance methods.
    command.storeOptionsAsProperties(false);
    if (params.length) {
        command.arguments(argumentsOf(params));
        command.description(description, argumentDescriptions(params));
    }
    else {
        command.description(description);
    }
    declareOptions(command, options);
    answerUnknownOption(command);
    answerMissingInput(command, name, params);
    if (dispatch) {
        command.action(() => {
            rejectExcessArguments(name, params, command.args);
            return dispatch(name, forwardedArgs(params, command.args), forwardedOptions(command, options));
        });
    }
};
const newProgram = () => {
    const program = new commander.Command('cypress tap');
    program.exitOverride();
    program.addHelpCommand(false);
    program.description(PROGRAM_DESCRIPTION);
    program.usage('[command] [args...] [options]');
    answerUnknownOption(program);
    answerUnknownCommand(program);
    answerMissingInput(program, program.name(), []);
    return program;
};
const buildTapProgram = (schema, dispatch) => {
    const program = newProgram();
    // The outer `tap` command owns --session/--json/--timeout and parses them
    // before this program runs, so they never reach here — declared only so help
    // lists them. The outer command disables its own help, making this the sole
    // place they surface.
    declareSharedOptions(program, JSON_DESCRIPTION);
    for (const native of tapCliCommands) {
        declareCommand(program, native);
    }
    // An older session may still advertise a command the CLI has since made
    // native; start() dispatches natives before ever consulting the schema, so
    // skip the shadowed advertisement rather than registering a duplicate.
    const nativeNames = new Set(tapCliCommands.map(({ name }) => name));
    for (const command of schema.commands.filter(({ name, hidden }) => !hidden && !nativeNames.has(name))) {
        declareCommand(program, command, dispatch);
    }
    return program;
};
// A one-command program used by exec/tap.ts to parse a single CLI-native
// command, so its positionals and options validate through the same commander
// grammar the schema commands use.
const buildNativeProgram = (native, dispatch) => {
    var _a;
    const program = newProgram();
    // A native command's standalone help is rendered only here, so its full
    // `details` prose stands in for the one-line `description` commander prints
    // between the usage line and the generated Arguments/Options sections.
    declareCommand(program, Object.assign(Object.assign({}, native), { description: (_a = native.details) !== null && _a !== void 0 ? _a : native.description }), dispatch);
    return program;
};

// A name this CLI does not know is whatever the user typed, so it is reported
// as unknown rather than sent verbatim.
const getKnownCommand = (command) => cli.distExports.KNOWN_COMMANDS.has(command) ? command : 'unknown';
/**
 * What an invocation reports before it runs: the command it named, and the flags
 * `cypress tap` handles itself rather than passing to a command. The flags a
 * command declares are reported once commander has parsed them, by noteTapCommand.
 */
const reportedInvocation = (command, wantsHelp, options) => ({
    command: command ? getKnownCommand(command) : undefined,
    flags: [
        ...wantsHelp ? ['help'] : [],
        ...Object.keys(options),
    ],
});

const debug = Debug('cypress:cli:tap');
// The failures that mean no session was reachable to ask. Help is answerable
// without one, so these — and only these — lose to a help invocation.
const DISCOVERY_CODES = new Set([
    'NO_SESSION',
    'SESSION_NOT_FOUND',
    'STALE_SESSION',
    'NO_BROWSER_ATTACHED',
    'UNSUPPORTED_BROWSER',
    'RENDERER_UNRESPONSIVE',
]);
const INVALID_USAGE = 'INVALID_USAGE';
const validateSchema = (value) => {
    const schema = value;
    if (!schema || typeof schema !== 'object' || typeof schema.schemaVersion !== 'number' || !Array.isArray(schema.commands)) {
        return throwTapError('PROTOCOL_MISMATCH', `${cli.distExports.TAP_SCHEMA_METHOD} returned an unrecognizable schema.`);
    }
    if (schema.schemaVersion !== cli.distExports.TAP_SCHEMA_VERSION) {
        throw new cli.distExports.VersionSkewTapError({
            sessionSchema: schema.schemaVersion,
            cliSchema: cli.distExports.TAP_SCHEMA_VERSION,
            sessionCypress: schema.cypressVersion,
            cliCypress: xvfb.util.pkgVersion(),
        });
    }
    return schema;
};
const isHelpFlag = (arg) => arg === '--help' || arg === '-h';
const buildCommandInfo = (operands) => {
    const wantsHelp = operands.some(isHelpFlag);
    const positionals = operands.filter((arg) => !isHelpFlag(arg));
    const command = positionals[0];
    return { wantsHelp, positionals, command };
};
// `--json` is parsed by the outer `cypress tap` command, so commander never
// routes it to the command being run. A command that declares it in its own
// schema needs it anyway — for that command the flag also changes what the
// session returns, not just how the CLI prints it — so it is handed over here.
const withJson = (schema, name, options, json) => {
    var _a;
    const declared = (_a = schema.commands.find((command) => command.name === name)) === null || _a === void 0 ? void 0 : _a.options.some((option) => option.name === 'json');
    return json && declared ? Object.assign(Object.assign({}, options), { json: 'true' }) : options;
};
const runNativeCommand = (native, positionals, options, wantsHelp) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    let dispatchCode;
    const program = buildNativeProgram(native, (name, args, commandOptions) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
        noteTapCommand(name, args, commandOptions);
        dispatchCode = yield native.handler(options, args, commandOptions);
    }));
    if (wantsHelp) {
        renderNativeHelp(program, native.name);
        return 0;
    }
    try {
        yield program.parseAsync(positionals, { from: 'user' });
    }
    catch (err) {
        if (err instanceof commander.CommanderError) {
            noteTapFailure(INVALID_USAGE);
            return 1;
        }
        // A command that reads its own options before resolving a session — as the
        // AUT readers do, so a bad value is answered as itself — raises outside the
        // flow that renders the rest of its failures.
        return yield renderTapFailure(err, helpFor(program, native.name));
    }
    return dispatchCode !== null && dispatchCode !== void 0 ? dispatchCode : 1;
});
const execCommand = (connection, command, commandArgs, commandOptions, json, help) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
    const outcome = validateExecResult(yield connection.call(cli.distExports.TAP_EXEC_METHOD, [command, commandArgs, commandOptions]));
    if ('error' in outcome) {
        return yield renderTapFailure(outcome.error, help);
    }
    renderOutcome(command, outcome.result, json, commandOptions);
    return 0;
});
// With no session to query, fall back to the schema this CLI ships with so the
// help listing still reflects every command the CLI knows — the query path stays
// authoritative when a session is attached (it may run a different version).
const renderKnownSchema = (command) => {
    const schema = cli.distExports.buildTapSchema(xvfb.util.pkgVersion());
    const program = buildTapProgram(schema, () => { });
    return renderStaticHelp(program, schema, command);
};
const runTap = (_a, options_1) => xvfb.__awaiter(void 0, [_a, options_1], void 0, function* ({ wantsHelp, positionals, command }, options) {
    const native = tapCliCommands.find(({ name }) => name === command);
    if (native) {
        return runNativeCommand(native, positionals, options, wantsHelp);
    }
    try {
        const selection = yield resolveSession({ session: options.session, cwd: process.cwd() });
        return yield withTapConnection(selection.session, (connection) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
            const schema = validateSchema(yield connection.call(cli.distExports.TAP_SCHEMA_METHOD));
            let dispatchCode = 0;
            const program = buildTapProgram(schema, (name, args, commandOptions) => xvfb.__awaiter(void 0, void 0, void 0, function* () {
                noteTapCommand(name, args, commandOptions);
                dispatchCode = yield execCommand(connection, name, args, withJson(schema, name, commandOptions, options.json), options.json, helpFor(program, name));
            }));
            if (wantsHelp || !command) {
                return renderSchemaHelp(program, schema, selection, command);
            }
            try {
                yield program.parseAsync(positionals, { from: 'user' });
            }
            catch (err) {
                if (err instanceof commander.CommanderError) {
                    noteTapFailure(INVALID_USAGE);
                    return 1;
                }
                // A name or flag commander could not place is answered here, where the
                // program that knows the real ones is still in scope to list them.
                if (cli.distExports.isTapError(err)) {
                    return yield renderTapFailure(err, helpFor(program, command));
                }
                throw err;
            }
            return dispatchCode;
        }), options.timeout);
    }
    catch (err) {
        // Help is answerable without a session, so a discovery failure falls back
        // to the schema the CLI ships with rather than reporting the failure.
        if (cli.distExports.isTapError(err) && DISCOVERY_CODES.has(err.code) && (wantsHelp || !command)) {
            return yield renderKnownSchema(command);
        }
        debug('tap %s failed: %s %s', command || '(help)', err.code, err.message);
        return yield renderTapFailure(err);
    }
});
const tapModule = {
    start() {
        return xvfb.__awaiter(this, arguments, void 0, function* (operands = [], options = {}) {
            debug('tap invocation %o with options %o', operands, options);
            const info = buildCommandInfo(operands);
            let exitCode = 1;
            beginTapTrace(reportedInvocation(info.command, info.wantsHelp, options));
            // The CLI exits the moment this returns, so the trace is reported before it
            // does rather than left in flight.
            try {
                exitCode = yield runTap(info, options);
                return exitCode;
            }
            finally {
                yield reportTapTrace(exitCode);
            }
        });
    },
};

exports.default = tapModule;

//#region src/index.ts
const IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[a-z]:[/\\]/i;
const LINE_WITH_FUNCTION_RE = /^\s+at (?<function>.+) \((?<source>[^)]+)\)$/u;
const LINE_WITHOUT_FUNCTION_RE = /^\s+at (?<source>\S+)$/u;
const SOURCE_RE = /^(?<source>.+):(?<line>\d+):(?<column>\d+)$/u;
function captureRawStackTrace() {
	if (!Error.captureStackTrace) return;
	const stack = /* @__PURE__ */ new Error();
	Error.captureStackTrace(stack);
	return stack.stack;
}
function captureStackTrace() {
	const stack = captureRawStackTrace();
	return stack ? parseRawStackTrace(stack) : [];
}
function parseRawStackTrace(stacktrace) {
	const trace = [];
	for (const line of stacktrace.split("\n")) {
		const match = LINE_WITH_FUNCTION_RE.exec(line) || LINE_WITHOUT_FUNCTION_RE.exec(line);
		if (!match?.groups?.source) continue;
		const parsed = {
			function: void 0,
			...match.groups,
			source: match.groups.source
		};
		const parsedSource = SOURCE_RE.exec(parsed.source)?.groups;
		if (parsedSource) Object.assign(parsed, parsedSource);
		if (IS_ABSOLUTE_RE.test(parsed.source)) parsed.source = `file://${parsed.source}`;
		if (parsed.source === import.meta.url) continue;
		for (const key of ["line", "column"]) if (parsed[key]) parsed[key] = Number(parsed[key]);
		trace.push(parsed);
	}
	return trace;
}
//#endregion
export { captureRawStackTrace, captureStackTrace, parseRawStackTrace };

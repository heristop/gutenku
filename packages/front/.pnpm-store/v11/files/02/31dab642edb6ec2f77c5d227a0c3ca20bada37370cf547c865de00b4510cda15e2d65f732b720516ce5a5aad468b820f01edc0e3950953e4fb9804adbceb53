import process from 'node:process';

function parseVersion(versionString) {
	const parts = (versionString || '').split('.').map(n => Number.parseInt(n, 10));
	return {
		major: parts[0] || 0,
		minor: parts[1] || 0,
		patch: parts[2] || 0,
	};
}

function versionSatisfies(version, minMajor, minMinor = 0, minPatch = 0) {
	const {major, minor, patch} = version;
	return major > minMajor
		|| (major === minMajor && minor > minMinor)
		|| (major === minMajor && minor === minMinor && patch >= minPatch);
}

function getKonsoleVersion(env) {
	const version = Number.parseInt(env.KONSOLE_VERSION, 10);
	// Konsole 22.04 (encoded as 220400) added graphics support
	return Number.isNaN(version) ? 0 : version;
}

function isWezTerm(env) {
	return Boolean(env.WEZTERM_PANE || env.WEZTERM_UNIX_SOCKET);
}

function isWezTermTerminal(env) {
	const termProgram = (env.TERM_PROGRAM || '').toLowerCase();
	const lcTerminal = (env.LC_TERMINAL || '').toLowerCase();
	return isWezTerm(env) || termProgram === 'wezterm' || lcTerminal === 'wezterm';
}

function wezTermVersionSatisfies(env, minMajor, minMinor = 0, minPatch = 0) {
	if (!isWezTermTerminal(env)) {
		return false;
	}

	if (!env.TERM_PROGRAM_VERSION) {
		return true;
	}

	const version = parseVersion(env.TERM_PROGRAM_VERSION);
	return versionSatisfies(version, minMajor, minMinor, minPatch);
}

function supportsKitty(stream, env) {
	if (stream && !stream.isTTY) {
		return false;
	}

	if (isWezTermTerminal(env)) {
		return true;
	}

	// Strong indicators for specific terminals
	if (env.KITTY_WINDOW_ID || env.KITTY_PID) {
		return true;
	}

	if (env.GHOSTTY_RESOURCES_DIR) {
		return true;
	}

	const termProgram = (env.TERM_PROGRAM || '').toLowerCase();

	// Terminals with full Kitty protocol support
	if (['kitty', 'ghostty', 'rio', 'warpterminal'].includes(termProgram)) {
		return true;
	}

	// ITerm2 requires version 3.6+ for Kitty protocol
	if (termProgram === 'iterm.app') {
		const version = parseVersion(env.TERM_PROGRAM_VERSION);
		return versionSatisfies(version, 3, 6);
	}

	// Konsole requires version 22.04+
	if (termProgram === 'konsole' || env.KONSOLE_VERSION) {
		return getKonsoleVersion(env) >= 220_400;
	}

	// Check TERM for known patterns
	const term = env.TERM || '';
	if (/kitty/i.test(term) || term === 'xterm-ghostty') {
		return true;
	}

	return false;
}

function supportsIterm2(stream, env) {
	if (stream && !stream.isTTY) {
		return false;
	}

	const termProgram = (env.TERM_PROGRAM || '').toLowerCase();

	if (isWezTermTerminal(env)) {
		return wezTermVersionSatisfies(env, 20_220_319);
	}

	// ITerm2 requires version 2.9.20150512+
	if (termProgram === 'iterm.app') {
		const version = parseVersion(env.TERM_PROGRAM_VERSION);
		return versionSatisfies(version, 2, 9, 20_150_512);
	}

	// VS Code requires version 1.80+
	if (termProgram === 'vscode') {
		const version = parseVersion(env.TERM_PROGRAM_VERSION);
		return versionSatisfies(version, 1, 80);
	}

	// Rio requires version 0.1.13+
	if (termProgram === 'rio') {
		const version = parseVersion(env.TERM_PROGRAM_VERSION);
		return versionSatisfies(version, 0, 1, 13);
	}

	// Terminals with full iTerm2 protocol support
	if (termProgram === 'mintty') {
		return true;
	}

	// Konsole requires version 22.04+
	if (termProgram === 'konsole' || env.KONSOLE_VERSION) {
		return getKonsoleVersion(env) >= 220_400;
	}

	// LC_TERMINAL fallback (SSH-friendly)
	const lcTerminal = (env.LC_TERMINAL || '').toLowerCase();
	if (lcTerminal === 'iterm2') {
		return true;
	}

	return false;
}

function supportsSixel(stream, env) {
	// Sixel detection via environment variables is limited.
	// Many terminals (xterm, foot, etc.) support Sixel but don't set TERM_PROGRAM.
	// For accurate detection, a DA1 query would be needed.

	if (stream && !stream.isTTY) {
		return false;
	}

	const termProgram = (env.TERM_PROGRAM || '').toLowerCase();

	if (isWezTermTerminal(env)) {
		return wezTermVersionSatisfies(env, 20_200_620);
	}

	// VS Code requires version 1.80+
	if (termProgram === 'vscode') {
		const version = parseVersion(env.TERM_PROGRAM_VERSION);
		return versionSatisfies(version, 1, 80);
	}

	// Rio requires version 0.1.12+
	if (termProgram === 'rio') {
		const version = parseVersion(env.TERM_PROGRAM_VERSION);
		return versionSatisfies(version, 0, 1, 12);
	}

	// Terminals with full Sixel support
	// Note: foot also supports Sixel but doesn't set TERM_PROGRAM
	if (termProgram === 'mintty') {
		return true;
	}

	// Konsole requires version 22.04+
	if (termProgram === 'konsole' || env.KONSOLE_VERSION) {
		return getKonsoleVersion(env) >= 220_400;
	}

	// Check TERM for mlterm (supports Sixel from version 3.1.9+)
	const term = env.TERM || '';
	if (/^mlterm/i.test(term)) {
		return true;
	}

	return false;
}

export function createSupportsTerminalGraphics(stream) {
	const {env} = process;

	return {
		kitty: supportsKitty(stream, env),
		iterm2: supportsIterm2(stream, env),
		sixel: supportsSixel(stream, env),
	};
}

const supportsTerminalGraphics = {
	stdout: createSupportsTerminalGraphics(process.stdout),
	stderr: createSupportsTerminalGraphics(process.stderr),
};

export default supportsTerminalGraphics;

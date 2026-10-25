import {runAppleScript} from 'run-applescript';

// Only a double quote can end the AppleScript string literal. A backslash can pre-escape one, and line breaks are rejected as defense in depth.
const bundleIdentifierPattern = /^[^\n\r"\\]+$/u;

export default async function bundleName(bundleId) {
	if (typeof bundleId !== 'string') {
		throw new TypeError('Expected a string bundle identifier');
	}

	if (!bundleIdentifierPattern.test(bundleId)) {
		throw new TypeError(`Invalid bundle identifier: ${JSON.stringify(bundleId)}`);
	}

	return runAppleScript(`tell application "Finder" to set app_path to application file id "${bundleId}" as string\ntell application "System Events" to get value of property list item "CFBundleName" of property list file (app_path & ":Contents:Info.plist")`);
}

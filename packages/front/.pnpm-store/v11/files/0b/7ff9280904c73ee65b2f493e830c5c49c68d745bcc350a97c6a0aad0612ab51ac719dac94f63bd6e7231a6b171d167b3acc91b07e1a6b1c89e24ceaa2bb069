import { flatten, unflatten } from "./_chunks/libs/flat.mjs";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { homedir } from "node:os";
import destr from "destr";
import { defu } from "defu";
const RE_KEY_VAL = /^\s*([^\s=]+)\s*=\s*(.*)?\s*$/;
const RE_LINES = /\n|\r|\r\n/;
const defaults = {
	name: ".conf",
	dir: process.cwd(),
	flat: false
};
function withDefaults(options) {
	if (typeof options === "string") options = { name: options };
	return {
		...defaults,
		...options
	};
}
function parse(contents, options = {}) {
	const config = {};
	const lines = contents.split(RE_LINES);
	for (const line of lines) {
		const match = line.match(RE_KEY_VAL);
		if (!match) continue;
		const key = match[1];
		if (!key || key === "__proto__" || key === "constructor") continue;
		const value = destr((match[2] || "").trim());
		if (key.endsWith("[]")) {
			const nkey = key.slice(0, Math.max(0, key.length - 2));
			config[nkey] = (config[nkey] || []).concat(value);
			continue;
		}
		config[key] = value;
	}
	return options.flat ? config : unflatten(config, { overwrite: true });
}
function parseFile(path, options) {
	if (!existsSync(path)) return {};
	return parse(readFileSync(path, "utf8"), options);
}
function read(options) {
	options = withDefaults(options);
	return parseFile(resolve(options.dir, options.name), options);
}
function readUser(options) {
	options = withDefaults(options);
	options.dir = process.env.XDG_CONFIG_HOME || homedir();
	return read(options);
}
function serialize(config) {
	return Object.entries(flatten(config)).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join("\n");
}
function write(config, options) {
	_write(config, withDefaults(options), false);
}
function _write(config, options, secure) {
	const path = resolve(options.dir, options.name);
	mkdirSync(dirname(path), {
		recursive: true,
		...secure && { mode: 448 }
	});
	writeFileSync(path, serialize(config), {
		encoding: "utf8",
		...secure && { mode: 384 }
	});
	if (secure) chmodSync(path, 384);
}
function writeUser(config, options) {
	options = withDefaults(options);
	options.dir = process.env.XDG_CONFIG_HOME || homedir();
	_write(config, options, true);
}
function userConfigDir() {
	return process.env.XDG_CONFIG_HOME || resolve(homedir(), ".config");
}
function readUserConfig(options) {
	options = withDefaults(options);
	options.dir = userConfigDir();
	return read(options);
}
function writeUserConfig(config, options) {
	options = withDefaults(options);
	options.dir = userConfigDir();
	_write(config, options, true);
}
function updateUserConfig(config, options) {
	options = withDefaults(options);
	options.dir = userConfigDir();
	return _update(config, options, true);
}
function update(config, options) {
	return _update(config, withDefaults(options), false);
}
function _update(config, options, secure) {
	if (!options.flat) config = unflatten(config, { overwrite: true });
	const newConfig = defu(config, read(options));
	_write(newConfig, options, secure);
	return newConfig;
}
function updateUser(config, options) {
	options = withDefaults(options);
	options.dir = process.env.XDG_CONFIG_HOME || homedir();
	return _update(config, options, true);
}
export { defaults, parse, parseFile, read, readUser, readUserConfig, serialize, update, updateUser, updateUserConfig, userConfigDir, write, writeUser, writeUserConfig };

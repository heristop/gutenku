import { e as DetectOptions, f as DetectResult, a as AgentName, A as Agent } from './shared/package-manager-detector.vknIX8gX.mjs';

/**
 * Detects the package manager used in the running process.
 *
 * This method will check for `process.env.npm_config_user_agent`.
 */
declare function getUserAgent(): AgentName | null;
/**
 * Detects the package manager used in the project.
 * @param options {DetectOptions} The options to use when detecting the package manager.
 * @returns {Promise<DetectResult | null>} The detected package manager or `null` if not found.
 */
declare function detect(options?: DetectOptions): Promise<DetectResult | null>;
/**
 * Extracts the `major[.minor[.patch]]` part of a version string, e.g. `^9.12.1+sha512.abc` becomes `9.12.1`.
 * @param version The raw version, as found in `packageManager` or `devEngines.packageManager.version`.
 * @returns The extracted version, or the input unchanged if it contains no numeric version.
 */
declare function normalizeAgentVersion(version: string | undefined): string | undefined;
/**
 * Resolves the agent for a package manager name and version, e.g. to pass to `resolveCommand` without running `detect`.
 *
 * Yarn above v1 resolves to `yarn@berry` (with version `berry`) and pnpm below v7 to `pnpm@6`.
 * @param name The package manager name.
 * @param ver The package manager version, see `normalizeAgentVersion`.
 * @returns The resolved name, agent and version, or `undefined` if the name is not a known agent.
 */
declare function resolveAgent(name: AgentName, ver?: string): {
    name: AgentName;
    agent: Agent;
    version: string | undefined;
} | undefined;

export { detect, getUserAgent, normalizeAgentVersion, resolveAgent };

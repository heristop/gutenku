function splitRunArgs(args, valueFlags = []) {
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("-"))
      continue;
    if (i > 0 && valueFlags.includes(args[i - 1]))
      continue;
    return { before: args.slice(0, i), script: args[i], after: args.slice(i + 1) };
  }
  return { before: args, script: void 0, after: [] };
}
function dashDashArg(agent, agentCommand, valueFlags = []) {
  return (args) => {
    const { before, script, after } = splitRunArgs(args, valueFlags);
    if (script === void 0)
      return [agent, agentCommand, ...before];
    if (after.length > 0)
      return [agent, agentCommand, ...before, script, "--", ...after];
    return [agent, agentCommand, ...before, script];
  };
}
const npm = {
  "agent": ["npm", 0],
  "run": dashDashArg("npm", "run", ["-w", "--workspace"]),
  "install": ["npm", "i", 0],
  "frozen": ["npm", "ci", 0],
  "global": ["npm", "i", "-g", 0],
  "add": ["npm", "i", 0],
  "upgrade": ["npm", "update", 0],
  "upgrade-interactive": null,
  "dedupe": ["npm", "dedupe", 0],
  "why": ["npm", "why", 0],
  "execute": ["npx", 0],
  "execute-local": ["npx", 0],
  "uninstall": ["npm", "uninstall", 0],
  "global_uninstall": ["npm", "uninstall", "-g", 0]
};
const yarn = {
  "agent": ["yarn", 0],
  "run": ["yarn", "run", 0],
  "install": ["yarn", "install", 0],
  "frozen": ["yarn", "install", "--frozen-lockfile", 0],
  "global": ["yarn", "global", "add", 0],
  "add": ["yarn", "add", 0],
  "upgrade": ["yarn", "upgrade", 0],
  "upgrade-interactive": ["yarn", "upgrade-interactive", 0],
  "dedupe": null,
  "why": ["yarn", "why", 0],
  "execute": ["npx", 0],
  "execute-local": dashDashArg("yarn", "exec"),
  "uninstall": ["yarn", "remove", 0],
  "global_uninstall": ["yarn", "global", "remove", 0]
};
const yarnBerry = {
  ...yarn,
  "frozen": ["yarn", "install", "--immutable", 0],
  "upgrade": ["yarn", "up", 0],
  "upgrade-interactive": ["yarn", "up", "-i", 0],
  "dedupe": ["yarn", "dedupe", 0],
  "execute": ["yarn", "dlx", 0],
  "execute-local": ["yarn", "exec", 0],
  // Yarn 2+ removed 'global', see https://github.com/yarnpkg/berry/issues/821
  "global": ["npm", "i", "-g", 0],
  "global_uninstall": ["npm", "uninstall", "-g", 0]
};
function createPnpmCommands(cli) {
  return {
    "agent": [cli, 0],
    "run": [cli, "run", 0],
    "install": [cli, "i", 0],
    "frozen": [cli, "i", "--frozen-lockfile", 0],
    "global": [cli, "add", "-g", 0],
    "add": [cli, "add", 0],
    "upgrade": [cli, "update", 0],
    "upgrade-interactive": [cli, "update", "-i", 0],
    "dedupe": [cli, "dedupe", 0],
    "why": [cli, "why", 0],
    "execute": [cli, "dlx", 0],
    "execute-local": [cli, "exec", 0],
    "uninstall": [cli, "remove", 0],
    "global_uninstall": [cli, "remove", "--global", 0]
  };
}
const pnpm = createPnpmCommands("pnpm");
const pnpmRush = createPnpmCommands("rush-pnpm");
const bun = {
  "agent": ["bun", 0],
  "run": ["bun", "run", 0],
  "install": ["bun", "install", 0],
  "frozen": ["bun", "install", "--frozen-lockfile", 0],
  "global": ["bun", "add", "-g", 0],
  "add": ["bun", "add", 0],
  "upgrade": ["bun", "update", 0],
  "upgrade-interactive": ["bun", "update", "-i", 0],
  "dedupe": null,
  "why": ["bun", "why", 0],
  "execute": ["bun", "x", 0],
  "execute-local": ["bun", "x", 0],
  "uninstall": ["bun", "remove", 0],
  "global_uninstall": ["bun", "remove", "-g", 0]
};
const aube = {
  "agent": ["aube", 0],
  "run": ["aube", "run", 0],
  "install": ["aube", "install", 0],
  "frozen": ["aube", "install", "--frozen-lockfile", 0],
  "global": ["aube", "add", "-g", 0],
  "add": ["aube", "add", 0],
  "upgrade": ["aube", "update", 0],
  "upgrade-interactive": ["aube", "update", "-i", 0],
  "dedupe": ["aube", "dedupe", 0],
  "why": ["aube", "why", 0],
  "execute": ["aube", "dlx", 0],
  "execute-local": ["aube", "exec", 0],
  "uninstall": ["aube", "remove", 0],
  "global_uninstall": ["aube", "remove", "-g", 0]
};
function denoAdd(args) {
  if (args.includes("--npm") || args.includes("--jsr"))
    return ["deno", "add", ...args];
  return ["deno", "add", ...args.map((arg) => arg.startsWith("-") || arg.includes(":") ? arg : `npm:${arg}`)];
}
const deno = {
  "agent": ["deno", 0],
  "run": ["deno", "task", 0],
  "install": ["deno", "install", 0],
  "frozen": ["deno", "install", "--frozen", 0],
  "global": ["deno", "install", "-g", 0],
  "add": denoAdd,
  "upgrade": ["deno", "outdated", "--update", 0],
  "upgrade-interactive": ["deno", "outdated", "--update", 0],
  "dedupe": null,
  "why": ["deno", "why", 0],
  "execute": ["deno", "x", 0],
  "execute-local": ["deno", "task", "--eval", 0],
  "uninstall": ["deno", "remove", 0],
  "global_uninstall": ["deno", "uninstall", "-g", 0]
};
const nub = {
  "agent": ["nub", 0],
  "run": ["nub", "run", 0],
  "install": ["nub", "install", 0],
  "frozen": ["nub", "install", "--frozen-lockfile", 0],
  "global": ["nub", "add", "-g", 0],
  "add": ["nub", "add", 0],
  "upgrade": ["nub", "update", 0],
  "upgrade-interactive": ["nub", "update", "-i", 0],
  "dedupe": ["nub", "dedupe", 0],
  "why": ["nub", "why", 0],
  "execute": ["nubx", 0],
  "execute-local": ["nub", "exec", 0],
  "uninstall": ["nub", "remove", 0],
  "global_uninstall": ["nub", "remove", "-g", 0]
};
const upm = {
  "agent": ["upm", 0],
  "run": ["upm", "run", 0],
  "install": ["upm", "install", 0],
  "frozen": ["upm", "install", "--frozen-lockfile", 0],
  "global": null,
  "add": ["upm", "add", 0],
  "upgrade": null,
  "upgrade-interactive": null,
  "dedupe": ["upm", "dedupe", 0],
  "execute": ["upx", 0],
  "execute-local": ["upm", "exec", 0],
  "uninstall": ["upm", "remove", 0],
  "global_uninstall": null,
  "why": null
};
const COMMANDS = {
  "npm": npm,
  "yarn": yarn,
  "yarn@berry": yarnBerry,
  "pnpm": pnpm,
  // pnpm v6.x or below
  "pnpm@6": {
    ...pnpm,
    run: dashDashArg("pnpm", "run", ["-F", "--filter"])
  },
  "pnpm-rush": pnpmRush,
  "bun": bun,
  "aube": aube,
  "deno": deno,
  "nub": nub,
  "upm": upm
};
const WORKSPACE_ROOT_CHECK_COMMANDS = {
  "yarn": ["add", "uninstall"],
  "pnpm": ["add"],
  "pnpm@6": ["add"],
  "pnpm-rush": ["add"]
};
const MINIMUM_RELEASE_AGE_FLAGS = {
  "npm": {
    commands: ["install", "add", "upgrade", "global", "execute"],
    flag: (minutes) => `--min-release-age=${minutes / 1440}`
  },
  "pnpm": {
    commands: ["install", "add", "upgrade", "upgrade-interactive", "global", "execute"],
    flag: (minutes) => `--config.minimum-release-age=${minutes}`
  },
  "pnpm-rush": {
    commands: ["install", "add", "upgrade", "upgrade-interactive", "global", "execute"],
    flag: (minutes) => `--config.minimum-release-age=${minutes}`
  },
  "bun": {
    commands: ["install", "add", "upgrade", "upgrade-interactive", "global"],
    flag: (minutes) => `--minimum-release-age=${minutes * 60}`
  },
  "deno": {
    commands: ["install", "add", "global", "execute"],
    flag: (minutes) => `--minimum-dependency-age=${minutes}`
  },
  "nub": {
    commands: ["install", "add", "upgrade", "upgrade-interactive", "global", "execute"],
    flag: (minutes) => `--minimum-release-age=${minutes}`
  },
  "upm": {
    commands: ["install", "add", "execute"],
    flag: (minutes) => `--min-release-age=${minutes / 1440}`
  }
};
function resolveCommand(agent, command, args, options = {}) {
  const value = COMMANDS[agent][command];
  if (options.ignoreWorkspaceRootCheck && WORKSPACE_ROOT_CHECK_COMMANDS[agent]?.includes(command))
    args = ["--ignore-workspace-root-check", ...args];
  const releaseAge = MINIMUM_RELEASE_AGE_FLAGS[agent];
  if (options.minimumReleaseAge != null && releaseAge?.commands.includes(command))
    args = [releaseAge.flag(options.minimumReleaseAge), ...args];
  return constructCommand(value, args);
}
function constructCommand(value, args) {
  if (value == null)
    return null;
  const list = typeof value === "function" ? value(args) : value.flatMap((v) => {
    if (typeof v === "number")
      return args;
    return [v];
  });
  return {
    command: list[0],
    args: list.slice(1)
  };
}

export { COMMANDS, constructCommand, resolveCommand, splitRunArgs };

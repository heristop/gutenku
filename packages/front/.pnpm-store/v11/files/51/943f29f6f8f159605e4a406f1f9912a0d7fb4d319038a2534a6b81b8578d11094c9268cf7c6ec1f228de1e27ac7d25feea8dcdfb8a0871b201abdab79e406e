import process from 'node:process';
import { gray, bold, red, yellow } from 'ansis';
import { cac } from 'cac';
import { b as build } from '../shared/vite-ssg.D5Fdxh1E.mjs';
import 'node:fs';
import 'node:fs/promises';
import 'node:path';
import 'node:url';
import '@unhead/dom';
import 'jsdom';
import 'vite';
import '../shared/vite-ssg.C6pK7rvr.mjs';

const cli = cac("vite-ssg");
cli.command("build", "Build SSG").option("--script <script>", "Rewrites script loading timing").option("--mock", "Mock browser globals (window, document, etc.) for SSG").option("--mode <mode>", "Specify the mode the Vite process is running in").option("--config, -c <config>", "The vite config file to use").option("--base, -b <base>", "The base path to render").action(async (args) => {
  const { config: configFile = void 0, ...ssgOptions } = args;
  if (args.script && !["sync", "async", "defer", "async defer"].includes(args.script)) {
    console.error(`
${gray("[vite-ssg]")} ${bold(red("Invalid script option."))}`);
    process.exit(1);
  }
  await build(ssgOptions, { configFile });
  const waitInSeconds = 15;
  const timeout = setTimeout(() => {
    console.log(`${gray("[vite-ssg]")} ${yellow(`Build process still running after ${waitInSeconds}s. There might be something misconfigured in your setup. Force exit.`)}`);
    process.exit(0);
  }, waitInSeconds * 1e3);
  timeout.unref();
});
cli.on("command:*", () => {
  console.error(`
${gray("[vite-ssg]")} ${bold(red("Invalid command."))}`);
  cli.outputHelp();
  process.exit(1);
});
cli.help();
cli.parse(process.argv);

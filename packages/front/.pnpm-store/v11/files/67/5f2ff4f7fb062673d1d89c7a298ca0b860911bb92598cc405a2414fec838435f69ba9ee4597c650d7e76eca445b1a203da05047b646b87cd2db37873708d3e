import { Agent, Agent as Agent$1 } from "package-manager-detector";
//#region src/detect.d.ts
export type PackageManager = 'pnpm' | 'yarn' | 'npm' | 'bun';
export declare function detectPackageManager(cwd?: any): Promise<Agent$1 | null>;
//#endregion
//#region src/install.d.ts
export interface InstallPackageOptions {
  cwd?: string;
  dev?: boolean;
  silent?: boolean;
  packageManager?: string;
  preferOffline?: boolean;
  additionalArgs?: string[] | ((agent: string, detectedAgent: string) => string[] | undefined);
}
export declare function installPackage(names: string | string[], options?: InstallPackageOptions): Promise<import("tinyexec").Output>;
//#endregion
//#region src/uninstall.d.ts
export interface UninstallPackageOptions {
  cwd?: string;
  dev?: boolean;
  silent?: boolean;
  packageManager?: string;
  additionalArgs?: string[];
}
export declare function uninstallPackage(names: string | string[], options?: UninstallPackageOptions): Promise<import("tinyexec").Output>;
//#endregion
export type { Agent };
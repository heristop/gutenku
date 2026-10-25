import childProcess from 'child_process';
export declare const LaunchErrorCodes: {
    readonly ERR_LAUNCHER_PATH_NOT_SET: "ERR_LAUNCHER_PATH_NOT_SET";
    readonly ERR_LAUNCHER_INVALID_USER_DATA_DIRECTORY: "ERR_LAUNCHER_INVALID_USER_DATA_DIRECTORY";
    readonly ERR_LAUNCHER_UNSUPPORTED_PLATFORM: "ERR_LAUNCHER_UNSUPPORTED_PLATFORM";
    readonly ERR_LAUNCHER_NOT_INSTALLED: "ERR_LAUNCHER_NOT_INSTALLED";
};
export declare type LaunchErrorCodes = typeof LaunchErrorCodes[keyof typeof LaunchErrorCodes];
export declare function defaults<T>(val: T | undefined, def: T): T;
export declare function delay(time: number): Promise<unknown>;
export declare class LauncherError extends Error {
    message: string;
    code?: string;
    constructor(message?: string, code?: string);
}
export declare class ChromePathNotSetError extends LauncherError {
    message: string;
    code: "ERR_LAUNCHER_PATH_NOT_SET";
}
export declare class InvalidUserDataDirectoryError extends LauncherError {
    message: string;
    code: "ERR_LAUNCHER_INVALID_USER_DATA_DIRECTORY";
}
export declare class UnsupportedPlatformError extends LauncherError {
    message: string;
    code: "ERR_LAUNCHER_UNSUPPORTED_PLATFORM";
}
export declare class ChromeNotInstalledError extends LauncherError {
    message: string;
    code: "ERR_LAUNCHER_NOT_INSTALLED";
}
export declare function getPlatform(): "wsl" | "aix" | "android" | "darwin" | "freebsd" | "linux" | "openbsd" | "sunos" | "win32" | "cygwin" | "netbsd";
export declare function makeTmpDir(): string;
export declare function toWin32Path(dir?: string): string;
export declare function toWSLPath(dir: string, fallback: string): string;
export declare function getWSLLocalAppDataPath(path: string): string;
export declare function makeWin32TmpDir(): string;
export { childProcess as _childProcessForTesting };

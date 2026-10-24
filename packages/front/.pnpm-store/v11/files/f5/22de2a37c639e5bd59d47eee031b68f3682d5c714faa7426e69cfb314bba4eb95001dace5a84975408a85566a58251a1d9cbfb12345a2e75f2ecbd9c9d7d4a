import { IOutput } from '../interfaces';
export interface IOutputOptions {
    verbose?: boolean;
    debug?: boolean;
}
export declare class Output implements IOutput {
    private verb;
    private readonly debugMode;
    constructor(verbose?: boolean | IOutputOptions, debugMode?: boolean);
    set verbose(value: boolean);
    debug: (message: string, obj?: unknown) => void;
    info(message: string): void;
    error(message: string, exitProcess?: boolean): void;
    clear(): void;
    assert(claim: unknown, message: string): void;
}

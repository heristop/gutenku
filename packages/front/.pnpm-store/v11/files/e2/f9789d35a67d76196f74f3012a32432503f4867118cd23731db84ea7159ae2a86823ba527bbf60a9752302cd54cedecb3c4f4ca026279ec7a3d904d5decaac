import { IConfig, ReplacerOptions } from '../interfaces';
type ReplacerOption = ReplacerOptions[string];
export interface IReplacerEntryParams {
    config: IConfig;
    defaultReplacers: ReplacerOptions;
    entry: [string, ReplacerOption];
    cwd: string;
    nodeModules: string[];
}
export declare function importReplacerEntry(params: IReplacerEntryParams): Promise<void>;
export {};

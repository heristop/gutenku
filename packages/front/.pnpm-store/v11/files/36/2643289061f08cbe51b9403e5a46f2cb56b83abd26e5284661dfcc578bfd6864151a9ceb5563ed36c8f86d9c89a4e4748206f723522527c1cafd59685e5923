import * as axe from 'axe-core';
declare global {
    interface Window {
        axe: typeof axe;
    }
}
declare global {
    namespace Cypress {
        interface Chainable {
            injectAxe: typeof injectAxe;
            configureAxe: typeof configureAxe;
            checkA11y: typeof checkA11y;
        }
    }
}
export interface Options extends axe.RunOptions {
    includedImpacts?: string[];
    interval?: number;
    retries?: number;
}
export interface InjectOptions {
    axeCorePath?: string;
}
export declare const injectAxe: (injectOptions?: InjectOptions) => void;
export declare const configureAxe: (configurationOptions?: {}) => void;
declare const checkA11y: (context?: axe.ElementContext, options?: Options, violationCallback?: (violations: axe.Result[]) => void, skipFailures?: boolean) => void;
export {};

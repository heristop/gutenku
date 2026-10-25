import type { DomEventNameWithModifier } from './constants/dom-events';
import { KeyName, codesByKeyName, keyCodesByKeyName } from './constants/dom-events';
interface TriggerOptions {
    code?: string;
    key?: string;
    keyCode?: number;
    [custom: string]: any;
}
declare function createDOMEvent(eventString: DomEventNameWithModifier | string, options?: TriggerOptions): Event & TriggerOptions;
export { TriggerOptions, createDOMEvent, codesByKeyName, keyCodesByKeyName, KeyName };

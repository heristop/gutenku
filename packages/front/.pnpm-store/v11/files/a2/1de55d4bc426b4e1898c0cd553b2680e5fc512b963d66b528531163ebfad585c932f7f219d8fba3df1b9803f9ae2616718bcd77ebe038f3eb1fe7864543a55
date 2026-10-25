import { CustomCommand, CustomTab, PluginDescriptor, PluginSetupFunction } from "@vue/devtools-kit";

//#region src/index-node.d.ts
declare function addCustomCommand(): void;
declare function addCustomTab(): void;
declare function onDevToolsClientConnected(_fn: () => void): Promise<void>;
declare function onDevToolsConnected(_fn: () => void): Promise<void>;
declare function removeCustomCommand(): void;
declare function setupDevToolsPlugin(_pluginDescriptor: PluginDescriptor, _setupFn: PluginSetupFunction): void;
//#endregion
export { type CustomCommand, type CustomTab, addCustomCommand, addCustomTab, onDevToolsClientConnected, onDevToolsConnected, removeCustomCommand, setupDevToolsPlugin, setupDevToolsPlugin as setupDevtoolsPlugin };
import { createDebug } from "obug";
import path from "node:path";
//#region src/tsc/context.ts
const debug = createDebug("rolldown-plugin-dts:tsc-context");
/** Creates an empty, isolated TypeScript compiler context. */
function createContext() {
	return {
		programs: [],
		files: /* @__PURE__ */ new Map(),
		projects: /* @__PURE__ */ new Map()
	};
}
/**
* Removes a file and any dependent compiler state from a context.
*
* @param context - Context to invalidate.
* @param file - File path to remove. Relative paths resolve from the process
* working directory.
*/
function invalidateContextFile(context, file) {
	file = path.resolve(file).replaceAll("\\", "/");
	debug(`invalidating context file: ${file}`);
	context.files.delete(file);
	context.programs = context.programs.filter((program) => {
		return program.getSourceFiles().every((sourceFile) => sourceFile.fileName !== file);
	});
	context.projects.clear();
}
/** Shared compiler context used when no explicit context is provided. */
const globalContext = createContext();
//#endregion
export { createContext, globalContext, invalidateContextFile };

import { spawn } from "node:child_process";
const SHA1_LENGTH = 40;
const EMPTY_ERROR_MAP = new Map([]);
export async function getStatusShort(pSpawnFunction = spawn) {
	const lErrorMap = new Map([
		[129, `'${process.cwd()}' does not seem to be a git repository`],
	]);
	const lStatusOutput = await getGitResult(
		["status", "--porcelain"],
		lErrorMap,
		pSpawnFunction,
	);
	return lStatusOutput;
}
export async function getDiffLines(
	pOldRevision,
	pNewRevision,
	pSpawnFunction = spawn,
) {
	const lErrorMap = new Map([
		[
			128,
			`revision '${pOldRevision}' ${pNewRevision ? `(or '${pNewRevision}') ` : ""}unknown`,
		],
		[129, `'${process.cwd()}' does not seem to be a git repository`],
	]);
	const lDiffOutput = await getGitResult(
		pNewRevision
			? ["diff", pOldRevision, pNewRevision, "--name-status"]
			: ["diff", pOldRevision, "--name-status"],
		lErrorMap,
		pSpawnFunction,
	);
	return lDiffOutput;
}
export async function getSHA(pSpawnFunction = spawn) {
	const lRevParseOutput = await getGitResult(
		["rev-parse", "HEAD"],
		EMPTY_ERROR_MAP,
		pSpawnFunction,
	);
	return lRevParseOutput.slice(0, SHA1_LENGTH);
}
function getGitResult(pArguments, pErrorMap, pSpawnFunction) {
	const lGit = pSpawnFunction("git", pArguments, {
		cwd: process.cwd(),
		env: process.env,
	});
	const lStdOutChunks = [];
	const lStdErrorChunks = [];
	return new Promise((pResolve, pReject) => {
		lGit.stdout?.on("data", (pData) => {
			lStdOutChunks.push(pData);
		});
		lGit.stderr?.on("data", (pData) => {
			lStdErrorChunks.push(pData);
		});
		lGit.on("close", (pCode) => {
			if (pCode === 0) {
				pResolve(lStdOutChunks.join(""));
			} else {
				pReject(
					new Error(
						pErrorMap.get(pCode ?? 0) ??
							`internal git error: ${pCode} (${lStdErrorChunks.join("")})`,
					),
				);
			}
		});
		lGit.on("error", (pError) => {
			if (pError?.code === "ENOENT") {
				pReject(new Error("git executable not found"));
			} else {
				pReject(new Error(`internal spawn error: ${pError}`));
			}
		});
	});
}

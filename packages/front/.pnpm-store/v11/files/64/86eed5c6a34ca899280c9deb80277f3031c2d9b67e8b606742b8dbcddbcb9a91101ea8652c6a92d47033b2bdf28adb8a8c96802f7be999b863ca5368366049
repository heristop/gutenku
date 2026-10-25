"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInterpolation = generateInterpolation;
exports.generateIdentifier = generateIdentifier;
const shared_1 = require("../../utils/shared");
const codeFeatures_1 = require("../codeFeatures");
const names_1 = require("../names");
const utils_1 = require("../utils");
const boundary_1 = require("../utils/boundary");
const bindingReferences_1 = require("./bindingReferences");
function* generateInterpolation(options, ctx, block, features, code, start, prefix = '', suffix = '', inNarrowing = false) {
    if (prefix) {
        yield prefix;
    }
    let prevEnd = 0;
    for (const [name, offset, isShorthand, isNarrowing, inTypeQuery, isNewOperand] of forEachIdentifiers(options.typescript, ctx, block, code, prefix, suffix, inNarrowing)) {
        if (isShorthand) {
            yield* generateNonIdentifierCode(code.slice(prevEnd, offset + name.length), block.name, start + prevEnd, features, prevEnd > 0);
            yield `: `;
        }
        else if (prevEnd < offset) {
            yield* generateNonIdentifierCode(code.slice(prevEnd, offset), block.name, start + prevEnd, features, prevEnd > 0);
        }
        const codes = [[
                name,
                block.name,
                start + offset,
                isShorthand
                    ? { ...features, __shorthandExpression: 'js' }
                    : features,
            ]];
        yield* generateIdentifier(options, ctx, codes, name, block.name, start + offset, start + offset + name.length, isNarrowing, inTypeQuery, isNewOperand);
        prevEnd = offset + name.length;
    }
    if (prevEnd < code.length) {
        yield* generateNonIdentifierCode(code.slice(prevEnd), block.name, start + prevEnd, features, prevEnd > 0);
    }
    if (suffix) {
        yield suffix;
    }
}
/**
 * Yield a code chunk, cutting the boundary character off as verification-only.
 *
 * Adjacent mappings share the boundary offset (closed interval), so both the
 * neighbouring token's end and this chunk's start claim the same source offset.
 * Downgrading the boundary character to verification-only keeps content-sensitive
 * features (rename / navigation) from firing on the neighbouring chunk.
 */
function* generateNonIdentifierCode(code, source, offset, data, shouldCut = true) {
    if (!code.length) {
        return;
    }
    if (!shouldCut) {
        yield [code, source, offset, data];
        return;
    }
    yield [code.slice(0, 1), source, offset, { verification: data.verification }];
    if (code.length > 1) {
        yield [code.slice(1), source, offset + 1, data];
    }
}
// Access strategy, in precedence order:
// - setup consts → direct reference
// - local-scope / global names → direct reference (the interpolation path
//   filters these earlier; the v-bind shorthand path relies on this branch)
// - template refs → direct `.value`
// - dotValue bindings (narrowed at least once anywhere) → `.value` at
//   every position; narrowing then works on the `.value` reference chain
// - other bindings → `__VLS_unwrap` (plain reads keep the original type)
// - otherwise → `__VLS_ctx.<name>`
function* generateIdentifier(options, ctx, codes, name, source, start, end, isNarrowing = false, inTypeQuery = false, isNewOperand = false) {
    if (options.setupConsts.has(name) || (0, bindingReferences_1.shouldIdentifierSkipped)(ctx, name)) {
        yield* codes;
    }
    else if (options.setupRefs.has(name)) {
        yield* codes;
        yield `.`;
        const boundary = yield* boundary_1.Boundary.start(source, start, end, codeFeatures_1.codeFeatures.verification);
        yield `value`;
        yield boundary.end();
    }
    else if (options.setupBindings.has(name)) {
        // First pass records narrowing accesses here; the second pass emits from dotValueBindings.
        ctx.accessVariable(source, name, start, inTypeQuery || isNarrowing);
        if (inTypeQuery || options.dotValueBindings.has(name)) {
            yield* codes;
            yield `.`;
            const boundary = yield* boundary_1.Boundary.start(source, start, end, codeFeatures_1.codeFeatures.verification);
            yield `value`;
            yield boundary.end();
        }
        else {
            // `new __VLS_unwrap(Foo)()` parses as `new (__VLS_unwrap(Foo)())`,
            // whose target lacks a construct signature; keep the operand parenthesized.
            if (isNewOperand) {
                yield `(`;
            }
            yield `${names_1.names.unwrap}(`;
            yield* codes;
            yield `, ${(0, utils_1.getRefBrandArgument)(options.vueCompilerOptions, options.scriptLang)})`;
            if (isNewOperand) {
                yield `)`;
            }
        }
    }
    else {
        // #1205, #1264
        const boundary = yield* boundary_1.Boundary.start(source, start, end, codeFeatures_1.codeFeatures.verification);
        if (ctx.dollarVars.has(name)) {
            yield names_1.names.dollars;
        }
        else {
            ctx.accessVariable(source, name, start);
            yield names_1.names.ctx;
        }
        yield `.`;
        yield* codes;
        yield boundary.end();
    }
}
function* forEachIdentifiers(ts, ctx, block, code, prefix, suffix, inNarrowing) {
    if (utils_1.identifierRE.test(code) && !(0, bindingReferences_1.shouldIdentifierSkipped)(ctx, code)) {
        yield [code, 0, false, inNarrowing, false, false];
        return;
    }
    const scope = ctx.scope();
    const ast = (0, utils_1.getTypeScriptAST)(ts, block, prefix + code + suffix);
    for (const { id, isShorthand, isNarrowing, skipped, inTypeQuery, isNewOperand } of (0, bindingReferences_1.forEachDeclarations)(ts, ast, ast, ctx, scope, inNarrowing)) {
        if (skipped) {
            continue;
        }
        const text = (0, shared_1.getNodeText)(ts, id, ast);
        yield [text, (0, shared_1.getStartEnd)(ts, id, ast).start - prefix.length, isShorthand, isNarrowing, inTypeQuery, isNewOperand];
    }
    scope.end();
}
//# sourceMappingURL=interpolation.js.map
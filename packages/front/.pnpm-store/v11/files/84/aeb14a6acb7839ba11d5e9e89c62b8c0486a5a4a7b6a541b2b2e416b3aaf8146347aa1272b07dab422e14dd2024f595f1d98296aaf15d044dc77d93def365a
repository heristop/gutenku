"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forEachDeclarations = forEachDeclarations;
exports.shouldIdentifierSkipped = shouldIdentifierSkipped;
const shared_1 = require("@vue/shared");
const collectBindings_1 = require("../../utils/collectBindings");
const shared_2 = require("../../utils/shared");
const utils_1 = require("../utils");
// https://github.com/vuejs/core/blob/fb0c3ca519f1fccf52049cd6b8db3a67a669afe9/packages/compiler-core/src/transforms/transformExpression.ts#L47
const isLiteralWhitelisted = /*@__PURE__*/ (0, shared_1.makeMap)('true,false,null,this');
function* forEachDeclarations(ts, node, ast, ctx, scope, inNarrowing) {
    if (ts.isIdentifier(node)) {
        yield {
            id: node,
            isShorthand: false,
            isNarrowing: inNarrowing,
            skipped: shouldIdentifierSkipped(ctx, (0, shared_2.getNodeText)(ts, node, ast)),
            inTypeQuery: false,
            isNewOperand: false,
        };
    }
    else if (ts.isShorthandPropertyAssignment(node)) {
        yield {
            id: node.name,
            isShorthand: true,
            isNarrowing: inNarrowing,
            skipped: shouldIdentifierSkipped(ctx, (0, shared_2.getNodeText)(ts, node.name, ast)),
            inTypeQuery: false,
            isNewOperand: false,
        };
    }
    else if (ts.isPropertyAccessExpression(node)) {
        yield* forEachDeclarations(ts, node.expression, ast, ctx, scope, true);
    }
    else if (ts.isElementAccessExpression(node)) {
        yield* forEachDeclarations(ts, node.expression, ast, ctx, scope, true);
        yield* forEachDeclarations(ts, node.argumentExpression, ast, ctx, scope, false);
    }
    else if (ts.isCallExpression(node)) {
        yield* forEachDeclarations(ts, node.expression, ast, ctx, scope, false);
        if (node.typeArguments) {
            for (const typeArg of node.typeArguments) {
                yield* forEachDeclarationsInTypeNode(ts, typeArg, ast, ctx, scope);
            }
        }
        for (const arg of node.arguments) {
            yield* forEachDeclarations(ts, arg, ast, ctx, scope, inNarrowing);
        }
    }
    else if (ts.isNewExpression(node)) {
        if (ts.isIdentifier(node.expression)) {
            yield {
                id: node.expression,
                isShorthand: false,
                isNarrowing: false,
                skipped: shouldIdentifierSkipped(ctx, (0, shared_2.getNodeText)(ts, node.expression, ast)),
                inTypeQuery: false,
                isNewOperand: true,
            };
        }
        else {
            yield* forEachDeclarations(ts, node.expression, ast, ctx, scope, false);
        }
        if (node.typeArguments) {
            for (const typeArg of node.typeArguments) {
                yield* forEachDeclarationsInTypeNode(ts, typeArg, ast, ctx, scope);
            }
        }
        for (const arg of node.arguments ?? []) {
            yield* forEachDeclarations(ts, arg, ast, ctx, scope, inNarrowing);
        }
    }
    else if (ts.isTaggedTemplateExpression(node)) {
        yield* forEachDeclarations(ts, node.tag, ast, ctx, scope, false);
        yield* forEachDeclarations(ts, node.template, ast, ctx, scope, inNarrowing);
    }
    else if (ts.isParenthesizedExpression(node)) {
        yield* forEachDeclarations(ts, node.expression, ast, ctx, scope, inNarrowing);
    }
    else if (ts.isNonNullExpression(node)) {
        yield* forEachDeclarations(ts, node.expression, ast, ctx, scope, inNarrowing);
    }
    else if (ts.isTypeAssertionExpression(node)) {
        yield* forEachDeclarationsInTypeNode(ts, node.type, ast, ctx, scope);
        yield* forEachDeclarations(ts, node.expression, ast, ctx, scope, inNarrowing);
    }
    else if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) {
        yield* forEachDeclarations(ts, node.expression, ast, ctx, scope, inNarrowing);
        yield* forEachDeclarationsInTypeNode(ts, node.type, ast, ctx, scope);
    }
    else if (ts.isBinaryExpression(node)) {
        const isLogical = node.operatorToken.kind === ts.SyntaxKind.BarBarToken
            || node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
            || node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken;
        const isAssignment = node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment
            && node.operatorToken.kind <= ts.SyntaxKind.LastAssignment;
        const isEquality = node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken
            || node.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken
            || node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken
            || node.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsToken;
        const isInstanceof = node.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword;
        const isIn = node.operatorToken.kind === ts.SyntaxKind.InKeyword;
        if (node.operatorToken.kind === ts.SyntaxKind.CommaToken) {
            yield* forEachDeclarations(ts, node.left, ast, ctx, scope, false);
            yield* forEachDeclarations(ts, node.right, ast, ctx, scope, inNarrowing);
        }
        else if (isLogical) {
            yield* forEachNarrowedBy(ts, node.left, ast, ctx, scope, function* () {
                yield* forEachDeclarations(ts, node.right, ast, ctx, scope, inNarrowing);
            });
        }
        else if (isAssignment) {
            yield* forEachDeclarationsInAssignmentTarget(ts, node.left, ast, ctx, scope);
            yield* forEachDeclarations(ts, node.right, ast, ctx, scope, false);
        }
        else {
            yield* forEachDeclarations(ts, node.left, ast, ctx, scope, isEquality || isInstanceof);
            yield* forEachDeclarations(ts, node.right, ast, ctx, scope, isEquality || isIn);
        }
    }
    else if (ts.isConditionalExpression(node)) {
        yield* forEachNarrowedBy(ts, node.condition, ast, ctx, scope, function* () {
            yield* forEachDeclarations(ts, node.whenTrue, ast, ctx, scope, false);
            yield* forEachDeclarations(ts, node.whenFalse, ast, ctx, scope, false);
        });
    }
    else if (ts.isPrefixUnaryExpression(node)) {
        yield* forEachDeclarations(ts, node.operand, ast, ctx, scope, node.operator === ts.SyntaxKind.ExclamationToken
            || node.operator === ts.SyntaxKind.PlusPlusToken
            || node.operator === ts.SyntaxKind.MinusMinusToken);
    }
    else if (ts.isPostfixUnaryExpression(node)) {
        yield* forEachDeclarations(ts, node.operand, ast, ctx, scope, true);
    }
    else if (isDeleteExpression(ts, node)) {
        yield* forEachDeclarations(ts, node.expression, ast, ctx, scope, true);
    }
    else if (ts.isTypeOfExpression(node)) {
        yield* forEachDeclarations(ts, node.expression, ast, ctx, scope, true);
    }
    else if (ts.isVariableDeclaration(node)) {
        scope.declare(...(0, collectBindings_1.collectBindingNames)(ts, node.name, ast));
        yield* forEachDeclarationsInBinding(ts, node, ast, ctx, scope);
    }
    else if (ts.isArrayBindingPattern(node) || ts.isObjectBindingPattern(node)) {
        for (const element of node.elements) {
            if (ts.isBindingElement(element)) {
                yield* forEachDeclarationsInBinding(ts, element, ast, ctx, scope);
            }
        }
    }
    else if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
        yield* forEachDeclarationsInFunction(ts, node, ast, ctx);
    }
    else if (ts.isFunctionDeclaration(node)) {
        if (node.name) {
            scope.declare((0, shared_2.getNodeText)(ts, node.name, ast));
        }
        yield* forEachDeclarationsInFunction(ts, node, ast, ctx);
    }
    else if (ts.isClassDeclaration(node)) {
        if (node.name) {
            scope.declare((0, shared_2.getNodeText)(ts, node.name, ast));
        }
        yield* forEachDeclarationsInClass(ts, node, ast, ctx, scope);
    }
    else if (ts.isClassExpression(node)) {
        const classScope = ctx.scope();
        if (node.name) {
            classScope.declare((0, shared_2.getNodeText)(ts, node.name, ast));
        }
        yield* forEachDeclarationsInClass(ts, node, ast, ctx, classScope);
        classScope.end();
    }
    else if (ts.isObjectLiteralExpression(node)) {
        for (const prop of node.properties) {
            if (ts.isPropertyAssignment(prop)) {
                // fix https://github.com/vuejs/language-tools/issues/1176
                if (ts.isComputedPropertyName(prop.name)) {
                    yield* forEachDeclarations(ts, prop.name.expression, ast, ctx, scope, false);
                }
                yield* forEachDeclarations(ts, prop.initializer, ast, ctx, scope, false);
            }
            // fix https://github.com/vuejs/language-tools/issues/1156
            else if (ts.isShorthandPropertyAssignment(prop)) {
                yield* forEachDeclarations(ts, prop, ast, ctx, scope, false);
            }
            // fix https://github.com/vuejs/language-tools/issues/1148#issuecomment-1094378126
            else if (ts.isSpreadAssignment(prop)) {
                // TODO: cannot report "Spread types may only be created from object types.ts(2698)"
                yield* forEachDeclarations(ts, prop.expression, ast, ctx, scope, false);
            }
            // fix https://github.com/vuejs/language-tools/issues/4604
            else if (ts.isFunctionLike(prop) && prop.body) {
                if (prop.name && ts.isComputedPropertyName(prop.name)) {
                    yield* forEachDeclarations(ts, prop.name.expression, ast, ctx, scope, false);
                }
                yield* forEachDeclarationsInFunction(ts, prop, ast, ctx);
            }
        }
    }
    // fix https://github.com/vuejs/language-tools/issues/1422
    else if (ts.isTypeNode(node)) {
        yield* forEachDeclarationsInTypeNode(ts, node, ast, ctx, scope);
    }
    else if (ts.isBlock(node)) {
        const scope = ctx.scope();
        predeclareFunctionDeclarations(ts, node.statements, ast, scope);
        for (const child of (0, utils_1.forEachNode)(ts, node)) {
            yield* forEachDeclarations(ts, child, ast, ctx, scope, false);
        }
        scope.end();
    }
    else if (ts.isForOfStatement(node) || ts.isForInStatement(node)) {
        const scope = ctx.scope();
        const declarations = ts.isVariableDeclarationList(node.initializer) ? node.initializer.declarations : undefined;
        if (declarations) {
            for (const decl of declarations) {
                if (decl.initializer) {
                    yield* forEachDeclarations(ts, decl.initializer, ast, ctx, scope, false);
                }
            }
        }
        else {
            yield* forEachDeclarationsInAssignmentTarget(ts, node.initializer, ast, ctx, scope);
        }
        // The source resolves before the loop bindings are in scope (`for (const x of x)` reads the outer `x`).
        yield* forEachDeclarations(ts, node.expression, ast, ctx, scope, false);
        if (declarations) {
            for (const decl of declarations) {
                scope.declare(...(0, collectBindings_1.collectBindingNames)(ts, decl.name, ast));
            }
        }
        yield* forEachDeclarations(ts, node.statement, ast, ctx, scope, false);
        scope.end();
    }
    else if (ts.isIfStatement(node)) {
        yield* forEachNarrowedBy(ts, node.expression, ast, ctx, scope, function* () {
            yield* forEachDeclarations(ts, node.thenStatement, ast, ctx, scope, false);
            if (node.elseStatement) {
                yield* forEachDeclarations(ts, node.elseStatement, ast, ctx, scope, false);
            }
        });
    }
    else if (isWhileStatement(ts, node)) {
        yield* forEachNarrowedBy(ts, node.expression, ast, ctx, scope, function* () {
            yield* forEachDeclarations(ts, node.statement, ast, ctx, scope, false);
        });
    }
    else if (isDoStatement(ts, node)) {
        yield* forEachDeclarations(ts, node.statement, ast, ctx, scope, false);
        yield* forEachDeclarations(ts, node.expression, ast, ctx, scope, true);
    }
    else if (ts.isForStatement(node)) {
        const scope = ctx.scope();
        if (node.initializer) {
            if (ts.isVariableDeclarationList(node.initializer)) {
                for (const decl of node.initializer.declarations) {
                    scope.declare(...(0, collectBindings_1.collectBindingNames)(ts, decl.name, ast));
                    if (decl.initializer) {
                        yield* forEachDeclarations(ts, decl.initializer, ast, ctx, scope, false);
                    }
                }
            }
            else {
                yield* forEachDeclarations(ts, node.initializer, ast, ctx, scope, false);
            }
        }
        yield* forEachNarrowedBy(ts, node.condition, ast, ctx, scope, function* () {
            if (node.incrementor) {
                yield* forEachDeclarations(ts, node.incrementor, ast, ctx, scope, false);
            }
            yield* forEachDeclarations(ts, node.statement, ast, ctx, scope, false);
        });
        scope.end();
    }
    else if (ts.isSwitchStatement(node)) {
        predeclareFunctionDeclarations(ts, node.caseBlock.clauses.flatMap(clause => [...clause.statements]), ast, scope);
        yield* forEachNarrowedBy(ts, node.expression, ast, ctx, scope, function* () {
            for (const clause of node.caseBlock.clauses) {
                if (ts.isCaseClause(clause)) {
                    yield* forEachDeclarations(ts, clause.expression, ast, ctx, scope, false);
                }
                for (const statement of clause.statements) {
                    yield* forEachDeclarations(ts, statement, ast, ctx, scope, false);
                }
            }
        });
    }
    else if (ts.isLabeledStatement(node)) {
        yield* forEachDeclarations(ts, node.statement, ast, ctx, scope, false);
    }
    else if (isBreakOrContinueStatement(ts, node)) {
        // break/continue labels are not bindings.
    }
    else if (ts.isMetaProperty(node)) {
        // `new.target` / `import.meta` are not bindings.
    }
    else if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
        yield* forEachDeclarationsInTypeNode(ts, node, ast, ctx, scope);
    }
    else if (ts.isEnumDeclaration(node)) {
        scope.declare((0, shared_2.getNodeText)(ts, node.name, ast));
        for (const member of node.members) {
            if (member.initializer) {
                yield* forEachDeclarations(ts, member.initializer, ast, ctx, scope, false);
            }
        }
    }
    else if (ts.isModuleDeclaration(node)) {
        if (node.body && ts.isModuleBlock(node.body)) {
            const scope = ctx.scope();
            predeclareFunctionDeclarations(ts, node.body.statements, ast, scope);
            for (const statement of node.body.statements) {
                yield* forEachDeclarations(ts, statement, ast, ctx, scope, false);
            }
            scope.end();
        }
        else if (node.body && ts.isModuleDeclaration(node.body)) {
            yield* forEachDeclarations(ts, node.body, ast, ctx, scope, false);
        }
    }
    else if (ts.isCatchClause(node)) {
        const scope = ctx.scope();
        if (node.variableDeclaration) {
            yield* forEachDeclarations(ts, node.variableDeclaration, ast, ctx, scope, false);
        }
        if (node.block) {
            yield* forEachDeclarations(ts, node.block, ast, ctx, scope, false);
        }
        scope.end();
    }
    else if (ts.isSourceFile(node)) {
        predeclareFunctionDeclarations(ts, node.statements, ast, scope);
        for (const statement of node.statements) {
            yield* forEachDeclarations(ts, statement, ast, ctx, scope, inNarrowing);
        }
    }
    else if (ts.isExpressionStatement(node)) {
        yield* forEachDeclarations(ts, node.expression, ast, ctx, scope, inNarrowing);
    }
    else {
        for (const child of (0, utils_1.forEachNode)(ts, node)) {
            yield* forEachDeclarations(ts, child, ast, ctx, scope, false);
        }
    }
}
function* forEachNarrowedBy(ts, condition, ast, ctx, scope, body) {
    // The condition's declarations come first (narrowing positions), then the body.
    if (condition) {
        yield* forEachDeclarations(ts, condition, ast, ctx, scope, true);
    }
    yield* body();
}
function predeclareFunctionDeclarations(ts, statements, ast, scope) {
    for (const statement of statements) {
        if (ts.isFunctionDeclaration(statement) && statement.name) {
            scope.declare((0, shared_2.getNodeText)(ts, statement.name, ast));
        }
    }
}
function* forEachDeclarationsInAssignmentTarget(ts, node, ast, ctx, scope) {
    if (ts.isIdentifier(node)) {
        yield {
            id: node,
            isShorthand: false,
            isNarrowing: true,
            skipped: shouldIdentifierSkipped(ctx, (0, shared_2.getNodeText)(ts, node, ast)),
            inTypeQuery: false,
            isNewOperand: false,
        };
    }
    else if (ts.isObjectLiteralExpression(node)) {
        for (const prop of node.properties) {
            if (ts.isPropertyAssignment(prop)) {
                if (ts.isComputedPropertyName(prop.name)) {
                    yield* forEachDeclarations(ts, prop.name.expression, ast, ctx, scope, false);
                }
                yield* forEachDeclarationsInAssignmentTarget(ts, prop.initializer, ast, ctx, scope);
            }
            else if (ts.isShorthandPropertyAssignment(prop)) {
                yield {
                    id: prop.name,
                    isShorthand: true,
                    isNarrowing: true,
                    skipped: shouldIdentifierSkipped(ctx, (0, shared_2.getNodeText)(ts, prop.name, ast)),
                    inTypeQuery: false,
                    isNewOperand: false,
                };
                if (prop.objectAssignmentInitializer) {
                    yield* forEachDeclarations(ts, prop.objectAssignmentInitializer, ast, ctx, scope, false);
                }
            }
            else if (ts.isSpreadAssignment(prop)) {
                yield* forEachDeclarationsInAssignmentTarget(ts, prop.expression, ast, ctx, scope);
            }
        }
    }
    else if (ts.isArrayLiteralExpression(node)) {
        for (const element of node.elements) {
            if (ts.isOmittedExpression(element)) {
                continue;
            }
            else if (ts.isSpreadElement(element)) {
                yield* forEachDeclarationsInAssignmentTarget(ts, element.expression, ast, ctx, scope);
            }
            else if (ts.isBinaryExpression(element)) {
                yield* forEachDeclarationsInAssignmentTarget(ts, element.left, ast, ctx, scope);
                yield* forEachDeclarations(ts, element.right, ast, ctx, scope, false);
            }
            else {
                yield* forEachDeclarationsInAssignmentTarget(ts, element, ast, ctx, scope);
            }
        }
    }
    else if (ts.isParenthesizedExpression(node)) {
        yield* forEachDeclarationsInAssignmentTarget(ts, node.expression, ast, ctx, scope);
    }
    else {
        yield* forEachDeclarations(ts, node, ast, ctx, scope, true);
    }
}
function* forEachDeclarationsInBinding(ts, node, ast, ctx, scope) {
    if ('propertyName' in node && node.propertyName && ts.isComputedPropertyName(node.propertyName)) {
        yield* forEachDeclarations(ts, node.propertyName.expression, ast, ctx, scope, true);
    }
    if (!ts.isIdentifier(node.name)) {
        yield* forEachDeclarations(ts, node.name, ast, ctx, scope, false);
    }
    if ('type' in node && node.type) {
        yield* forEachDeclarationsInTypeNode(ts, node.type, ast, ctx, scope);
    }
    if (node.initializer) {
        yield* forEachDeclarations(ts, node.initializer, ast, ctx, scope, false);
    }
}
function* forEachDeclarationsInFunction(ts, node, ast, ctx) {
    const scope = ctx.scope();
    if (ts.isFunctionExpression(node) && node.name) {
        scope.declare((0, shared_2.getNodeText)(ts, node.name, ast));
    }
    for (const param of node.parameters) {
        scope.declare(...(0, collectBindings_1.collectBindingNames)(ts, param.name, ast));
    }
    if (node.typeParameters) {
        for (const typeParam of node.typeParameters) {
            yield* forEachDeclarationsInTypeNode(ts, typeParam, ast, ctx, scope);
        }
    }
    for (const param of node.parameters) {
        yield* forEachDeclarationsInBinding(ts, param, ast, ctx, scope);
    }
    if (node.type) {
        yield* forEachDeclarationsInTypeNode(ts, node.type, ast, ctx, scope);
    }
    if (node.body) {
        yield* forEachDeclarations(ts, node.body, ast, ctx, scope, false);
    }
    scope.end();
}
function* forEachDeclarationsInClass(ts, node, ast, ctx, scope) {
    for (const typeParam of node.typeParameters ?? []) {
        yield* forEachDeclarationsInTypeNode(ts, typeParam, ast, ctx, scope);
    }
    for (const clause of node.heritageClauses ?? []) {
        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
            for (const type of clause.types) {
                yield* forEachDeclarations(ts, type.expression, ast, ctx, scope, false);
                if (type.typeArguments) {
                    for (const typeArg of type.typeArguments) {
                        yield* forEachDeclarationsInTypeNode(ts, typeArg, ast, ctx, scope);
                    }
                }
            }
        }
        else {
            yield* forEachDeclarationsInTypeNode(ts, clause, ast, ctx, scope);
        }
    }
    for (const member of node.members) {
        if (ts.isPropertyDeclaration(member)
            || ts.isMethodDeclaration(member)
            || ts.isGetAccessorDeclaration(member)
            || ts.isSetAccessorDeclaration(member)) {
            if (member.name && ts.isComputedPropertyName(member.name)) {
                // A computed name in a class property must be an entity name (grammar rule): no `__VLS_unwrap` call allowed.
                yield* forEachDeclarations(ts, member.name.expression, ast, ctx, scope, true);
            }
        }
        if (ts.isConstructorDeclaration(member)
            || ts.isMethodDeclaration(member)
            || ts.isGetAccessorDeclaration(member)
            || ts.isSetAccessorDeclaration(member)) {
            yield* forEachDeclarationsInFunction(ts, member, ast, ctx);
        }
        else if (ts.isPropertyDeclaration(member)) {
            if (member.type) {
                yield* forEachDeclarationsInTypeNode(ts, member.type, ast, ctx, scope);
            }
            if (member.initializer) {
                yield* forEachDeclarations(ts, member.initializer, ast, ctx, scope, false);
            }
        }
        else if (ts.isClassStaticBlockDeclaration(member)) {
            const blockScope = ctx.scope();
            predeclareFunctionDeclarations(ts, member.body.statements, ast, blockScope);
            for (const statement of member.body.statements) {
                yield* forEachDeclarations(ts, statement, ast, ctx, blockScope, false);
            }
            blockScope.end();
        }
    }
}
function* forEachDeclarationsInTypeNode(ts, node, ast, ctx, scope) {
    if (ts.isTypeQueryNode(node)) {
        let id = node.exprName;
        while (!ts.isIdentifier(id)) {
            id = id.left;
        }
        yield {
            id,
            isShorthand: false,
            isNarrowing: false,
            skipped: shouldIdentifierSkipped(ctx, (0, shared_2.getNodeText)(ts, id, ast)),
            inTypeQuery: true,
            isNewOperand: false,
        };
    }
    else if (ts.isComputedPropertyName(node)) {
        // TS1170: a computed name in a type literal must be an entity-name expression (no calls).
        for (const item of forEachDeclarations(ts, node.expression, ast, ctx, scope, false)) {
            item.inTypeQuery = true;
            yield item;
        }
    }
    else {
        for (const child of (0, utils_1.forEachNode)(ts, node)) {
            yield* forEachDeclarationsInTypeNode(ts, child, ast, ctx, scope);
        }
    }
}
function shouldIdentifierSkipped(ctx, text) {
    return ctx.scopes.some(scope => scope.has(text))
        // https://github.com/vuejs/core/blob/245230e135152900189f13a4281302de45fdcfaa/packages/compiler-core/src/transforms/transformExpression.ts#L342-L352
        || (0, shared_1.isGloballyAllowed)(text)
        || isLiteralWhitelisted(text)
        || text === 'require'
        || text.startsWith('__VLS_');
}
// vue-tsc runs against TypeScript's tsc bundle, which does not include
// type guards that the compiler itself never uses, so check `kind` directly.
function isDeleteExpression(ts, node) {
    return node.kind === ts.SyntaxKind.DeleteExpression;
}
function isWhileStatement(ts, node) {
    return node.kind === ts.SyntaxKind.WhileStatement;
}
function isDoStatement(ts, node) {
    return node.kind === ts.SyntaxKind.DoStatement;
}
function isBreakOrContinueStatement(ts, node) {
    return node.kind === ts.SyntaxKind.BreakStatement || node.kind === ts.SyntaxKind.ContinueStatement;
}
//# sourceMappingURL=bindingReferences.js.map
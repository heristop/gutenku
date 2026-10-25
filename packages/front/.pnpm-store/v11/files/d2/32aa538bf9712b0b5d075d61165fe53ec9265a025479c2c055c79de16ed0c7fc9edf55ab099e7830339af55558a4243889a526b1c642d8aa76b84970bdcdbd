import type { NodeOfType } from "@yuku-toolchain/types";
export declare const ALIAS_GROUPS: {
    readonly Expression: readonly ["Identifier", "Literal", "ThisExpression", "Super", "ArrayExpression", "ObjectExpression", "FunctionExpression", "ArrowFunctionExpression", "ClassExpression", "TaggedTemplateExpression", "TemplateLiteral", "MemberExpression", "CallExpression", "NewExpression", "ChainExpression", "SequenceExpression", "ParenthesizedExpression", "BinaryExpression", "LogicalExpression", "ConditionalExpression", "UnaryExpression", "UpdateExpression", "AssignmentExpression", "YieldExpression", "AwaitExpression", "ImportExpression", "MetaProperty", "TSAsExpression", "TSSatisfiesExpression", "TSTypeAssertion", "TSNonNullExpression", "TSInstantiationExpression", "JSXElement", "JSXFragment"];
    readonly Statement: readonly ["ExpressionStatement", "BlockStatement", "EmptyStatement", "DebuggerStatement", "ReturnStatement", "LabeledStatement", "BreakStatement", "ContinueStatement", "IfStatement", "SwitchStatement", "ThrowStatement", "TryStatement", "WhileStatement", "DoWhileStatement", "ForStatement", "ForInStatement", "ForOfStatement", "WithStatement", "FunctionDeclaration", "ClassDeclaration", "VariableDeclaration", "TSDeclareFunction", "TSTypeAliasDeclaration", "TSInterfaceDeclaration", "TSEnumDeclaration", "TSModuleDeclaration", "TSImportEqualsDeclaration"];
    readonly Declaration: readonly ["FunctionDeclaration", "ClassDeclaration", "VariableDeclaration", "TSDeclareFunction", "TSTypeAliasDeclaration", "TSInterfaceDeclaration", "TSEnumDeclaration", "TSModuleDeclaration", "TSImportEqualsDeclaration"];
    readonly ModuleDeclaration: readonly ["ImportDeclaration", "ExportNamedDeclaration", "ExportDefaultDeclaration", "ExportAllDeclaration", "TSExportAssignment", "TSNamespaceExportDeclaration"];
    readonly Function: readonly ["FunctionDeclaration", "FunctionExpression", "TSDeclareFunction", "TSEmptyBodyFunctionExpression", "ArrowFunctionExpression"];
    readonly Class: readonly ["ClassDeclaration", "ClassExpression"];
    readonly Method: readonly ["MethodDefinition", "TSAbstractMethodDefinition"];
    readonly Loop: readonly ["DoWhileStatement", "ForInStatement", "ForOfStatement", "ForStatement", "WhileStatement"];
    readonly Pattern: readonly ["ArrayPattern", "ObjectPattern", "AssignmentPattern", "RestElement"];
    readonly JSX: readonly ["JSXAttribute", "JSXClosingElement", "JSXClosingFragment", "JSXElement", "JSXEmptyExpression", "JSXExpressionContainer", "JSXFragment", "JSXIdentifier", "JSXMemberExpression", "JSXNamespacedName", "JSXOpeningElement", "JSXOpeningFragment", "JSXSpreadAttribute", "JSXSpreadChild", "JSXText"];
    readonly TSType: readonly ["TSAnyKeyword", "TSUnknownKeyword", "TSNeverKeyword", "TSVoidKeyword", "TSNullKeyword", "TSUndefinedKeyword", "TSStringKeyword", "TSNumberKeyword", "TSBigIntKeyword", "TSBooleanKeyword", "TSSymbolKeyword", "TSObjectKeyword", "TSIntrinsicKeyword", "TSThisType", "TSTypeReference", "TSTypeQuery", "TSImportType", "TSLiteralType", "TSTemplateLiteralType", "TSArrayType", "TSIndexedAccessType", "TSTupleType", "TSNamedTupleMember", "TSJSDocNullableType", "TSJSDocNonNullableType", "TSJSDocUnknownType", "TSUnionType", "TSIntersectionType", "TSConditionalType", "TSInferType", "TSTypeOperator", "TSParenthesizedType", "TSFunctionType", "TSConstructorType", "TSTypePredicate", "TSTypeLiteral", "TSMappedType"];
};
export type AliasName = keyof typeof ALIAS_GROUPS;
type GroupType<A extends AliasName> = (typeof ALIAS_GROUPS)[A][number];
/** The node union each alias covers, e.g. `AliasMap["Function"]`. */
export type AliasMap = {
    [A in AliasName]: NodeOfType<GroupType<A>>;
};
export {};

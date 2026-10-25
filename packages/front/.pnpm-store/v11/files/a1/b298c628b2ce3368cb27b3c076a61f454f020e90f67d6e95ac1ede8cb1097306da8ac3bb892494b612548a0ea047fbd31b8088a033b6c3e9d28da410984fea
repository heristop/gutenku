import { Kind, specifiedRules, validate, } from 'graphql';
export function validateGraphQlDocuments(schema, documents, rules = createDefaultRules()) {
    const definitions = new Set();
    const fragmentsDefinitionsMap = new Map();
    for (const document of documents) {
        for (const docDefinition of document.definitions) {
            if (docDefinition.kind === Kind.FRAGMENT_DEFINITION) {
                fragmentsDefinitionsMap.set(docDefinition.name.value, docDefinition);
            }
            else {
                definitions.add(docDefinition);
            }
        }
    }
    const fullAST = {
        kind: Kind.DOCUMENT,
        definitions: Array.from([...definitions, ...fragmentsDefinitionsMap.values()]),
    };
    const errors = validate(schema, fullAST, rules);
    for (const error of errors) {
        error.stack = error.message;
        if (error.locations) {
            for (const location of error.locations) {
                error.stack += `\n    at ${error.source?.name}:${location.line}:${location.column}`;
            }
        }
    }
    return errors;
}
export function createDefaultRules() {
    const ignored = ['NoUnusedFragmentsRule', 'NoUnusedVariablesRule', 'KnownDirectivesRule'];
    return specifiedRules.filter((f) => !ignored.includes(f.name));
}

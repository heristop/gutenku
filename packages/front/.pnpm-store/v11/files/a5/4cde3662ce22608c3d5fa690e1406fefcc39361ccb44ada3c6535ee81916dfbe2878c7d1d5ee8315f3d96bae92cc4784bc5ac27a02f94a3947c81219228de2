"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertResolversPresent = assertResolversPresent;
const graphql_1 = require("graphql");
const utils_1 = require("@graphql-tools/utils");
function assertResolversPresent(schema, resolverValidationOptions = {}) {
    const { requireResolversForArgs, requireResolversForNonScalar, requireResolversForAllFields } = resolverValidationOptions;
    if (requireResolversForAllFields && (requireResolversForArgs || requireResolversForNonScalar)) {
        throw new TypeError('requireResolversForAllFields takes precedence over the more specific assertions. ' +
            'Please configure either requireResolversForAllFields or requireResolversForArgs / ' +
            'requireResolversForNonScalar, but not a combination of them.');
    }
    const subscriptionTypeName = schema.getSubscriptionType()?.name;
    (0, utils_1.forEachField)(schema, (field, typeName, fieldName) => {
        const isSubscriptionField = typeName === subscriptionTypeName;
        // requires a resolver for *every* field.
        if (requireResolversForAllFields) {
            expectResolver('requireResolversForAllFields', requireResolversForAllFields, field, typeName, fieldName, isSubscriptionField);
        }
        // requires a resolver on every field that has arguments
        if (requireResolversForArgs && field.args.length > 0) {
            expectResolver('requireResolversForArgs', requireResolversForArgs, field, typeName, fieldName, isSubscriptionField);
        }
        // requires a resolver on every field that returns a non-scalar type
        if (requireResolversForNonScalar !== 'ignore' && !(0, graphql_1.isScalarType)((0, graphql_1.getNamedType)(field.type))) {
            expectResolver('requireResolversForNonScalar', requireResolversForNonScalar, field, typeName, fieldName, isSubscriptionField);
        }
    });
}
function expectResolver(validator, behavior, field, typeName, fieldName, isSubscriptionField = false) {
    const resolverFn = isSubscriptionField ? field.subscribe : field.resolve;
    if (!resolverFn) {
        const message = `Resolver missing for "${typeName}.${fieldName}".
To disable this validator, use:
  resolverValidationOptions: {
    ${validator}: 'ignore'
  }`;
        if (behavior === 'error') {
            throw new Error(message);
        }
        if (behavior === 'warn') {
            console.warn(message);
        }
        return;
    }
    if (typeof resolverFn !== 'function') {
        throw new Error(`Resolver "${typeName}.${fieldName}" must be a function`);
    }
}

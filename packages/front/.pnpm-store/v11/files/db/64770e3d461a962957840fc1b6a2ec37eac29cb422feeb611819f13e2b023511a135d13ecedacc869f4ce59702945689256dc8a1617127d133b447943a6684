export const MULTIPART_MIXED = 'multipart/mixed';
export const DEFAULT_MULTIPART_BOUNDARY = '-';
export const INCREMENTAL_DELIVERY_SPECS = [
    { id: 'v0.1', parameter: 'deferSpec', value: '20220824', default: true },
    { id: 'v0.2', parameter: 'incrementalSpec', value: 'v0.2' },
];
export function getDefaultIncrementalDeliverySpec(specs = INCREMENTAL_DELIVERY_SPECS) {
    return specs.find(spec => spec.default) ?? specs[0];
}
export function getIncrementalSpecParameterNames(specs = INCREMENTAL_DELIVERY_SPECS) {
    return new Set(specs.map(spec => spec.parameter.toLowerCase()));
}
export function getMultipartContentType(spec, options = {}) {
    const boundary = options.boundary ?? DEFAULT_MULTIPART_BOUNDARY;
    const base = `${MULTIPART_MIXED}; boundary="${boundary}"`;
    if (spec == null || options.echoSpec !== true) {
        return base;
    }
    return `${base}; ${spec.parameter}=${spec.value}`;
}
export const DEFAULT_MULTIPART_CONTENT_TYPE = getMultipartContentType();
/**
 * Resolve registered spec parameters on a multipart media type.
 *
 * Unknown parameter names are ignored. A registered parameter with an
 * unregistered value is `'unsupported'`.
 */
export function lookupIncrementalDeliverySpec(params, specs = INCREMENTAL_DELIVERY_SPECS) {
    let matched;
    for (const [name, value] of Object.entries(params)) {
        const named = specs.filter(spec => spec.parameter.toLowerCase() === name.toLowerCase());
        if (named.length === 0) {
            continue;
        }
        const spec = named.find(candidate => candidate.value.toLowerCase() === value.toLowerCase());
        if (spec == null) {
            return 'unsupported';
        }
        matched = spec;
    }
    return matched;
}

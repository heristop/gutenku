import type { DescField, DescOneof } from "../descriptors.js";
export declare const unsafeLocal: unique symbol;
/**
 * Return the selected field of a oneof group.
 *
 * @private
 */
export declare function unsafeOneofCase(target: Record<string, any>, oneof: DescOneof): DescField | undefined;
/**
 * Returns true if the field is set.
 *
 * @private
 */
export declare function unsafeIsSet(target: Record<string, any>, field: DescField): boolean;
/**
 * Returns true if the field is set, but only for singular fields with explicit
 * presence (proto2).
 *
 * @private
 */
export declare function unsafeIsSetExplicit(target: object, localName: string): boolean;
/**
 * Return a field value, respecting oneof groups.
 *
 * @private
 */
export declare function unsafeGet(target: Record<string, unknown>, field: DescField): unknown;
/**
 * Set a field value, respecting oneof groups.
 *
 * @private
 */
export declare function unsafeSet(target: Record<string, unknown>, field: DescField, value: unknown): void;
/**
 * Set a property, treating __proto__ as an own data property.
 *
 * @private
 */
export declare function setOwn(obj: Record<string, unknown>, key: string | number, value: unknown): void;
/**
 * Get a property, disregarding inherited members.
 *
 * @private
 */
export declare function getOwn(obj: Record<string, unknown>, key: string | number): unknown;
/**
 * Resets the field, so that unsafeIsSet() will return false.
 *
 * @private
 */
export declare function unsafeClear(target: Record<string, any>, field: DescField): void;

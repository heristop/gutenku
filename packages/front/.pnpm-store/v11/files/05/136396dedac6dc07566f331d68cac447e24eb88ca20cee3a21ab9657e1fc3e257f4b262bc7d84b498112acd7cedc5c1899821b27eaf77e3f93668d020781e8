import type { GenEnum, GenFile, GenMessage } from "../../../codegenv2/types.js";
import type { Message } from "../../../types.js";
import type { JsonObject, JsonValue } from "../../../json-value.js";
/**
 * Describes the file google/protobuf/struct.proto.
 */
export declare const file_google_protobuf_struct: GenFile;
/**
 * Represents a JSON object.
 *
 * An unordered key-value map, intending to perfectly capture the semantics of a
 * JSON object. This enables parsing any arbitrary JSON payload as a message
 * field in ProtoJSON format.
 *
 * This follows RFC 8259 guidelines for interoperable JSON: notably this type
 * cannot represent large Int64 values or `NaN`/`Infinity` numbers,
 * since the JSON format generally does not support those values in its number
 * type.
 *
 * If you do not intend to parse arbitrary JSON into your message, a custom
 * typed message should be preferred instead of using this type.
 *
 * @generated from message google.protobuf.Struct
 */
export type Struct = Message<"google.protobuf.Struct"> & {
    /**
     * Unordered map of dynamically typed values.
     *
     * @generated from field: map<string, google.protobuf.Value> fields = 1;
     */
    fields: {
        [key: string]: Value;
    };
};
/**
 * Represents a JSON object.
 *
 * An unordered key-value map, intending to perfectly capture the semantics of a
 * JSON object. This enables parsing any arbitrary JSON payload as a message
 * field in ProtoJSON format.
 *
 * This follows RFC 8259 guidelines for interoperable JSON: notably this type
 * cannot represent large Int64 values or `NaN`/`Infinity` numbers,
 * since the JSON format generally does not support those values in its number
 * type.
 *
 * If you do not intend to parse arbitrary JSON into your message, a custom
 * typed message should be preferred instead of using this type.
 *
 * @generated from message google.protobuf.Struct
 */
export type StructJson = JsonObject;
/**
 * Describes the message google.protobuf.Struct.
 * Use `create(StructSchema)` to create a new message.
 */
export declare const StructSchema: GenMessage<Struct, {
    jsonType: StructJson;
}>;
/**
 * Represents a JSON value.
 *
 * `Value` represents a dynamically typed value which can be either
 * null, a number, a string, a boolean, a recursive struct value, or a
 * list of values. A producer of value is expected to set one of these
 * variants. Absence of any variant is an invalid state.
 *
 * @generated from message google.protobuf.Value
 */
export type Value = Message<"google.protobuf.Value"> & {
    /**
     * The kind of value.
     *
     * @generated from oneof google.protobuf.Value.kind
     */
    kind: {
        /**
         * Represents a JSON `null`.
         *
         * @generated from field: google.protobuf.NullValue null_value = 1;
         */
        value: NullValue;
        case: "nullValue";
    } | {
        /**
         * Represents a JSON number. Must not be `NaN`, `Infinity` or
         * `-Infinity`, since those are not supported in JSON. This also cannot
         * represent large Int64 values, since JSON format generally does not
         * support them in its number type.
         *
         * @generated from field: double number_value = 2;
         */
        value: number;
        case: "numberValue";
    } | {
        /**
         * Represents a JSON string.
         *
         * @generated from field: string string_value = 3;
         */
        value: string;
        case: "stringValue";
    } | {
        /**
         * Represents a JSON boolean (`true` or `false` literal in JSON).
         *
         * @generated from field: bool bool_value = 4;
         */
        value: boolean;
        case: "boolValue";
    } | {
        /**
         * Represents a JSON object.
         *
         * @generated from field: google.protobuf.Struct struct_value = 5;
         */
        value: Struct;
        case: "structValue";
    } | {
        /**
         * Represents a JSON array.
         *
         * @generated from field: google.protobuf.ListValue list_value = 6;
         */
        value: ListValue;
        case: "listValue";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Represents a JSON value.
 *
 * `Value` represents a dynamically typed value which can be either
 * null, a number, a string, a boolean, a recursive struct value, or a
 * list of values. A producer of value is expected to set one of these
 * variants. Absence of any variant is an invalid state.
 *
 * @generated from message google.protobuf.Value
 */
export type ValueJson = JsonValue;
/**
 * Describes the message google.protobuf.Value.
 * Use `create(ValueSchema)` to create a new message.
 */
export declare const ValueSchema: GenMessage<Value, {
    jsonType: ValueJson;
}>;
/**
 * Represents a JSON array.
 *
 * @generated from message google.protobuf.ListValue
 */
export type ListValue = Message<"google.protobuf.ListValue"> & {
    /**
     * Repeated field of dynamically typed values.
     *
     * @generated from field: repeated google.protobuf.Value values = 1;
     */
    values: Value[];
};
/**
 * Represents a JSON array.
 *
 * @generated from message google.protobuf.ListValue
 */
export type ListValueJson = JsonValue[];
/**
 * Describes the message google.protobuf.ListValue.
 * Use `create(ListValueSchema)` to create a new message.
 */
export declare const ListValueSchema: GenMessage<ListValue, {
    jsonType: ListValueJson;
}>;
/**
 * Represents a JSON `null`.
 *
 * `NullValue` is a sentinel, using an enum with only one value to represent
 * the null value for the `Value` type union.
 *
 * A field of type `NullValue` with any value other than `0` is considered
 * invalid. Most ProtoJSON serializers will emit a `Value` with a `null_value`
 * set as a JSON `null` regardless of the integer value, and so will round trip
 * to a `0` value.
 *
 * @generated from enum google.protobuf.NullValue
 */
export declare enum NullValue {
    /**
     * Null value.
     *
     * @generated from enum value: NULL_VALUE = 0;
     */
    NULL_VALUE = 0
}
/**
 * Represents a JSON `null`.
 *
 * `NullValue` is a sentinel, using an enum with only one value to represent
 * the null value for the `Value` type union.
 *
 * A field of type `NullValue` with any value other than `0` is considered
 * invalid. Most ProtoJSON serializers will emit a `Value` with a `null_value`
 * set as a JSON `null` regardless of the integer value, and so will round trip
 * to a `0` value.
 *
 * @generated from enum google.protobuf.NullValue
 */
export type NullValueJson = null;
/**
 * Describes the enum google.protobuf.NullValue.
 */
export declare const NullValueSchema: GenEnum<NullValue, NullValueJson>;

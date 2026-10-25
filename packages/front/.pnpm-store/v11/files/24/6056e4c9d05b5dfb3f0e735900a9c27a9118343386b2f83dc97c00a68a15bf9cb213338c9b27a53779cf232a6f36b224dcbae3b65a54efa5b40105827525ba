import type { GenEnum, GenExtension, GenFile, GenMessage } from "../../../codegenv2/types.js";
import type { FeatureSet } from "./descriptor_pb.js";
import type { Message } from "../../../types.js";
/**
 * Describes the file google/protobuf/cpp_features.proto.
 */
export declare const file_google_protobuf_cpp_features: GenFile;
/**
 * @generated from message pb.CppFeatures
 */
export type CppFeatures = Message<"pb.CppFeatures"> & {
    /**
     * Whether or not to treat an enum field as closed.  This option is only
     * applicable to enum fields, and will be removed in the future.  It is
     * consistent with the legacy behavior of using proto3 enum types for proto2
     * fields.
     *
     * @generated from field: optional bool legacy_closed_enum = 1;
     */
    legacyClosedEnum: boolean;
    /**
     * @generated from field: optional pb.CppFeatures.StringType string_type = 2;
     */
    stringType: CppFeatures_StringType;
    /**
     * @generated from field: optional bool enum_name_uses_string_view = 3;
     */
    enumNameUsesStringView: boolean;
    /**
     * @generated from field: optional pb.CppFeatures.RepeatedType repeated_type = 4;
     */
    repeatedType: CppFeatures_RepeatedType;
};
/**
 * @generated from message pb.CppFeatures
 */
export type CppFeaturesJson = {
    /**
     * Whether or not to treat an enum field as closed.  This option is only
     * applicable to enum fields, and will be removed in the future.  It is
     * consistent with the legacy behavior of using proto3 enum types for proto2
     * fields.
     *
     * @generated from field: optional bool legacy_closed_enum = 1;
     */
    legacyClosedEnum?: boolean;
    /**
     * @generated from field: optional pb.CppFeatures.StringType string_type = 2;
     */
    stringType?: CppFeatures_StringTypeJson;
    /**
     * @generated from field: optional bool enum_name_uses_string_view = 3;
     */
    enumNameUsesStringView?: boolean;
    /**
     * @generated from field: optional pb.CppFeatures.RepeatedType repeated_type = 4;
     */
    repeatedType?: CppFeatures_RepeatedTypeJson;
};
/**
 * Describes the message pb.CppFeatures.
 * Use `create(CppFeaturesSchema)` to create a new message.
 */
export declare const CppFeaturesSchema: GenMessage<CppFeatures, {
    jsonType: CppFeaturesJson;
}>;
/**
 * @generated from enum pb.CppFeatures.StringType
 */
export declare enum CppFeatures_StringType {
    /**
     * @generated from enum value: STRING_TYPE_UNKNOWN = 0;
     */
    STRING_TYPE_UNKNOWN = 0,
    /**
     * @generated from enum value: VIEW = 1;
     */
    VIEW = 1,
    /**
     * @generated from enum value: CORD = 2;
     */
    CORD = 2,
    /**
     * @generated from enum value: STRING = 3;
     */
    STRING = 3
}
/**
 * @generated from enum pb.CppFeatures.StringType
 */
export type CppFeatures_StringTypeJson = "STRING_TYPE_UNKNOWN" | "VIEW" | "CORD" | "STRING";
/**
 * Describes the enum pb.CppFeatures.StringType.
 */
export declare const CppFeatures_StringTypeSchema: GenEnum<CppFeatures_StringType, CppFeatures_StringTypeJson>;
/**
 * @generated from enum pb.CppFeatures.RepeatedType
 */
export declare enum CppFeatures_RepeatedType {
    /**
     * @generated from enum value: REPEATED_TYPE_UNKNOWN = 0;
     */
    REPEATED_TYPE_UNKNOWN = 0,
    /**
     * The repeated field will be backed by proto2::Repeated(Ptr)Field, and
     * accessors will return a reference/pointer to this type.
     *
     * @generated from enum value: LEGACY = 1;
     */
    LEGACY = 1,
    /**
     * The repeated field has an opaque backing type, and accessors will return
     * a RepeatedFieldProxy.
     *
     * @generated from enum value: PROXY = 2;
     */
    PROXY = 2
}
/**
 * @generated from enum pb.CppFeatures.RepeatedType
 */
export type CppFeatures_RepeatedTypeJson = "REPEATED_TYPE_UNKNOWN" | "LEGACY" | "PROXY";
/**
 * Describes the enum pb.CppFeatures.RepeatedType.
 */
export declare const CppFeatures_RepeatedTypeSchema: GenEnum<CppFeatures_RepeatedType, CppFeatures_RepeatedTypeJson>;
/**
 * @generated from extension: optional pb.CppFeatures cpp = 1000;
 */
export declare const cpp: GenExtension<FeatureSet, CppFeatures>;

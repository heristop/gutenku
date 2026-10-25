/*@ts-ignore*/
import * as GraphQL from 'graphql';

type Or<T, U> = void extends T ? U : T;
type Maybe<T> = T | undefined | null;
interface Extensions {
  [extension: string]: unknown;
}
type Source =
  | any
  | {
      body: string;
      name: string;
      locationOffset: {
        line: number;
        column: number;
      };
    };
type Location =
  | any
  | {
      start: number;
      end: number;
      source: Source;
    };

// When `graphql` isn't installed, `typeof GraphQL.Kind` resolves to `any`. That would make
// `keyof typeof GraphQL.Kind` match every `Key` and collapse `GraphQLKind` and the `Kind` value
// itself to `any`, breaking discriminated unions on AST `kind` fields. `IsGraphQLAny` detects that
// case so we fall back to the literal string kinds instead.
type IsGraphQLAny = 0 extends 1 & typeof GraphQL.Kind ? true : false;

type GraphQLKind<Key extends string, Fallback extends string> = IsGraphQLAny extends true
  ? Fallback
  : Key extends keyof typeof GraphQL.Kind
    ? (typeof GraphQL.Kind)[Key]
    : Fallback;

declare const Kind: (IsGraphQLAny extends true ? {} : typeof GraphQL.Kind) & {
  readonly NAME: GraphQLKind<'NAME', 'Name'>;
  readonly DOCUMENT: GraphQLKind<'DOCUMENT', 'Document'>;
  readonly OPERATION_DEFINITION: GraphQLKind<'OPERATION_DEFINITION', 'OperationDefinition'>;
  readonly VARIABLE_DEFINITION: GraphQLKind<'VARIABLE_DEFINITION', 'VariableDefinition'>;
  readonly SELECTION_SET: GraphQLKind<'SELECTION_SET', 'SelectionSet'>;
  readonly FIELD: GraphQLKind<'FIELD', 'Field'>;
  readonly ARGUMENT: GraphQLKind<'ARGUMENT', 'Argument'>;
  readonly FRAGMENT_SPREAD: GraphQLKind<'FRAGMENT_SPREAD', 'FragmentSpread'>;
  readonly INLINE_FRAGMENT: GraphQLKind<'INLINE_FRAGMENT', 'InlineFragment'>;
  readonly FRAGMENT_DEFINITION: GraphQLKind<'FRAGMENT_DEFINITION', 'FragmentDefinition'>;
  readonly VARIABLE: GraphQLKind<'VARIABLE', 'Variable'>;
  readonly INT: GraphQLKind<'INT', 'IntValue'>;
  readonly FLOAT: GraphQLKind<'FLOAT', 'FloatValue'>;
  readonly STRING: GraphQLKind<'STRING', 'StringValue'>;
  readonly BOOLEAN: GraphQLKind<'BOOLEAN', 'BooleanValue'>;
  readonly NULL: GraphQLKind<'NULL', 'NullValue'>;
  readonly ENUM: GraphQLKind<'ENUM', 'EnumValue'>;
  readonly LIST: GraphQLKind<'LIST', 'ListValue'>;
  readonly OBJECT: GraphQLKind<'OBJECT', 'ObjectValue'>;
  readonly OBJECT_FIELD: GraphQLKind<'OBJECT_FIELD', 'ObjectField'>;
  readonly DIRECTIVE: GraphQLKind<'DIRECTIVE', 'Directive'>;
  readonly NAMED_TYPE: GraphQLKind<'NAMED_TYPE', 'NamedType'>;
  readonly LIST_TYPE: GraphQLKind<'LIST_TYPE', 'ListType'>;
  readonly NON_NULL_TYPE: GraphQLKind<'NON_NULL_TYPE', 'NonNullType'>;
  readonly SCHEMA_DEFINITION: GraphQLKind<'SCHEMA_DEFINITION', 'SchemaDefinition'>;
  readonly OPERATION_TYPE_DEFINITION: GraphQLKind<
    'OPERATION_TYPE_DEFINITION',
    'OperationTypeDefinition'
  >;
  readonly SCALAR_TYPE_DEFINITION: GraphQLKind<'SCALAR_TYPE_DEFINITION', 'ScalarTypeDefinition'>;
  readonly OBJECT_TYPE_DEFINITION: GraphQLKind<'OBJECT_TYPE_DEFINITION', 'ObjectTypeDefinition'>;
  readonly FIELD_DEFINITION: GraphQLKind<'FIELD_DEFINITION', 'FieldDefinition'>;
  readonly INPUT_VALUE_DEFINITION: GraphQLKind<'INPUT_VALUE_DEFINITION', 'InputValueDefinition'>;
  readonly INTERFACE_TYPE_DEFINITION: GraphQLKind<
    'INTERFACE_TYPE_DEFINITION',
    'InterfaceTypeDefinition'
  >;
  readonly UNION_TYPE_DEFINITION: GraphQLKind<'UNION_TYPE_DEFINITION', 'UnionTypeDefinition'>;
  readonly ENUM_TYPE_DEFINITION: GraphQLKind<'ENUM_TYPE_DEFINITION', 'EnumTypeDefinition'>;
  readonly ENUM_VALUE_DEFINITION: GraphQLKind<'ENUM_VALUE_DEFINITION', 'EnumValueDefinition'>;
  readonly INPUT_OBJECT_TYPE_DEFINITION: GraphQLKind<
    'INPUT_OBJECT_TYPE_DEFINITION',
    'InputObjectTypeDefinition'
  >;
  readonly DIRECTIVE_DEFINITION: GraphQLKind<'DIRECTIVE_DEFINITION', 'DirectiveDefinition'>;
  readonly SCHEMA_EXTENSION: GraphQLKind<'SCHEMA_EXTENSION', 'SchemaExtension'>;
  readonly SCALAR_TYPE_EXTENSION: GraphQLKind<'SCALAR_TYPE_EXTENSION', 'ScalarTypeExtension'>;
  readonly OBJECT_TYPE_EXTENSION: GraphQLKind<'OBJECT_TYPE_EXTENSION', 'ObjectTypeExtension'>;
  readonly INTERFACE_TYPE_EXTENSION: GraphQLKind<
    'INTERFACE_TYPE_EXTENSION',
    'InterfaceTypeExtension'
  >;
  readonly UNION_TYPE_EXTENSION: GraphQLKind<'UNION_TYPE_EXTENSION', 'UnionTypeExtension'>;
  readonly ENUM_TYPE_EXTENSION: GraphQLKind<'ENUM_TYPE_EXTENSION', 'EnumTypeExtension'>;
  readonly INPUT_OBJECT_TYPE_EXTENSION: GraphQLKind<
    'INPUT_OBJECT_TYPE_EXTENSION',
    'InputObjectTypeExtension'
  >;
  /** Coordinates */
  readonly TYPE_COORDINATE: GraphQLKind<'TYPE_COORDINATE', 'TypeCoordinate'>;
  readonly MEMBER_COORDINATE: GraphQLKind<'MEMBER_COORDINATE', 'MemberCoordinate'>;
  readonly ARGUMENT_COORDINATE: GraphQLKind<'ARGUMENT_COORDINATE', 'ArgumentCoordinate'>;
  readonly DIRECTIVE_COORDINATE: GraphQLKind<'DIRECTIVE_COORDINATE', 'DirectiveCoordinate'>;
  readonly DIRECTIVE_ARGUMENT_COORDINATE: GraphQLKind<
    'DIRECTIVE_ARGUMENT_COORDINATE',
    'DirectiveArgumentCoordinate'
  >;
};

type Kind = (typeof Kind)[keyof typeof Kind];

declare namespace Kind {
  /** Name */
  export type NAME = GraphQLKind<'NAME', 'Name'>;
  /** Document */
  export type DOCUMENT = GraphQLKind<'DOCUMENT', 'Document'>;
  export type OPERATION_DEFINITION = GraphQLKind<'OPERATION_DEFINITION', 'OperationDefinition'>;
  export type VARIABLE_DEFINITION = GraphQLKind<'VARIABLE_DEFINITION', 'VariableDefinition'>;
  export type SELECTION_SET = GraphQLKind<'SELECTION_SET', 'SelectionSet'>;
  export type FIELD = GraphQLKind<'FIELD', 'Field'>;
  export type ARGUMENT = GraphQLKind<'ARGUMENT', 'Argument'>;
  /** Fragments */
  export type FRAGMENT_SPREAD = GraphQLKind<'FRAGMENT_SPREAD', 'FragmentSpread'>;
  export type INLINE_FRAGMENT = GraphQLKind<'INLINE_FRAGMENT', 'InlineFragment'>;
  export type FRAGMENT_DEFINITION = GraphQLKind<'FRAGMENT_DEFINITION', 'FragmentDefinition'>;
  /** Values */
  export type VARIABLE = GraphQLKind<'VARIABLE', 'Variable'>;
  export type INT = GraphQLKind<'INT', 'IntValue'>;
  export type FLOAT = GraphQLKind<'FLOAT', 'FloatValue'>;
  export type STRING = GraphQLKind<'STRING', 'StringValue'>;
  export type BOOLEAN = GraphQLKind<'BOOLEAN', 'BooleanValue'>;
  export type NULL = GraphQLKind<'NULL', 'NullValue'>;
  export type ENUM = GraphQLKind<'ENUM', 'EnumValue'>;
  export type LIST = GraphQLKind<'LIST', 'ListValue'>;
  export type OBJECT = GraphQLKind<'OBJECT', 'ObjectValue'>;
  export type OBJECT_FIELD = GraphQLKind<'OBJECT_FIELD', 'ObjectField'>;
  /** Directives */
  export type DIRECTIVE = GraphQLKind<'DIRECTIVE', 'Directive'>;
  /** Types */
  export type NAMED_TYPE = GraphQLKind<'NAMED_TYPE', 'NamedType'>;
  export type LIST_TYPE = GraphQLKind<'LIST_TYPE', 'ListType'>;
  export type NON_NULL_TYPE = GraphQLKind<'NON_NULL_TYPE', 'NonNullType'>;
  /** Type System Definitions */
  export type SCHEMA_DEFINITION = GraphQLKind<'SCHEMA_DEFINITION', 'SchemaDefinition'>;
  export type OPERATION_TYPE_DEFINITION = GraphQLKind<
    'OPERATION_TYPE_DEFINITION',
    'OperationTypeDefinition'
  >;
  /** Type Definitions */
  export type SCALAR_TYPE_DEFINITION = GraphQLKind<
    'SCALAR_TYPE_DEFINITION',
    'ScalarTypeDefinition'
  >;
  export type OBJECT_TYPE_DEFINITION = GraphQLKind<
    'OBJECT_TYPE_DEFINITION',
    'ObjectTypeDefinition'
  >;
  export type FIELD_DEFINITION = GraphQLKind<'FIELD_DEFINITION', 'FieldDefinition'>;
  export type INPUT_VALUE_DEFINITION = GraphQLKind<
    'INPUT_VALUE_DEFINITION',
    'InputValueDefinition'
  >;
  export type INTERFACE_TYPE_DEFINITION = GraphQLKind<
    'INTERFACE_TYPE_DEFINITION',
    'InterfaceTypeDefinition'
  >;
  export type UNION_TYPE_DEFINITION = GraphQLKind<'UNION_TYPE_DEFINITION', 'UnionTypeDefinition'>;
  export type ENUM_TYPE_DEFINITION = GraphQLKind<'ENUM_TYPE_DEFINITION', 'EnumTypeDefinition'>;
  export type ENUM_VALUE_DEFINITION = GraphQLKind<'ENUM_VALUE_DEFINITION', 'EnumValueDefinition'>;
  export type INPUT_OBJECT_TYPE_DEFINITION = GraphQLKind<
    'INPUT_OBJECT_TYPE_DEFINITION',
    'InputObjectTypeDefinition'
  >;
  /** Directive Definitions */
  export type DIRECTIVE_DEFINITION = GraphQLKind<'DIRECTIVE_DEFINITION', 'DirectiveDefinition'>;
  /** Type System Extensions */
  export type SCHEMA_EXTENSION = GraphQLKind<'SCHEMA_EXTENSION', 'SchemaExtension'>;
  /** Type Extensions */
  export type SCALAR_TYPE_EXTENSION = GraphQLKind<'SCALAR_TYPE_EXTENSION', 'ScalarTypeExtension'>;
  export type OBJECT_TYPE_EXTENSION = GraphQLKind<'OBJECT_TYPE_EXTENSION', 'ObjectTypeExtension'>;
  export type INTERFACE_TYPE_EXTENSION = GraphQLKind<
    'INTERFACE_TYPE_EXTENSION',
    'InterfaceTypeExtension'
  >;
  export type UNION_TYPE_EXTENSION = GraphQLKind<'UNION_TYPE_EXTENSION', 'UnionTypeExtension'>;
  export type ENUM_TYPE_EXTENSION = GraphQLKind<'ENUM_TYPE_EXTENSION', 'EnumTypeExtension'>;
  export type INPUT_OBJECT_TYPE_EXTENSION = GraphQLKind<
    'INPUT_OBJECT_TYPE_EXTENSION',
    'InputObjectTypeExtension'
  >;
  /** Coordinates */
  export type TYPE_COORDINATE = GraphQLKind<'TYPE_COORDINATE', 'TypeCoordinate'>;
  export type MEMBER_COORDINATE = GraphQLKind<'MEMBER_COORDINATE', 'MemberCoordinate'>;
  export type ARGUMENT_COORDINATE = GraphQLKind<'ARGUMENT_COORDINATE', 'ArgumentCoordinate'>;
  export type DIRECTIVE_COORDINATE = GraphQLKind<'DIRECTIVE_COORDINATE', 'DirectiveCoordinate'>;
  export type DIRECTIVE_ARGUMENT_COORDINATE = GraphQLKind<
    'DIRECTIVE_ARGUMENT_COORDINATE',
    'DirectiveArgumentCoordinate'
  >;
}

declare enum OperationTypeNode {
  QUERY = 'query',
  MUTATION = 'mutation',
  SUBSCRIPTION = 'subscription',
}

/** Type System Definition */
declare type TypeSystemDefinitionNode = Or<
  GraphQL.TypeSystemDefinitionNode,
  SchemaDefinitionNode | TypeDefinitionNode | DirectiveDefinitionNode
>;
type SchemaDefinitionNode = Or<
  GraphQL.SchemaDefinitionNode,
  {
    readonly kind: Kind.SCHEMA_DEFINITION;
    readonly loc?: Location;
    readonly description?: StringValueNode;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
    readonly operationTypes: ReadonlyArray<OperationTypeDefinitionNode>;
  }
>;
type OperationTypeDefinitionNode = Or<
  GraphQL.OperationTypeDefinitionNode,
  {
    readonly kind: Kind.OPERATION_TYPE_DEFINITION;
    readonly loc?: Location;
    readonly operation: OperationTypeNode;
    readonly type: NamedTypeNode;
  }
>;
/** Type Definition */
declare type TypeDefinitionNode = Or<
  GraphQL.TypeDefinitionNode,
  | ScalarTypeDefinitionNode
  | ObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode
  | UnionTypeDefinitionNode
  | EnumTypeDefinitionNode
  | InputObjectTypeDefinitionNode
>;
type ScalarTypeDefinitionNode = Or<
  GraphQL.ScalarTypeDefinitionNode,
  {
    readonly kind: Kind.SCALAR_TYPE_DEFINITION;
    readonly loc?: Location;
    readonly description?: StringValueNode;
    readonly name: NameNode;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
  }
>;
type ObjectTypeDefinitionNode = Or<
  GraphQL.ObjectTypeDefinitionNode,
  {
    readonly kind: Kind.OBJECT_TYPE_DEFINITION;
    readonly loc?: Location;
    readonly description?: StringValueNode;
    readonly name: NameNode;
    readonly interfaces?: ReadonlyArray<NamedTypeNode>;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
    readonly fields?: ReadonlyArray<FieldDefinitionNode>;
  }
>;
type FieldDefinitionNode = Or<
  GraphQL.FieldDefinitionNode,
  {
    readonly kind: Kind.FIELD_DEFINITION;
    readonly loc?: Location;
    readonly description?: StringValueNode;
    readonly name: NameNode;
    readonly arguments?: ReadonlyArray<InputValueDefinitionNode>;
    readonly type: TypeNode;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
  }
>;
type InputValueDefinitionNode = Or<
  GraphQL.InputValueDefinitionNode,
  {
    readonly kind: Kind.INPUT_VALUE_DEFINITION;
    readonly loc?: Location;
    readonly description?: StringValueNode;
    readonly name: NameNode;
    readonly type: TypeNode;
    readonly defaultValue?: ConstValueNode;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
  }
>;
type InterfaceTypeDefinitionNode = Or<
  GraphQL.InterfaceTypeDefinitionNode,
  {
    readonly kind: Kind.INTERFACE_TYPE_DEFINITION;
    readonly loc?: Location;
    readonly description?: StringValueNode;
    readonly name: NameNode;
    readonly interfaces?: ReadonlyArray<NamedTypeNode>;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
    readonly fields?: ReadonlyArray<FieldDefinitionNode>;
  }
>;
type UnionTypeDefinitionNode = Or<
  GraphQL.UnionTypeDefinitionNode,
  {
    readonly kind: Kind.UNION_TYPE_DEFINITION;
    readonly loc?: Location;
    readonly description?: StringValueNode;
    readonly name: NameNode;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
    readonly types?: ReadonlyArray<NamedTypeNode>;
  }
>;
type EnumTypeDefinitionNode = Or<
  GraphQL.EnumTypeDefinitionNode,
  {
    readonly kind: Kind.ENUM_TYPE_DEFINITION;
    readonly loc?: Location;
    readonly description?: StringValueNode;
    readonly name: NameNode;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
    readonly values?: ReadonlyArray<EnumValueDefinitionNode>;
  }
>;
type EnumValueDefinitionNode = Or<
  GraphQL.EnumValueDefinitionNode,
  {
    readonly kind: Kind.ENUM_VALUE_DEFINITION;
    readonly loc?: Location;
    readonly description?: StringValueNode;
    readonly name: NameNode;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
  }
>;
type InputObjectTypeDefinitionNode = Or<
  GraphQL.InputObjectTypeDefinitionNode,
  {
    readonly kind: Kind.INPUT_OBJECT_TYPE_DEFINITION;
    readonly loc?: Location;
    readonly description?: StringValueNode;
    readonly name: NameNode;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
    readonly fields?: ReadonlyArray<InputValueDefinitionNode>;
  }
>;
type DirectiveDefinitionNode = Or<
  GraphQL.DirectiveDefinitionNode,
  {
    readonly kind: Kind.DIRECTIVE_DEFINITION;
    readonly loc?: Location;
    readonly description?: StringValueNode;
    readonly name: NameNode;
    readonly arguments?: ReadonlyArray<InputValueDefinitionNode>;
    readonly repeatable: boolean;
    readonly locations: ReadonlyArray<NameNode>;
  }
>;
type TypeSystemExtensionNode = Or<
  GraphQL.TypeSystemExtensionNode,
  SchemaExtensionNode | TypeExtensionNode
>;
type SchemaExtensionNode = Or<
  GraphQL.SchemaExtensionNode,
  {
    readonly kind: Kind.SCHEMA_EXTENSION;
    readonly loc?: Location;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
    readonly operationTypes?: ReadonlyArray<OperationTypeDefinitionNode>;
  }
>;
declare type TypeExtensionNode = Or<
  GraphQL.TypeExtensionNode,
  | ScalarTypeExtensionNode
  | ObjectTypeExtensionNode
  | InterfaceTypeExtensionNode
  | UnionTypeExtensionNode
  | EnumTypeExtensionNode
  | InputObjectTypeExtensionNode
>;
type ScalarTypeExtensionNode = Or<
  GraphQL.ScalarTypeExtensionNode,
  {
    readonly kind: Kind.SCALAR_TYPE_EXTENSION;
    readonly loc?: Location;
    readonly name: NameNode;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
  }
>;
type ObjectTypeExtensionNode = Or<
  GraphQL.ObjectTypeExtensionNode,
  {
    readonly kind: Kind.OBJECT_TYPE_EXTENSION;
    readonly loc?: Location;
    readonly name: NameNode;
    readonly interfaces?: ReadonlyArray<NamedTypeNode>;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
    readonly fields?: ReadonlyArray<FieldDefinitionNode>;
  }
>;
type InterfaceTypeExtensionNode = Or<
  GraphQL.InterfaceTypeExtensionNode,
  {
    readonly kind: Kind.INTERFACE_TYPE_EXTENSION;
    readonly loc?: Location;
    readonly name: NameNode;
    readonly interfaces?: ReadonlyArray<NamedTypeNode>;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
    readonly fields?: ReadonlyArray<FieldDefinitionNode>;
  }
>;
type UnionTypeExtensionNode = Or<
  GraphQL.UnionTypeExtensionNode,
  {
    readonly kind: Kind.UNION_TYPE_EXTENSION;
    readonly loc?: Location;
    readonly name: NameNode;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
    readonly types?: ReadonlyArray<NamedTypeNode>;
  }
>;
type EnumTypeExtensionNode = Or<
  GraphQL.EnumTypeExtensionNode,
  {
    readonly kind: Kind.ENUM_TYPE_EXTENSION;
    readonly loc?: Location;
    readonly name: NameNode;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
    readonly values?: ReadonlyArray<EnumValueDefinitionNode>;
  }
>;
type InputObjectTypeExtensionNode = Or<
  GraphQL.InputObjectTypeExtensionNode,
  {
    readonly kind: Kind.INPUT_OBJECT_TYPE_EXTENSION;
    readonly loc?: Location;
    readonly name: NameNode;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
    readonly fields?: ReadonlyArray<InputValueDefinitionNode>;
  }
>;

declare type SchemaCoordinateNode =
  | TypeCoordinateNode
  | MemberCoordinateNode
  | ArgumentCoordinateNode
  | DirectiveCoordinateNode
  | DirectiveArgumentCoordinateNode;
interface TypeCoordinateNode {
  readonly kind: Kind.TYPE_COORDINATE;
  readonly loc?: Location;
  readonly name: NameNode;
}
interface MemberCoordinateNode {
  readonly kind: Kind.MEMBER_COORDINATE;
  readonly loc?: Location;
  readonly name: NameNode;
  readonly memberName: NameNode;
}
interface ArgumentCoordinateNode {
  readonly kind: Kind.ARGUMENT_COORDINATE;
  readonly loc?: Location;
  readonly name: NameNode;
  readonly fieldName: NameNode;
  readonly argumentName: NameNode;
}
interface DirectiveCoordinateNode {
  readonly kind: Kind.DIRECTIVE_COORDINATE;
  readonly loc?: Location;
  readonly name: NameNode;
}
interface DirectiveArgumentCoordinateNode {
  readonly kind: Kind.DIRECTIVE_ARGUMENT_COORDINATE;
  readonly loc?: Location;
  readonly name: NameNode;
  readonly argumentName: NameNode;
}

type ASTNode = Or<
  GraphQL.ASTNode,
  | NameNode
  | DocumentNode
  | OperationDefinitionNode
  | VariableDefinitionNode
  | VariableNode
  | SelectionSetNode
  | FieldNode
  | ArgumentNode
  | FragmentSpreadNode
  | InlineFragmentNode
  | FragmentDefinitionNode
  | IntValueNode
  | FloatValueNode
  | StringValueNode
  | BooleanValueNode
  | NullValueNode
  | EnumValueNode
  | ListValueNode
  | ObjectValueNode
  | ObjectFieldNode
  | DirectiveNode
  | NamedTypeNode
  | ListTypeNode
  | NonNullTypeNode
  | SchemaDefinitionNode
  | OperationTypeDefinitionNode
  | ScalarTypeDefinitionNode
  | ObjectTypeDefinitionNode
  | FieldDefinitionNode
  | InputValueDefinitionNode
  | InterfaceTypeDefinitionNode
  | UnionTypeDefinitionNode
  | EnumTypeDefinitionNode
  | EnumValueDefinitionNode
  | InputObjectTypeDefinitionNode
  | DirectiveDefinitionNode
  | SchemaExtensionNode
  | ScalarTypeExtensionNode
  | ObjectTypeExtensionNode
  | InterfaceTypeExtensionNode
  | UnionTypeExtensionNode
  | EnumTypeExtensionNode
  | InputObjectTypeExtensionNode
  | SchemaCoordinateNode
  | TypeCoordinateNode
  | MemberCoordinateNode
  | ArgumentCoordinateNode
  | DirectiveCoordinateNode
  | DirectiveArgumentCoordinateNode
>;
type NameNode = Or<
  GraphQL.NameNode,
  {
    readonly kind: Kind.NAME;
    readonly value: string;
    readonly loc?: Location;
  }
>;
type DocumentNode = Or<
  GraphQL.DocumentNode & {
    readonly tokenCount?: number | undefined;
  },
  {
    readonly kind: Kind.DOCUMENT;
    readonly definitions: ReadonlyArray<DefinitionNode>;
    readonly loc?: Location;
    readonly tokenCount?: number | undefined;
  }
>;
type DefinitionNode = Or<
  GraphQL.DefinitionNode,
  ExecutableDefinitionNode | TypeSystemDefinitionNode | TypeSystemExtensionNode
>;
type ExecutableDefinitionNode = Or<
  GraphQL.ExecutableDefinitionNode,
  OperationDefinitionNode | FragmentDefinitionNode
>;
type OperationDefinitionNode = Or<
  GraphQL.OperationDefinitionNode & {
    readonly description?: StringValueNode;
  },
  {
    readonly kind: Kind.OPERATION_DEFINITION;
    readonly operation: OperationTypeNode;
    readonly name?: NameNode;
    readonly description?: StringValueNode;
    readonly variableDefinitions?: ReadonlyArray<VariableDefinitionNode>;
    readonly directives?: ReadonlyArray<DirectiveNode>;
    readonly selectionSet: SelectionSetNode;
    readonly loc?: Location;
  }
>;
type VariableDefinitionNode = Or<
  GraphQL.VariableDefinitionNode & {
    description?: StringValueNode;
  },
  {
    readonly kind: Kind.VARIABLE_DEFINITION;
    readonly variable: VariableNode;
    readonly type: TypeNode;
    readonly defaultValue?: ConstValueNode;
    readonly description?: StringValueNode;
    readonly directives?: ReadonlyArray<ConstDirectiveNode>;
    readonly loc?: Location;
  }
>;
type VariableNode = Or<
  GraphQL.VariableNode,
  {
    readonly kind: Kind.VARIABLE;
    readonly name: NameNode;
    readonly loc?: Location;
  }
>;
type SelectionSetNode = Or<
  GraphQL.SelectionSetNode,
  {
    readonly kind: Kind.SELECTION_SET;
    readonly selections: ReadonlyArray<SelectionNode>;
    readonly loc?: Location;
  }
>;
declare type SelectionNode = Or<
  GraphQL.SelectionNode,
  FieldNode | FragmentSpreadNode | InlineFragmentNode
>;
type FieldNode = Or<
  GraphQL.FieldNode,
  {
    readonly kind: Kind.FIELD;
    readonly alias?: NameNode;
    readonly name: NameNode;
    readonly arguments?: ReadonlyArray<ArgumentNode>;
    readonly directives?: ReadonlyArray<DirectiveNode>;
    readonly selectionSet?: SelectionSetNode;
    readonly loc?: Location;
  }
>;
type ArgumentNode = Or<
  GraphQL.ArgumentNode,
  {
    readonly kind: Kind.ARGUMENT;
    readonly name: NameNode;
    readonly value: ValueNode;
    readonly loc?: Location;
  }
>;
type ConstArgumentNode = Or<
  GraphQL.ConstArgumentNode,
  {
    readonly kind: Kind.ARGUMENT;
    readonly name: NameNode;
    readonly value: ConstValueNode;
    readonly loc?: Location;
  }
>;
type FragmentSpreadNode = Or<
  GraphQL.FragmentSpreadNode,
  {
    readonly kind: Kind.FRAGMENT_SPREAD;
    readonly name: NameNode;
    readonly directives?: ReadonlyArray<DirectiveNode>;
    readonly loc?: Location;
  }
>;
type InlineFragmentNode = Or<
  GraphQL.InlineFragmentNode,
  {
    readonly kind: Kind.INLINE_FRAGMENT;
    readonly typeCondition?: NamedTypeNode;
    readonly directives?: ReadonlyArray<DirectiveNode>;
    readonly selectionSet: SelectionSetNode;
    readonly loc?: Location;
  }
>;
type FragmentDefinitionNode = Or<
  GraphQL.FragmentDefinitionNode & {
    description?: StringValueNode;
  },
  {
    readonly kind: Kind.FRAGMENT_DEFINITION;
    readonly name: NameNode;
    readonly description?: StringValueNode;
    readonly typeCondition: NamedTypeNode;
    readonly directives?: ReadonlyArray<DirectiveNode>;
    readonly selectionSet: SelectionSetNode;
    readonly loc?: Location;
  }
>;
type ValueNode = Or<
  GraphQL.ValueNode,
  | VariableNode
  | IntValueNode
  | FloatValueNode
  | StringValueNode
  | BooleanValueNode
  | NullValueNode
  | EnumValueNode
  | ListValueNode
  | ObjectValueNode
>;
type ConstValueNode = Or<
  GraphQL.ConstValueNode,
  | IntValueNode
  | FloatValueNode
  | StringValueNode
  | BooleanValueNode
  | NullValueNode
  | EnumValueNode
  | ConstListValueNode
  | ConstObjectValueNode
>;
type IntValueNode = Or<
  GraphQL.IntValueNode,
  {
    readonly kind: Kind.INT;
    readonly value: string;
    readonly loc?: Location;
  }
>;
type FloatValueNode = Or<
  GraphQL.FloatValueNode,
  {
    readonly kind: Kind.FLOAT;
    readonly value: string;
    readonly loc?: Location;
  }
>;
type StringValueNode = Or<
  GraphQL.StringValueNode,
  {
    readonly kind: Kind.STRING;
    readonly value: string;
    readonly block?: boolean;
    readonly loc?: Location;
  }
>;
type BooleanValueNode = Or<
  GraphQL.BooleanValueNode,
  {
    readonly kind: Kind.BOOLEAN;
    readonly value: boolean;
    readonly loc?: Location;
  }
>;
type NullValueNode = Or<
  GraphQL.NullValueNode,
  {
    readonly kind: Kind.NULL;
    readonly loc?: Location;
  }
>;
type EnumValueNode = Or<
  GraphQL.EnumValueNode,
  {
    readonly kind: Kind.ENUM;
    readonly value: string;
    readonly loc?: Location;
  }
>;
type ListValueNode = Or<
  GraphQL.ListValueNode,
  {
    readonly kind: Kind.LIST;
    readonly values: ReadonlyArray<ValueNode>;
    readonly loc?: Location;
  }
>;
type ConstListValueNode = Or<
  GraphQL.ConstListValueNode,
  {
    readonly kind: Kind.LIST;
    readonly values: ReadonlyArray<ConstValueNode>;
    readonly loc?: Location;
  }
>;
type ObjectValueNode = Or<
  GraphQL.ObjectValueNode,
  {
    readonly kind: Kind.OBJECT;
    readonly fields: ReadonlyArray<ObjectFieldNode>;
    readonly loc?: Location;
  }
>;
type ConstObjectValueNode = Or<
  GraphQL.ConstObjectValueNode,
  {
    readonly kind: Kind.OBJECT;
    readonly fields: ReadonlyArray<ConstObjectFieldNode>;
    readonly loc?: Location;
  }
>;
type ObjectFieldNode = Or<
  GraphQL.ObjectFieldNode,
  {
    readonly kind: Kind.OBJECT_FIELD;
    readonly name: NameNode;
    readonly value: ValueNode;
    readonly loc?: Location;
  }
>;
type ConstObjectFieldNode = Or<
  GraphQL.ConstObjectFieldNode,
  {
    readonly kind: Kind.OBJECT_FIELD;
    readonly name: NameNode;
    readonly value: ConstValueNode;
    readonly loc?: Location;
  }
>;
type DirectiveNode = Or<
  GraphQL.DirectiveNode,
  {
    readonly kind: Kind.DIRECTIVE;
    readonly name: NameNode;
    readonly arguments?: ReadonlyArray<ArgumentNode>;
    readonly loc?: Location;
  }
>;
type ConstDirectiveNode = Or<
  GraphQL.ConstDirectiveNode,
  {
    readonly kind: Kind.DIRECTIVE;
    readonly name: NameNode;
    readonly arguments?: ReadonlyArray<ConstArgumentNode>;
    readonly loc?: Location;
  }
>;
type TypeNode = Or<GraphQL.TypeNode, NamedTypeNode | ListTypeNode | NonNullTypeNode>;
type NamedTypeNode = Or<
  GraphQL.NamedTypeNode,
  {
    readonly kind: Kind.NAMED_TYPE;
    readonly name: NameNode;
    readonly loc?: Location;
  }
>;
type ListTypeNode = Or<
  GraphQL.ListTypeNode,
  {
    readonly kind: Kind.LIST_TYPE;
    readonly type: TypeNode;
    readonly loc?: Location;
  }
>;
type NonNullTypeNode = Or<
  GraphQL.NonNullTypeNode,
  {
    readonly kind: Kind.NON_NULL_TYPE;
    readonly type: NamedTypeNode | ListTypeNode;
    readonly loc?: Location;
  }
>;

declare class GraphQLError extends Error {
  readonly locations: ReadonlyArray<any> | undefined;
  readonly path: ReadonlyArray<string | number> | undefined;
  readonly nodes: ReadonlyArray<any> | undefined;
  readonly source: Source | undefined;
  readonly positions: ReadonlyArray<number> | undefined;
  readonly originalError: Error | undefined;
  readonly extensions: Extensions;
  constructor(
    message: string,
    nodes?: ReadonlyArray<ASTNode> | ASTNode | null,
    source?: Maybe<Source>,
    positions?: Maybe<ReadonlyArray<number>>,
    path?: Maybe<ReadonlyArray<string | number>>,
    originalError?: Maybe<Error>,
    extensions?: Maybe<Extensions>
  );
  toJSON(): any;
  toString(): string;
  get [Symbol.toStringTag](): string;
}

/**
 * This is a spec-compliant implementation of a GraphQL query language parser,
 * up-to-date with the October 2021 Edition. Unlike the reference implementation
 * in graphql.js it will only parse the query language, but not the schema
 * language.
 */

type ParseOptions = {
  [option: string]: any;
};
declare function parse(string: string | Source, options?: ParseOptions | undefined): DocumentNode;
declare function parseValue(
  string: string | Source,
  _options?: ParseOptions | undefined
): ValueNode;
declare function parseType(string: string | Source, _options?: ParseOptions | undefined): TypeNode;

declare const BREAK: {};
declare function visit<N extends ASTNode>(root: N, visitor: ASTVisitor): N;
declare function visit<R>(root: ASTNode, visitor: ASTReducer<R>): R;
type ASTVisitor = EnterLeaveVisitor<ASTNode> | KindVisitor;
type KindVisitor = {
  readonly [NodeT in ASTNode as NodeT['kind']]?: ASTVisitFn<NodeT> | EnterLeaveVisitor<NodeT>;
};
interface EnterLeaveVisitor<TVisitedNode extends ASTNode> {
  readonly enter?: ASTVisitFn<TVisitedNode> | undefined;
  readonly leave?: ASTVisitFn<TVisitedNode> | undefined;
}
type ASTVisitFn<Node extends ASTNode> = (
  node: Node,
  key: string | number | undefined,
  parent: ASTNode | ReadonlyArray<ASTNode> | undefined,
  path: ReadonlyArray<string | number>,
  ancestors: ReadonlyArray<ASTNode | ReadonlyArray<ASTNode>>
) => any;
type ASTReducer<R> = {
  readonly [NodeT in ASTNode as NodeT['kind']]?: {
    readonly enter?: ASTVisitFn<NodeT>;
    readonly leave: ASTReducerFn<NodeT, R>;
  };
};
type ASTReducerFn<TReducedNode extends ASTNode, R> = (
  node: {
    [K in keyof TReducedNode]: ReducedField<TReducedNode[K], R>;
  },
  key: string | number | undefined,
  parent: ASTNode | ReadonlyArray<ASTNode> | undefined,
  path: ReadonlyArray<string | number>,
  ancestors: ReadonlyArray<ASTNode | ReadonlyArray<ASTNode>>
) => R;
type ReducedField<T, R> = T extends null | undefined
  ? T
  : T extends ReadonlyArray<any>
    ? ReadonlyArray<R>
    : R;

declare function printString(string: string): string;
declare function printBlockString(string: string): string;
declare function print(node: ASTNode): string;

declare function valueFromASTUntyped(
  node: ValueNode,
  variables?: Maybe<Record<string, any>>
): unknown;
declare function valueFromTypeNode(
  node: ValueNode,
  type: TypeNode,
  variables?: Maybe<Record<string, any>>
): unknown;

declare function isSelectionNode(node: ASTNode): node is SelectionNode;

export {
  BREAK,
  GraphQLError,
  Kind,
  OperationTypeNode,
  isSelectionNode,
  parse,
  parseType,
  parseValue,
  print,
  printBlockString,
  printString,
  valueFromASTUntyped,
  valueFromTypeNode,
  visit,
};
export type {
  ASTNode,
  ASTReducer,
  ASTVisitFn,
  ASTVisitor,
  ArgumentCoordinateNode,
  ArgumentNode,
  BooleanValueNode,
  ConstArgumentNode,
  ConstDirectiveNode,
  ConstListValueNode,
  ConstObjectFieldNode,
  ConstObjectValueNode,
  ConstValueNode,
  DefinitionNode,
  DirectiveArgumentCoordinateNode,
  DirectiveCoordinateNode,
  DirectiveDefinitionNode,
  DirectiveNode,
  DocumentNode,
  EnumTypeDefinitionNode,
  EnumTypeExtensionNode,
  EnumValueDefinitionNode,
  EnumValueNode,
  ExecutableDefinitionNode,
  Extensions,
  FieldDefinitionNode,
  FieldNode,
  FloatValueNode,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  GraphQLKind,
  InlineFragmentNode,
  InputObjectTypeDefinitionNode,
  InputObjectTypeExtensionNode,
  InputValueDefinitionNode,
  IntValueNode,
  InterfaceTypeDefinitionNode,
  InterfaceTypeExtensionNode,
  IsGraphQLAny,
  ListTypeNode,
  ListValueNode,
  Location,
  MemberCoordinateNode,
  NameNode,
  NamedTypeNode,
  NonNullTypeNode,
  NullValueNode,
  ObjectFieldNode,
  ObjectTypeDefinitionNode,
  ObjectTypeExtensionNode,
  ObjectValueNode,
  OperationDefinitionNode,
  OperationTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  ScalarTypeExtensionNode,
  SchemaCoordinateNode,
  SchemaDefinitionNode,
  SchemaExtensionNode,
  SelectionNode,
  SelectionSetNode,
  Source,
  StringValueNode,
  TypeCoordinateNode,
  TypeDefinitionNode,
  TypeExtensionNode,
  TypeNode,
  TypeSystemDefinitionNode,
  TypeSystemExtensionNode,
  UnionTypeDefinitionNode,
  UnionTypeExtensionNode,
  ValueNode,
  VariableDefinitionNode,
  VariableNode,
};

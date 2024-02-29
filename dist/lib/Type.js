"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optional = exports.OptionalType = void 0;
// /** Type definition, including nested/object syntax. */
// export type TypeDefinition =
//   | ValueType
//   | [ValueType]
//   | OptionalType<TypeDefinition>
//   | { [property: string]: TypeDefinition } // Type.Object syntax
//   | [{ [property: string]: TypeDefinition }]; // Type.Array syntax
// export type TypedTypeDefinition<EncoderType = any> =
//   | ValueType
//   | [ValueType]
//   | OptionalType<TypedTypeDefinition<EncoderType>>
//   | { [property in keyof EncoderType]: TypedTypeDefinition<EncoderType[property]> } // Type.Object syntax
//   | [{ [property in keyof EncoderType]: TypedTypeDefinition<EncoderType[property]> }] // Type.Array syntax
class OptionalType {
    constructor(type) {
        this.type = type;
    }
}
exports.OptionalType = OptionalType;
function Optional(t) {
    return new OptionalType(t);
}
exports.Optional = Optional;
//# sourceMappingURL=Type.js.map
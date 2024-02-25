/** All Type values, except the special Type.Array and Type.Object data structures. */
type ValueType = Exclude<Type, Type.Array | Type.Object>;
/** Type definition, including nested/object syntax. */
export type TypeDefinition = ValueType | [ValueType] | OptionalType<TypeDefinition> | {
    [property: string]: TypeDefinition;
} | [{
    [property: string]: TypeDefinition;
}];
export declare class OptionalType<T> {
    type: T;
    constructor(type: T);
}
export declare function Optional<T>(t: T): OptionalType<T>;
/**
 * Binary coder types.
 */
export declare const enum Type {
    /**
     * A single boolean, encoded as 1 byte.
     *
     * @see {Type.BooleanTuple} @see {Type.Bitmask8} to pack multiple booleans into 1 byte.
     */
    Boolean = "bool",
    /** A string. */
    String = "str",
    /** Floating-point number (16-bit, half precision, 2 bytes). */
    Half = "half",
    /** Floating-point number (32-bit, single precision, 4 bytes). */
    Float = "float",
    /** Floating-point number (64-bit, double precision, 8 bytes). Default JavaScript `number` type. */
    Double = "double",
    /**
     * Signed integer.
     *
     * Automatically uses 1, 2, 4, or 8 bytes depending on the value:
     *  - For values -64 -> 64 uses 1 byte.
     *  - For values -8,192 -> 8,192 uses 2 bytes.
     *  - For values -268,435,456 -> 268,435,456 uses 4 bytes.
     *  - For values -Number.MAX_SAFE_INTEGER -> Number.MAX_SAFE_INTEGER uses 8 bytes (if outside of the 4 byte range).
     */
    Int = "int",
    /** Signed 1 byte integer (between -127 and 127). */
    Int8 = "int8",
    /** Signed 2 byte integer (between -32,767 and 32,767). */
    Int16 = "int16",
    /** Signed 4 byte integer (between -2,147,483,647 and 2,147,483,647). */
    Int32 = "int32",
    /**
     * Unsigned integer.
     *
     * Automatically uses 1, 2, 4, or 8 bytes depending on the value:
     *  - For values 0 -> 127 uses 1 bytes.
     *  - For values 128 -> 16,384 uses 2 bytes.
     *  - For values 16,385 -> 536,870,911 uses 4 bytes.
     *  - For values 536,870,912 -> Number.MAX_SAFE_INTEGER uses 8 bytes.
     */
    UInt = "uint",
    /** Unsigned 1 byte integer (between 0 and 255). */
    UInt8 = "uint8",
    /** Unsigned 2 byte integer (between 0 and 65,535). */
    UInt16 = "uint16",
    /** Unsigned 4 byte integer (between 0 and 4,294,967,295). */
    UInt32 = "uint32",
    /**
     * Any JavaScript ArrayBuffer or ArrayBufferView (e.g. UInt8Array).
     *
     * @see {ArrayBuffer}
     * @see {ArrayBufferView}
     */
    Binary = "binary",
    /**
     * A JavaScript date object.
     *
     * Encoded as an 8 byte (64-bit) integer UTC timestamp from as the number
     * of milliseconds since the Unix Epoch (January 1, 1970, 00:00:00 UTC).
     *
     * @see {Date}
     */
    Date = "date",
    /**
     * A JavaScript regular expression.
     * @see {RegExp}
     */
    RegExp = "regex",
    /**
     * Any JSON-serializable data.
     */
    JSON = "json",
    /**
     * A tuple/array of booleans.
     *
     * Automatically packs into the minimal amount of bytes (with a 2-bit header):
     *  - For arrays with 0 -> 6 values uses 1 bytes.
     *  - For arrays with 7 -> 12 values uses 2 bytes.
     *  - And so forth...
     */
    BooleanTuple = "booltuple",
    /** An array containing up to 8 booleans, encoded as a single UInt8. */
    Bitmask8 = "bitmask8",
    /** An array containing up to 16 booleans, encoded as a single UInt16. */
    Bitmask16 = "bitmask16",
    /** An array containing up to 32 booleans, encoded as a single UInt32. */
    Bitmask32 = "bitmask32",
    /**
     * Do not use this directly, use array syntax instead.
     *
     * An array definition.
     * @see {Array}
     */
    Array = "[array]",
    /**
     * Do not use this directly, use object syntax instead.
     *
     * A dictionary-like definition.
     */
    Object = "{object}"
}
export {};
//# sourceMappingURL=Type.d.ts.map
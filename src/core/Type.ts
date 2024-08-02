/**
 * Mappings for the value types.
 */
export type ValueTypes = {
  // Floats
  [Type.Float16]: number;
  [Type.Float32]: number;
  [Type.Float64]: number;
  // Integers
  [Type.Int]: number;
  [Type.Int8]: number;
  [Type.Int16]: number;
  [Type.Int32]: number;
  [Type.UInt]: number;
  [Type.UInt8]: number;
  [Type.UInt16]: number;
  [Type.UInt32]: number;
  // Scalar
  [Type.UScalar]: number;
  [Type.Scalar]: number;
  // Boolean
  [Type.Bool]: boolean;
  [Type.Bools]: boolean[];
  [Type.Bools8]: boolean[];
  [Type.Bools16]: boolean[];
  [Type.Bools32]: boolean[];
  // Other
  [Type.String]: string;
  [Type.Date]: Date;
  [Type.RegExp]: RegExp;
  [Type.JSON]: any;
  [Type.Binary]: ArrayBuffer;
};

/** @throws any error too */
export type ValidationFn<T> = (x: T) => undefined | boolean | Error;
export type TransformFn<T> = (x: T) => T;
export type Transforms<T> = TransformFn<T> | [preEncode: TransformFn<T>] | [preEncode: TransformFn<T> | undefined, postDecode: TransformFn<T> | undefined];

/**
 * A wrapper around any Type definition that declares it as optional.
 */
export class OptionalType<T extends FieldDefinition> {
  public constructor(public type: T) {}
}

/**
 * Wrap any definition as optional.
 */
export function optional<T extends FieldDefinition>(t: T): OptionalType<T> {
  return new OptionalType(t);
}

/**
 * A definition for an object binary encoder.
 */
export type EncoderDefinition = {
  [key: string]: FieldDefinition | OptionalType<FieldDefinition>;
};

/**
 * Definition for an object-field binary encoder.
 */
export type FieldDefinition = keyof ValueTypes | [keyof ValueTypes] | EncoderDefinition | [EncoderDefinition] | OptionalType<FieldDefinition>;

/**
 * The resulting type of the decoded data, based on the encoder definition.
 */
export type InferredDecodedType<EncoderType extends EncoderDefinition> = {
  [EKey in keyof EncoderType as EncoderType[EKey] extends OptionalType<any> ? never : EKey]: EncoderType[EKey] extends keyof ValueTypes
      ? ValueTypes[EncoderType[EKey]]
      : EncoderType[EKey] extends [keyof ValueTypes]
        ? Array<ValueTypes[EncoderType[EKey][0]]>
        : EncoderType[EKey] extends EncoderDefinition
          ? InferredDecodedType<EncoderType[EKey]>
          : EncoderType[EKey] extends [EncoderDefinition]
            ? Array<InferredDecodedType<EncoderType[EKey][number]>>
            : never;
} & {
  [EKey in keyof EncoderType as EncoderType[EKey] extends OptionalType<any> ? EKey : never]?: EncoderType[EKey] extends OptionalType<infer OptionalValue extends keyof ValueTypes>
    ? ValueTypes[OptionalValue] | undefined
    : EncoderType[EKey] extends OptionalType<infer OptionalValue extends [keyof ValueTypes]>
      ? Array<ValueTypes[OptionalValue[0]]> | undefined
      : EncoderType[EKey] extends OptionalType<infer OptionalValue extends EncoderDefinition>
        ? InferredDecodedType<OptionalValue> | undefined
        : never;
};

export type InferredTransformConfig<EncoderType extends EncoderDefinition> = {
 [EKey in keyof EncoderType]?: EncoderType[EKey] extends keyof ValueTypes
     ? Transforms<ValueTypes[EncoderType[EKey]]>
     : EncoderType[EKey] extends [keyof ValueTypes]
       ? Transforms<ValueTypes[EncoderType[EKey][0]]>
       : EncoderType[EKey] extends EncoderDefinition
         ? InferredTransformConfig<EncoderType[EKey]>
         : EncoderType[EKey] extends [EncoderDefinition]
           ? InferredTransformConfig<EncoderType[EKey][number]>
           : EncoderType[EKey] extends OptionalType<infer OptionalValue extends keyof ValueTypes>
            ? Transforms<ValueTypes[OptionalValue]>
            : EncoderType[EKey] extends OptionalType<infer OptionalValue extends [keyof ValueTypes]>
              ? Transforms<ValueTypes[OptionalValue[0]]>
              : EncoderType[EKey] extends OptionalType<infer OptionalValue extends EncoderDefinition>
                ? InferredTransformConfig<OptionalValue> | undefined
                : never;
};

export type InferredValidationConfig<EncoderType extends EncoderDefinition> = {
 [EKey in keyof EncoderType]?: EncoderType[EKey] extends keyof ValueTypes
     ? ValidationFn<ValueTypes[EncoderType[EKey]]>
     : EncoderType[EKey] extends [keyof ValueTypes]
       ? ValidationFn<ValueTypes[EncoderType[EKey][0]]>
       : EncoderType[EKey] extends EncoderDefinition
         ? InferredValidationConfig<EncoderType[EKey]>
         : EncoderType[EKey] extends [EncoderDefinition]
           ? InferredValidationConfig<EncoderType[EKey][number]>
           : EncoderType[EKey] extends OptionalType<infer OptionalValue extends keyof ValueTypes>
            ? ValidationFn<ValueTypes[OptionalValue]>
            : EncoderType[EKey] extends OptionalType<infer OptionalValue extends [keyof ValueTypes]>
              ? ValidationFn<ValueTypes[OptionalValue[0]]>
              : EncoderType[EKey] extends OptionalType<infer OptionalValue extends EncoderDefinition>
                ? InferredValidationConfig<OptionalValue> | undefined
                : never;
};


/**
 * Binary coder types.
 */
export const enum Type {
  /**
   * A boolean, encoded as 1 byte.
   *
   * Use `Bools8` to pack multiple booleans into 1 byte.
   *
   * @see {Type.Bools8}
   */
  Bool = 'bool',

  /** A string. */
  String = 'str',

  /** Floating-point number (16-bit, half precision, 2 bytes). */
  Float16 = 'float16',

  /** Floating-point number (32-bit, single precision, 4 bytes). */
  Float32 = 'float32',

  /** Floating-point number (64-bit, double precision, 8 bytes). Default JavaScript `number` type. */
  Float64 = 'float64',

  /**
   * Signed integer.
   *
   * Automatically uses 1, 2, 4, or 8 bytes depending on the value:
   *  - For values -64 -> 64 uses 1 byte.
   *  - For values -8,192 -> 8,192 uses 2 bytes.
   *  - For values -268,435,456 -> 268,435,456 uses 4 bytes.
   *  - For values -Number.MAX_SAFE_INTEGER -> Number.MAX_SAFE_INTEGER uses 8 bytes (if outside of the 4 byte range).
   */
  Int = 'int',

  /** Signed 1 byte integer (between -127 and 127). */
  Int8 = 'int8',

  /** Signed 2 byte integer (between -32,767 and 32,767). */
  Int16 = 'int16',

  /** Signed 4 byte integer (between -2,147,483,647 and 2,147,483,647). */
  Int32 = 'int32',

  /**
   * Unsigned integer.
   *
   * Automatically uses 1, 2, 4, or 8 bytes depending on the value:
   *  - For values 0 -> 127 uses 1 bytes.
   *  - For values 128 -> 16,384 uses 2 bytes.
   *  - For values 16,385 -> 536,870,911 uses 4 bytes.
   *  - For values 536,870,912 -> Number.MAX_SAFE_INTEGER uses 8 bytes.
   */
  UInt = 'uint',

  /** Unsigned 1 byte integer (between 0 and 255). */
  UInt8 = 'uint8',

  /** Unsigned 2 byte integer (between 0 and 65,535). */
  UInt16 = 'uint16',

  /** Unsigned 4 byte integer (between 0 and 4,294,967,295). */
  UInt32 = 'uint32',

  /** An unsigned scalar between 0.0 and 1.0. Stored as 1 byte. */
  UScalar = 'uscalar',

  /** A signed scalar between -1.0 and 1.0. Stored as 1 byte. */
  Scalar = 'scalar',

  //
  // Advanced:
  //

  /**
   * Any JavaScript ArrayBuffer.
   *
   * @see {ArrayBuffer}
   */
  Binary = 'binary',

  /**
   * A JavaScript date object.
   *
   * Encoded as an 8 byte (64-bit) integer UTC timestamp from as the number
   * of milliseconds since the Unix Epoch (January 1, 1970, 00:00:00 UTC).
   *
   * @see {Date}
   */
  Date = 'date',

  /**
   * A JavaScript regular expression.
   *
   * @see {RegExp}
   */
  RegExp = 'regex',

  /** Any JSON-serializable data. Encoded as a UTF-8 string. */
  JSON = 'json',

  /** Array of 1 - 8 booleans, encoded to 1 byte. */
  Bools8 = 'bitmask8',

  /** Array of 1 - 16 booleans, encoded to 2 bytes. */
  Bools16 = 'bitmask16',

  /** Array of 1 - 32 booleans, encoded to 4 bytes. */
  Bools32 = 'bitmask32',

  /** Array of booleans (arbitrarily long), encoded with a 2-bit header. */
  Bools = 'booltuple',

  // ----- Data structures: -----

  /** [INTERNAL ONLY] Use "[T]" array syntax instead. */
  Array = '[array]',

  /** [INTERNAL ONLY] Use "{}" object syntax instead. */
  Object = '{object}',

  // ----- Aliases: -----

  /** Alias for `Type.Float16` @see {Float16} */
  Half = 'float16',

  /** Alias for `Type.Float32` @see {Float32} */
  Single = 'float32',

  /** Alias for `Type.Float32` @see {Float32} */
  Float = 'float32',

  /** Alias for `Type.Float64` @see {Float64} */
  Double = 'float64',

  /** Alias for `Type.Bool` @see {Bool} */
  Boolean = 'bool',

  /** Alias for 'Type.UInt' @see {UInt} */
  Enum = 'uint',

  /** @deprecated Alias for `Type.BoolArray` @see {BoolArray} */
  BooleanTuple = 'booltuple',

  /** @deprecated Alias for `Type.Bools8` @see {Bools8} */
  Bitmask8 = 'bitmask8',

  /** @deprecated Alias for `Type.Bools16` @see {Bools16} */
  Bitmask16 = 'bitmask16',

  /** @deprecated Alias for `Type.Bools32` @see {Bools32} */
  Bitmask32 = 'bitmask32',
}

export const ValidValueTypes: readonly string[] = [
  // Floats
  Type.Float16,
  Type.Float32,
  Type.Float64,
  // Integers
  Type.Int,
  Type.Int8,
  Type.Int16,
  Type.Int32,
  Type.UInt,
  Type.UInt8,
  Type.UInt16,
  Type.UInt32,
  // Scalars
  Type.UScalar,
  Type.Scalar,
  // Boolean
  Type.Bool,
  Type.Bools,
  Type.Bools8,
  Type.Bools16,
  Type.Bools32,
  // Other
  Type.String,
  Type.Date,
  Type.RegExp,
  Type.JSON,
  Type.Binary,
] as const;

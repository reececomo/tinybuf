
/**
 * Binary coder types.
 */
export const enum Type {
  /**
   * Boolean value (1 byte).
   * @see {Bools8} for packing multiple booleans into a single byte.
   */
  Bool = 'bool',

  /** A string (1† byte header + string bytes). */
  String = 'str',

  /** Floating-point number (16-bit, half precision, 2 bytes). */
  Float16 = 'float16',

  /** Floating-point number (32-bit, single precision, 4 bytes). */
  Float32 = 'float32',

  /** Floating-point number (64-bit, double precision, 8 bytes). Default JavaScript `number` type. */
  Float64 = 'float64',

  /**
   * Signed integer (1 - 8 bytes).
   * - 0 → ±64 = 1 byte
   * - … → ±8,192 = 2 bytes
   * - … → ±268,435,456 = 4 bytes
   * - … → ±`Number.MAX_SAFE_INTEGER` = 8 bytes
   */
  Int = 'int',

  /** Signed 1 byte integer (between -127 and 127). */
  Int8 = 'int8',

  /** Signed 2 byte integer (between -32,767 and 32,767). */
  Int16 = 'int16',

  /** Signed 4 byte integer (between -2,147,483,647 and 2,147,483,647). */
  Int32 = 'int32',

  /**
   * Unsigned integer (1 - 8 bytes).
   * - `0` → `127` = 1 byte
   * - `128` → `16,384` = 2 bytes
   * - `16,385` → `536,870,911` = 4 bytes
   * - `536,870,912` → `Number.MAX_SAFE_INTEGER` = 8 bytes
   */
  UInt = 'uint',

  /** Unsigned 8-bit integer (between 0 and 255, 1 byte). */
  UInt8 = 'uint8',

  /** Unsigned 16-bit integer (between 0 and 65,535, 2 bytes). */
  UInt16 = 'uint16',

  /** Unsigned 32-bit integer (between 0 and 4,294,967,295, 4 bytes). */
  UInt32 = 'uint32',

  /** A signed scalar between -1.00 and 1.00 (1 byte). */
  Scalar = 'scalar',

  /** An unsigned scalar between 0.00 and 1.00 (1 byte). */
  UScalar = 'uscalar',

  // ---- Advanced types: -----

  /** A Uint8Array, ArrayBuffer or ArrayBufferLike value (1† byte header + buffer bytes). */
  Buffer = 'buf',

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

  /** Any JSON-serializable data. Encodes as a UTF-8 string. */
  JSON = 'json',

  /** Up to 8 booleans (1 byte). */
  Bools8 = 'bitmask8',

  /** Up to 16 booleans (2 bytes). */
  Bools16 = 'bitmask16',

  /** Up to 32 booleans (4 bytes). */
  Bools32 = 'bitmask32',

  /** Any array of booleans (0¶ byte / 2-bit header). */
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

  /** Alias for `Type.Float64` @see {Float64} */
  Double = 'float64',

  /** Alias for `Type.Float64 @see {Float64} */
  Number = 'float64',

  /** Alias for `Type.Bool` @see {Bool} */
  Boolean = 'bool',

  /** Alias for 'Type.UInt' @see {UInt} */
  Enum = 'uint',
}

/** All value types - excluding array, object and optional */
export const VALID_VALUE_TYPES: readonly string[] = [
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
  Type.Buffer,
] as const;

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
  [Type.Buffer]: Uint8Array | ArrayBuffer | ArrayBufferView;
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

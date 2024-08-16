/**
 * Field types for defining encoding formats.
 *
 * @see [Get started: Types](https://github.com/reececomo/tinybuf/blob/main/docs/get_started.md#types)
 */
export const enum Type {
  /**
   * Unsigned integer (1 - 8 bytes).
   * - 0 → 127 = 1 byte
   * - 128 → 16,384 = 2 bytes
   * - 16,385 → 536,870,911 = 4 bytes
   * - 536,870,912 → `Number.MAX_SAFE_INTEGER` = 8 bytes
   */
  UInt,

  /** Unsigned 8-bit integer (between 0 and 255, 1 byte). */
  UInt8,

  /** Unsigned 16-bit integer (between 0 and 65,535, 2 bytes). */
  UInt16,

  /** Unsigned 32-bit integer (between 0 and 4,294,967,295, 4 bytes). */
  UInt32,

  /**
   * Signed integer (1 - 8 bytes).
   * - 0 → ±64 = 1 byte
   * - ±65 → ±8,192 = 2 bytes
   * - ±8,193 → ±268,435,456 = 4 bytes
   * - ±268,435,457 → ±`Number.MAX_SAFE_INTEGER` = 8 bytes
   */
  Int,

  /** Signed 1 byte integer (between -127 and 127). */
  Int8,

  /** Signed 2 byte integer (between -32,767 and 32,767). */
  Int16,

  /** Signed 4 byte integer (between -2,147,483,647 and 2,147,483,647). */
  Int32,

  /** Default JavaScript `number` type. Floating-point number (64-bit, double precision, 8 bytes). */
  Float64,

  /** Floating-point number (32-bit, single precision, 4 bytes). */
  Float32,

  /**
   * Floating-point number (16-bit, half precision, 2 bytes).
   *
   * **Warning:** Low precision; maximum range: ±65,504.
   */
  Float16,

  /** A cheap, low-resolution signed scalar between -1.00 and 1.00 (1 byte). */
  Scalar8,

  /** A cheap, low-resolution unsigned scalar between 0.00 and 1.00 (1 byte). */
  UScalar8,

  /**
   * Boolean value (1 byte).
   * @see {Bools} for packing multiple booleans into a single byte.
   */
  Bool,

  /** Any array of booleans (1 bit overhead, encoded as UInt). */
  Bools,

  /** Any ArrayBuffer or ArrayBufferView (e.g. Uint8Array) value (encoded as 1 x UInt for byte length + buffer bytes). */
  Buffer,

  /** A UTF-8 string (encoded as 1 x UInt for UTF-8 byte length + UTF-8 bytes). */
  String,

  /** Any JSON-serializable data. Encodes as a UTF-8 string. */
  JSON,

  /** JavaScript regular expression. */
  RegExp,

  /**
   * JavaScript date object.
   *
   * Encoded as an 8 byte (64-bit) integer UTC timestamp from as the number
   * of milliseconds since the Unix Epoch (January 1, 1970, 00:00:00 UTC).
   *
   * @see {Date}
   */
  Date,
}

/**
 * Mappings for the value types.
 */
export type ValueTypes = {
  [Type.Int]: number;
  [Type.Int8]: number;
  [Type.Int16]: number;
  [Type.Int32]: number;
  [Type.UInt]: number;
  [Type.UInt8]: number;
  [Type.UInt16]: number;
  [Type.UInt32]: number;
  [Type.Float64]: number;
  [Type.Float32]: number;
  [Type.Float16]: number;
  [Type.Scalar8]: number;
  [Type.UScalar8]: number;
  [Type.Bool]: boolean;
  [Type.Bools]: boolean[];
  [Type.Buffer]: Uint8Array | ArrayBuffer | ArrayBufferView;
  [Type.String]: string;
  [Type.JSON]: any;
  [Type.RegExp]: RegExp;
  [Type.Date]: Date;
};

/** @throws any error too */
export type ValidationFn<T> = (x: T) => undefined | boolean | Error;
export type TransformFn<T> = (x: T) => T;
export type Transforms<T> = TransformFn<T> | [preEncode: TransformFn<T>] | [preEncode: TransformFn<T> | undefined, postDecode: TransformFn<T> | undefined];

/**
 * A wrapper around any Type definition that declares it as optional.
 */
export class MaybeType<T extends FieldDefinition> {
  public constructor(public type: T) {}
}

/**
 * Wrap any definition as optional.
 */
export function optional<T extends FieldDefinition>(t: T): MaybeType<T> {
  return new MaybeType(t);
}

/**
 * A definition for an object binary encoder.
 */
export type EncoderDefinition = {
  [key: string]: FieldDefinition | MaybeType<FieldDefinition>;
};

/**
 * Definition for an object-field binary encoder.
 */
export type FieldDefinition = keyof ValueTypes | [keyof ValueTypes] | EncoderDefinition | [EncoderDefinition] | MaybeType<FieldDefinition>;

/**
 * The resulting type of the decoded data, based on the encoder definition.
 */
export type InferredDecodedType<EncoderType extends EncoderDefinition> = {
  [EKey in keyof EncoderType as EncoderType[EKey] extends MaybeType<any> ? never : EKey]: EncoderType[EKey] extends keyof ValueTypes
      ? ValueTypes[EncoderType[EKey]]
      : EncoderType[EKey] extends [keyof ValueTypes]
        ? Array<ValueTypes[EncoderType[EKey][0]]>
        : EncoderType[EKey] extends EncoderDefinition
          ? InferredDecodedType<EncoderType[EKey]>
          : EncoderType[EKey] extends [EncoderDefinition]
            ? Array<InferredDecodedType<EncoderType[EKey][number]>>
            : never;
} & {
  [EKey in keyof EncoderType as EncoderType[EKey] extends MaybeType<any> ? EKey : never]?: EncoderType[EKey] extends MaybeType<infer OptionalValue extends keyof ValueTypes>
    ? ValueTypes[OptionalValue] | undefined
    : EncoderType[EKey] extends MaybeType<infer OptionalValue extends [keyof ValueTypes]>
      ? Array<ValueTypes[OptionalValue[0]]> | undefined
      : EncoderType[EKey] extends MaybeType<infer OptionalValue extends EncoderDefinition>
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
           : EncoderType[EKey] extends MaybeType<infer OptionalValue extends keyof ValueTypes>
            ? Transforms<ValueTypes[OptionalValue]>
            : EncoderType[EKey] extends MaybeType<infer OptionalValue extends [keyof ValueTypes]>
              ? Transforms<ValueTypes[OptionalValue[0]]>
              : EncoderType[EKey] extends MaybeType<infer OptionalValue extends EncoderDefinition>
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
           : EncoderType[EKey] extends MaybeType<infer OptionalValue extends keyof ValueTypes>
            ? ValidationFn<ValueTypes[OptionalValue]>
            : EncoderType[EKey] extends MaybeType<infer OptionalValue extends [keyof ValueTypes]>
              ? ValidationFn<ValueTypes[OptionalValue[0]]>
              : EncoderType[EKey] extends MaybeType<infer OptionalValue extends EncoderDefinition>
                ? InferredValidationConfig<OptionalValue> | undefined
                : never;
};

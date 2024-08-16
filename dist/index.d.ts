/**
 * Read the header bytes of a buffer as a number.
 *
 * @throws {RangeError} if buffer size < 2
 */
export declare function peekHeader(b: ArrayBuffer | ArrayBufferView): number;
/**
 * Read the header bytes of a buffer as a string.
 *
 * @throws {RangeError} if buffer length < 2
 */
export declare function peekHeaderStr(b: ArrayBuffer | ArrayBufferView): string;
/**
 * Field types for defining encoding formats.
 *
 * @see [Get started: Types](https://github.com/reececomo/tinybuf/blob/main/docs/get_started.md#types)
 */
export declare enum Type {
	/**
	 * Unsigned integer (1 - 8 bytes).
	 * - 0 → 127 = 1 byte
	 * - 128 → 16,384 = 2 bytes
	 * - 16,385 → 536,870,911 = 4 bytes
	 * - 536,870,912 → `Number.MAX_SAFE_INTEGER` = 8 bytes
	 */
	UInt = "u",
	/** Unsigned 8-bit integer (between 0 and 255, 1 byte). */
	UInt8 = "u8",
	/** Unsigned 16-bit integer (between 0 and 65,535, 2 bytes). */
	UInt16 = "u16",
	/** Unsigned 32-bit integer (between 0 and 4,294,967,295, 4 bytes). */
	UInt32 = "u32",
	/**
	 * Signed integer (1 - 8 bytes).
	 * - 0 → ±64 = 1 byte
	 * - ±65 → ±8,192 = 2 bytes
	 * - ±8,193 → ±268,435,456 = 4 bytes
	 * - ±268,435,457 → ±`Number.MAX_SAFE_INTEGER` = 8 bytes
	 */
	Int = "i",
	/** Signed 1 byte integer (between -127 and 127). */
	Int8 = "i8",
	/** Signed 2 byte integer (between -32,767 and 32,767). */
	Int16 = "i16",
	/** Signed 4 byte integer (between -2,147,483,647 and 2,147,483,647). */
	Int32 = "i32",
	/** Default JavaScript `number` type. Floating-point number (64-bit, double precision, 8 bytes). */
	Float64 = "f64",
	/** Floating-point number (32-bit, single precision, 4 bytes). */
	Float32 = "f32",
	/**
	 * Floating-point number (16-bit, half precision, 2 bytes).
	 *
	 * **Warning:** Low precision; maximum range: ±65,504.
	 */
	Float16 = "f16",
	/** A cheap, low-resolution signed scalar between -1.00 and 1.00 (1 byte). */
	Scalar8 = "s8",
	/** A cheap, low-resolution unsigned scalar between 0.00 and 1.00 (1 byte). */
	UScalar8 = "us8",
	/**
	 * Boolean value (1 byte).
	 * @see {Bools} for packing multiple booleans into a single byte.
	 */
	Bool = "bl",
	/** Any array of booleans (1 bit overhead, encoded as UInt). */
	Bools = "bls",
	/** Any ArrayBuffer or ArrayBufferView (e.g. Uint8Array) value (encoded as 1 x UInt for byte length + buffer bytes). */
	Buffer = "buf",
	/** A UTF-8 string (encoded as 1 x UInt for UTF-8 byte length + UTF-8 bytes). */
	String = "str",
	/** Any JSON-serializable data. Encodes as a UTF-8 string. */
	JSON = "jsn",
	/** JavaScript regular expression. */
	RegExp = "reg",
	/**
	 * JavaScript date object.
	 *
	 * Encoded as an 8 byte (64-bit) integer UTC timestamp from as the number
	 * of milliseconds since the Unix Epoch (January 1, 1970, 00:00:00 UTC).
	 *
	 * @see {Date}
	 */
	Date = "dt"
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
export type Transforms<T> = TransformFn<T> | [
	preEncode: TransformFn<T>
] | [
	preEncode: TransformFn<T> | undefined,
	postDecode: TransformFn<T> | undefined
];
/**
 * A wrapper around any Type definition that declares it as optional.
 */
export declare class MaybeType<T extends FieldDefinition> {
	type: T;
	constructor(type: T);
}
/**
 * Wrap any definition as optional.
 */
export declare function optional<T extends FieldDefinition>(t: T): MaybeType<T>;
/**
 * A definition for an object binary encoder.
 */
export type EncoderDefinition = {
	[key: string]: FieldDefinition | MaybeType<FieldDefinition>;
};
/**
 * Definition for an object-field binary encoder.
 */
export type FieldDefinition = keyof ValueTypes | [
	keyof ValueTypes
] | EncoderDefinition | [
	EncoderDefinition
] | MaybeType<FieldDefinition>;
/**
 * The resulting type of the decoded data, based on the encoder definition.
 */
export type InferredDecodedType<EncoderType extends EncoderDefinition> = {
	[EKey in keyof EncoderType as EncoderType[EKey] extends MaybeType<any> ? never : EKey]: EncoderType[EKey] extends keyof ValueTypes ? ValueTypes[EncoderType[EKey]] : EncoderType[EKey] extends [
		keyof ValueTypes
	] ? Array<ValueTypes[EncoderType[EKey][0]]> : EncoderType[EKey] extends EncoderDefinition ? InferredDecodedType<EncoderType[EKey]> : EncoderType[EKey] extends [
		EncoderDefinition
	] ? Array<InferredDecodedType<EncoderType[EKey][number]>> : never;
} & {
	[EKey in keyof EncoderType as EncoderType[EKey] extends MaybeType<any> ? EKey : never]?: EncoderType[EKey] extends MaybeType<infer OptionalValue extends keyof ValueTypes> ? ValueTypes[OptionalValue] | undefined : EncoderType[EKey] extends MaybeType<infer OptionalValue extends [
		keyof ValueTypes
	]> ? Array<ValueTypes[OptionalValue[0]]> | undefined : EncoderType[EKey] extends MaybeType<infer OptionalValue extends EncoderDefinition> ? InferredDecodedType<OptionalValue> | undefined : never;
};
export type InferredTransformConfig<EncoderType extends EncoderDefinition> = {
	[EKey in keyof EncoderType]?: EncoderType[EKey] extends keyof ValueTypes ? Transforms<ValueTypes[EncoderType[EKey]]> : EncoderType[EKey] extends [
		keyof ValueTypes
	] ? Transforms<ValueTypes[EncoderType[EKey][0]]> : EncoderType[EKey] extends EncoderDefinition ? InferredTransformConfig<EncoderType[EKey]> : EncoderType[EKey] extends [
		EncoderDefinition
	] ? InferredTransformConfig<EncoderType[EKey][number]> : EncoderType[EKey] extends MaybeType<infer OptionalValue extends keyof ValueTypes> ? Transforms<ValueTypes[OptionalValue]> : EncoderType[EKey] extends MaybeType<infer OptionalValue extends [
		keyof ValueTypes
	]> ? Transforms<ValueTypes[OptionalValue[0]]> : EncoderType[EKey] extends MaybeType<infer OptionalValue extends EncoderDefinition> ? InferredTransformConfig<OptionalValue> | undefined : never;
};
export type InferredValidationConfig<EncoderType extends EncoderDefinition> = {
	[EKey in keyof EncoderType]?: EncoderType[EKey] extends keyof ValueTypes ? ValidationFn<ValueTypes[EncoderType[EKey]]> : EncoderType[EKey] extends [
		keyof ValueTypes
	] ? ValidationFn<ValueTypes[EncoderType[EKey][0]]> : EncoderType[EKey] extends EncoderDefinition ? InferredValidationConfig<EncoderType[EKey]> : EncoderType[EKey] extends [
		EncoderDefinition
	] ? InferredValidationConfig<EncoderType[EKey][number]> : EncoderType[EKey] extends MaybeType<infer OptionalValue extends keyof ValueTypes> ? ValidationFn<ValueTypes[OptionalValue]> : EncoderType[EKey] extends MaybeType<infer OptionalValue extends [
		keyof ValueTypes
	]> ? ValidationFn<ValueTypes[OptionalValue[0]]> : EncoderType[EKey] extends MaybeType<infer OptionalValue extends EncoderDefinition> ? InferredValidationConfig<OptionalValue> | undefined : never;
};
export type FormatHeader = string | number;
/**
 * Decoded object types for a given binary format.
 * @example let onData = (data: Decoded<typeof MyBufferFormat>) => {...};
 */
export type Decoded<FromBufferFormat> = FromBufferFormat extends BufferFormat<infer EncoderType, any> ? InferredDecodedType<EncoderType> : never;
/**
 * Defines a format for encoding/decoding binary buffers.
 *
 * Optionally customize the identifier, either as a 2-byte string, an unsigned integer (0 -> 65,535), or as `null` to disable entirely.
 *
 * @example
 * const MyFormat = defineFormat({ ... });
 * const MyFormat = defineFormat('ab', { ... });
 * const MyFormat = defineFormat(1234, { ... });
 * const MyFormat = defineFormat(null, { ... });
 */
export declare function defineFormat<T extends EncoderDefinition, HeaderType extends string | number = number>(def: T): BufferFormat<T, HeaderType>;
/**
 * Defines a format for encoding/decoding binary buffers.
 *
 * Optionally customize the identifier, either as a 2-byte string, an unsigned integer (0 -> 65,535), or as `null` to disable entirely.
 *
 * @example
 * const MyFormat = defineFormat({ ... });
 * const MyFormat = defineFormat('ab', { ... });
 * const MyFormat = defineFormat(1234, { ... });
 * const MyFormat = defineFormat(null, { ... });
 */
export declare function defineFormat<T extends EncoderDefinition, HeaderType extends string | number = number>(h: HeaderType | null, def: T): BufferFormat<T, HeaderType>;
/**
 * BufferFormat is a utility class for encoding and decoding binary data based
 * on a provided encoding format.
 *
 * @see {header}
 * @see {encode(data)}
 * @see {decode(binary)}
 */
export declare class BufferFormat<EncoderType extends EncoderDefinition, HeaderType extends FormatHeader = number> {
	/**
	 * A unique identifier encoded as the first 2 bytes (or `undefined` if headerless).
	 *
	 * @see {peekHeader(...)}
	 * @see {peekHeaderStr(...)}
	 */
	header: HeaderType;
	get encodingBuffer(): DataView | undefined;
	constructor(def: EncoderType, header?: HeaderType | null);
	/**
	 * Read the header of a buffer as a number.
	 *
	 * @see {header}
	 * @throws {RangeError} if buffer size < 2
	 */
	static peekHeader: typeof peekHeader;
	/**
	 * Read the header of a buffer as a string.
	 *
	 * @see {header}
	 * @throws {RangeError} if buffer size < 2
	 */
	static peekHeaderStr: typeof peekHeaderStr;
	/**
	 * Encode an object to bytes.
	 *
	 * **Warning:** Returns an unsafe view into the encoding buffer. Pass this reference to preserve
	 * performance, and to minimize memory allocation and fragmentation.
	 *
	 * @param data - data to encode
	 * @param preserveBytes - (default: `setTinybufConfig().safe`) When set to true, copies encoded
	 * bytes to a new buffer. When set to false, returns an unsafe view of bytes but prevents
	 * unnnecessary memory allocation and fragmentation.
	 *
	 * @returns a copy of encoded bytes
	 * @throws if fails to encode value to schema
	 */
	encode<DecodedType extends InferredDecodedType<EncoderType>>(data: DecodedType, preserveBytes?: boolean): Uint8Array;
	/**
	 * Decode binary data to an object.
	 * @throws if fails to decode bytes to schema.
	 */
	decode<DecodedType = InferredDecodedType<EncoderType>>(b: Uint8Array | ArrayBufferView | ArrayBuffer): DecodedType;
	/**
	 * Set additional transform functions to apply before encoding and after decoding.
	 */
	setTransforms(transforms: InferredTransformConfig<EncoderType> | Transforms<any>): this;
	/**
	 * Set additional validation rules which are applied on encode() and decode().
	 *
	 * - Validation functions should throw an error, return an error, or return boolean false.
	 * - Anything else is treated as successfully passing validation.
	 */
	setValidation(validations: InferredValidationConfig<EncoderType> | ValidationFn<any>): this;
	private _$processValidation;
}
export type AnyFormat = BufferFormat<any, any>;
/**
 * Small utility for registering and processing format handlers.
 *
 * @example
 * const myHandler = bufferParser()
 *   .on(FormatA, aData => {})
 *   .on(FormatB, bData => {});
 *
 * myHandler.processBuffer(bytes);
 */
export declare const bufferParser: () => BufferParser;
export declare class BufferParser {
	/**
	 * Decode an array buffer and trigger the relevant data handler.
	 *
	 * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
	 *
	 * @throws {TinybufError} if fails to decode, or no handler is registered
	 */
	processBuffer(b: ArrayBuffer | ArrayBufferView): void;
	/**
	 * Register a format handler.
	 */
	on<EncoderType extends EncoderDefinition, DecodedType = InferredDecodedType<EncoderType>>(format: BufferFormat<EncoderType, string | number>, callback: (data: DecodedType) => any, overwritePrevious?: boolean): this;
	/** Register a format (or formats) that are recognized. */
	ignore(...format: AnyFormat[]): this;
	/** Clears all registered formats and handlers. */
	clear(): void;
}
/**
 * Returns the nearest half precision float representation of a number.
 * @param x A numeric expression.
 */
export declare function f16round(x: number): number;
/**
 * Quantize a number to an 8-bit scalar between 0.0 and 1.0.
 *
 * @returns A number (double) in its closest signed scalar representation.
 */
export declare function uscalround(x: number): number;
/**
 * Quantize a number to an 8-bit signed scalar between -1.0 and 1.0.
 *
 * @returns A number (double) in its closest signed scalar representation.
 */
export declare function scalround(x: number): number;
/**
 * Mask booleans to a uint32.
 *
 * @param x - A boolean array.
 * @param padBit - A bit to pad the mask (for variable length data).
 */
export declare const mask: (x: boolean[], padBit?: 0 | 1) => number;
/**
 * Unmask booleans from a uint32.
 *
 * @param x - A uint32 number.
 * @param len - number of booleans to expect (default: infer lenth from x where x is encoded with a pad bit)
 */
export declare const unmask: (x: number, len?: number) => boolean[];
export declare class TinybufError extends Error {
}
/** Set Tinybuf global config */
export declare const setTinybufConfig: (c: Partial<TinybufConfig>) => void;
export type TinybufConfig = {
	/**
	 * (default: false)
	 *
	 * This sets the default value for `preserveBytes` on
	 * `encode(data, preserveBytes?)`.
	 *
	 * By default, `encode()` returns its encoded bytes as a `Uint8Array`
	 * view of the bytes in the shared encoding buffer.
	 *
	 * This is suitable for synchronous use (e.g. high-performance applications)
	 * as it avoids slow and expensive memory allocation and fragmentation on
	 * each call to `encode()`.
	 *
	 * However, susbsequent calls are destructive to the underlying bytes, so
	 * for asynchronous uses (e.g. Promises, Workers, long-lived storage), set
	 * `preserveBytes` to `true`.
	 */
	safe: boolean;
	/**
	 * (default: true)
	 * By default, format encoders share a global encoding buffer for performance
	 * and memory management reasons.
	 *
	 * When set to false, each format is allocated an individual encoding buffer.
	 *
	 * Enable to maximise performance and memory re-use, just be cautious of
	 * possible race conditions.
	 */
	useGlobalEncodingBuffer: boolean;
	/**
	 * (default: 1500)
	 * The maximum bytes that can be allocated to an encoding buffer.
	 *
	 * Default is 1500 bytes, the standard "Maximum Transmission Unit".
	 */
	encodingBufferMaxSize: number;
	/**
	 * (default: 256)
	 * Initial bytes to allocate for an encoding buffer.
	 */
	encodingBufferInitialSize: number;
	/**
	 * (default: 256)
	 * Additional bytes to allocated when dynamically increasing the size of an encoding buffer.
	 */
	encodingBufferIncrement: number;
};

export {};

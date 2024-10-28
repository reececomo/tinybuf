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
 * @see [Types](https://github.com/reececomo/tinybuf/blob/main/docs/types.md)
 */
export declare const Type: {
	/**
	 * Unsigned integer (1 - 8 bytes).
	 * - 0 → 127 = 1 byte
	 * - 128 → 16,384 = 2 bytes
	 * - 16,385 → 536,870,911 = 4 bytes
	 * - 536,870,912 → `Number.MAX_SAFE_INTEGER` = 8 bytes
	 */
	readonly UInt: "uint";
	/** Unsigned 8-bit integer (between 0 and 255, 1 byte). */
	readonly UInt8: "u8";
	/** Unsigned 16-bit integer (between 0 and 65,535, 2 bytes). */
	readonly UInt16: "u16";
	/** Unsigned 32-bit integer (between 0 and 4,294,967,295, 4 bytes). */
	readonly UInt32: "u32";
	/**
	 * Signed integer (1 - 8 bytes).
	 * - 0 → ±64 = 1 byte
	 * - ±65 → ±8,192 = 2 bytes
	 * - ±8,193 → ±268,435,456 = 4 bytes
	 * - ±268,435,457 → ±`Number.MAX_SAFE_INTEGER` = 8 bytes
	 */
	readonly Int: "int";
	/** Signed 1 byte integer (between -127 and 127). */
	readonly Int8: "i8";
	/** Signed 2 byte integer (between -32,767 and 32,767). */
	readonly Int16: "i16";
	/** Signed 4 byte integer (between -2,147,483,647 and 2,147,483,647). */
	readonly Int32: "i32";
	/** Default JavaScript `number` type. Floating-point number (64-bit, double precision, 8 bytes). */
	readonly Float64: "f64";
	/** Floating-point number (32-bit, single precision, 4 bytes). */
	readonly Float32: "f32";
	/**
	 * Floating-point number (16-bit in FP16 format, half precision, 2 bytes).
	 *
	 * **Warning:** Low precision; maximum range: ±65,504.
	 */
	readonly Float16: "f16";
	/**
	 * Floating-point number (16-bit in BF16 format, half precision, 2 bytes).
	 *
	 * **Warning:** Low precision.
	 */
	readonly BFloat16: "b16";
	/** A signed 2-decimal scalar between -1.00 and 1.00 (1 byte). */
	readonly Scalar8: "sc";
	/** An unsigned 2-decimal scalar between 0.00 and 1.00 (1 byte). */
	readonly UScalar8: "usc";
	/**
	 * Boolean value (1 byte).
	 * @see {Bools} for packing multiple booleans into a single byte.
	 */
	readonly Bool: "bl";
	/** Any array of booleans (1 bit overhead, encoded as UInt). */
	readonly Bools: "bls";
	/** Any ArrayBuffer or ArrayBufferView (e.g. Uint8Array) value (encoded as 1 x UInt for byte length + buffer bytes). */
	readonly Buffer: "buf";
	/** A UTF-8 string (encoded as 1 x UInt for UTF-8 byte length + UTF-8 bytes). */
	readonly String: "str";
	/** Any JSON data (encodes as UTF-8). */
	readonly JSON: "jsn";
	/** JavaScript RegExp object. */
	readonly RegExp: "re";
	/**
	 * JavaScript Date object.
	 *
	 * Encoded as an 8 byte (64-bit) integer UTC timestamp from as the number
	 * of milliseconds since the Unix Epoch (January 1, 1970, 00:00:00 UTC).
	 *
	 * @see {Date}
	 */
	readonly Date: "dt";
};
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
	[Type.BFloat16]: number;
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
/** https://www.totaltypescript.com/concepts/the-prettify-helper */
export type Pretty<T> = T extends ArrayBuffer | ArrayBufferView | Date | RegExp | Uint8Array ? T : T extends Array<infer U> ? Array<Pretty<U>> : T extends object ? {
	[K in keyof T]: Pretty<T[K]>;
} & unknown : T;
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
export type RawDecodedType<EncoderType extends EncoderDefinition> = {
	[EKey in keyof EncoderType as EncoderType[EKey] extends MaybeType<any> ? never : EKey]: EncoderType[EKey] extends keyof ValueTypes ? ValueTypes[EncoderType[EKey]] : EncoderType[EKey] extends [
		keyof ValueTypes
	] ? Array<ValueTypes[EncoderType[EKey][0]]> : EncoderType[EKey] extends EncoderDefinition ? RawDecodedType<EncoderType[EKey]> : EncoderType[EKey] extends [
		EncoderDefinition
	] ? Array<RawDecodedType<EncoderType[EKey][number]>> : never;
} & {
	[EKey in keyof EncoderType as EncoderType[EKey] extends MaybeType<any> ? EKey : never]?: EncoderType[EKey] extends MaybeType<infer OptionalValue extends keyof ValueTypes> ? ValueTypes[OptionalValue] | undefined : EncoderType[EKey] extends MaybeType<infer OptionalValue extends [
		keyof ValueTypes
	]> ? Array<ValueTypes[OptionalValue[0]]> | undefined : EncoderType[EKey] extends MaybeType<infer OptionalValue extends EncoderDefinition> ? RawDecodedType<OptionalValue> | undefined : never;
};
export type DecodedType<EncoderType extends EncoderDefinition> = Pretty<RawDecodedType<EncoderType>>;
export type TransformConfig<EncoderType extends EncoderDefinition> = {
	[EKey in keyof EncoderType]?: EncoderType[EKey] extends keyof ValueTypes ? Transforms<ValueTypes[EncoderType[EKey]]> : EncoderType[EKey] extends [
		keyof ValueTypes
	] ? Transforms<ValueTypes[EncoderType[EKey][0]]> : EncoderType[EKey] extends EncoderDefinition ? TransformConfig<EncoderType[EKey]> : EncoderType[EKey] extends [
		EncoderDefinition
	] ? TransformConfig<EncoderType[EKey][number]> : EncoderType[EKey] extends MaybeType<infer OptionalValue extends keyof ValueTypes> ? Transforms<ValueTypes[OptionalValue]> : EncoderType[EKey] extends MaybeType<infer OptionalValue extends [
		keyof ValueTypes
	]> ? Transforms<ValueTypes[OptionalValue[0]]> : EncoderType[EKey] extends MaybeType<infer OptionalValue extends EncoderDefinition> ? TransformConfig<OptionalValue> | undefined : never;
};
export type ValidationConfig<EncoderType extends EncoderDefinition> = {
	[EKey in keyof EncoderType]?: EncoderType[EKey] extends keyof ValueTypes ? ValidationFn<ValueTypes[EncoderType[EKey]]> : EncoderType[EKey] extends [
		keyof ValueTypes
	] ? ValidationFn<ValueTypes[EncoderType[EKey][0]]> : EncoderType[EKey] extends EncoderDefinition ? ValidationConfig<EncoderType[EKey]> : EncoderType[EKey] extends [
		EncoderDefinition
	] ? ValidationConfig<EncoderType[EKey][number]> : EncoderType[EKey] extends MaybeType<infer OptionalValue extends keyof ValueTypes> ? ValidationFn<ValueTypes[OptionalValue]> : EncoderType[EKey] extends MaybeType<infer OptionalValue extends [
		keyof ValueTypes
	]> ? ValidationFn<ValueTypes[OptionalValue[0]]> : EncoderType[EKey] extends MaybeType<infer OptionalValue extends EncoderDefinition> ? ValidationConfig<OptionalValue> | undefined : never;
};
export type FormatHeader = string | number;
/**
 * Utility to get the decoded type of a buffer format
 * @example type Format = Decoded<typeof MyBufferFormat>
 */
export type Decoded<TBufferFormat> = TBufferFormat extends BufferFormat<infer Format, any> ? DecodedType<Format> : never;
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
export declare function defineFormat<T extends EncoderDefinition, HeaderType extends FormatHeader = number>(def: T): BufferFormat<T, HeaderType>;
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
export declare function defineFormat<T extends EncoderDefinition, HeaderType extends FormatHeader = number>(h: HeaderType | null, def: T): BufferFormat<T, HeaderType>;
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
	 * Encode an object into an existing byte array.
	 *
	 * **Warning:** Returns an unsafe view into the encoding buffer. Pass this reference to preserve
	 * performance, and to minimize memory allocation and fragmentation.
	 */
	encodeInto<TDecodedType extends DecodedType<EncoderType>>(data: TDecodedType, bytes: Uint8Array): Uint8Array;
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
	encode<TDecodedType extends DecodedType<EncoderType>>(data: TDecodedType, preserveBytes?: boolean): Uint8Array;
	/**
	 * Decode binary data into an existing object instance.
	 * @throws if fails to decode bytes to schema.
	 */
	decodeInto<TDecodedType = DecodedType<EncoderType>>(bytes: Uint8Array | ArrayBufferView | ArrayBuffer, obj: Partial<TDecodedType>): TDecodedType;
	/**
	 * Decode binary data to an object.
	 * @throws if fails to decode bytes to schema.
	 */
	decode<TDecodedType = DecodedType<EncoderType>>(bytes: Uint8Array | ArrayBufferView | ArrayBuffer): TDecodedType;
	/**
	 * @deprecated use decodeInto() instead
	 */
	decode<TDecodedType = DecodedType<EncoderType>>(bytes: Uint8Array | ArrayBufferView | ArrayBuffer, decodeInto: Partial<TDecodedType>): TDecodedType;
	/**
	 * Set additional transform functions to apply before encoding and after decoding.
	 */
	setTransforms(transforms: TransformConfig<EncoderType> | Transforms<any>): this;
	/**
	 * Set additional validation rules which are applied on encode() and decode().
	 *
	 * - Validation functions should throw an error, return an error, or return boolean false.
	 * - Anything else is treated as successfully passing validation.
	 */
	setValidation(validations: ValidationConfig<EncoderType> | ValidationFn<any>): this;
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
	private _$data;
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
	on<EncoderType extends EncoderDefinition, TDecodedType = DecodedType<EncoderType>>(format: BufferFormat<EncoderType, string | number>, callback: (data: TDecodedType) => any, { decodeInPlace, }?: {
		decodeInPlace?: boolean;
	}): this;
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
 * Returns the nearest bfloat16 representation of a number.
 * @param x A numeric expression.
 */
export declare function bf16round(x: number): number;
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
 * @param l - number of booleans to expect (default: infer lenth from x where x is encoded with a pad bit)
 * or pass an existing boolean array to decode in-place.
 */
export declare const unmask: (x: number, l?: number | boolean[]) => boolean[];
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

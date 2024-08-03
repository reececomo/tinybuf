declare class Field {
	readonly name: string;
	readonly coder: BufferFormat<any>;
	readonly isOptional: boolean;
	readonly isArray: boolean;
	protected _format?: string;
	constructor(name: string, rawType: FieldDefinition);
	/**
	 * @returns A string identifying the encoding format.
	 * @example "{str,uint16,bool}[]?"
	 */
	get format(): string;
}
declare class OptionalType<T extends FieldDefinition> {
	type: T;
	constructor(type: T);
}
export declare class BufferDecodingError extends TinyBufError {
	readonly underlying: Error;
	constructor(summary: string, underlying: Error);
}
export declare class BufferEncodingError extends TinyBufError {
}
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
	 * @see {hashCode}
	 */
	readonly header?: HeaderType;
	protected readonly type: Type;
	protected readonly fields: Field[];
	protected _hash?: number;
	protected _format?: string;
	protected _transforms?: Transforms<any> | undefined;
	protected _validationFn?: ValidationFn<any> | undefined;
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
	/** A uint16 number representing the shape of the encoded format */
	get hashCode(): number;
	/**
	 * @returns A string describing the encoding format.
	 * @example "{uint8,str[]?}"
	 */
	protected get format(): string;
	/**
	 * Encode an object to bytes.
	 * @param data - data to encode
	 * @param resize - copy the bytes to a resized buffer instead of returning a view (default: false)
	 * @throws if fails to encode value to schema.
	 */
	encode<DecodedType extends InferredDecodedType<EncoderType>>(data: DecodedType, resize?: boolean): Uint8Array;
	/**
	 * Decode binary data to an object.
	 *
	 * @throws if fails (e.g. binary data is incompatible with schema).
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
	private _preEncode;
	private _postDecode;
	/**
	 * This function will be executed only the first time
	 * After that, we'll compile the read routine and add it directly to the instance
	 * @param state
	 * @returns
	 * @throws if fails
	 */
	private read;
	/**
	 * Generate read function code for this coder.
	 *
	 * @example
	 * // new Type({a:'int', 'b?':['string']}) would emit:
	 *
	 * `return {
	 *   a: this._readField(0, state),
	 *   b: this._readField(1, state),
	 * }`
	 */
	private generateObjectReadCode;
	/** Read an individual field. */
	private _readField;
	private readValueType;
	/** Compile the decode() method for this object. */
	private compileRead;
	/**
	 * @param value
	 * @param data
	 * @param path
	 * @param type
	 * @throws if the value is invalid
	 */
	private _writeArray;
	/**
	 * @throws if invalid data
	 */
	private _readArray;
	private _readOptional;
}
export declare class BufferParserInstance {
	private formats;
	/** All available formats */
	get availableFormats(): Set<AnyFormat>;
	/**
	 * Decode an array buffer and trigger the relevant data handler.
	 *
	 * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
	 *
	 * @throws {BufferDecodingError} if the buffer failed to decode to the registered format, or header was bad
	 * @throws {UnrecognizedFormatError} if no format is registered that can handle this data
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
export declare class FormatHeaderCollisionError extends TinyBufError {
}
export declare class TinyBufError extends Error {
}
export declare class UnrecognizedFormatError extends TinyBufError {
}
export declare class WriteTypeError extends TinyBufError {
	constructor(expectedType: string, value: any, path?: string);
}
export declare const SETTINGS: {
	/** Use a single shared buffer for encoding (dangerous if you maintain long-lived references to encoded data) */
	useSharedWriteBuffer: boolean;
	/** How many bytes to allocate to a new write buffer */
	writeBufferDefaultSize: number;
	/** When automatically increasing buffer length, this is the amount of bytes to allocate */
	writeBufferIncrement: number;
	/** When automatically increasing buffer length, this is the amount of bytes to allocate */
	writeBufferMaxSize: number;
};
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
export declare const bufferParser: () => BufferParserInstance;
/**
 * Binary coder types.
 */
export declare const enum Type {
	/**
	 * Boolean value (1 byte).
	 * @see {Bools8} for packing multiple booleans into a single byte.
	 */
	Bool = "bool",
	/** A string (1† byte header + string bytes). */
	String = "str",
	/** Floating-point number (16-bit, half precision, 2 bytes). */
	Float16 = "float16",
	/** Floating-point number (32-bit, single precision, 4 bytes). */
	Float32 = "float32",
	/** Floating-point number (64-bit, double precision, 8 bytes). Default JavaScript `number` type. */
	Float64 = "float64",
	/**
	 * Signed integer (1 - 8 bytes).
	 * - 0 → ±64 = 1 byte
	 * - … → ±8,192 = 2 bytes
	 * - … → ±268,435,456 = 4 bytes
	 * - … → ±`Number.MAX_SAFE_INTEGER` = 8 bytes
	 */
	Int = "int",
	/** Signed 1 byte integer (between -127 and 127). */
	Int8 = "int8",
	/** Signed 2 byte integer (between -32,767 and 32,767). */
	Int16 = "int16",
	/** Signed 4 byte integer (between -2,147,483,647 and 2,147,483,647). */
	Int32 = "int32",
	/**
	 * Unsigned integer (1 - 8 bytes).
	 * - `0` → `127` = 1 byte
	 * - `128` → `16,384` = 2 bytes
	 * - `16,385` → `536,870,911` = 4 bytes
	 * - `536,870,912` → `Number.MAX_SAFE_INTEGER` = 8 bytes
	 */
	UInt = "uint",
	/** Unsigned 8-bit integer (between 0 and 255, 1 byte). */
	UInt8 = "uint8",
	/** Unsigned 16-bit integer (between 0 and 65,535, 2 bytes). */
	UInt16 = "uint16",
	/** Unsigned 32-bit integer (between 0 and 4,294,967,295, 4 bytes). */
	UInt32 = "uint32",
	/** A signed scalar between -1.00 and 1.00 (1 byte). */
	Scalar = "scalar",
	/** An unsigned scalar between 0.00 and 1.00 (1 byte). */
	UScalar = "uscalar",
	/** A Uint8Array, ArrayBuffer or ArrayBufferLike value (1† byte header + buffer bytes). */
	Buffer = "buf",
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
	 *
	 * @see {RegExp}
	 */
	RegExp = "regex",
	/** Any JSON-serializable data. Encodes as a UTF-8 string. */
	JSON = "json",
	/** Up to 8 booleans (1 byte). */
	Bools8 = "bitmask8",
	/** Up to 16 booleans (2 bytes). */
	Bools16 = "bitmask16",
	/** Up to 32 booleans (4 bytes). */
	Bools32 = "bitmask32",
	/** Any array of booleans (0¶ byte / 2-bit header). */
	Bools = "booltuple",
	/** [INTERNAL ONLY] Use "[T]" array syntax instead. */
	Array = "[array]",
	/** [INTERNAL ONLY] Use "{}" object syntax instead. */
	Object = "{object}",
	/** Alias for `Type.Float16` @see {Float16} */
	Half = "float16",
	/** Alias for `Type.Float32` @see {Float32} */
	Single = "float32",
	/** Alias for `Type.Float64` @see {Float64} */
	Double = "float64",
	/** Alias for `Type.Float64 @see {Float64} */
	Number = "float64",
	/** Alias for `Type.Bool` @see {Bool} */
	Boolean = "bool",
	/** Alias for 'Type.UInt' @see {UInt} */
	Enum = "uint"
}
/**
 * Convert a number to the nearest 16-bit half precision float representation (as a UInt16 bitmask).
 *
 * @param doubleFloat A number.
 * @returns A UInt16 bitmask representation of a half precision float.
 *
 * @see https://stackoverflow.com/a/32633586
 */
export declare const toFloat16: (v: number) => number;
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
 * Convert a UInt16 bitmask of a 16-bit half precision float representation into a normal double precision float (number).
 *
 * @param b A UInt16 bitmask representation of a half precision float.
 * @returns A number (standard 64-bit double precision representation).
 */
export declare function fromFloat16(b: number): number;
/** @returns A signed scalar between -1.0 and 1.0. */
export declare function fromScalar8(uInt8: number): number;
/** @returns An unsigned scalar between 0.0 and 1.0. */
export declare function fromUScalar8(uInt8: number): number;
/**
 * The fround16() method returns the nearest 16-bit half precision float representation of a number.
 *
 * @param doubleFloat A number.
 * @returns The nearest 16-bit half precision float representation of x.
 */
export declare function fround16(doubleFloat: number): number;
/**
 * Wrap any definition as optional.
 */
export declare function optional<T extends FieldDefinition>(t: T): OptionalType<T>;
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
 * Quantize a number to an 8-bit signed scalar between -1.0 and 1.0.
 *
 * @param doubleFloat A number.
 * @returns A number (double) in its closest signed scalar representation.
 */
export declare function scalarRound(doubleFloat: number): number;
/** @returns A UInt8 bitmask representation. */
export declare function toScalar8(scalar: number): number;
/** @returns A UInt8 bitmask representation. */
export declare function toUScalar8(uScalar: number): number;
/**
 * Quantize a number to an 8-bit scalar between 0.0 and 1.0.
 *
 * @param doubleFloat A number.
 * @returns A number (double) in its closest signed scalar representation.
 */
export declare function uScalarRound(doubleFloat: number): number;
export type AnyFormat = BufferFormat<any, any>;
/**
 * Decoded type of a binary encoding.
 * @example let onData = (data: Decoded<typeof MyBufferFormat>) => {...};
 */
export type Decoded<FromBufferFormat> = FromBufferFormat extends BufferFormat<infer EncoderType, any> ? InferredDecodedType<EncoderType> : never;
/**
 * A definition for an object binary encoder.
 */
export type EncoderDefinition = {
	[key: string]: FieldDefinition | OptionalType<FieldDefinition>;
};
/**
 * Definition for an object-field binary encoder.
 */
export type FieldDefinition = keyof ValueTypes | [
	keyof ValueTypes
] | EncoderDefinition | [
	EncoderDefinition
] | OptionalType<FieldDefinition>;
export type FormatHeader = string | number;
/**
 * The resulting type of the decoded data, based on the encoder definition.
 */
export type InferredDecodedType<EncoderType extends EncoderDefinition> = {
	[EKey in keyof EncoderType as EncoderType[EKey] extends OptionalType<any> ? never : EKey]: EncoderType[EKey] extends keyof ValueTypes ? ValueTypes[EncoderType[EKey]] : EncoderType[EKey] extends [
		keyof ValueTypes
	] ? Array<ValueTypes[EncoderType[EKey][0]]> : EncoderType[EKey] extends EncoderDefinition ? InferredDecodedType<EncoderType[EKey]> : EncoderType[EKey] extends [
		EncoderDefinition
	] ? Array<InferredDecodedType<EncoderType[EKey][number]>> : never;
} & {
	[EKey in keyof EncoderType as EncoderType[EKey] extends OptionalType<any> ? EKey : never]?: EncoderType[EKey] extends OptionalType<infer OptionalValue extends keyof ValueTypes> ? ValueTypes[OptionalValue] | undefined : EncoderType[EKey] extends OptionalType<infer OptionalValue extends [
		keyof ValueTypes
	]> ? Array<ValueTypes[OptionalValue[0]]> | undefined : EncoderType[EKey] extends OptionalType<infer OptionalValue extends EncoderDefinition> ? InferredDecodedType<OptionalValue> | undefined : never;
};
export type InferredTransformConfig<EncoderType extends EncoderDefinition> = {
	[EKey in keyof EncoderType]?: EncoderType[EKey] extends keyof ValueTypes ? Transforms<ValueTypes[EncoderType[EKey]]> : EncoderType[EKey] extends [
		keyof ValueTypes
	] ? Transforms<ValueTypes[EncoderType[EKey][0]]> : EncoderType[EKey] extends EncoderDefinition ? InferredTransformConfig<EncoderType[EKey]> : EncoderType[EKey] extends [
		EncoderDefinition
	] ? InferredTransformConfig<EncoderType[EKey][number]> : EncoderType[EKey] extends OptionalType<infer OptionalValue extends keyof ValueTypes> ? Transforms<ValueTypes[OptionalValue]> : EncoderType[EKey] extends OptionalType<infer OptionalValue extends [
		keyof ValueTypes
	]> ? Transforms<ValueTypes[OptionalValue[0]]> : EncoderType[EKey] extends OptionalType<infer OptionalValue extends EncoderDefinition> ? InferredTransformConfig<OptionalValue> | undefined : never;
};
export type InferredValidationConfig<EncoderType extends EncoderDefinition> = {
	[EKey in keyof EncoderType]?: EncoderType[EKey] extends keyof ValueTypes ? ValidationFn<ValueTypes[EncoderType[EKey]]> : EncoderType[EKey] extends [
		keyof ValueTypes
	] ? ValidationFn<ValueTypes[EncoderType[EKey][0]]> : EncoderType[EKey] extends EncoderDefinition ? InferredValidationConfig<EncoderType[EKey]> : EncoderType[EKey] extends [
		EncoderDefinition
	] ? InferredValidationConfig<EncoderType[EKey][number]> : EncoderType[EKey] extends OptionalType<infer OptionalValue extends keyof ValueTypes> ? ValidationFn<ValueTypes[OptionalValue]> : EncoderType[EKey] extends OptionalType<infer OptionalValue extends [
		keyof ValueTypes
	]> ? ValidationFn<ValueTypes[OptionalValue[0]]> : EncoderType[EKey] extends OptionalType<infer OptionalValue extends EncoderDefinition> ? InferredValidationConfig<OptionalValue> | undefined : never;
};
export type TransformFn<T> = (x: T) => T;
export type Transforms<T> = TransformFn<T> | [
	preEncode: TransformFn<T>
] | [
	preEncode: TransformFn<T> | undefined,
	postDecode: TransformFn<T> | undefined
];
/** @throws any error too */
export type ValidationFn<T> = (x: T) => undefined | boolean | Error;
/**
 * Mappings for the value types.
 */
export type ValueTypes = {
	[Type.Float16]: number;
	[Type.Float32]: number;
	[Type.Float64]: number;
	[Type.Int]: number;
	[Type.Int8]: number;
	[Type.Int16]: number;
	[Type.Int32]: number;
	[Type.UInt]: number;
	[Type.UInt8]: number;
	[Type.UInt16]: number;
	[Type.UInt32]: number;
	[Type.UScalar]: number;
	[Type.Scalar]: number;
	[Type.Bool]: boolean;
	[Type.Bools]: boolean[];
	[Type.Bools8]: boolean[];
	[Type.Bools16]: boolean[];
	[Type.Bools32]: boolean[];
	[Type.String]: string;
	[Type.Date]: Date;
	[Type.RegExp]: RegExp;
	[Type.JSON]: any;
	[Type.Buffer]: Uint8Array | ArrayBuffer | ArrayBufferView;
};

export {};

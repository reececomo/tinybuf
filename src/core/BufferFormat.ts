import * as coders from './lib/coders';
import { hashCode, strToHashCode } from './lib/hashCode';
import { peekHeader, peekHeaderStr } from './lib/peek';
import { BufferWriter } from './lib/BufferWriter';
import { BufferReader } from './lib/BufferReader';
import {
  InferredDecodedType,
  EncoderDefinition,
  Type,
  OptionalType,
  VALID_VALUE_TYPES,
  InferredTransformConfig,
  InferredValidationConfig,
  ValidationFn,
  Transforms,
  FieldDefinition
} from './Type';
import { WriteTypeError } from './lib/errors';
import { SETTINGS } from './settings';

export type FormatHeader = string | number;

/**
 * Decoded type of a binary encoding.
 * @example let onData = (data: Decoded<typeof MyBinaryCoder>) => {...};
 */
export type Decoded<FromBinaryCoder> = FromBinaryCoder extends BinaryCoder<infer EncoderType, any> ? InferredDecodedType<EncoderType> : never;

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
export function defineFormat<T extends EncoderDefinition, HeaderType extends string | number = number>(def: T): BinaryCoder<T, HeaderType>;
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
export function defineFormat<T extends EncoderDefinition, HeaderType extends string | number = number>(h: HeaderType | null, def: T): BinaryCoder<T, HeaderType>;
export function defineFormat<T extends EncoderDefinition, HeaderType extends string | number = number>(a?: HeaderType | T, b?: T): BinaryCoder<T, HeaderType> {
  return a !== null && typeof a === 'object'
    ? new BinaryCoder<T, HeaderType>(a as T)
    : new BinaryCoder<T, HeaderType>(b as T, a as HeaderType);
}

function isValidHeader(h: FormatHeader): boolean {
  if (typeof h === 'number') return Number.isInteger(h) && h >= 0 && h <= 65_535;
  if (typeof h === 'string') return new TextEncoder().encode(h).byteLength === 2;
  return false;
}

/**
 * BinaryCoder is a utility class for encoding and decoding binary data based
 * on a provided encoding format.
 *
 * @see {header}
 * @see {encode(data)}
 * @see {decode(binary)}
 */
export class BinaryCoder<EncoderType extends EncoderDefinition, HeaderType extends FormatHeader = number> {
  /**
   * A unique identifier encoded as the first 2 bytes (or `undefined` if headerless).
   *
   * @see {peekHeader(...)}
   * @see {peekHeaderStr(...)}
   * @see {hashCode}
   */
  public readonly header?: HeaderType;

  protected readonly type: Type;
  protected readonly fields!: Field[];

  protected _hash?: number;
  protected _format?: string;
  protected _transforms?: Transforms<any> | undefined;
  protected _validationFn?: ValidationFn<any> | undefined;

  public constructor(
    def: EncoderType,
    header?: HeaderType | null
  ) {
    // set definition
    if (def instanceof OptionalType) {
      throw new TypeError("Invalid encoding format: Root object cannot be optionals.");
    }
    else if (def !== undefined && typeof def === 'string' && VALID_VALUE_TYPES.includes(def)) {
      this.type = def;
    }
    else if (def instanceof Object) {
      this.type = Type.Object;
      this.fields = Object.keys(def).map((name) => new Field(name, def[name]));
    }
    else {
      throw new TypeError("Invalid encoding format: Must be an object, or a known coder type.");
    }

    // set headers
    if (header === undefined && this.type === Type.Object) {
      this.header = this.hashCode as HeaderType; // automatic
    }
    else if (header === null) {
      this.header = undefined; // headerless
    }
    else if (isValidHeader(header)) {
      this.header = header; // manual
    }
    else {
      throw new TypeError(`Header should be an integer between 0 and 65535, a 2-byte string, or null. Received: ${header}`);
    }
  }

  // ----- Static methods: -----

  /**
   * Read the header of a buffer as a number.
   *
   * @see {BinaryCoder.header}
   * @throws {RangeError} if buffer size < 2
   */
  public static peekHeader = peekHeader;

  /**
   * Read the header of a buffer as a string.
   *
   * @see {BinaryCoder.header}
   * @throws {RangeError} if buffer size < 2
   */
  public static peekHeaderStr = peekHeaderStr;

  // ----- Accessors: -----

  /** A uint16 number representing the shape of the encoded format */
  public get hashCode(): number {
    if (this._hash === undefined) {
      this._hash = hashCode(this.format);
    }

    return this._hash;
  }

  /**
   * @returns A string describing the encoding format.
   * @example "{uint8,str[]?}"
   */
  protected get format(): string {
    if (this._format === undefined) {
      this._format = this.type === Type.Object
        ? `{${this.fields.map(v => v.format).join(',')}}`
        : `${this.type}`;
    }

    return this._format;
  }

  // ----- Public methods: -----

  /**
   * Encode an object to bytes.
   * @param data - data to encode
   * @param resize - copy the bytes to a resized buffer instead of returning a view (default: false)
   * @throws if fails to encode value to schema.
   */
  public encode<DecodedType extends InferredDecodedType<EncoderType>>(
    data: DecodedType,
    resize = false,
  ): Uint8Array {
    const safeValue = this._preEncode(data);
    const buffer = new BufferWriter(resize ? SETTINGS.writeBufferDefaultSize : undefined);

    if (this.header != null) this.writeHeader(buffer);
    this.write(safeValue, buffer, '');

    return resize ? buffer.copy() : buffer.asView();
  }

  /**
   * Decode binary data to an object.
   *
   * @throws if fails (e.g. binary data is incompatible with schema).
   */
  public decode<DecodedType = InferredDecodedType<EncoderType>>(b: Uint8Array | ArrayBufferView | ArrayBuffer): DecodedType {
    return this.read(new BufferReader(b, this.header === undefined ? 0 : 2));
  }

  /**
   * Set additional transform functions to apply before encoding and after decoding.
   */
  public setTransforms(transforms: InferredTransformConfig<EncoderType> | Transforms<any>): this {
    if (transforms instanceof Function || (Array.isArray(transforms) && transforms[0] instanceof Function)) {
      this._transforms = transforms;
    }
    else {
      for (const name of Object.keys(transforms)) {
        const field = this.fields.find(f => f.name === name);
        if (!field) {
          throw new TypeError(`Failed to set transforms for field '${name}'`);
        }

        // Set validation for object.
        field.coder.setTransforms(transforms[name]);
      }
    }

    return this;
  }

  /**
   * Set additional validation rules which are applied on encode() and decode().
   *
   * - Validation functions should throw an error, return an error, or return boolean false.
   * - Anything else is treated as successfully passing validation.
   */
  public setValidation(validations: InferredValidationConfig<EncoderType> | ValidationFn<any>): this {
    if (validations instanceof Function) {
      this._validationFn = validations;
    }
    else {
      for (const name of Object.keys(validations)) {
        const field = this.fields.find(f => f.name === name);
        if (!field) {
          throw new TypeError(`Failed to set validation function for field '${name}'`);
        }

        field.coder.setValidation(validations[name]);
      }
    }

    return this;
  }

  // ----- Implementation: -----

  /**
   * @param value
   * @param bw
   * @param path
   * @throws if the value is invalid
   *
   * @internal
   */
  protected write(value: { [x: string]: any; }, bw: BufferWriter, path: string): void {
    if (this.type !== Type.Object) {
      const safeValue = (this._validationFn || this._transforms) ? this._preEncode(value) : value;

      return this.getCoder(this.type).write(safeValue, bw, path);
    }

    // Check for object type
    if (!value || typeof value !== 'object') {
      throw new TypeError(`Expected an object at ${path}`);
    }

    // Write each field
    for (const field of this.fields) {
      const subpath = path ? `${path}.${field.name}` : field.name;
      const subValue = value[field.name];

      if (field.isOptional) {

        // Add 'presence' flag
        if (subValue === undefined || subValue === null) {
          coders.booleanCoder.write(false, bw);
          continue;
        }
        else {
          coders.booleanCoder.write(true, bw);
        }
      }

      if (!field.isArray) {
        // Scalar field
        field.coder.write(subValue, bw, subpath);
        continue;
      }

      // Array field
      this._writeArray(subValue, bw, subpath, field.coder);
    }
  }

  /** @internal */
  private writeHeader(bw: BufferWriter): void {
    const h = typeof this.header === 'string' ? strToHashCode(this.header) : this.header as number;
    coders.uint16Coder.write(h, bw, '');
  }

  /**
   * Helper to get the right coder.
   * @internal
   */
  protected getCoder(type: Type): coders.BinaryTypeCoder<any> {
    switch (type) {
      case Type.Buffer: return coders.bufferCoder;
      case Type.Bool: return coders.booleanCoder;
      case Type.Bools: return coders.booleanArrayCoder;
      case Type.Bools8: return coders.bitmask8Coder;
      case Type.Bools16: return coders.bitmask16Coder;
      case Type.Bools32: return coders.bitmask32Coder;
      case Type.Date: return coders.dateCoder;
      case Type.Float16: return coders.float16Coder;
      case Type.Float32: return coders.float32Coder;
      case Type.Float64: return coders.float64Coder;
      case Type.UScalar: return coders.uscalarCoder;
      case Type.Scalar: return coders.scalarCoder;
      case Type.Int: return coders.intCoder;
      case Type.Int16: return coders.int16Coder;
      case Type.Int32: return coders.int32Coder;
      case Type.Int8: return coders.int8Coder;
      case Type.JSON: return coders.jsonCoder;
      case Type.RegExp: return coders.regexCoder;
      case Type.String: return coders.stringCoder;
      case Type.UInt: return coders.uintCoder;
      case Type.UInt16: return coders.uint16Coder;
      case Type.UInt32: return coders.uint32Coder;
      case Type.UInt8: return coders.uint8Coder;
    }
  }

  // ----- Private methods: -----

  private _preEncode<T extends Record<string, any>>(data: T): T {
    if (this._validationFn && this._validationFn(data) === false) {
      throw new Error('custom validation failed');
    }

    if (this._transforms instanceof Function) {
      return this._transforms(data);
    }
    else if (Array.isArray(this._transforms) && this._transforms[0] instanceof Function) {
      return this._transforms[0](data);
    }

    return data;
  }

  private _postDecode<T extends Record<string, any>>(data: T): T {
    if (Array.isArray(this._transforms) && this._transforms[1] instanceof Function) {
      data = this._transforms[1](data);
    }

    if (this._validationFn instanceof Function) {
      this._validationFn(data);
    }

    return data;
  }

  /**
   * This function will be executed only the first time
   * After that, we'll compile the read routine and add it directly to the instance
   * @param state
   * @returns
   * @throws if fails
   */
  private read<DecodedType = InferredDecodedType<EncoderType>>(state: BufferReader): DecodedType {
    // This function will be executed only the first time to compile the read routine.
    // After that, we'll compile the read routine and add it directly to the instance

    // Update the read method implementation.
    this.read = this.compileRead();

    return this.read(state);
  }

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
  private generateObjectReadCode(): string {
    const fieldsStr: string = this.fields
      .map(({ name }, i) => `${name}:this.${this._readField.name}(${i},state)`)
      .join(',');

    return `return{${fieldsStr}}`;
  }

  /** Read an individual field. */
  private _readField(fieldIndex: number, state: BufferReader): any {
    const field = this.fields[fieldIndex];

    if (field.isOptional && !this._readOptional(state)) {
      return undefined;
    }

    if (field.isArray) {
      return this._readArray(field.coder, state);
    }

    return field.coder.read(state);
  }

  private readMeAsValueType<DecodedType = InferredDecodedType<EncoderType>>(state: BufferReader): DecodedType {
    return this._postDecode(this.getCoder(this.type).read(state));
  }

  /** Compile the decode() method for this object. */
  private compileRead<DecodedType = InferredDecodedType<EncoderType>>(): (state: BufferReader) => DecodedType {
    if (this.type !== Type.Object && this.type !== Type.Array) {
      // Scalar type - in this case, there is no need to write custom code.
      return (this._validationFn !== undefined || this._transforms !== undefined) ? this.readMeAsValueType : this.getCoder(this.type).read;
    }

    const code = this.generateObjectReadCode();

    return new Function('state', code) as any;
  }

  /**
   * @param value
   * @param data
   * @param path
   * @param type
   * @throws if the value is invalid
   */
  private _writeArray(value: string | any[], data: any, path: string, type: BinaryCoder<any, any>): void {
    let i: string | number, len: number;
    if (!Array.isArray(value)) {
      throw new WriteTypeError(`Array<${type.type}>`, data, path);
    }

    len = value.length;
    coders.uintCoder.write(len, data);
    for (i = 0; i < len; i++) {
      type.write(value[i], data, path + '.' + i);
    }
  }

  /**
   * @throws if invalid data
   */
  private _readArray<T extends EncoderDefinition>(type: BinaryCoder<T, any>, state: any): Array<T> {
    const arr = new Array(coders.uintCoder.read(state));
    for (let j = 0; j < arr.length; j++) {
      arr[j] = type.read(state);
    }
    return arr;
  }

  private _readOptional(state: BufferReader): boolean {
    return coders.booleanCoder.read(state);
  }
}

/**
 * Parses and represents an object field.
 */
export class Field {
  public readonly name: string;
  public readonly coder: BinaryCoder<any>;
  public readonly isOptional: boolean;
  public readonly isArray: boolean;

  protected _format?: string;

  public constructor(name: string, rawType: FieldDefinition) {
    this.isOptional = rawType instanceof OptionalType;

    let type = rawType instanceof OptionalType ? rawType.type : rawType;

    this.name = name;

    if (Array.isArray(type)) {
      if (type.length !== 1) {
        throw new TypeError('Invalid array definition, it must have exactly one element');
      }

      type = type[0];
      this.isArray = true;
    }
    else {
      this.isArray = false;
    }

    this.coder = new BinaryCoder<any>(type, null);
  }

  /**
   * @returns A string identifying the encoding format.
   * @example "{str,uint16,bool}[]?"
   */
  public get format(): string {
    if (this._format === undefined) {
      this._format = `${(this.coder as any).format}${this.isArray ? '[]' : ''}${this.isOptional ? '?' : ''}`;
    }

    return this._format;
  }
}

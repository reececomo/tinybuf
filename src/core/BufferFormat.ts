import { CODERS } from './lib/coders';
import * as coders from './lib/coders';
import { $hashCode, $strToHashCode } from './lib/hashCode';
import { peekHeader, peekHeaderStr } from './lib/peek';
import { BufferWriter } from './lib/BufferWriter';
import { BufferReader } from './lib/BufferReader';
import {
  InferredDecodedType,
  EncoderDefinition,
  Type,
  OptionalType,
  InferredTransformConfig,
  InferredValidationConfig,
  ValidationFn,
  Transforms,
  FieldDefinition
} from './Type';
import { EncodeError } from './lib/errors';
import { cfg } from './config';

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
export function defineFormat<T extends EncoderDefinition, HeaderType extends string | number = number>(def: T): BufferFormat<T, HeaderType>;
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
export function defineFormat<T extends EncoderDefinition, HeaderType extends string | number = number>(h: HeaderType | null, def: T): BufferFormat<T, HeaderType>;
export function defineFormat<T extends EncoderDefinition, HeaderType extends string | number = number>(a?: HeaderType | T, b?: T): BufferFormat<T, HeaderType> {
  return a !== null && typeof a === 'object'
    ? new BufferFormat<T, HeaderType>(a as T)
    : new BufferFormat<T, HeaderType>(b as T, a as HeaderType);
}

function isValidHeader(h: FormatHeader): boolean {
  if (typeof h === 'number') return Number.isInteger(h) && h >= 0 && h <= 65_535;
  if (typeof h === 'string') return new TextEncoder().encode(h).byteLength === 2;
  return false;
}

/**
 * BufferFormat is a utility class for encoding and decoding binary data based
 * on a provided encoding format.
 *
 * @see {header}
 * @see {encode(data)}
 * @see {decode(binary)}
 */
export class BufferFormat<EncoderType extends EncoderDefinition, HeaderType extends FormatHeader = number> {
  /** @internal */
  private static _$globalEncodingBuffer?: ArrayBuffer;

  /**
   * A unique identifier encoded as the first 2 bytes (or `undefined` if headerless).
   *
   * @see {peekHeader(...)}
   * @see {peekHeaderStr(...)}
   */
  public readonly header!: HeaderType;

  /** @internal */
  private readonly _$header!: number; // always uint16 vesion
  /** @internal */
  private readonly _$type!: Type;
  /** @internal */
  private readonly _$fields!: Field[];
  /** @internal */
  private readonly _$fieldsMap!: Map<string, Field>;

  /** @internal */
  private _$format?: string;
  /** @internal */
  private _$transforms?: Transforms<any> | undefined;
  /** @internal */
  private _$validate?: ValidationFn<any> | undefined;
  /** @internal */
  private _$hasValidationOrTransforms = false;
  /** @internal */
  private _$writer?: BufferWriter;

  public constructor(
    def: EncoderType,
    header?: HeaderType | null,
  ) {
    // set definition
    if (def instanceof OptionalType) {
      throw new TypeError("Invalid encoding format: Root object cannot be optional.");
    }
    else if (def !== undefined && typeof def === 'number') {
      this._$type = def;
    }
    else if (def instanceof Object) {
      this._$type = undefined; // object
      this._$fieldsMap = new Map();
      this._$fields = Object.keys(def).map((name) => {
        const f = new Field(name, def[name]);
        this._$fieldsMap.set(name, f);
        return f;
      });

      // set headers
      if (header === undefined) {
        this.header = $hashCode(this.f) as HeaderType; // automatic
        this._$header = this.header as number;
      }
      else if (header === null) {
        this.header = undefined; // headerless
        this._$header = undefined;
      }
      else if (isValidHeader(header)) {
        this.header = header; // manual
        this._$header = typeof header === 'number' ? header : $strToHashCode(header);
      }
      else {
        throw new TypeError(`Header should be an integer between 0 and 65535, a 2-byte string, or null. Received: ${header}`);
      }
    }
    else {
      throw new TypeError("Invalid encoding format: Must be an object, or a known coder type.");
    }
  }

  // ----- Static methods: -----

  /**
   * Read the header of a buffer as a number.
   *
   * @see {header}
   * @throws {RangeError} if buffer size < 2
   */
  public static peekHeader = peekHeader;

  /**
   * Read the header of a buffer as a string.
   *
   * @see {header}
   * @throws {RangeError} if buffer size < 2
   */
  public static peekHeaderStr = peekHeaderStr;

  // ----- Accessors: -----

  /**
   * @example "{uint8,str[]?}"
   * @internal
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private get f(): string {
    if (this._$format === undefined) {
      this._$format = this._$fields !== undefined
        ? `{${this._$fields.map(v => v.f).join(',')}}`
        : `${this._$type}`;
    }

    return this._$format;
  }

  /** @internal */
  private static _$initWriter(): BufferWriter {
    if (cfg.useGlobalEncodingBuffer) {
      if (!BufferFormat._$globalEncodingBuffer) {
        // lazy init: global encoding buffer created at max size
        BufferFormat._$globalEncodingBuffer = new ArrayBuffer(cfg.encodingBufferMaxSize);
      }

      return new BufferWriter(BufferFormat._$globalEncodingBuffer);
    }

    return new BufferWriter(cfg.encodingBufferInitialSize);
  }

  /**
   * Encode an object to bytes.
   *
   * **Warning:** Returns an unsafe view into the encoding buffer. Pass this reference to preserve
   * performance, and to minimize memory allocation and fragmentation.
   *
   * @param data - data to encode
   * @param safe - (default: `setTinybufConfig().safe`) safely copy bytes, instead of returning a pointer to the encoded buffer
   *
   * @returns An Uint8Array view of the encoded bytes
   * @throws if fails to encode value to schema
   */
  public encode<DecodedType extends InferredDecodedType<EncoderType>>(
    data: DecodedType,
    safe?: boolean,
  ): Uint8Array {
    // lazy init
    if (!this._$writer) this._$writer = BufferFormat._$initWriter();
    this._$writer.$byteOffset = 0; // reset
    if (this._$hasValidationOrTransforms) data = this._$preprocess(data);
    this._$write(data, this._$writer, '');

    if (safe ?? cfg.safe) {
      return this._$writer.$asCopy();
    }

    return this._$writer.$asView();
  }

  /**
   * Decode binary data to an object.
   * @throws if fails to decode bytes to schema.
   */
  public decode<DecodedType = InferredDecodedType<EncoderType>>(b: Uint8Array | ArrayBufferView | ArrayBuffer): DecodedType {
    return this._$read(new BufferReader(b, this.header === undefined ? 0 : 2));
  }

  /**
   * Set additional transform functions to apply before encoding and after decoding.
   */
  public setTransforms(transforms: InferredTransformConfig<EncoderType> | Transforms<any>): this {
    this._$hasValidationOrTransforms = true;

    if (transforms instanceof Function || (Array.isArray(transforms) && transforms[0] instanceof Function)) {
      this._$transforms = transforms;
    }
    else {
      for (const name of Object.keys(transforms)) {
        const field = this._$fieldsMap.get(name);
        if (!field) {
          throw new TypeError(`Failed to set transforms for field '${name}'`);
        }

        // Set validation for object.
        field.$coder.setTransforms(transforms[name]);
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
    this._$hasValidationOrTransforms = true;

    if (validations instanceof Function) {
      this._$validate = validations;
    }
    else {
      for (const name of Object.keys(validations)) {
        const field = this._$fieldsMap.get(name);
        if (!field) {
          throw new TypeError(`Failed to set validation function for field '${name}'`);
        }

        field.$coder.setValidation(validations[name]);
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
  private _$write(value: { [x: string]: any; }, bw: BufferWriter, path: string): void {
    // write header
    if (this._$header !== undefined) this._$writer.$writeUInt16(this._$header);

    // write scalar
    if (this._$type !== undefined) {
      const safeValue = (this._$validate || this._$transforms) ? this._$preprocess(value) : value;

      return CODERS[this._$type].$write(safeValue, bw, path);
    }

    // Check for object type
    if (!value || typeof value !== 'object') {
      throw new TypeError(`Expected an object at ${path}`);
    }

    // Write each field
    for (const field of this._$fields) {
      const subpath = path ? `${path}.${field.$name}` : field.$name;
      const subValue = value[field.$name];

      if (field.$isOptional) {

        // add 'presence' flag
        if (subValue === undefined || subValue === null) {
          coders.boolCoder.$write(false, bw);
          continue;
        }
        else {
          coders.boolCoder.$write(true, bw);
        }
      }

      if (!field.$isArray) {
        // scalar field
        field.$coder._$write(subValue, bw, subpath);
        continue;
      }

      // Array field
      this._$writeArray(subValue, bw, subpath, field.$coder);
    }
  }

  /**
   * pre-process: validation and/or transforms
   * @internal
   */
  private _$preprocess<T extends Record<string, any>>(data: T): T {
    if (this._$validate && this._$validate(data) === false) {
      throw new Error('failed validation');
    }

    if (this._$transforms instanceof Function) {
      return this._$transforms(data);
    }
    else if (Array.isArray(this._$transforms) && this._$transforms[0] instanceof Function) {
      return this._$transforms[0](data);
    }

    return data;
  }

  /**
   * post-process: validation and/or transforms
   * @internal
   */
  private _$postprocess<T extends Record<string, any>>(data: T): T {
    if (Array.isArray(this._$transforms) && this._$transforms[1] instanceof Function) {
      data = this._$transforms[1](data);
    }

    if (this._$validate instanceof Function) {
      this._$validate(data);
    }

    return data;
  }

  /**
   * This function will be executed only the first time
   * After that, we'll compile the read routine and add it directly to the instance
   * @param state
   * @returns
   * @throws if fails
   *
   * @internal
   */
  private _$read<DecodedType = InferredDecodedType<EncoderType>>(state: BufferReader): DecodedType {
    // This function will be executed only the first time to compile the read routine.
    // After that, we'll compile the read routine and add it directly to the instance

    // Update the read method implementation.
    this._$read = this._$compileFormatReadFn();

    return this._$read(state);
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
   *
   * @internal
   */
  private _$makeObjectReader(): string {
    const fieldsStr: string = this._$fields
      .map(({ $name: name }, i) => `${name}:this.${this._$readField.name}(${i},state)`)
      .join(',');

    return `return{${fieldsStr}}`;
  }

  /**
   * Read an individual field.
   * @internal
   */
  private _$readField(fieldId: number, state: BufferReader): any {
    const field = this._$fields[fieldId];

    if (field.$isOptional && !this._$readOptional(state)) {
      return undefined;
    }

    if (field.$isArray) {
      return this._$readArray(field.$coder, state);
    }

    return field.$coder._$read(state);
  }

  /**
   * Compile the decode() method for this object.
   *
   * @internal
   */
  private _$compileFormatReadFn<DecodedType = InferredDecodedType<EncoderType>>(): (state: BufferReader) => DecodedType {
    // scalar type
    if (this._$type !== undefined) {
      return this._$hasValidationOrTransforms
        ? (s) => this._$postprocess(CODERS[this._$type].$read(s))
        : CODERS[this._$type].$read;
    }

    // scalar type
    return new Function('state', this._$makeObjectReader()) as any;
  }

  /**
   * @param value
   * @param data
   * @param path
   * @param type
   * @throws if the value is invalid
   *
   * @internal
   */
  private _$writeArray(value: string | any[], data: any, path: string, type: BufferFormat<any, any>): void {
    if (!Array.isArray(value)) {
      throw new EncodeError(`Array<${type._$type}>`, data, path);
    }

    let i: string | number, len: number;
    len = value.length;
    coders.uintCoder.$write(len, data);
    for (i = 0; i < len; i++) {
      type._$write(value[i], data, path + '.' + i);
    }
  }

  /**
   * @throws if invalid data
   *
   * @internal
   */
  private _$readArray<T extends EncoderDefinition>(type: BufferFormat<T, any>, state: any): Array<T> {
    const arr = new Array(coders.uintCoder.$read(state));
    for (let j = 0; j < arr.length; j++) {
      arr[j] = type._$read(state);
    }
    return arr;
  }

  /** @internal */
  private _$readOptional(state: BufferReader): boolean {
    return coders.boolCoder.$read(state);
  }
}

/**
 * Parses and represents an object field.
 *
 * @internal
 */
class Field {
  public readonly $name: string;
  public readonly $coder: BufferFormat<any>;
  public readonly $isOptional: boolean;
  public readonly $isArray: boolean;

  private _$formatString?: string;

  public constructor(name: string, rawType: FieldDefinition) {
    this.$isOptional = rawType instanceof OptionalType;
    let type = rawType instanceof OptionalType ? rawType.type : rawType;
    this.$name = name;

    if (Array.isArray(type)) {
      if (type.length !== 1) {
        throw new TypeError('Invalid array definition, it must have exactly one element');
      }

      type = type[0];
      this.$isArray = true;
    }
    else {
      this.$isArray = false;
    }

    this.$coder = new BufferFormat<any>(type, null);
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public get f(): string {
    if (this._$formatString === undefined) {
      this._$formatString = `${(this.$coder as any).f}${this.$isArray ? '[]' : ''}${this.$isOptional ? '?' : ''}`;
    }

    return this._$formatString;
  }
}

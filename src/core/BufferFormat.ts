/* eslint-disable @typescript-eslint/unified-signatures */
import { writers, readers } from "./lib/coders";
import * as coders from "./lib/coders";
import { $hashCode, $strToHashCode } from "./lib/hashCode";
import { peekHeader, peekHeaderStr } from "./lib/peek";
import { BufferWriter } from "./lib/BufferWriter";
import { BufferReader } from "./lib/BufferReader";
import {
  DecodedType,
  EncoderDefinition,
  FieldDefinition,
  TransformConfig,
  ValidationConfig,
  MaybeType,
  Transforms,
  TypeLiteral,
  ValidationFn,
  ValidTypes,
} from "./Type";
import { cfg } from "./config";

export type FormatHeader = string | number;

/**
 * Utility to get the decoded type of a buffer format
 * @example type Format = Decoded<typeof MyBufferFormat>
 */
export type Decoded<TBufferFormat> = TBufferFormat extends BufferFormat<infer Format, any>
  ? DecodedType<Format>
  : never;

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
export function defineFormat<T extends EncoderDefinition, HeaderType extends FormatHeader = number>(def: T): BufferFormat<T, HeaderType>;
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
export function defineFormat<T extends EncoderDefinition, HeaderType extends FormatHeader = number>(h: HeaderType | null, def: T): BufferFormat<T, HeaderType>;
export function defineFormat<T extends EncoderDefinition, HeaderType extends FormatHeader = number>(a?: HeaderType | T, b?: T): BufferFormat<T, HeaderType> {
  return a !== null && typeof a === "object"
    ? new BufferFormat<T, HeaderType>(a as T)
    : new BufferFormat<T, HeaderType>(b as T, a as HeaderType);
}

function isValidHeader(h: FormatHeader): boolean {
  if (typeof h === "number") return Number.isInteger(h) && h >= 0 && h <= 65_535;
  if (typeof h === "string") return new TextEncoder().encode(h).byteLength === 2;
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
  private static _$globalWriter?: BufferWriter;

  /**
   * A unique identifier encoded as the first 2 bytes (or `undefined` if headerless).
   *
   * @see {peekHeader(...)}
   * @see {peekHeaderStr(...)}
   */
  public header!: HeaderType;

  /** @internal */
  private _$header!: number; // always uint16 vesion
  /** @internal */
  private _$type!: TypeLiteral;
  /** @internal */
  private _$fields!: Field[];
  /** @internal */
  private _$fieldsMap!: Map<string, Field>;

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
    if (typeof def === "string" && ValidTypes.includes(def)) {
      this._$type = def;
    }
    else if (def instanceof MaybeType) {
      throw new TypeError("Format cannot be optional");
    }
    else if (def instanceof Object) {
      this._$type = undefined; // object
      this._$fieldsMap = new Map();
      this._$fields = Object.keys(def).map((name) => {
        const f = new Field(name, def[name]);
        this._$fieldsMap.set(name, f); // also set map entry
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
        this._$header = typeof header === "number" ? header : $strToHashCode(header);
      }
      else {
        throw new TypeError("Header must be 2-byte string, uint16, or null.");
      }
    }
    else {
      throw new TypeError("Format must be object or Type");
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
        ? `{${this._$fields.map(v => v.f).join(",")}}`
        : `${this._$type}`;
    }

    return this._$format;
  }

  /** @internal */
  private static _$initWriter(): BufferWriter {
    if (cfg.useGlobalEncodingBuffer) {
      if (!BufferFormat._$globalWriter) {
        // lazy init: global encoding buffer created at max size
        this._$globalWriter = new BufferWriter(cfg.encodingBufferInitialSize);
      }

      return this._$globalWriter;
    }

    return new BufferWriter(cfg.encodingBufferInitialSize);
  }

  /**
   * Encode an object into an existing byte array.
   *
   * **Warning:** Returns an unsafe view into the encoding buffer. Pass this reference to preserve
   * performance, and to minimize memory allocation and fragmentation.
   */
  public encodeInto<TDecodedType extends DecodedType<EncoderType>>(
    data: TDecodedType,
    bytes: Uint8Array,
  ): Uint8Array {
    const writer = new BufferWriter(bytes);

    if (this._$hasValidationOrTransforms) {
      data = this._$preprocess(data);
    }

    this._$write(data, writer);

    return writer.$viewBytes();
  }

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
  public encode<TDecodedType extends DecodedType<EncoderType>>(
    data: TDecodedType,
    preserveBytes?: boolean,
  ): Uint8Array {
    if (!this._$writer) {
      // lazy init
      this._$writer = BufferFormat._$initWriter();
    }

    // reset
    this._$writer.$byteLength = 0;

    if (this._$hasValidationOrTransforms) {
      data = this._$preprocess(data);
    }

    this._$write(data, this._$writer);

    return (preserveBytes ?? cfg.safe)
      ? this._$writer.$copyBytes()
      : this._$writer.$viewBytes();
  }

  /**
   * Decode binary data into an existing object instance.
   * @throws if fails to decode bytes to schema.
   */
  public decodeInto<TDecodedType = DecodedType<EncoderType>>(
    bytes: Uint8Array | ArrayBufferView | ArrayBuffer,
    obj: Partial<TDecodedType>,
  ): TDecodedType {
    return this._$read(new BufferReader(bytes, this.header === undefined ? 0 : 2), obj);
  }
  /**
   * Decode binary data to an object.
   * @throws if fails to decode bytes to schema.
   */
  public decode<TDecodedType = DecodedType<EncoderType>>(
    bytes: Uint8Array | ArrayBufferView | ArrayBuffer
  ): TDecodedType;
  /**
   * @deprecated use decodeInto() instead
   */
  public decode<TDecodedType = DecodedType<EncoderType>>(
    bytes: Uint8Array | ArrayBufferView | ArrayBuffer,
    decodeInto: Partial<TDecodedType>,
  ): TDecodedType;
  /**
   * Decode binary data to an object.
   * @throws if fails to decode bytes to schema.
   */
  public decode<TDecodedType = DecodedType<EncoderType>>(
    bytes: Uint8Array | ArrayBufferView | ArrayBuffer,
    decodeInto?: Partial<TDecodedType> | undefined,
  ): TDecodedType {
    return this._$read(new BufferReader(bytes, this.header === undefined ? 0 : 2), decodeInto);
  }

  /**
   * Set additional transform functions to apply before encoding and after decoding.
   */
  public setTransforms(transforms: TransformConfig<EncoderType> | Transforms<any>): this {
    this._$hasValidationOrTransforms = true;

    if (typeof transforms === "function" || (Array.isArray(transforms) && typeof transforms[0]  === "function")) {
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
  public setValidation(validations: ValidationConfig<EncoderType> | ValidationFn<any>): this {
    this._$hasValidationOrTransforms = true;

    if (typeof validations === "function") {
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
   * @throws if the value is invalid
   *
   * @internal
   */
  private _$write(value: any, bw: BufferWriter): void {
    // write header
    if (this._$header !== undefined) bw.$writeUint16(this._$header);

    // write scalar
    if (this._$type !== undefined) {
      const safeValue = (this._$validate || this._$transforms) ? this._$preprocess(value) : value;

      return writers[this._$type](safeValue, bw);
    }

    // check for object type
    if (typeof value !== "object" || !value) {
      throw new TypeError("expected object type");
    }

    // write each field
    for (const field of this._$fields) {
      const subValue = value[field.$name];

      if (field.$isOptional) {
        if (subValue === undefined || subValue === null) {
          coders.boolCoder.$write(false, bw);
          continue; // skip
        }
        else {
          coders.boolCoder.$write(true, bw);
        }
      }
      else if (subValue == null) {
        throw new Error(`missing required value: ${field.$name}`);
      }

      if (field.$isArray) {
        // array
        this._$writeArray(subValue, bw, field.$coder);
        continue;
      }

      // scalar/object field
      field.$coder._$write(subValue, bw);
    }
  }

  /**
   * pre-process: validation and/or transforms
   * @internal
   */
  private _$preprocess<T extends Record<string, any>>(data: T): T {
    if (this._$validate) this._$processValidation(data);

    if (typeof this._$transforms === "function") {
      return this._$transforms(data);
    }
    else if (Array.isArray(this._$transforms) && typeof this._$transforms[0] === "function") {
      return this._$transforms[0](data);
    }

    return data;
  }

  /**
   * post-process: validation and/or transforms
   * @internal
   */
  private _$postprocess<T extends Record<string, any>>(data: T): T {
    if (Array.isArray(this._$transforms) && typeof this._$transforms[1] === "function") {
      data = this._$transforms[1](data);
    }

    if (this._$validate) this._$processValidation(data);

    return data;
  }

  private _$processValidation(data: any): void {
    if (!this._$validate) return;
    const res = this._$validate(data);
    if (res instanceof Error) throw res;
    if (res === false) throw new Error("failed validation");
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
  private _$read<TDecodedType = DecodedType<EncoderType>>(state: BufferReader, obj?: Partial<TDecodedType>): TDecodedType {
    // This function will be executed only the first time to compile the read routine.
    // After that, we'll compile the read routine and add it directly to the instance

    // Update the read method implementation.
    this._$read = this._$compileFormatReadFn();

    return this._$read(state, obj);
  }

  /**
   * Generate read function code for this coder.
   *
   * @example
   * let v=o??{};
   * v.prop1=this._$readField(0,s,o);
   * v.prop2=this._$readField(1,s,o);
   * return v
   *
   * @internal
   */
  private _$makeObjectReadFnBody(): string {
    const fieldsStr: string = this._$fields
      .map(({ $name: n }, i) => `v.${n}=this.${this._$readField.name}(${i},s,v.${n})`)
      .join(";");

    return `let v=o??{};${fieldsStr};return v;`;
  }

  /**
   * Read an individual field.
   * @internal
   */
  private _$readField(fieldIndex: number, state: BufferReader, obj?: any): any {
    const field = this._$fields[fieldIndex];

    if (field.$isOptional && !coders.boolCoder.$read(state)) {
      return undefined;
    }

    if (field.$isArray) {
      return this._$readArray(field.$coder, state, obj);
    }

    return field.$coder._$read(state, obj);
  }

  /**
   * Compile the decode() method for this object.
   *
   * @internal
   */
  private _$compileFormatReadFn<TDecodedType = DecodedType<EncoderType>>(): (state: BufferReader, obj: Partial<TDecodedType> | undefined) => TDecodedType {
    if (this._$type !== undefined) {
      // scalar type
      return this._$hasValidationOrTransforms
        ? (s) => this._$postprocess(readers[this._$type](s))
        : readers[this._$type];
    }

    // object type
    return new Function("s", "o",  this._$makeObjectReadFnBody()) as any;
  }

  /**
   * @internal
   */
  private _$writeArray(value: any[], bw: BufferWriter, type: BufferFormat<any, any>): void {
    if (!Array.isArray(value)) {
      throw new TypeError(`expected array, instead got: ${value}`);
    }

    coders.uintCoder.$write(value.length, bw);
    for (let i = 0; i < value.length; i++) {
      type._$write(value[i], bw);
    }
  }

  /**
   * @throws if invalid data
   * @internal
   */
  private _$readArray<T extends EncoderDefinition>(type: BufferFormat<T, any>, state: any, obj?: Array<T>): Array<T> {
    const len = coders.uintCoder.$read(state);
    const arr = obj?.length === len ? obj : new Array(len);
    for (let j = 0; j < arr.length; j++) {
      arr[j] = type._$read(state, obj?.[j]);
    }
    return arr;
  }
}

/**
 * Parses and represents an object field.
 *
 * @internal
 */
class Field {
  public $name: string;
  public $coder: BufferFormat<any>;
  public $isOptional: boolean;
  public $isArray: boolean;

  private _$formatString?: string;

  public constructor(name: string, rawType: FieldDefinition) {
    this.$isOptional = rawType instanceof MaybeType;
    let type = rawType instanceof MaybeType ? rawType.type : rawType;

    this.$name = name;

    if (Array.isArray(type)) {
      if (type.length !== 1) {
        throw new TypeError("Array type must contain exactly one format");
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
      this._$formatString = `${(this.$coder as any).f}${this.$isArray ? "[]" : ""}${this.$isOptional ? "?" : ""}`;
    }

    return this._$formatString;
  }
}

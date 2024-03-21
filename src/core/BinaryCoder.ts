import * as coders from './lib/coders';
import { Field } from './Field';
import {
  djb2HashUInt16,
  hashCodeTo2CharStr,
  strToHashCode
} from './lib/hashCode';
import { MutableArrayBuffer } from './MutableArrayBuffer';
import { ReadState } from './ReadState';
import {
  InferredDecodedType,
  EncoderDefinition,
  Type,
  OptionalType,
  ValidValueTypes
} from './Type';

/**
 * Infer the decoded type of a BinaryCoder.
 *
 * @example
 * let onData = (data: Infer<typeof MyBinaryCoder>) => {...};
 */
export type Infer<FromBinaryCoder> = FromBinaryCoder extends BinaryCoder<infer EncoderType> ? InferredDecodedType<EncoderType> : never;

/**
 * BinaryCoder is a utility class for encoding and decoding binary data based
 * on a provided encoding format.
 *
 * @see {Id}
 * @see {encode(data)}
 * @see {decode(binary)}
 */
export class BinaryCoder<EncoderType extends EncoderDefinition, IdType extends string | number = number> {
  protected readonly type: Type;
  protected readonly fields: Field[];

  protected _hash?: number;
  protected _format?: string;
  protected _id?: IdType;

  /**
   * @param encoderDefinition A defined encoding format.
   * @param Id Defaults to hash code. Set `false` to disable. Must be a 16-bit unsigned integer.
   */
  public constructor(
    encoderDefinition: EncoderType,
    Id?: IdType | false
  ) {
    if (
      (typeof Id === 'number' && (Math.floor(Id) !== Id || Id < 0 || Id > 65_535))
      || (typeof Id === 'string' && new TextEncoder().encode(Id).byteLength !== 2)
      || (Id !== undefined && Id !== false && !['string', 'number'].includes(typeof Id))
    ) {
      throw new TypeError(`Id must be an unsigned 16-bit integer, a 2-byte string, or \`false\`. Received: ${Id}`);
    }
    else if (encoderDefinition instanceof OptionalType) {
      throw new TypeError("Invalid type given. Root object must not be an Optional.");
    }
    else if (typeof encoderDefinition === 'object') {
      this.type = Type.Object;
      this.fields = Object.keys(encoderDefinition).map(function (name) {
        return new Field(name, encoderDefinition[name]);
      });
    }
    else if (encoderDefinition !== undefined && typeof encoderDefinition === 'string' && ValidValueTypes.includes(encoderDefinition)) {
      this.type = encoderDefinition;
    }
    else {
      throw new TypeError("Invalid type given. Must be an object, or a known coder type.");
    }

    if (Id === false) {
      this._id = undefined;
    }
    else if (Id === undefined && this.type === Type.Object) {
      this._id = this.hashCode as IdType;
    }
    else {
      this._id = Id;
    }
  }

  // ----- Static methods: -----

  /**
   * Read the first two bytes of a buffer as an unsigned 16-bit integer.
   *
   * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
   *
   * @see {BinaryCoder.Id}
   * @throws {RangeError} if buffer size < 2
   */
  public static peekIntId(buffer: ArrayBuffer | ArrayBufferView): number {
    const dataView = new DataView(buffer instanceof ArrayBuffer ? buffer : buffer.buffer);
    return dataView.getUint16(0);
  }

  /**
   * Read the first two bytes of a buffer as a 2-character string.
   *
   * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
   *
   * @see {BinaryCoder.Id}
   * @throws {RangeError} if buffer size < 2
   */
  public static peekStrId(buffer: ArrayBuffer | ArrayBufferView): string {
    return hashCodeTo2CharStr(this.peekIntId(buffer));
  }

  // ----- Public accessors: -----

  /**
   * A unique identifier as an unsigned 16-bit integer. Encoded as the first 2 bytes.
   *
   * @see {BinaryCoder.peekIntId(...)}
   * @see {BinaryCoder.peekStrId(...)}
   * @see {BinaryCoder.hashCode}
   */
  public get Id(): IdType | undefined {
    return this._id;
  }

  /**
   * @returns A hash code representing the encoding format. An unsigned 16-bit integer.
   */
  public get hashCode(): number {
    if (this._hash === undefined) {
      this._hash = djb2HashUInt16(this.format);
    }

    return this._hash;
  }

  /**
   * @returns A string describing the encoding format.
   * @example "{uint8,str[]?}"
   */
  public get format(): string {
    if (this._format === undefined) {
      this._format = this.type === Type.Object
        ? `{${this.fields.map(v => v.format).join(',')}}`
        : `${this.type}`;
    }

    return this._format;
  }

  // ----- Public methods: -----

  /**
   * Encode an object to binary.
   *
   * @throws if the value is invalid
   */
  public encode<DecodedType extends InferredDecodedType<EncoderType>>(value: DecodedType): ArrayBuffer {
    const data = new MutableArrayBuffer();
    this.writeId(data);
    this.write(value, data, '');
    return data.toArrayBuffer();
  }

  /**
   * Decode binary data to an object.
   *
   * @throws if fails (e.g. binary data is incompatible with schema).
   */
  public decode<DecodedType = InferredDecodedType<EncoderType>>(arrayBuffer: ArrayBuffer | ArrayBufferView): DecodedType {
    return this.read(new ReadState(
      arrayBuffer instanceof ArrayBuffer ? arrayBuffer : arrayBuffer.buffer,
      this.Id === undefined ? 0 : 2
    )) as any;
  }

  // ----- Implementation: -----

  /**
   * @param value
   * @param data
   * @param path
   * @throws if the value is invalid
   */
  protected write(value: { [x: string]: any; }, data: MutableArrayBuffer, path: string): void {
    if (this.type !== Type.Object) {
      return this.getCoder(this.type).write(value, data, path);
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
          coders.booleanCoder.write(false, data);
          continue;
        }
        else {
          coders.booleanCoder.write(true, data);
        }
      }

      if (!field.isArray) {
        // Scalar field
        field.coder.write(subValue, data, subpath);
        continue;
      }

      // Array field
      this._writeArray(subValue, data, subpath, field.coder);
    }
  }

  /**
   * Writes @see {Id} as the prefix of the buffer.
   */
  protected writeId(mutableArrayBuffer: MutableArrayBuffer): void {
    if (this.Id === undefined) {
      return;
    }

    const idInt16 = typeof this.Id === 'string' ? strToHashCode(this.Id) : this.Id as number;
    coders.uint16Coder.write(idInt16, mutableArrayBuffer, '');
  }

  /**
   * Helper to get the right coder.
   */
  protected getCoder(type: Type): coders.BinaryTypeCoder<any> {
    switch (type) {
      case Type.Binary: return coders.arrayBufferCoder;
      case Type.Bitmask16: return coders.bitmask16Coder;
      case Type.Bitmask32: return coders.bitmask32Coder;
      case Type.Bitmask8: return coders.bitmask8Coder;
      case Type.Boolean: return coders.booleanCoder;
      case Type.BooleanTuple: return coders.booleanArrayCoder;
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

  /**
   * This function will be executed only the first time
   * After that, we'll compile the read routine and add it directly to the instance
   * @param state
   * @returns
   * @throws if fails
   */
  private read(state: ReadState): EncoderType {
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
  private _readField(fieldIndex: number, state: ReadState): any {
    const field = this.fields[fieldIndex];

    if (field.isOptional && !this._readOptional(state)) {
      return undefined;
    }

    if (field.isArray) {
      return this._readArray(field.coder, state);
    }

    return field.coder.read(state);
  }

  /** Compile the decode method for this object. */
  private compileRead(): (state: ReadState) => EncoderType {
    if (this.type !== Type.Object && this.type !== Type.Array) {
      // Scalar type - in this case, there is no need to write custom code.
      return this.getCoder(this.type).read;
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
      throw new coders.WriteTypeError(`Array<${type.type}>`, data, path);
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
  private _readArray<T extends EncoderDefinition>(type: BinaryCoder<T>, state: any): Array<T> {
    const arr = new Array(coders.uintCoder.read(state));
    for (let j = 0; j < arr.length; j++) {
      arr[j] = type.read(state);
    }
    return arr;
  }

  private _readOptional(state: ReadState): boolean {
    return coders.booleanCoder.read(state);
  }
}

export default BinaryCoder;
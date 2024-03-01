import * as coders from './lib/coders';
import { Field } from './Field';
import { generateObjectShapeHashCode } from './lib/hashCode';
import { MutableArrayBuffer } from './MutableArrayBuffer';
import { ReadState } from './ReadState';
import { InferredDecodedType, EncoderDefinition, Optional, Type } from './Type';

/**
 * BinaryCodec is a utility class for encoding and decoding binary data based
 * on a provided encoding format.
 *
 * @see {Id}
 * @see {hashCode}
 * @see {encode(data)}
 * @see {decode(binary)}
 */
export class BinaryCodec<EncoderType extends EncoderDefinition> {
  /**
   * A 16-bit integer identifier, encoded as the first 2 bytes.
   * @see {BinaryCodec.peek(...)}
   */
  public readonly Id?: number | false;

  /**
   * A shape-based unique representation of the encoding format.
   */
  public readonly hashCode: number;

  protected readonly type: Type;
  protected readonly fields: Field[]
  
  /**
   * @param encoderDefinition A defined encoding format.
   * @param Id Defaults to hash code. Set `false` to disable. Must be a 16-bit unsigned integer.
   */
  constructor(
    encoderDefinition: EncoderType,
    Id?: number | false
  ) {
    if (typeof Id === 'number' && (Id < 0 || Id > 65_535)) {
      throw new RangeError(`hashCode must be between 0 and 65535.`)
    }
    else if (encoderDefinition instanceof Optional) {
      throw new Error("Invalid type given. Root object must not be an Optional.")
    }
    else if (typeof encoderDefinition === 'object') {
      this.type = Type.Object
      this.fields = Object.keys(encoderDefinition).map(function (name) {
        return new Field(name, encoderDefinition[name])
      })
    }
    else if (encoderDefinition !== undefined) {
      this.type = encoderDefinition;
    }
    else {
      throw new Error("Invalid type given. Must be array containing a single type, an object, or a known coder type.");
    }
    
    // Create a hash code
    this.Id = Id === undefined && this.type === Type.Object ? generateObjectShapeHashCode(encoderDefinition) : Id ?? 0;
  }

  /**
   * Whether this data matches this 
   */
  public matches(data: any): data is EncoderType {
    try {
      this.encode(data);
      return true;
    }
    catch (error) {
      return false;
    }
  }

  // ----- Static methods: -----

  /**
   * Read the first two bytes of a buffer.
   *
   * When passed an ArrayBufferView, accesses the underlying 'buffer' instance directly.
   *
   * @see {BinaryCodec.Id}
   * @throws {RangeError} if buffer size < 2
   */
  public static peekId(buffer: ArrayBuffer | ArrayBufferView): number {
    const dataView = new DataView(buffer instanceof ArrayBuffer ? buffer : buffer.buffer);
    return dataView.getUint16(0);
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
      this.Id === false ? 0 : 2
    )) as any;
  }

  // ----- Implementation: -----
  
  /**
  * @param {*} value
  * @param {MutableArrayBuffer} data
  * @param {string} path
  * @throws if the value is invalid
  */
  protected write(value: { [x: string]: any; }, data: MutableArrayBuffer, path: string) {
    let i: number, field: Field, subpath: any, subValue: any, len: number
    
    if (this.type !== Type.Object) {
      return this.getCoder(this.type).write(value, data, path)
    }
    
    // Check for object type
    if (!value || typeof value !== 'object') {
      throw new TypeError('Expected an object at ' + path)
    }
    
    // Write each field
    for (let i = 0, len = this.fields.length; i < len; i++) {
      field = this.fields[i]
      subpath = path ? path + '.' + field.name : field.name
      subValue = value[field.name]
      
      if (field.isOptional) {
        // Add 'presence' flag
        if (subValue === undefined || subValue === null) {
          coders.booleanCoder.write(false, data)
          continue
        } else {
          coders.booleanCoder.write(true, data)
        }
      }
      
      if (!field.isArray) {
        // Scalar field
        field.type.write(subValue, data, subpath)
        continue
      }
      
      // Array field
      this._writeArray(subValue, data, subpath, field.type)
    }
  }

  /**
   * Writes @see {Id} as the prefix of the buffer.
   */
  protected writeId(mutableArrayBuffer: MutableArrayBuffer): void {
    if (this.Id === false) {
      return;
    }

    coders.uint16Coder.write(this.Id, mutableArrayBuffer, '');
  }
  
  /**
  * This function will be executed only the first time
  * After that, we'll compile the read routine and add it directly to the instance
  * @param {ReadState} state
  * @return {*}
  * @throws if fails
  */
  private read(state: ReadState): EncoderType {
    this.read = this.compileRead();
    return this.read(state)
  }
  
  /**
  * Compile the decode method for this object.
  */
  private compileRead(): (state: ReadState) => EncoderType {
    if (this.type !== Type.Object && this.type !== Type.Array) {
      // Scalar type
      // In this case, there is no need to write custom code
      return this.getCoder(this.type).read
    }
    
    // As an example, compiling code to new Type({a:'int', 'b?':['string']}) will result in:
    // return {
    //     a: this.fields[0].type.read(state),
    //     b: this._readOptional(state) ? this._readArray(state, this.fields[1].type) : undefined
    // }
    let code = 'return {' + this.fields.map(function (field, i) {
      let name = JSON.stringify(field.name),
      fieldStr = 'this.fields[' + i + ']',
      readCode: string, code: string
      
      if (field.isArray) {
        readCode = 'this._readArray(' + fieldStr + '.type, state)'
      } else {
        readCode = fieldStr + '.type.read(state)'
      }
      
      if (!field.isOptional) {
        code = name + ': ' + readCode
      } else {
        code = name + ': this._readOptional(state) ? ' + readCode + ' : undefined'
      }
      return code
    }).join(',') + '}'
    
    return new Function('state', code) as any;
  }

  /**
   * Helper to get the right coder.
   */
  protected getCoder(type: Type): coders.BinaryTypeCoder<any> {
    switch (type) {
      case Type.Boolean: return coders.booleanCoder;
      case Type.Binary: return coders.arrayBufferCoder;
      case Type.Date: return coders.dateCoder;
      case Type.Float16: return coders.float16Coder;
      case Type.Float32: return coders.float32Coder;
      case Type.Float64: return coders.float64Coder;
      case Type.Int: return coders.intCoder;
      case Type.Int8: return coders.int8Coder;
      case Type.Int16: return coders.int16Coder;
      case Type.Int32: return coders.int32Coder;
      case Type.RegExp: return coders.regexCoder;
      case Type.String: return coders.stringCoder;
      case Type.UInt: return coders.uintCoder;
      case Type.UInt8: return coders.uint8Coder;
      case Type.UInt16: return coders.uint16Coder;
      case Type.UInt32: return coders.uint32Coder;

      case Type.JSON: return coders.jsonCoder;
      case Type.BooleanTuple: return coders.booleanArrayCoder;
      case Type.Bitmask8: return coders.bitmask8Coder;
      case Type.Bitmask16: return coders.bitmask16Coder;
      case Type.Bitmask32: return coders.bitmask32Coder;
      
      case Type.Array:
        throw new Error('Unexpected getCoder() for array type. Use array syntax instead.');

      case Type.Object:
        throw new Error('Unexpected getCoder() for object type. Use object syntax instead.');
      
      default:
        throw new Error(`Unknown binary coder type: "${type}"`);
    }
  }

  // ----- Private methods: -----
  
  /**
  * @param {*} value
  * @param {MutableArrayBuffer} data
  * @param {string} path
  * @param {BinaryCodec} type
  * @throws if the value is invalid
  */
  private _writeArray(value: string | any[], data: any, path: string, type: BinaryCodec<any>) {
    let i: string | number, len: number
    if (!Array.isArray(value)) {
      throw new coders.WriteTypeError(`Array<${type.type}>`, data, path);
    }
    len = value.length
    coders.uintCoder.write(len, data)
    for (i = 0; i < len; i++) {
      type.write(value[i], data, path + '.' + i)
    }
  }
  
  /**
  * @param {BinaryCodec} type
  * @param {ReadState} state
  * @return {Array}
  * @throws - if invalid
  */
  private _readArray(type: { read: (arg0: any) => any; }, state: any) {
    let arr = new Array(coders.uintCoder.read(state)),
    j: number
    for (j = 0; j < arr.length; j++) {
      arr[j] = type.read(state)
    }
    return arr
  }

  private _readOptional(state: ReadState): boolean {
    return coders.booleanCoder.read(state);
  }
}

export default BinaryCodec;

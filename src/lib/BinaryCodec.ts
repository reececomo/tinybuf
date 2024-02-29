import * as coders from './coders';
import { Field } from './Field';
import { generateObjectShapeHashCode } from './lib/hashCode';
import { MutableArrayBuffer } from './MutableArrayBuffer';
import { ReadState } from './ReadState';
import { InferredDecodedType, EncoderDefinition, Optional, Type } from './Type';

/**
 * A binary buffer encoder/decoder.
 *
 * Binary 
 */
export class BinaryCodec<EncoderType extends EncoderDefinition> {
  protected readonly type: Type;
  protected readonly fields: Field[]
  // protected readonly subBinaryCodec?: BinaryCodec<EncoderType, DecoderType>;

  /** A shape-unique hash. */
  public readonly hashCode: number;
  
  constructor(
    definition: EncoderType,
    /**
     * An optional Id (UInt16) to be encoded as the first 2 bytes.
     * Uses @see {hashCode} by default. Set `null` to disable.
     *
     * You can use this with @see {BinaryCodec.peek(...)} or @see {BinaryCodecInterpreter}
     */
    public readonly Id?: number | false,
  ) {
    if (definition instanceof Optional) {
      throw new Error("Invalid type given. Root object must not be an Optional.")
    }
    else if (typeof definition === 'object') {
      this.type = Type.Object
      this.fields = Object.keys(definition).map(function (name) {
        return new Field(name, definition[name])
      })
    } else if (definition !== undefined) {
      this.type = definition;
    } else {
      throw new Error("Invalid type given. Must be array containing a single type, an object, or a known coder type.");
    }
    
    // Create a hash code
    const shape = this.type === Type.Object ? definition as any : {};
    this.hashCode = generateObjectShapeHashCode(shape);

    if (this.Id === undefined && this.Id !== null) {
      this.Id = this.hashCode;
    }
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
   * A helper function to peek the Id.
   *
   * Default is integer, but you can set `Type.String` to read a string, otherwise this will return the length of the string.
   *
   * If all your codecs have set a @see {Id}, you can use this to differentiate.
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
  public encode(value: InferredDecodedType<EncoderType>): ArrayBuffer {
    const data = new MutableArrayBuffer();
    this._writePrefixIfSet(data);
    this._write(value, data, '');
    return data.toArrayBuffer();
  }
  
  /**
   * Decode binary data to an object.
   *
   * @throws if fails (e.g. binary data is incompatible with schema).
   */
  public decode(arrayBuffer: ArrayBuffer | ArrayBufferView): InferredDecodedType<EncoderType> {
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
  protected _write(value: { [x: string]: any; }, data: MutableArrayBuffer, path: string) {
    let i: number, field: Field, subpath: any, subValue: any, len: number
    
    if (this.type !== Type.Object) {
      // Simple type
      return coders.getCoder(this.type).write(value, data, path)
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
        field.type._write(subValue, data, subpath)
        continue
      }
      
      // Array field
      this._writeArray(subValue, data, subpath, field.type)
    }
  }

  /**
   * Writes @see {Id} as the prefix of the buffer.
   */
  protected _writePrefixIfSet(mutableArrayBuffer: MutableArrayBuffer): void {
    if (this.Id === false) {
      return;
    }

    coders.uint16Coder.write(this.Id, mutableArrayBuffer, '');
  }
  
  /**
  * @param {*} value
  * @param {MutableArrayBuffer} data
  * @param {string} path
  * @param {BinaryCodec} type
  * @throws if the value is invalid
  * @private
  */
  protected _writeArray(value: string | any[], data: any, path: string, type: BinaryCodec<any>) {
    var i: string | number, len: number
    if (!Array.isArray(value)) {
      throw new TypeError('Expected an Array at ' + path)
    }
    len = value.length
    coders.uintCoder.write(len, data)
    for (i = 0; i < len; i++) {
      type._write(value[i], data, path + '.' + i)
    }
  }
  
  /**
  * This funciton will be executed only the first time
  * After that, we'll compile the read routine and add it directly to the instance
  * @param {ReadState} state
  * @return {*}
  * @throws if fails
  */
  protected read(state: ReadState): EncoderType {
    this.read = this._compileRead();
    return this.read(state)
  }

  protected _readOptional(state: ReadState): boolean {
    return coders.booleanCoder.read(state);
  }
  
  /**
  * Compile the decode method for this object
  * @return {function(ReadState):*}
  * @private
  */
  protected _compileRead(): (state: ReadState) => EncoderType {
    if (this.type !== Type.Object && this.type !== Type.Array) {
      // Scalar type
      // In this case, there is no need to write custom code
      return coders.getCoder(this.type).read
    }
    
    // As an example, compiling code to new Type({a:'int', 'b?':['string']}) will result in:
    // return {
    //     a: this.fields[0].type.read(state),
    //     b: this._readOptional(state) ? this._readArray(state, this.fields[1].type) : undefined
    // }
    var code = 'return {' + this.fields.map(function (field, i) {
      var name = JSON.stringify(field.name),
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
  * @param {BinaryCodec} type
  * @param {ReadState} state
  * @return {Array}
  * @throws - if invalid
  * @private
  */
  protected _readArray(type: { read: (arg0: any) => any; }, state: any) {
    var arr = new Array(coders.uintCoder.read(state)),
    j: number
    for (j = 0; j < arr.length; j++) {
      arr[j] = type.read(state)
    }
    return arr
  }
}

export default BinaryCodec;

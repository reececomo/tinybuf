import * as coders from './coders';
import { Field } from './Field';
import { MutableArrayBuffer } from './MutableArrayBuffer';
import { ReadState } from './ReadState';
import { Type } from './Type';

/** Types used in definitions */
export type BinaryCodecDefinition = Type | [Type] | Object | Object[];

/**
 * A binary buffer encoder/decoder.
 */
export class BinaryCodec<T = any> {
  readonly type: Type;
  readonly fields: Field[]
  readonly subBinaryCodec?: BinaryCodec<T>;
  
  constructor(type: BinaryCodecDefinition) {
    if (Array.isArray(type)) {
      if (type.length !== 1) {
        throw new TypeError('Invalid array type, it must have exactly one element')
      }
      
      this.type = Type.Array;
      this.subBinaryCodec = new BinaryCodec(type[0]);
    } else if (typeof type === 'object') {
      this.type = Type.Object
      this.fields = Object.keys(type).map(function (name) {
        return new Field(name, type[name])
      })
    } else if (type !== undefined) {
      this.type = type;
    } else {
      throw new Error("Invalid type given. Must be array containing a single type, an object, or a known coder type.");
    }
  }
  
  /**
   * Encode data to binary.
   *
   * @throws if the value is invalid
   */
  public encode(value: T): ArrayBuffer {
    var data = new MutableArrayBuffer();
    this.write(value, data, '')
    return data.toArrayBuffer();
  }
  
  /**
   * Decode data.
   *
   * @throws if fails (e.g. binary data is incompatible with schema).
   */
  public decode(arrayBuffer: ArrayBuffer): T {
    return this.read(new ReadState(arrayBuffer))
  }
  
  /**
  * @param {*} value
  * @param {MutableArrayBuffer} data
  * @param {string} path
  * @throws if the value is invalid
  */
  public write(value: { [x: string]: any; }, data: MutableArrayBuffer, path: string) {
    var i: number, field: Field, subpath: any, subValue: any, len: number
    
    if (this.type === Type.Array) {
      // Array field
      return this._writeArray(value as any, data, path, this.subBinaryCodec)
    } else if (this.type !== Type.Object) {
      // Simple type
      return coders.getCoder(this.type).write(value, data, path)
    }
    
    // Check for object type
    if (!value || typeof value !== 'object') {
      throw new TypeError('Expected an object at ' + path)
    }
    
    // Write each field
    for (i = 0, len = this.fields.length; i < len; i++) {
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
  * @param {*} value
  * @param {MutableArrayBuffer} data
  * @param {string} path
  * @param {BinaryCodec} type
  * @throws if the value is invalid
  * @private
  */
  private _writeArray(value: string | any[], data: any, path: string, type: BinaryCodec<T>) {
    var i: string | number, len: number
    if (!Array.isArray(value)) {
      throw new TypeError('Expected an Array at ' + path)
    }
    len = value.length
    coders.uintCoder.write(len, data)
    for (i = 0; i < len; i++) {
      type.write(value[i], data, path + '.' + i)
    }
  }
  
  /**
  * This funciton will be executed only the first time
  * After that, we'll compile the read routine and add it directly to the instance
  * @param {ReadState} state
  * @return {*}
  * @throws if fails
  */
  public read(state: ReadState) {
    this.read = this._compileRead()
    return this.read(state)
  }
  
  /**
  * Return a signature for this type. Two types that resolve to the same hash can be said as equivalents
  */
  public getHash() {
    var hash = new MutableArrayBuffer
    hashType(this, false, false)
    return hash.toArrayBuffer()
    
    /**
    * @param {BinaryCodec} type
    * @param {boolean} array
    * @param {boolean} optional
    */
    function hashType(type: BinaryCodec<T>, array: boolean, isOptional: boolean) {
      // Write type (first char + flags)
      // AOxx xxxx
      hash.writeUInt8((this.type.charCodeAt(0) & 0x3f) | (array ? 0x80 : 0) | (isOptional ? 0x40 : 0))
      
      if (this.type === Type.Array) {
        hashType(type.subBinaryCodec, false, false)
      } else if (this.type === Type.Object) {
        coders.uintCoder.write(type.fields.length, hash)
        type.fields.forEach((f) => hashType(f.type, f.isArray, f.isOptional));
      }
    }
  }
  
  public _readOptional(state: ReadState): boolean {
    return coders.booleanCoder.read(state);
  }
  
  /**
  * Compile the decode method for this object
  * @return {function(ReadState):*}
  * @private
  */
  private _compileRead() {
    if (this.type !== Type.Object && this.type !== Type.Array) {
      // Scalar type
      // In this case, there is no need to write custom code
      return coders.getCoder(this.type).read
    } else if (this.type === Type.Array) {
      return this._readArray.bind(this, this.subBinaryCodec)
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
    
    return new Function('state', code)
  }
  
  /**
  * @param {BinaryCodec} type
  * @param {ReadState} state
  * @return {Array}
  * @throws - if invalid
  * @private
  */
  private _readArray(type: { read: (arg0: any) => any; }, state: any) {
    var arr = new Array(coders.uintCoder.read(state)),
    j: number
    for (j = 0; j < arr.length; j++) {
      arr[j] = type.read(state)
    }
    return arr
  }
}

export default BinaryCodec;

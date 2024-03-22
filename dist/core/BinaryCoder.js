"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryCoder = void 0;
const coders = __importStar(require("./lib/coders"));
const Field_1 = require("./Field");
const hashCode_1 = require("./lib/hashCode");
const MutableArrayBuffer_1 = require("./MutableArrayBuffer");
const ReadState_1 = require("./ReadState");
const Type_1 = require("./Type");
/**
 * BinaryCoder is a utility class for encoding and decoding binary data based
 * on a provided encoding format.
 *
 * @see {Id}
 * @see {encode(data)}
 * @see {decode(binary)}
 */
class BinaryCoder {
    /**
     * @param encoderDefinition A defined encoding format.
     * @param Id Defaults to hash code. Set `false` to disable. Must be a 16-bit unsigned integer.
     */
    constructor(encoderDefinition, Id) {
        if ((typeof Id === 'number' && (Math.floor(Id) !== Id || Id < 0 || Id > 65535))
            || (typeof Id === 'string' && new TextEncoder().encode(Id).byteLength !== 2)
            || (Id !== undefined && Id !== false && !['string', 'number'].includes(typeof Id))) {
            throw new TypeError(`Id must be an unsigned 16-bit integer, a 2-byte string, or \`false\`. Received: ${Id}`);
        }
        else if (encoderDefinition instanceof Type_1.OptionalType) {
            throw new TypeError("Invalid type given. Root object must not be an Optional.");
        }
        else if (typeof encoderDefinition === 'object') {
            this.type = "{object}" /* Type.Object */;
            this.fields = Object.keys(encoderDefinition).map(function (name) {
                return new Field_1.Field(name, encoderDefinition[name]);
            });
        }
        else if (encoderDefinition !== undefined && typeof encoderDefinition === 'string' && Type_1.ValidValueTypes.includes(encoderDefinition)) {
            this.type = encoderDefinition;
        }
        else {
            throw new TypeError("Invalid type given. Must be an object, or a known coder type.");
        }
        if (Id === false) {
            this._id = undefined;
        }
        else if (Id === undefined && this.type === "{object}" /* Type.Object */) {
            this._id = this.hashCode;
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
    static peekIntId(buffer) {
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
    static peekStrId(buffer) {
        return (0, hashCode_1.hashCodeTo2CharStr)(this.peekIntId(buffer));
    }
    // ----- Public accessors: -----
    /**
     * A unique identifier as an unsigned 16-bit integer. Encoded as the first 2 bytes.
     *
     * @see {BinaryCoder.peekIntId(...)}
     * @see {BinaryCoder.peekStrId(...)}
     * @see {BinaryCoder.hashCode}
     */
    get Id() {
        return this._id;
    }
    /**
     * @returns A hash code representing the encoding format. An unsigned 16-bit integer.
     */
    get hashCode() {
        if (this._hash === undefined) {
            this._hash = (0, hashCode_1.djb2HashUInt16)(this.format);
        }
        return this._hash;
    }
    /**
     * @returns A string describing the encoding format.
     * @example "{uint8,str[]?}"
     */
    get format() {
        if (this._format === undefined) {
            this._format = this.type === "{object}" /* Type.Object */
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
    encode(value) {
        const safeValue = this._preEncode(value);
        const buffer = new MutableArrayBuffer_1.MutableArrayBuffer();
        this.writeId(buffer);
        this.write(safeValue, buffer, '');
        return buffer.toArrayBuffer();
    }
    /**
     * Decode binary data to an object.
     *
     * @throws if fails (e.g. binary data is incompatible with schema).
     */
    decode(arrayBuffer) {
        const decoded = this.read(new ReadState_1.ReadState(arrayBuffer instanceof ArrayBuffer ? arrayBuffer : arrayBuffer.buffer, this.Id === undefined ? 0 : 2));
        return this._postDecode(decoded);
    }
    /**
     * Set additional transform functions to apply before encoding and after decoding.
     */
    setTransforms(transforms) {
        if (transforms instanceof Function) {
            this._transforms = transforms;
        }
        else if (Array.isArray(transforms) && transforms[0] instanceof Function) {
            this._transforms = transforms[0];
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
    setValidation(validations) {
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
     * @param data
     * @param path
     * @throws if the value is invalid
     */
    write(value, data, path) {
        if (this.type !== "{object}" /* Type.Object */) {
            const safeValue = (this._validationFn || this._transforms) ? this._preEncode(value) : value;
            return this.getCoder(this.type).write(safeValue, data, path);
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
    writeId(mutableArrayBuffer) {
        if (this.Id === undefined) {
            return;
        }
        const idInt16 = typeof this.Id === 'string' ? (0, hashCode_1.strToHashCode)(this.Id) : this.Id;
        coders.uint16Coder.write(idInt16, mutableArrayBuffer, '');
    }
    /**
     * Helper to get the right coder.
     */
    getCoder(type) {
        switch (type) {
            case "binary" /* Type.Binary */: return coders.arrayBufferCoder;
            case "bitmask16" /* Type.Bitmask16 */: return coders.bitmask16Coder;
            case "bitmask32" /* Type.Bitmask32 */: return coders.bitmask32Coder;
            case "bitmask8" /* Type.Bitmask8 */: return coders.bitmask8Coder;
            case "bool" /* Type.Boolean */: return coders.booleanCoder;
            case "booltuple" /* Type.BooleanTuple */: return coders.booleanArrayCoder;
            case "date" /* Type.Date */: return coders.dateCoder;
            case "float16" /* Type.Float16 */: return coders.float16Coder;
            case "float32" /* Type.Float32 */: return coders.float32Coder;
            case "float64" /* Type.Float64 */: return coders.float64Coder;
            case "uscalar" /* Type.UScalar */: return coders.uscalarCoder;
            case "scalar" /* Type.Scalar */: return coders.scalarCoder;
            case "int" /* Type.Int */: return coders.intCoder;
            case "int16" /* Type.Int16 */: return coders.int16Coder;
            case "int32" /* Type.Int32 */: return coders.int32Coder;
            case "int8" /* Type.Int8 */: return coders.int8Coder;
            case "json" /* Type.JSON */: return coders.jsonCoder;
            case "regex" /* Type.RegExp */: return coders.regexCoder;
            case "str" /* Type.String */: return coders.stringCoder;
            case "uint" /* Type.UInt */: return coders.uintCoder;
            case "uint16" /* Type.UInt16 */: return coders.uint16Coder;
            case "uint32" /* Type.UInt32 */: return coders.uint32Coder;
            case "uint8" /* Type.UInt8 */: return coders.uint8Coder;
        }
    }
    // ----- Private methods: -----
    _preEncode(data) {
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
    _postDecode(data) {
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
    read(state) {
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
    generateObjectReadCode() {
        const fieldsStr = this.fields
            .map(({ name }, i) => `${name}:this.${this._readField.name}(${i},state)`)
            .join(',');
        return `return{${fieldsStr}}`;
    }
    /** Read an individual field. */
    _readField(fieldIndex, state) {
        const field = this.fields[fieldIndex];
        if (field.isOptional && !this._readOptional(state)) {
            return undefined;
        }
        if (field.isArray) {
            return this._readArray(field.coder, state);
        }
        return field.coder.read(state);
    }
    readMeAsValueType(state) {
        return this._postDecode(this.getCoder(this.type).read(state));
    }
    /** Compile the decode() method for this object. */
    compileRead() {
        if (this.type !== "{object}" /* Type.Object */ && this.type !== "[array]" /* Type.Array */) {
            // Scalar type - in this case, there is no need to write custom code.
            return (this._validationFn !== undefined || this._transforms !== undefined) ? this.readMeAsValueType : this.getCoder(this.type).read;
        }
        const code = this.generateObjectReadCode();
        return new Function('state', code);
    }
    /**
     * @param value
     * @param data
     * @param path
     * @param type
     * @throws if the value is invalid
     */
    _writeArray(value, data, path, type) {
        let i, len;
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
    _readArray(type, state) {
        const arr = new Array(coders.uintCoder.read(state));
        for (let j = 0; j < arr.length; j++) {
            arr[j] = type.read(state);
        }
        return arr;
    }
    _readOptional(state) {
        return coders.booleanCoder.read(state);
    }
}
exports.BinaryCoder = BinaryCoder;
exports.default = BinaryCoder;
//# sourceMappingURL=BinaryCoder.js.map
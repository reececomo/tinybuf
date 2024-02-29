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
exports.BinaryCodec = void 0;
const coders = __importStar(require("./coders"));
const Field_1 = require("./Field");
const hashCode_1 = require("./lib/hashCode");
const MutableArrayBuffer_1 = require("./MutableArrayBuffer");
const ReadState_1 = require("./ReadState");
const Type_1 = require("./Type");
/**
 * A binary buffer encoder/decoder.
 *
 * Binary
 */
class BinaryCodec {
    constructor(definition, 
    /**
     * An optional Id (UInt16) to be encoded as the first 2 bytes.
     * Uses @see {hashCode} by default. Set `null` to disable.
     *
     * You can use this with @see {BinaryCodec.peek(...)} or @see {BinaryCodecInterpreter}
     */
    Id) {
        this.Id = Id;
        if (definition instanceof Type_1.Optional) {
            throw new Error("Invalid type given. Root object must not be an Optional.");
        }
        else if (typeof definition === 'object') {
            this.type = "{object}" /* Type.Object */;
            this.fields = Object.keys(definition).map(function (name) {
                return new Field_1.Field(name, definition[name]);
            });
        }
        else if (definition !== undefined) {
            this.type = definition;
        }
        else {
            throw new Error("Invalid type given. Must be array containing a single type, an object, or a known coder type.");
        }
        // Create a hash code
        const shape = this.type === "{object}" /* Type.Object */ ? definition : {};
        this.hashCode = (0, hashCode_1.generateObjectShapeHashCode)(shape);
        if (this.Id === undefined && this.Id !== null) {
            this.Id = this.hashCode;
        }
    }
    /**
     * Whether this data matches this
     */
    matches(data) {
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
    static peekId(buffer) {
        const dataView = new DataView(buffer instanceof ArrayBuffer ? buffer : buffer.buffer);
        return dataView.getUint16(0);
    }
    // ----- Public methods: -----
    /**
     * Encode an object to binary.
     *
     * @throws if the value is invalid
     */
    encode(value) {
        const data = new MutableArrayBuffer_1.MutableArrayBuffer();
        this._writePrefixIfSet(data);
        this._write(value, data, '');
        return data.toArrayBuffer();
    }
    /**
     * Decode binary data to an object.
     *
     * @throws if fails (e.g. binary data is incompatible with schema).
     */
    decode(arrayBuffer) {
        return this.read(new ReadState_1.ReadState(arrayBuffer instanceof ArrayBuffer ? arrayBuffer : arrayBuffer.buffer, this.Id === false ? 0 : 2));
    }
    // ----- Implementation: -----
    /**
    * @param {*} value
    * @param {MutableArrayBuffer} data
    * @param {string} path
    * @throws if the value is invalid
    */
    _write(value, data, path) {
        let i, field, subpath, subValue, len;
        if (this.type !== "{object}" /* Type.Object */) {
            // Simple type
            return coders.getCoder(this.type).write(value, data, path);
        }
        // Check for object type
        if (!value || typeof value !== 'object') {
            throw new TypeError('Expected an object at ' + path);
        }
        // Write each field
        for (let i = 0, len = this.fields.length; i < len; i++) {
            field = this.fields[i];
            subpath = path ? path + '.' + field.name : field.name;
            subValue = value[field.name];
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
                field.type._write(subValue, data, subpath);
                continue;
            }
            // Array field
            this._writeArray(subValue, data, subpath, field.type);
        }
    }
    /**
     * Writes @see {Id} as the prefix of the buffer.
     */
    _writePrefixIfSet(mutableArrayBuffer) {
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
    _writeArray(value, data, path, type) {
        var i, len;
        if (!Array.isArray(value)) {
            throw new TypeError('Expected an Array at ' + path);
        }
        len = value.length;
        coders.uintCoder.write(len, data);
        for (i = 0; i < len; i++) {
            type._write(value[i], data, path + '.' + i);
        }
    }
    /**
    * This funciton will be executed only the first time
    * After that, we'll compile the read routine and add it directly to the instance
    * @param {ReadState} state
    * @return {*}
    * @throws if fails
    */
    read(state) {
        this.read = this._compileRead();
        return this.read(state);
    }
    _readOptional(state) {
        return coders.booleanCoder.read(state);
    }
    /**
    * Compile the decode method for this object
    * @return {function(ReadState):*}
    * @private
    */
    _compileRead() {
        if (this.type !== "{object}" /* Type.Object */ && this.type !== "[array]" /* Type.Array */) {
            // Scalar type
            // In this case, there is no need to write custom code
            return coders.getCoder(this.type).read;
        }
        // As an example, compiling code to new Type({a:'int', 'b?':['string']}) will result in:
        // return {
        //     a: this.fields[0].type.read(state),
        //     b: this._readOptional(state) ? this._readArray(state, this.fields[1].type) : undefined
        // }
        var code = 'return {' + this.fields.map(function (field, i) {
            var name = JSON.stringify(field.name), fieldStr = 'this.fields[' + i + ']', readCode, code;
            if (field.isArray) {
                readCode = 'this._readArray(' + fieldStr + '.type, state)';
            }
            else {
                readCode = fieldStr + '.type.read(state)';
            }
            if (!field.isOptional) {
                code = name + ': ' + readCode;
            }
            else {
                code = name + ': this._readOptional(state) ? ' + readCode + ' : undefined';
            }
            return code;
        }).join(',') + '}';
        return new Function('state', code);
    }
    /**
    * @param {BinaryCodec} type
    * @param {ReadState} state
    * @return {Array}
    * @throws - if invalid
    * @private
    */
    _readArray(type, state) {
        var arr = new Array(coders.uintCoder.read(state)), j;
        for (j = 0; j < arr.length; j++) {
            arr[j] = type.read(state);
        }
        return arr;
    }
}
exports.BinaryCodec = BinaryCodec;
exports.default = BinaryCodec;
//# sourceMappingURL=BinaryCodec.js.map
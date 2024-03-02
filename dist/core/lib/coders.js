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
exports.dateCoder = exports.regexCoder = exports.jsonCoder = exports.bitmask32Coder = exports.bitmask16Coder = exports.bitmask8Coder = exports.booleanArrayCoder = exports.booleanCoder = exports.arrayBufferCoder = exports.stringCoder = exports.float64Coder = exports.float32Coder = exports.float16Coder = exports.int32Coder = exports.int16Coder = exports.int8Coder = exports.intCoder = exports.uint32Coder = exports.uint16Coder = exports.uint8Coder = exports.uintCoder = exports.WriteTypeError = void 0;
const boolArray = __importStar(require("./boolArray"));
/* ---------------------------
 Binary Coder Implementations
 --------------------------- */
// Pre-calculated constants
const MAX_AUTO_UINT8 = 128, MAX_AUTO_UINT16 = 16384, MAX_AUTO_UINT32 = 536870912, MAX_AUTO_INT8 = 64, MAX_AUTO_INT16 = 8192, MAX_AUTO_INT32 = 268435456, MAX_INT8 = 127, MAX_INT16 = 32767, MAX_INT32 = 2147483647, MAX_UINT8 = 255, MAX_UINT16 = 65535, MAX_UINT32 = 4294967295, POW_32 = 4294967296;
class WriteTypeError extends TypeError {
    constructor(expectedType, value, path) {
        super(`Expected '${expectedType}', instead received: ${value} (type: ${typeof value}) (at path: '${path || '<root>'}')`);
    }
}
exports.WriteTypeError = WriteTypeError;
/**
 * Formats (big-endian):
 * 7b  0xxx xxxx
 * 14b  10xx xxxx  xxxx xxxx
 * 29b  110x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 * 61b  111x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 */
exports.uintCoder = {
    write: function (value, data, path) {
        if (typeof value !== 'number' || value > Number.MAX_SAFE_INTEGER || value < 0) {
            throw new WriteTypeError('uint', value, path);
        }
        const uIntValue = r2z(value);
        if (uIntValue < MAX_AUTO_UINT8) {
            data.writeUInt8(uIntValue);
        }
        else if (uIntValue < MAX_AUTO_UINT16) {
            data.writeUInt16(uIntValue + 0x8000);
        }
        else if (uIntValue < MAX_AUTO_UINT32) {
            data.writeUInt32(uIntValue + 0xc0000000);
        }
        else {
            // Split in two 32b uints
            data.writeUInt32(Math.floor(uIntValue / POW_32) + 0xe0000000);
            data.writeUInt32(uIntValue >>> 0);
        }
    },
    read: function (state) {
        const firstByte = state.peekUInt8();
        if (!(firstByte & 0x80)) {
            state.incrementOffset();
            return firstByte;
        }
        else if (!(firstByte & 0x40)) {
            return state.readUInt16() - 0x8000;
        }
        else if (!(firstByte & 0x20)) {
            return state.readUInt32() - 0xc0000000;
        }
        else {
            return (state.readUInt32() - 0xe0000000) * POW_32 + state.readUInt32();
        }
    }
};
exports.uint8Coder = {
    write: function (value, data, path) {
        if (typeof value !== 'number' || value < 0 || value > MAX_UINT8) {
            throw new WriteTypeError('uint8', value, path);
        }
        data.writeUInt8(r2z(value));
    },
    read: function (state) {
        return state.readUInt8();
    }
};
exports.uint16Coder = {
    write: function (value, data, path) {
        if (typeof value !== 'number' || value < 0 || value > MAX_UINT16) {
            throw new WriteTypeError('uint16', value, path);
        }
        data.writeUInt16(r2z(value));
    },
    read: function (state) {
        return state.readUInt16();
    }
};
exports.uint32Coder = {
    write: function (value, data, path) {
        if (typeof value !== 'number' || value < 0 || value > MAX_UINT32) {
            throw new WriteTypeError('uint32', value, path);
        }
        data.writeUInt32(r2z(value));
    },
    read: function (state) {
        return state.readUInt32();
    }
};
/**
 * Same formats as uintCoder.
 *
 * @see {uintCoder}
 */
exports.intCoder = {
    write: function (value, data, path) {
        if (typeof value !== 'number' || value > Number.MAX_SAFE_INTEGER || value < -Number.MAX_SAFE_INTEGER) {
            throw new WriteTypeError('int', value, path);
        }
        const intValue = r2z(value);
        if (intValue >= -MAX_AUTO_INT8 && intValue < MAX_AUTO_INT8) {
            data.writeUInt8(intValue & 0x7f);
        }
        else if (intValue >= -MAX_AUTO_INT16 && intValue < MAX_AUTO_INT16) {
            data.writeUInt16((intValue & 0x3fff) + 0x8000);
        }
        else if (intValue >= -MAX_AUTO_INT32 && intValue < MAX_AUTO_INT32) {
            data.writeUInt32((intValue & 0x1fffffff) + 0xc0000000);
        }
        else {
            // Split in two 32b uints
            data.writeUInt32((Math.floor(intValue / POW_32) & 0x1fffffff) + 0xe0000000);
            data.writeUInt32(intValue >>> 0);
        }
    },
    read: function (state) {
        let firstByte = state.peekUInt8(), i;
        if (!(firstByte & 0x80)) {
            state.incrementOffset();
            return (firstByte & 0x40) ? (firstByte | 0xffffff80) : firstByte;
        }
        else if (!(firstByte & 0x40)) {
            i = state.readUInt16() - 0x8000;
            return (i & 0x2000) ? (i | 0xffffc000) : i;
        }
        else if (!(firstByte & 0x20)) {
            i = state.readUInt32() - 0xc0000000;
            return (i & 0x10000000) ? (i | 0xe0000000) : i;
        }
        else {
            i = state.readUInt32() - 0xe0000000;
            i = (i & 0x10000000) ? (i | 0xe0000000) : i;
            return i * POW_32 + state.readUInt32();
        }
    }
};
exports.int8Coder = {
    write: function (value, data, path) {
        if (typeof value !== 'number' || value < -MAX_INT8 || value > MAX_INT8) {
            throw new WriteTypeError('int8', value, path);
        }
        data.writeInt8(r2z(value));
    },
    read: function (state) {
        return state.readInt8();
    }
};
exports.int16Coder = {
    write: function (value, data, path) {
        if (typeof value !== 'number' || value < -MAX_INT16 || value > MAX_INT16) {
            throw new WriteTypeError('int16', value, path);
        }
        data.writeInt16(r2z(value));
    },
    read: function (state) {
        return state.readInt16();
    }
};
exports.int32Coder = {
    write: function (value, data, path) {
        if (typeof value !== 'number' || value < -MAX_INT32 || value > MAX_INT32) {
            throw new WriteTypeError('int32', value, path);
        }
        data.writeInt32(r2z(value));
    },
    read: function (state) {
        return state.readInt32();
    }
};
/**
 * 16-bit half precision float
 */
exports.float16Coder = {
    write: function (value, data, path) {
        if (typeof value !== 'number') {
            throw new WriteTypeError('number', value, path);
        }
        data.writeFloat16(value);
    },
    read: function (state) {
        return state.readFloat16();
    }
};
/**
 * 32-bit single precision float
 */
exports.float32Coder = {
    write: function (value, data, path) {
        if (typeof value !== 'number') {
            throw new WriteTypeError('number', value, path);
        }
        data.writeFloat32(value);
    },
    read: function (state) {
        return state.readFloat32();
    }
};
/**
 * 64-bit double precision float
 */
exports.float64Coder = {
    write: function (value, data, path) {
        if (typeof value !== 'number') {
            throw new WriteTypeError('number', value, path);
        }
        data.writeFloat64(value);
    },
    read: function (state) {
        return state.readFloat64();
    }
};
/**
 * <uint_length> <buffer_data>
 */
exports.stringCoder = {
    write: function (value, data, path) {
        if (typeof value !== 'string') {
            throw new WriteTypeError('string', value, path);
        }
        const arrayBuffer = new TextEncoder().encode(value).buffer;
        exports.arrayBufferCoder.write(arrayBuffer, data, path);
    },
    read: function (state) {
        const arrayBuffer = exports.arrayBufferCoder.read(state);
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(arrayBuffer);
    }
};
/**
 * <uint_length> <buffer_data>
 */
exports.arrayBufferCoder = {
    write: function (value, data, path) {
        if (!(value instanceof ArrayBuffer)) {
            throw new WriteTypeError('ArrayBuffer', value, path);
        }
        exports.uintCoder.write(value.byteLength, data, path);
        data.appendBuffer(value);
    },
    read: function (state) {
        const length = exports.uintCoder.read(state);
        return state.readBuffer(length);
    }
};
/**
 * either 0x00 or 0x01
 */
exports.booleanCoder = {
    write: function (value, data, path) {
        if (typeof value !== 'boolean') {
            throw new WriteTypeError('boolean', value, path);
        }
        data.writeUInt8(value ? 1 : 0);
    },
    read: function (state) {
        const value = state.readUInt8();
        return Boolean(value !== 0);
    }
};
/**
 * Encode any number of booleans as one or more UInt8s.
 *
 * <padding> <is_last> <payload ...>
 */
exports.booleanArrayCoder = {
    write: function (value, data, path) {
        if (!boolArray.isBooleanArray(value)) {
            throw new WriteTypeError('boolean[]', value, path);
        }
        const chunkSize = 6;
        for (let i = 0; i < Math.max(1, value.length); i += chunkSize) {
            const isFinalChunk = i + chunkSize >= value.length;
            const bools = value.slice(i, i + chunkSize);
            const values = [/* header */ true, isFinalChunk, ...bools];
            const intValue = boolArray.booleanArrayToBitmask(values);
            data.writeUInt8(intValue);
        }
    },
    read: function (state) {
        const values = [];
        let isFinalChunk = false;
        while (!isFinalChunk) {
            const bitmask = state.readUInt8();
            const chunk = boolArray.uInt8ToBooleanArray(bitmask);
            chunk.shift(); // pop header
            isFinalChunk = chunk.shift();
            values.push(...chunk);
        }
        return values;
    }
};
/**
 * Encode exactly 8 booleans as a UInt8.
 */
exports.bitmask8Coder = {
    write: function (value, data, path) {
        if (!boolArray.isBooleanArray(value)) {
            throw new WriteTypeError('boolean[]', value, path);
        }
        const bitmask = boolArray.fixedLengthBooleanArrayToBitmask(value, 8);
        data.writeUInt8(bitmask);
    },
    read: function (state) {
        const bitmask = state.readUInt8();
        return boolArray.bitmaskToFixedLengthBooleanArray(bitmask, 8);
    }
};
/**
 * Encode exactly 16 booleans as a UInt16.
 */
exports.bitmask16Coder = {
    write: function (value, data, path) {
        if (!boolArray.isBooleanArray(value)) {
            throw new WriteTypeError('boolean[]', value, path);
        }
        const bitmask = boolArray.fixedLengthBooleanArrayToBitmask(value, 16);
        data.writeUInt16(bitmask);
    },
    read: function (state) {
        const bitmask = state.readUInt16();
        return boolArray.bitmaskToFixedLengthBooleanArray(bitmask, 16);
    }
};
/**
 * Encode exactly 32 booleans as a UInt32.
 */
exports.bitmask32Coder = {
    write: function (value, data, path) {
        if (!boolArray.isBooleanArray(value)) {
            throw new WriteTypeError('boolean[]', value, path);
        }
        const bitmask = boolArray.fixedLengthBooleanArrayToBitmask(value, 32);
        data.writeUInt32(bitmask);
    },
    read: function (state) {
        const bitmask = state.readUInt32();
        return boolArray.bitmaskToFixedLengthBooleanArray(bitmask, 32);
    }
};
/**
 * <uint_length> <buffer_data>
 */
exports.jsonCoder = {
    write: function (value, data, path) {
        let stringValue;
        try {
            stringValue = JSON.stringify(value);
        }
        catch (error) {
            throw new WriteTypeError('JSON', error, path);
        }
        exports.stringCoder.write(stringValue, data, path);
    },
    read: function (state) {
        const stringValue = exports.stringCoder.read(state);
        return JSON.parse(stringValue);
    }
};
/**
 * <uint_source_length> <buffer_source_data> <flags>
 * flags is a bit-mask: g=1, i=2, m=4
 */
exports.regexCoder = {
    write: function (value, data, path) {
        if (!(value instanceof RegExp)) {
            throw new WriteTypeError('RegExp', value, path);
        }
        let g, i, m;
        exports.stringCoder.write(value.source, data, path);
        g = value.global ? 1 : 0;
        i = value.ignoreCase ? 2 : 0;
        m = value.multiline ? 4 : 0;
        data.writeUInt8(g + i + m);
    },
    read: function (state) {
        const source = exports.stringCoder.read(state), flags = state.readUInt8(), g = flags & 0x1 ? 'g' : '', i = flags & 0x2 ? 'i' : '', m = flags & 0x4 ? 'm' : '';
        return new RegExp(source, g + i + m);
    }
};
/**
 * <uint_time_ms>
 */
exports.dateCoder = {
    write: function (value, data, path) {
        if (!(value instanceof Date)) {
            throw new WriteTypeError('Date', value, path);
        }
        else {
            const time = value.getTime();
            if (isNaN(time)) {
                throw new WriteTypeError('Date', 'NaN', path);
            }
            exports.intCoder.write(time, data, path);
        }
    },
    read: function (state) {
        return new Date(exports.intCoder.read(state));
    }
};
/** Round toward zero */
function r2z(x) {
    return x < 0 ? Math.ceil(x) : Math.floor(x);
}
//# sourceMappingURL=coders.js.map
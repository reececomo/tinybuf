import { BufferWriter } from './BufferWriter';
import { BufferReader } from './BufferReader';
import { r2z } from './math';
import {
  fromUScalar8,
  fromScalar8,
  toUScalar8,
  toScalar8
} from './scalar';
import { EncodeError } from './errors';
import { Type } from '../Type';
import {
  $bools2Mask,
  $mask2Bools,
  $mask2vBools,
  $vBools2Mask
} from './boolArray';

// Pre-calculated constants
const MAX_AUTO_UINT8 = 128,
  MAX_AUTO_UINT16 = 16_384,
  MAX_AUTO_UINT32 = 536_870_912,
  MAX_AUTO_INT8 = 64,
  MAX_AUTO_INT16 = 8_192,
  MAX_AUTO_INT32 = 268_435_456,
  MAX_INT8 = 127,
  MAX_INT16 = 32_767,
  MAX_INT32 = 2_147_483_647,
  MAX_UINT8 = 255,
  MAX_UINT16 = 65_535,
  MAX_UINT32 = 4_294_967_295,
  POW_32 = 4_294_967_296;

const utf8Decoder = new TextDecoder('utf-8');

export interface BinaryTypeCoder<T, R = T> {
  $write(value: T, data: BufferWriter, path?: string): void;
  $read(state: BufferReader): R;
}

/**
 * Formats (big-endian):
 * 7b  0xxx xxxx
 * 14b  10xx xxxx  xxxx xxxx
 * 29b  110x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 * 61b  111x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 */
export const uintCoder: BinaryTypeCoder<number> = {
  $write: function (value, data, path) {
    if (typeof value !== 'number' || value > Number.MAX_SAFE_INTEGER || value < 0) {
      throw new EncodeError('uint', value, path);
    }

    if (value < MAX_AUTO_UINT8) {
      data.$writeUInt8(r2z(value));
    }
    else if (value < MAX_AUTO_UINT16) {
      data.$writeUInt16(r2z(value) + 0x8000);
    }
    else if (value < MAX_AUTO_UINT32) {
      data.$writeUInt32(r2z(value) + 0xc0000000);
    }
    else {
      // Split in two 32b uints
      const uIntValue = r2z(value);
      data.$writeUInt32(Math.floor(uIntValue / POW_32) + 0xe0000000);
      data.$writeUInt32(uIntValue >>> 0);
    }
  },
  $read: function (state) {
    const firstByte = state.$peekUInt8();

    if (!(firstByte & 0x80)) {
      state.$skipByte();
      return firstByte;
    }
    else if (!(firstByte & 0x40)) {
      return state.$readUint16() - 0x8000;
    }
    else if (!(firstByte & 0x20)) {
      return state.$readUint32() - 0xc0000000;
    }
    else {
      return (state.$readUint32() - 0xe0000000) * POW_32 + state.$readUint32();
    }
  }
};

export const uint8Coder: BinaryTypeCoder<number> = {
  $write: function (value, data, path) {
    if (typeof value !== 'number' || value < 0 || value > MAX_UINT8) {
      throw new EncodeError('uint8', value, path);
    }
    data.$writeUInt8(r2z(value));
  },
  $read: function (state) {
    return state.$readUint8();
  }
};

export const uint16Coder: BinaryTypeCoder<number> = {
  $write: function (value, data, path) {
    if (typeof value !== 'number' || value < 0 || value > MAX_UINT16) {
      throw new EncodeError('uint16', value, path);
    }
    data.$writeUInt16(r2z(value));
  },
  $read: function (state) {
    return state.$readUint16();
  }
};

export const uint32Coder: BinaryTypeCoder<number> = {
  $write: function (value, data, path) {
    if (typeof value !== 'number' || value < 0 || value > MAX_UINT32) {
      throw new EncodeError('uint32', value, path);
    }
    data.$writeUInt32(r2z(value));
  },
  $read: function (state) {
    return state.$readUint32();
  }
};

/**
 * Same formats as uintCoder.
 *
 * @see {uintCoder}
 */
export const intCoder: BinaryTypeCoder<number> = {
  $write: function (value, data, path) {
    if (typeof value !== 'number' || value > Number.MAX_SAFE_INTEGER || value < -Number.MAX_SAFE_INTEGER) {
      throw new EncodeError('int', value, path);
    }

    if (value >= -MAX_AUTO_INT8 && value < MAX_AUTO_INT8) {
      data.$writeUInt8(r2z(value) & 0x7f);
    }
    else if (value >= -MAX_AUTO_INT16 && value < MAX_AUTO_INT16) {
      data.$writeUInt16((r2z(value) & 0x3fff) + 0x8000);
    }
    else if (value >= -MAX_AUTO_INT32 && value < MAX_AUTO_INT32) {
      data.$writeUInt32((r2z(value) & 0x1fffffff) + 0xc0000000);
    }
    else {
      const intValue = r2z(value);
      // Split in two 32b uints
      data.$writeUInt32((Math.floor(intValue / POW_32) & 0x1fffffff) + 0xe0000000);
      data.$writeUInt32(intValue >>> 0);
    }
  },
  $read: function (state) {
    let firstByte = state.$peekUInt8(), i: number;

    if (!(firstByte & 0x80)) {
      state.$skipByte();
      return (firstByte & 0x40) ? (firstByte | 0xffffff80) : firstByte;
    }
    else if (!(firstByte & 0x40)) {
      i = state.$readUint16() - 0x8000;
      return (i & 0x2000) ? (i | 0xffffc000) : i;
    }
    else if (!(firstByte & 0x20)) {
      i = state.$readUint32() - 0xc0000000;
      return (i & 0x10000000) ? (i | 0xe0000000) : i;
    }
    else {
      i = state.$readUint32() - 0xe0000000;
      i = (i & 0x10000000) ? (i | 0xe0000000) : i;
      return i * POW_32 + state.$readUint32();
    }
  }
};

export const int8Coder: BinaryTypeCoder<number> = {
  $write: function (value, data, path) {
    if (typeof value !== 'number' || value < -MAX_INT8 || value > MAX_INT8) {
      throw new EncodeError('int8', value, path);
    }
    data.$writeInt8(r2z(value));
  },
  $read: function (state) {
    return state.$readInt8();
  }
};

export const int16Coder: BinaryTypeCoder<number> = {
  $write: function (value, data, path) {
    if (typeof value !== 'number' || value < -MAX_INT16 || value > MAX_INT16) {
      throw new EncodeError('int16', value, path);
    }
    data.$writeInt16(r2z(value));
  },
  $read: function (state) {
    return state.$readInt16();
  }
};

export const int32Coder: BinaryTypeCoder<number> = {
  $write: function (value, data, path) {
    if (typeof value !== 'number' || value < -MAX_INT32 || value > MAX_INT32) {
      throw new EncodeError('int32', value, path);
    }
    data.$writeInt32(r2z(value));
  },
  $read: function (state) {
    return state.$readInt32();
  }
};

/**
 * 16-bit half precision float
 */
export const float16Coder: BinaryTypeCoder<number> = {
  $write: function (value, data, path) {
    if (typeof value !== 'number') {
      throw new EncodeError('number', value, path);
    }
    data.$writeFloat16(value);
  },
  $read: function (state) {
    return state.$readFloat16();
  }
};

/**
 * 32-bit single precision float
 */
export const float32Coder: BinaryTypeCoder<number> = {
  $write: function (value, data, path) {
    if (typeof value !== 'number') {
      throw new EncodeError('number', value, path);
    }
    data.$writeFloat32(value);
  },
  $read: function (state) {
    return state.$readFloat32();
  }
};

/**
 * 64-bit double precision float
 */
export const float64Coder: BinaryTypeCoder<number> = {
  $write: function (value, data, path) {
    if (typeof value !== 'number') {
      throw new EncodeError('number', value, path);
    }
    data.$writeFloat64(value);
  },
  $read: function (state) {
    return state.$readFloat64();
  }
};

/**
 * Scalar between 0.0 and 1.0.
 */
export const uscalarCoder: BinaryTypeCoder<number> = {
  $write: function (value, data, path) {
    if (typeof value !== 'number') {
      throw new EncodeError('number', value, path);
    }
    data.$writeUInt8(toUScalar8(value));
  },
  $read: function (state) {
    return fromUScalar8(state.$readUint8());
  }
};

/**
 * Signed scalar between -1.0 and 1.0.
 */
export const scalarCoder: BinaryTypeCoder<number> = {
  $write: function (value, data, path) {
    if (typeof value !== 'number') {
      throw new EncodeError('number', value, path);
    }
    data.$writeUInt8(toScalar8(value));
  },
  $read: function (state) {
    return fromScalar8(state.$readUint8());
  }
};

/**
 * <uint_length> <buffer_data>
 */
export const stringCoder: BinaryTypeCoder<string> = {
  $write: function (value, data, path) {
    bufferCoder.$write(new TextEncoder().encode(value ?? ''), data, path);
  },
  $read: function (state) {
    return utf8Decoder.decode(bufferCoder.$read(state));
  }
};

/**
 * <uint_length> <buffer_data>
 */
export const bufferCoder: BinaryTypeCoder<ArrayBuffer | ArrayBufferView, Uint8Array> = {
  $write: function (value, data, path) {
    uintCoder.$write(value.byteLength, data, path);
    data.$writeBuffer(value);
  },
  $read: function (state): Uint8Array {
    return state.$readBuffer(uintCoder.$read(state));
  }
};

/**
 * either 0x00 or 0x01
 */
export const boolCoder: BinaryTypeCoder<boolean> = {
  $write: function (value, data) {
    data.$writeUInt8(value ? 1 : 0);
  },
  $read: function (state) {
    return state.$readUint8() !== 0;
  }
};

/**
 * Encode exactly 8 booleans as a UInt8.
 */
export const bools8Coder: BinaryTypeCoder<boolean[]> = {
  $write: function (value, data) {
    data.$writeUInt8($bools2Mask(value, 8));
  },
  $read: function (state) {
    return $mask2Bools(state.$readUint8(), 8);
  }
};

/**
 * Encode exactly 16 booleans as a UInt16.
 */
export const bools16Coder: BinaryTypeCoder<boolean[]> = {
  $write: function (value, data) {
    data.$writeUInt16($bools2Mask(value, 16));
  },
  $read: function (state) {
    return $mask2Bools(state.$readUint16(), 16);
  }
};

/**
 * Encode exactly 32 booleans as a UInt32.
 */
export const bools32Coder: BinaryTypeCoder<boolean[]> = {
  $write: function (value, data) {
    data.$writeUInt32($bools2Mask(value, 32));
  },
  $read: function (state) {
    return $mask2Bools(state.$readUint32(), 32);
  }
};
/**
 * Encode any number of booleans as one or more UInt8s.
 *
 * <padding> <is_last> <payload ...>
 */
export const boolsCoder: BinaryTypeCoder<boolean[]> = {
  $write: function (value, data) {
    for (let i = 0; i < Math.max(1, value.length); i += 6) {
      const last = i + 6 >= value.length;
      const intValue = $vBools2Mask([
        true, // positive padding
        last,
        ...value.slice(i, i + 6)
      ]);

      data.$writeUInt8(intValue);
    }
  },
  $read: function (state) {
    const values: boolean[] = [];
    let last = false;

    while (!last) {
      const chunk = $mask2vBools(state.$readUint8());
      chunk.shift(); // positive padding
      last = chunk.shift();
      values.push(...chunk);
    }

    return values;
  }
};

/**
 * <uint_length> <buffer_data>
 */
export const jsonCoder: BinaryTypeCoder<any> = {
  $write: function (value, data, path) {
    let stringValue: string;
    try {
      stringValue = JSON.stringify(value);
    }
    catch (error) {
      throw new EncodeError('JSON', error, path);
    }

    stringCoder.$write(stringValue, data, path);
  },
  $read: function (state) {
    const stringValue = stringCoder.$read(state);
    return JSON.parse(stringValue);
  }
};

/**
 * <uint_source_length> <buffer_source_data> <flags>
 * flags is a bit-mask: g=1, i=2, m=4
 */
export const regexCoder: BinaryTypeCoder<RegExp> = {
  $write: function (value, data, path) {
    if (!(value instanceof RegExp)) {
      throw new EncodeError('RegExp', value, path);
    }

    let g: number, i: number, m: number;
    stringCoder.$write(value.source, data, path);
    g = value.global ? 1 : 0;
    i = value.ignoreCase ? 2 : 0;
    m = value.multiline ? 4 : 0;
    data.$writeUInt8(g + i + m);
  },
  $read: function (state) {
    const source = stringCoder.$read(state),
      flags = state.$readUint8(),
      g = flags & 0x1 ? 'g' : '',
      i = flags & 0x2 ? 'i' : '',
      m = flags & 0x4 ? 'm' : '';
    return new RegExp(source, g + i + m);
  }
};

/**
 * <uint_time_ms>
 */
export const dateCoder: BinaryTypeCoder<Date> = {
  $write: function (value, data, path) {
    if (!(value instanceof Date)) {
      throw new EncodeError('Date', value, path);
    }
    else {
      const time = value.getTime();
      if (isNaN(time)) {
        throw new EncodeError('Date', 'NaN', path);
      }
      intCoder.$write(time, data, path);
    }
  },
  $read: function (state) {
    return new Date(intCoder.$read(state));
  }
};

/**
 * Array of coders, indexed by type
 */
export const CODERS: Record<Type, BinaryTypeCoder<any>> = [
  uintCoder, // Type.UInt
  uint8Coder, // Type.UInt8
  uint16Coder, // Type.UInt16
  uint32Coder, // Type.UInt32
  intCoder, // Type.Int
  int8Coder, // Type.Int8
  int16Coder, // Type.Int16
  int32Coder, // Type.Int32
  float64Coder, // Type.Float64
  float32Coder, // Type.Float32
  float16Coder, // Type.Float16
  scalarCoder, // Type.Scalar
  uscalarCoder, // Type.UScalar
  boolCoder, // Type.Bool
  boolsCoder, // Type.Bools
  bools8Coder, // Type.Bools8
  bools16Coder, // Type.Bools16
  bools32Coder, // Type.Bools32
  stringCoder, // Type.String
  bufferCoder, // Type.Buffer
  jsonCoder, // Type.JSON
  regexCoder, // Type.RegExp
  dateCoder, // Type.Date
];

import { BufferWriter } from './BufferWriter';
import { BufferReader } from './BufferReader';
import { $floor } from './math';
import {
  $fromuscal8,
  $fromscal8,
  $touscal8,
  $toscal8
} from './scalar';
import { Type } from '../Type';
import { mask, unmask } from './bitmask';
import { $utf8decode, $utf8encode } from './utf8';

// Pre-calculated constants
const MAX_VARUINT8 = 128,
  MAX_VARUINT16 = 16_384,
  MAX_VARUINT32 = 536_870_912,
  MAX_VARINT8 = 64,
  MAX_VARINT16 = 8_192,
  MAX_VARINT32 = 268_435_456,
  POW_32 = 0x100000000;

export interface BinaryTypeCoder<T, R = T> {
  $write(value: T, data: BufferWriter, path?: string): void;
  $read(state: BufferReader): R;
}

/**
 * Formats (big-endian):
 * 7b   0xxx xxxx
 * 14b  10xx xxxx  xxxx xxxx
 * 29b  110x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 * 61b  111x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 */
export const uintCoder: BinaryTypeCoder<number> = {
  $write: (value, data) => {
    if (value < MAX_VARUINT8) {
      data.$writeUInt8(value);
    }
    else if (value < MAX_VARUINT16) {
      data.$writeUInt16(value + 0x8000);
    }
    else if (value < MAX_VARUINT32) {
      data.$writeUInt32(value + 0xc0000000);
    }
    else {
      data.$writeUInt32($floor(value / POW_32) + 0b11100000000000000000000000000000);
      data.$writeUInt32(value >>> 0);
    }
  },
  $read: (state) => {
    const firstByte = state.$peek();

    if (!(firstByte & 0b10000000)) {
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
  $write: (value, data, path) => {
    data.$writeUInt8(value);
  },
  $read: (state) => {
    return state.$readUint8();
  }
};

export const uint16Coder: BinaryTypeCoder<number> = {
  $write: (value, data) => {
    data.$writeUInt16(value);
  },
  $read: (state) => {
    return state.$readUint16();
  }
};

export const uint32Coder: BinaryTypeCoder<number> = {
  $write: (value, data) => {
    data.$writeUInt32(value);
  },
  $read: (state) => {
    return state.$readUint32();
  }
};

/**
 * Same formats as uintCoder.
 *
 * @see {uintCoder}
 */
export const intCoder: BinaryTypeCoder<number> = {
  $write: (value, data) => {
    if (value >= -MAX_VARINT8 && value < MAX_VARINT8) {
      data.$writeUInt8(value & 0x7f);
    }
    else if (value >= -MAX_VARINT16 && value < MAX_VARINT16) {
      data.$writeUInt16((value & 0x3fff) + 0x8000);
    }
    else if (value >= -MAX_VARINT32 && value < MAX_VARINT32) {
      data.$writeUInt32((value & 0x1fffffff) + 0xc0000000);
    }
    else {
      const intValue = value;
      // Split in two 32b uints
      data.$writeUInt32(($floor(intValue / POW_32) & 0x1fffffff) + 0xe0000000);
      data.$writeUInt32(intValue >>> 0);
    }
  },
  $read: (state) => {
    let firstByte = state.$peek(), i: number;

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
  $write: (value, data, path) => data.$writeInt8(value),
  $read: (state) => state.$readInt8(),
};

export const int16Coder: BinaryTypeCoder<number> = {
  $write: (value, data, path) => data.$writeInt16(value),
  $read: (state) => state.$readInt16(),
};

export const int32Coder: BinaryTypeCoder<number> = {
  $write: (value, data, path) => data.$writeInt32(value),
  $read: (state) => state.$readInt32(),
};

export const float16Coder: BinaryTypeCoder<number> = {
  $write: (value, data, path) => data.$writeFloat16(value),
  $read: (state) => state.$readFloat16(),
};

export const float32Coder: BinaryTypeCoder<number> = {
  $write: (value, data, path) => data.$writeFloat32(value),
  $read: (state) => state.$readFloat32(),
};

export const float64Coder: BinaryTypeCoder<number> = {
  $write: (value, data, path) => data.$writeFloat64(value),
  $read: (state) => state.$readFloat64(),
};

export const uscalarCoder: BinaryTypeCoder<number> = {
  $write: (value, data, path) => data.$writeUInt8($touscal8(value)),
  $read: (state) => $fromuscal8(state.$readUint8()),
};

export const scalarCoder: BinaryTypeCoder<number> = {
  $write: (value, data, path) => data.$writeUInt8($toscal8(value)),
  $read: (state) => $fromscal8(state.$readUint8()),
};

export const dateCoder: BinaryTypeCoder<Date> = {
  $write: (value, data, path) => intCoder.$write(value.getTime(), data, path),
  $read: (state) => new Date(intCoder.$read(state)),
};

export const stringCoder: BinaryTypeCoder<string> = {
  $write: (value, data, path) => {
    bufferCoder.$write($utf8encode(value), data, path);
  },
  $read: (state) => {
    return $utf8decode(bufferCoder.$read(state));
  }
};

export const bufferCoder: BinaryTypeCoder<ArrayBuffer | ArrayBufferView, Uint8Array> = {
  $write: (value, data, path) => {
    uintCoder.$write(value.byteLength, data, path);
    data.$writeBuffer(value);
  },
  $read: (state) => state.$readBuffer(uintCoder.$read(state)),
};

export const boolCoder: BinaryTypeCoder<boolean> = {
  $write: (value, data) => data.$writeUInt8(value ? 1 : 0),
  $read: (state) => state.$readUint8() !== 0,
};

export const boolsCoder: BinaryTypeCoder<boolean[]> = {
  $write: (value, data) => uintCoder.$write(mask(value), data),
  $read: (state) => unmask(uintCoder.$read(state)),
};

export const jsonCoder: BinaryTypeCoder<any> = {
  $write: (value, data, path) => stringCoder.$write(JSON.stringify(value), data, path),
  $read: (state) => JSON.parse(stringCoder.$read(state)),
};

export const regexCoder: BinaryTypeCoder<RegExp> = {
  $write: (value, data, path) => {
    data.$writeUInt8(mask([value.global, value.ignoreCase, value.multiline]));
    stringCoder.$write(value.source, data, path);
  },
  $read: (state) => {
    const [g, i, m] = unmask(state.$readUint8());
    return new RegExp(stringCoder.$read(state), (g ? 'g' : '') + (i ? 'i' : '') + (m ? 'm' : ''));
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
  stringCoder, // Type.String
  bufferCoder, // Type.Buffer
  jsonCoder, // Type.JSON
  regexCoder, // Type.RegExp
  dateCoder, // Type.Date
];

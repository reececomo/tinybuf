import { BufferWriter } from './BufferWriter';
import { BufferReader } from './BufferReader';
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
  $write(value: T, writer: BufferWriter): void;
  $read(reader: BufferReader): R;
}

/**
 * Formats (big-endian):
 * 7b   0xxx xxxx
 * 14b  10xx xxxx  xxxx xxxx
 * 29b  110x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 * 61b  111x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 */
export const uintCoder: BinaryTypeCoder<number> = {
  $write: function (value, writer) {
    if (value < MAX_VARUINT8) {
      writer.$writeUInt8(value);
    }
    else if (value < MAX_VARUINT16) {
      writer.$writeUInt16(value + 0x8000);
    }
    else if (value < MAX_VARUINT32) {
      writer.$writeUInt32(value + 0xc0000000);
    }
    else {
      writer.$writeUInt32(Math.floor(value / POW_32) + 0xe0000000);
      writer.$writeUInt32(value >>> 0);
    }
  },
  $read: (reader) => {
    const firstByte = reader.$peek();

    if (!(firstByte & 0x80)) {
      reader.$skipByte();
      return firstByte;
    }
    else if (!(firstByte & 0x40)) {
      return reader.$readUint16() - 0x8000;
    }
    else if (!(firstByte & 0x20)) {
      return reader.$readUint32() - 0xc0000000;
    }

    return (reader.$readUint32() - 0xe0000000) * POW_32
      + reader.$readUint32();
  }
};

export const uint8Coder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeUInt8(value),
  $read: (reader) => reader.$readUint8(),
};

export const uint16Coder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeUInt16(value),
  $read: (reader) => reader.$readUint16(),
};

export const uint32Coder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeUInt32(value),
  $read: (reader) => reader.$readUint32(),
};

/**
 * Same formats as uintCoder.
 *
 * @see {uintCoder}
 */
export const intCoder: BinaryTypeCoder<number> = {
  $write: function (value, writer) {
    if (value >= -MAX_VARINT8 && value < MAX_VARINT8) {
      writer.$writeUInt8(value & 0x7f);
    }
    else if (value >= -MAX_VARINT16 && value < MAX_VARINT16) {
      writer.$writeUInt16((value & 0x3fff) + 0x8000);
    }
    else if (value >= -MAX_VARINT32 && value < MAX_VARINT32) {
      writer.$writeUInt32((value & 0x1fffffff) + 0xc0000000);
    }
    else {
      const intValue = value;
      // Split in two 32b uints
      writer.$writeUInt32((Math.floor(intValue / POW_32) & 0x1fffffff) + 0xe0000000);
      writer.$writeUInt32(intValue >>> 0);
    }
  },
  $read: (reader) => {
    let firstByte = reader.$peek(), i: number;

    if (!(firstByte & 0x80)) {
      reader.$skipByte();
      return (firstByte & 0x40) ? (firstByte | 0xffffff80) : firstByte;
    }
    else if (!(firstByte & 0x40)) {
      i = reader.$readUint16() - 0x8000;
      return (i & 0x2000) ? (i | 0xffffc000) : i;
    }
    else if (!(firstByte & 0x20)) {
      i = reader.$readUint32() - 0xc0000000;
      return (i & 0x10000000) ? (i | 0xe0000000) : i;
    }
    else {
      i = reader.$readUint32() - 0xe0000000;
      i = (i & 0x10000000) ? (i | 0xe0000000) : i;
      return i * POW_32 + reader.$readUint32();
    }
  }
};

export const int8Coder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeInt8(value),
  $read: (reader) => reader.$readInt8(),
};

export const int16Coder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeInt16(value),
  $read: (reader) => reader.$readInt16(),
};

export const int32Coder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeInt32(value),
  $read: (reader) => reader.$readInt32(),
};

export const float16Coder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeFloat16(value),
  $read: (reader) => reader.$readFloat16(),
};

export const float32Coder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeFloat32(value),
  $read: (reader) => reader.$readFloat32(),
};

export const float64Coder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeFloat64(value),
  $read: (reader) => reader.$readFloat64(),
};

export const uscalarCoder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeUInt8($touscal8(value)),
  $read: (reader) => $fromuscal8(reader.$readUint8()),
};

export const scalarCoder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeUInt8($toscal8(value)),
  $read: (reader) => $fromscal8(reader.$readUint8()),
};

export const dateCoder: BinaryTypeCoder<Date> = {
  $write: (value, writer) => intCoder.$write(value.getTime(), writer),
  $read: (reader) => new Date(intCoder.$read(reader)),
};

export const stringCoder: BinaryTypeCoder<string> = {
  $write: function (value, writer) {
    bufferCoder.$write($utf8encode(value), writer);
  },
  $read: (reader) => {
    return $utf8decode(bufferCoder.$read(reader));
  }
};

export const bufferCoder: BinaryTypeCoder<ArrayBuffer | ArrayBufferView, Uint8Array> = {
  $write: function (value, writer) {
    uintCoder.$write(value.byteLength, writer);
    writer.$writeBuffer(value);
  },
  $read: (reader) => reader.$readBuffer(uintCoder.$read(reader)),
};

export const boolCoder: BinaryTypeCoder<boolean> = {
  $write: (value, writer) => writer.$writeUInt8(value ? 1 : 0),
  $read: (reader) => reader.$readUint8() !== 0,
};

export const boolsCoder: BinaryTypeCoder<boolean[]> = {
  $write: (value, writer) => uintCoder.$write(mask(value), writer),
  $read: (reader) => unmask(uintCoder.$read(reader)),
};

export const jsonCoder: BinaryTypeCoder<any> = {
  $write: (value, writer) => stringCoder.$write(JSON.stringify(value), writer),
  $read: (reader) => JSON.parse(stringCoder.$read(reader)),
};

export const regexCoder: BinaryTypeCoder<RegExp> = {
  $write: function (value, writer) {
    writer.$writeUInt8(mask([value.global, value.ignoreCase, value.multiline]));
    stringCoder.$write(value.source, writer);
  },
  $read: (reader) => {
    const [g, i, m] = unmask(reader.$readUint8());
    return new RegExp(stringCoder.$read(reader), (g ? 'g' : '') + (i ? 'i' : '') + (m ? 'm' : ''));
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

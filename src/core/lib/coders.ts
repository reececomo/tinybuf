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
import { $floor } from './math';
import { $fromf16, $tof16 } from './float16';

// Pre-calculated constants
const MAX_VARUINT8 = 128,
  MAX_VARUINT16 = 16_384,
  MAX_VARUINT32 = 536_870_912,
  MAX_VARINT8 = 64,
  MAX_VARINT16 = 8_192,
  MAX_VARINT32 = 268_435_456,
  POW_32 = 0x100000000;

type WriterFn<T> = (value: T, writer: BufferWriter) => void;
type ReaderFn<T> = (reader: BufferReader) => T;

export interface BinaryTypeCoder<T, R = T> {
  $write: WriterFn<T>;
  $read: ReaderFn<R>;
}

/**
 * Format (big-endian):
 * 7b   0xxx xxxx
 * 14b  10xx xxxx  xxxx xxxx
 * 29b  110x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 * 61b  111x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 */
export const uintCoder: BinaryTypeCoder<number> = {
  $write: (value, writer) => {
    if (value < MAX_VARUINT8) {
      writer.$writeUint8(value);
    }
    else if (value < MAX_VARUINT16) {
      writer.$writeUint16(value + 0x8000);
    }
    else if (value < MAX_VARUINT32) {
      writer.$writeUint32(value + 0xc0000000);
    }
    else {
      writer.$writeUint32($floor(value / POW_32) + 0xe0000000);
      writer.$writeUint32(value >>> 0);
    }
  },
  $read: (reader) => {
    const firstByte = reader.$peek();

    if (!(firstByte & 0x80)) {
      reader.$skip();
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
  $write: (value, writer) => writer.$writeUint8(value),
  $read: (reader) => reader.$readUint8(),
};

export const uint16Coder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeUint16(value),
  $read: (reader) => reader.$readUint16(),
};

export const uint32Coder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeUint32(value),
  $read: (reader) => reader.$readUint32(),
};

/**
 * Format (big-endian):
 * 7b   0xxx xxxx
 * 14b  10xx xxxx  xxxx xxxx
 * 29b  110x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 * 61b  111x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 */
export const intCoder: BinaryTypeCoder<number> = {
  $write: (value, writer) => {
    if (value >= -MAX_VARINT8 && value < MAX_VARINT8) {
      writer.$writeUint8(value & 0x7f);
    }
    else if (value >= -MAX_VARINT16 && value < MAX_VARINT16) {
      writer.$writeUint16((value & 0x3fff) + 0x8000);
    }
    else if (value >= -MAX_VARINT32 && value < MAX_VARINT32) {
      writer.$writeUint32((value & 0x1fffffff) + 0xc0000000);
    }
    else {
      const intValue = value;
      // Split in two 32b uints
      writer.$writeUint32(($floor(intValue / POW_32) & 0x1fffffff) + 0xe0000000);
      writer.$writeUint32(intValue >>> 0);
    }
  },
  $read: (reader) => {
    let firstByte = reader.$peek(), i: number;

    if (!(firstByte & 0x80)) {
      reader.$skip();
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
  $write: (value, writer) => writer.$writeUint16($tof16(value)),
  $read: (reader) => $fromf16(reader.$readUint16()),
};

export const float32Coder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeFloat32(value),
  $read: (reader) => reader.$readFloat32(),
};

export const float64Coder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeFloat64(value),
  $read: (reader) => reader.$readFloat64(),
};

export const uscalar8Coder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeUint8($touscal8(value)),
  $read: (reader) => $fromuscal8(reader.$readUint8()),
};

export const scalar8Coder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeUint8($toscal8(value)),
  $read: (reader) => $fromscal8(reader.$readUint8()),
};

export const dateCoder: BinaryTypeCoder<Date> = {
  $write: (value, writer) => intCoder.$write(value.getTime(), writer),
  $read: (reader) => new Date(intCoder.$read(reader)),
};

export const stringCoder: BinaryTypeCoder<string> = {
  $write: (value, writer) => {
    const bytes = $utf8encode(value ?? '');
    bufferCoder.$write(bytes, writer);
  },
  $read: (reader) => {
    const bytes = bufferCoder.$read(reader);
    return $utf8decode(bytes);
  },
};

export const bufferCoder: BinaryTypeCoder<ArrayBuffer | ArrayBufferView, Uint8Array> = {
  $write: (value, writer) => {
    if (value.byteLength == null) throw new Error(`not a buffer (reason 2:  ${value} ${value.constructor})`);
    if (!(value instanceof ArrayBuffer) && !ArrayBuffer.isView(value)) throw new Error(`not a buffer (reason 1) ${value} ${(value as any).constructor}`);
    uintCoder.$write(value.byteLength, writer); // header byte (length)
    writer.$writeBytes(value);
  },
  $read: (reader) => {
    const bytes = uintCoder.$read(reader);
    return reader.$readBytes(bytes);
  },
};

export const boolCoder: BinaryTypeCoder<boolean> = {
  $write: (value, writer) => writer.$writeUint8(value ? 1 : 0),
  $read: (reader) => reader.$readUint8() !== 0,
};

export const boolsCoder: BinaryTypeCoder<boolean[]> = {
  $write: (value, writer) => {
    if (value.length > 28) value = value.slice(0, 28); // stored as UInt
    uintCoder.$write(mask(value), writer);
  },
  $read: (reader) => unmask(uintCoder.$read(reader)),
};

export const jsonCoder: BinaryTypeCoder<any> = {
  $write: (value, writer) => stringCoder.$write(JSON.stringify(value), writer),
  $read: (reader) => JSON.parse(stringCoder.$read(reader)),
};

export const regexCoder: BinaryTypeCoder<RegExp> = {
  $write: (value, writer) => {
    writer.$writeUint8(mask([value.global, value.ignoreCase, value.multiline]));
    stringCoder.$write(value.source, writer);
  },
  $read: (reader) => {
    const [g, i, m] = unmask(reader.$readUint8());
    return new RegExp(stringCoder.$read(reader), (g ? 'g' : '') + (i ? 'i' : '') + (m ? 'm' : ''));
  }
};

/** @see {Type} indices must match */
export const writers: Record<Type, WriterFn<any>> = [
  uintCoder.$write, // Type.UInt
  uint8Coder.$write, // Type.UInt8
  uint16Coder.$write, // Type.UInt16
  uint32Coder.$write, // Type.UInt32
  intCoder.$write, // Type.Int
  int8Coder.$write, // Type.Int8
  int16Coder.$write, // Type.Int16
  int32Coder.$write, // Type.Int32
  float64Coder.$write, // Type.Float64
  float32Coder.$write, // Type.Float32
  float16Coder.$write, // Type.Float16
  scalar8Coder.$write, // Type.Scalar
  uscalar8Coder.$write, // Type.UScalar
  boolCoder.$write, // Type.Bool
  boolsCoder.$write, // Type.Bools
  bufferCoder.$write, // Type.Buffer
  stringCoder.$write, // Type.String
  jsonCoder.$write, // Type.JSON
  regexCoder.$write, // Type.RegExp
  dateCoder.$write, // Type.Date
];

/** @see {Type} indices must match */
export const readers: Record<Type, ReaderFn<any>> = [
  uintCoder.$read, // Type.UInt
  uint8Coder.$read, // Type.UInt8
  uint16Coder.$read, // Type.UInt16
  uint32Coder.$read, // Type.UInt32
  intCoder.$read, // Type.Int
  int8Coder.$read, // Type.Int8
  int16Coder.$read, // Type.Int16
  int32Coder.$read, // Type.Int32
  float64Coder.$read, // Type.Float64
  float32Coder.$read, // Type.Float32
  float16Coder.$read, // Type.Float16
  scalar8Coder.$read, // Type.Scalar
  uscalar8Coder.$read, // Type.UScalar
  boolCoder.$read, // Type.Bool
  boolsCoder.$read, // Type.Bools
  bufferCoder.$read, // Type.Buffer
  stringCoder.$read, // Type.String
  jsonCoder.$read, // Type.JSON
  regexCoder.$read, // Type.RegExp
  dateCoder.$read, // Type.Date
];

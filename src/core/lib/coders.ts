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
import { $frombf16, $tobf16 } from './bfloat16';

// Pre-calculated constants
const MAX_VARUINT8 = 128,
  MAX_VARUINT16 = 16_384,
  MAX_VARUINT32 = 536_870_912,
  MAX_VARINT8 = 64,
  MAX_VARINT16 = 8_192,
  MAX_VARINT32 = 268_435_456,
  POW_32 = 0x100000000;

type WriterFn<W> = (value: W, writer: BufferWriter) => void;
type ReaderFn<R> = (reader: BufferReader, overwrite?: Partial<R>) => R;

export interface BinaryTypeCoder<W, R = W> {
  $write: WriterFn<W>;
  $read: ReaderFn<R>;
}

/**
 * Format (big-endian):
 * 7b   0xxxxxxx
 * 14b  10xxxxxx xxxxxxxx
 * 29b  110xxxxx xxxxxxxx xxxxxxxx xxxxxxxx
 * 61b  111xxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx
 */
export const uintCoder: BinaryTypeCoder<number> = {
  $write: (value, writer) => {
    if (typeof value !== 'number') value = Number(value);
    if (value < 0) value = 0;
    if (value < MAX_VARUINT8) writer.$writeUint8(value);
    else if (value < MAX_VARUINT16) writer.$writeUint16(value + 0x8000);
    else if (value < MAX_VARUINT32) writer.$writeUint32(value + 0xc0000000);
    else if (value >= MAX_VARUINT32) {
      writer.$writeUint32($floor(value / POW_32) + 0xe0000000);
      writer.$writeUint32(value >>> 0);
    }
    else {
      // coercion case
      writer.$writeUint8(value as any === true ? 1 : 0);
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
 * 7b   0xxxxxxx
 * 14b  10xxxxxx xxxxxxxx
 * 29b  110xxxxx xxxxxxxx xxxxxxxx xxxxxxxx
 * 61b  111xxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx
 */
export const intCoder: BinaryTypeCoder<number> = {
  $write: (value, writer) => {
    if (typeof value !== 'number') value = Number(value);
    if (value >= -MAX_VARINT8 && value < MAX_VARINT8) writer.$writeUint8(value & 0x7f);
    else if (value >= -MAX_VARINT16 && value < MAX_VARINT16) writer.$writeUint16((value & 0x3fff) + 0x8000);
    else if (value >= -MAX_VARINT32 && value < MAX_VARINT32) writer.$writeUint32((value & 0x1fffffff) + 0xc0000000);
    else if (value < -MAX_VARINT32 || value >= MAX_VARINT32) {
      // Split in two 32b uints
      writer.$writeUint32(($floor(value / POW_32) & 0x1fffffff) + 0xe0000000);
      writer.$writeUint32(value >>> 0);
    }
    else {
      // coercion case
      writer.$writeUint8(value as any === true ? 0x7f : 0);
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

export const bfloat16Coder: BinaryTypeCoder<number> = {
  $write: (value, writer) => writer.$writeUint16($tobf16(value)),
  $read: (reader) => $frombf16(reader.$readUint16()),
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

export const bufferCoder: BinaryTypeCoder<ArrayBuffer | ArrayBufferView, Uint8Array> = {
  $write: (value, writer) => {
    uintCoder.$write(value.byteLength, writer); // prefix length
    writer.$writeBytes(value);
  },
  $read: (reader) => reader.$readBytes(uintCoder.$read(reader)),
};

export const stringCoder: BinaryTypeCoder<string> = {
  $write: (value, writer) => bufferCoder.$write($utf8encode(value), writer),
  $read: (reader) => $utf8decode(bufferCoder.$read(reader)),
};

export const boolCoder: BinaryTypeCoder<boolean> = {
  $write: (value, writer) => writer.$writeUint8(value ? 1 : 0),
  $read: (reader) => reader.$readUint8() !== 0,
};

export const boolsCoder: BinaryTypeCoder<boolean[]> = {
  $write: (value, writer) => {
    if (value.length > 28) value = value.slice(0, 28); // drop additional
    uintCoder.$write(mask(value), writer);
  },
  $read: (reader, p) => unmask(uintCoder.$read(reader), p),
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
  uintCoder.$write,
  uint8Coder.$write,
  uint16Coder.$write,
  uint32Coder.$write,
  intCoder.$write,
  int8Coder.$write,
  int16Coder.$write,
  int32Coder.$write,
  float64Coder.$write,
  float32Coder.$write,
  float16Coder.$write,
  bfloat16Coder.$write,
  scalar8Coder.$write,
  uscalar8Coder.$write,
  boolCoder.$write,
  boolsCoder.$write,
  bufferCoder.$write,
  stringCoder.$write,
  jsonCoder.$write,
  regexCoder.$write,
  dateCoder.$write,
];

/** @see {Type} indices must match */

export const readers: Record<Type, ReaderFn<any>> = [
  uintCoder.$read,
  uint8Coder.$read,
  uint16Coder.$read,
  uint32Coder.$read,
  intCoder.$read,
  int8Coder.$read,
  int16Coder.$read,
  int32Coder.$read,
  float64Coder.$read,
  float32Coder.$read,
  float16Coder.$read,
  bfloat16Coder.$read,
  scalar8Coder.$read,
  uscalar8Coder.$read,
  boolCoder.$read,
  boolsCoder.$read,
  bufferCoder.$read,
  stringCoder.$read,
  jsonCoder.$read,
  regexCoder.$read,
  dateCoder.$read,
];

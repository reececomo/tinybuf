import { BufferWriter } from '../core/lib/BufferWriter';
import { BufferReader } from '../core/lib/BufferReader';
import { BinaryTypeCoder } from '../core/lib/coders';
import * as coders from '../core/lib/coders';

import { uintData } from './data/uint';
import { intData } from './data/int';
import { WriteTypeError } from '../core/lib/errors';

describe('coders', () => {
  describe('uintCoder', () => {
    const coder = coders.uintCoder;

    it('should handle valid values', () => {
      Object.keys(uintData).forEach(function (rawValue) {
        const value = Number(rawValue);

        const encoded = _writeAndReturnArrayBuffer(coder, value);
        const expected = uintData[value];
        expect(arrayBufferToHexString(encoded)).toEqual(expected.hex);
        expect(`${value}: ${encoded.byteLength}`).toEqual(`${value}: ${expected.bytes}`);

        const decoded: number = _readArrayBuffer(coder, encoded);
        expect(decoded).toEqual(value);
      });
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, -1)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, Number.MAX_SAFE_INTEGER + 1)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, '1' as any)).toThrow(WriteTypeError);
    });
  });

  describe('intCoder', () => {
    const coder = coders.intCoder;

    it('should handle valid values', () => {
      Object.keys(intData).forEach(function (rawValue) {
        const value = Number(rawValue);

        const encoded = _writeAndReturnArrayBuffer(coder, value);
        const expected = intData[value];
        expect(arrayBufferToHexString(encoded)).toEqual(expected.hex);
        expect(`${value}: ${encoded.byteLength}`).toEqual(`${value}: ${expected.bytes}`);

        const decoded: number = _readArrayBuffer(coder, encoded);
        expect(decoded).toEqual(value);
      });
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, Number.MAX_SAFE_INTEGER + 1)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, '1' as any)).toThrow(WriteTypeError);
    });
  });

  describe('int8Coder', () => {
    const coder = coders.int8Coder;

    it('should handle valid values', () => {
      [0, 1, 2, 100, 127, -1, -2, -100, -127].forEach((value: number): void => {
        const encoded = _writeAndReturnArrayBuffer(coder, value);
        expect(encoded.byteLength).toBe(1);
        const decoded: number = _readArrayBuffer(coder, encoded);
        expect(decoded).toEqual(value);
      });
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, 128)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, -128)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, '1' as any)).toThrow(WriteTypeError);
    });
  });

  describe('int16Coder', () => {
    const coder = coders.int16Coder;

    it('should handle valid values', () => {
      [0, 1, -1, 128, -128, 32_767, -32_767].forEach((value: number): void => {
        const encoded = _writeAndReturnArrayBuffer(coder, value);
        expect(encoded.byteLength).toBe(2);
        const decoded: number = _readArrayBuffer(coder, encoded);
        expect(decoded).toEqual(value);
      });
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, 32_768)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, -32_768)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, '1' as any)).toThrow(WriteTypeError);
    });
  });

  describe('int32Coder', () => {
    const coder = coders.int32Coder;

    it('should handle valid values', () => {
      [0, 1, -1, 32_767, -32_767, 32_768, -2_147_483_647, 2_147_483_647].forEach((value: number): void => {
        const encoded = _writeAndReturnArrayBuffer(coder, value);
        expect(encoded.byteLength).toBe(4);
        const decoded: number = _readArrayBuffer(coder, encoded);
        expect(decoded).toEqual(value);
      });
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, 2_147_483_648)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, -2_147_483_648)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, '1' as any)).toThrow(WriteTypeError);
    });
  });

  describe('uint8Coder', () => {
    const coder = coders.uint8Coder;

    it('should handle valid values', () => {
      [0, 1, 2, 100, 127, 254, 255].forEach((value: number): void => {
        const encoded = _writeAndReturnArrayBuffer(coder, value);
        expect(encoded.byteLength).toBe(1);
        const decoded: number = _readArrayBuffer(coder, encoded);
        expect(decoded).toEqual(value);
      });
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, 256)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, -1)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, '1' as any)).toThrow(WriteTypeError);
    });
  });

  describe('uint16Coder', () => {
    const coder = coders.uint16Coder;

    it('should handle valid values', () => {
      [0, 256, 65_535].forEach((value: number): void => {
        const encoded = _writeAndReturnArrayBuffer(coder, value);
        expect(encoded.byteLength).toBe(2);
        const decoded: number = _readArrayBuffer(coder, encoded);
        expect(decoded).toEqual(value);
      });
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, 65_536)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, -1)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, '1' as any)).toThrow(WriteTypeError);
    });
  });

  describe('uint32Coder', () => {
    const coder = coders.uint32Coder;

    it('should handle valid values', () => {
      [0, 255, 65_536, 4_294_967_295].forEach((value: number): void => {
        const encoded = _writeAndReturnArrayBuffer(coder, value);
        expect(encoded.byteLength).toBe(4);
        const decoded: number = _readArrayBuffer(coder, encoded);
        expect(decoded).toEqual(value);
      });
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, 4_294_967_296)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, -1)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, '1' as any)).toThrow(WriteTypeError);
    });
  });

  describe('float16Coder', () => {
    const coder = coders.float16Coder;

    it('should handle valid values', () => {
      check(coder, 0);
      check(coder, -0.5);
      check(coder, 0.5);
      check(coder, 1);
      check(coder, -1);
      check(coder, 3.1419, 3.142578125);
      check(coder, -3.1419, -3.142578125);
      check(coder, Infinity);
      check(coder, -Infinity);
      check(coder, 1 / Infinity);
      check(coder, -1 / Infinity);
      check(coder, NaN);
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, '1' as any)).toThrow(WriteTypeError);
    });
  });

  describe('float32Coder', () => {
    const coder = coders.float32Coder;

    it('should handle valid values', () => {
      check(coder, 0);
      check(coder, -0.5);
      check(coder, 0.5);
      check(coder, 1);
      check(coder, -1);
      check(coder, 3.1419, 3.141900062561035);
      check(coder, -3.1419, -3.141900062561035);
      check(coder, Infinity);
      check(coder, -Infinity);
      check(coder, 1 / Infinity);
      check(coder, -1 / Infinity);
      check(coder, NaN);
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, '1' as any)).toThrow(WriteTypeError);
    });
  });

  describe('float64Coder', () => {
    const coder = coders.float64Coder;

    it('should handle valid values', () => {
      check(coder, 0);
      check(coder, 3.14);
      check(coder, -Math.E);
      check(coder, Infinity);
      check(coder, -Infinity);
      check(coder, 1 / Infinity);
      check(coder, -1 / Infinity);
      check(coder, NaN);
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, '1' as any)).toThrow(WriteTypeError);
    });
  });

  describe('scalarCoder', () => {
    const coder = coders.uscalarCoder;

    it('should handle valid values', () => {
      check(coder, 0);
      check(coder, 0.22, 0.22);
      check(coder, 0.23, 0.23);
      check(coder, 0.25, 0.25);
      check(coder, 0.5, 0.5);
      check(coder, 0.75, 0.75);
      check(coder, 0.77, 0.77);
      check(coder, 0.78, 0.78);
      check(coder, 1);
      check(coder, -0.1, 0);
      check(coder, 1.1, 1);
      check(coder, Infinity, 1);
      check(coder, -Infinity, 0);
      check(coder, NaN, NaN);
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, '1' as any)).toThrow(WriteTypeError);
    });
  });

  describe('signedScalarCoder', () => {
    const coder = coders.scalarCoder;

    it('should handle valid values', () => {
      check(coder, -1);
      check(coder, -0.75, -0.75);
      check(coder, -0.5, -0.5);
      check(coder, -0.25, -0.25);
      check(coder, -0.22, -0.22);
      check(coder, 0);
      check(coder, 0.25, 0.25);
      check(coder, 0.25, 0.25);
      check(coder, 0.5, 0.5);
      check(coder, 0.75, 0.75);
      check(coder, 1);
      check(coder, -1.1, -1);
      check(coder, 1.1, 1);
      check(coder, Infinity, 1);
      check(coder, -Infinity, -1);
      check(coder, NaN, NaN);
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, '1' as any)).toThrow(WriteTypeError);
    });
  });

  describe('stringCoder', () => {
    const coder = coders.stringCoder;

    it('should handle valid values', () => {
      check(coder, '');
      check(coder, 'Hello World');
      check(coder, '\u0000 Ūnĭcōde \uD83D\uDC04');
    });
  });

  describe('bufferCoder', () => {
    const coder = coders.bufferCoder;

    it('should handle valid values', () => {
      const exampleArrayBuffer = new ArrayBuffer(6);
      const exampleDataView = new DataView(exampleArrayBuffer);
      const exampleUint8View = new Uint8Array(exampleArrayBuffer);
      for (const [i, value] of [3, 14, 15, 92, 65, 35].entries()) {
        exampleDataView.setUint8(i, value);
      }
      const exampleFreshUint8s = new Uint8Array([3, 14, 15, 92, 65, 35]);

      const expected = new Uint8Array([3, 14, 15, 92, 65, 35]);

      check(coder, exampleArrayBuffer, expected);
      check(coder, exampleDataView.buffer, expected);
      check(coder, exampleUint8View.buffer, expected);
      check(coder, exampleFreshUint8s, expected);
      check(coder, exampleFreshUint8s.buffer, expected);
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, 1 as any)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, 'abcdefg' as any)).toThrow(WriteTypeError);
    });
  });

  describe('booleanCoder', () => {
    const coder = coders.booleanCoder;

    it('should handle valid values', () => {
      check(coder, true);
      check(coder, false);
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, 0 as any)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, 1 as any)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, undefined)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, 'abcdefg' as any)).toThrow(WriteTypeError);
    });
  });

  describe('booleanArrayCoder', () => {
    const coder = coders.booleanArrayCoder;

    it('should handle valid values', () => {
      check(coder, []);
      check(coder, [true, false, true]);
      check(coder, [false, true, false]);
      check(coder, [false, true, false, true, true, false, true, false, true]);
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, 0 as any)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, 1 as any)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, [0, 1, 0] as any)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, 'abcdefg' as any)).toThrow(WriteTypeError);
    });
  });

  describe('bitmask8Coder', () => {
    const coder = coders.bitmask8Coder;

    it('should handle valid values', () => {
      check(
        coder,
        [],
        [false, false, false, false, false, false, false, false]
      );
      check(
        coder,
        [false, true],
        [false, true, false, false, false, false, false, false]
      );
      check(
        coder,
        [true, true],
        [true, true, false, false, false, false, false, false]
      );
      check(
        coder,
        [false, true, false, true, true, false, true, false, true],
        [false, true, false, true, true, false, true, false]
      );
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, 0 as any)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, 1 as any)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, [0, 1, 0] as any)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, 'abcdefg' as any)).toThrow(WriteTypeError);
    });
  });

  describe('bitmask16Coder', () => {
    const coder = coders.bitmask16Coder;

    it('should handle valid values', () => {
      check(
        coder,
        [],
        [
          false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false,
        ]
      );
      check(
        coder,
        [false, true],
        [
          false, true, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false,
        ]
      );
      check(
        coder,
        [true, true],
        [
          true, true, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false,
        ]
      );
      check(
        coder,
        [
          false, true, false, false, false, false, false, false,
          false, false, true, false, false, false, false, false,
          false, false, false, false, false, true, false, false,
        ],
        [
          false, true, false, false, false, false, false, false,
          false, false, true, false, false, false, false, false,
        ],
      );
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, 0 as any)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, 1 as any)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, [0, 1, 0] as any)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, 'abcdefg' as any)).toThrow(WriteTypeError);
    });
  });

  describe('bitmask32Coder', () => {
    const coder = coders.bitmask32Coder;

    it('should handle valid values', () => {
      check(
        coder,
        [],
        [
          false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false,
        ]
      );
      check(
        coder,
        [false, true],
        [
          false, true, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false,
        ]
      );
      check(
        coder,
        [true, true],
        [
          true, true, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false,
        ]
      );
      check(
        coder,
        [
          false, true, false, false, false, false, false, false,
          false, false, true, false, false, false, false, false,
          false, false, false, true, false, false, false, false,
          false, false, false, false, true, false, false, false,
          false, false, false, false, false, true, false, false,
        ],
        [
          false, true, false, false, false, false, false, false,
          false, false, true, false, false, false, false, false,
          false, false, false, true, false, false, false, false,
          false, false, false, false, true, false, false, false,
        ],
      );
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, 0 as any)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, 1 as any)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, [0, 1, 0] as any)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, 'abcdefg' as any)).toThrow(WriteTypeError);
    });
  });

  describe('jsonCoder', () => {
    const coder = coders.jsonCoder;

    it('should handle valid values', () => {
      check(coder, true);
      check(coder, 17);
      check(coder, null);
      check(coder, 'Hello');
      check(coder, [true, 17, null, 'Hi']);
      check(coder, {
        a: 2,
        b: {
          c: ['hi']
        }
      });
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, { myBigInt: BigInt(1234) })).toThrow(WriteTypeError);
    });
  });

  describe('regexCoder', () => {
    const coder = coders.regexCoder;

    it('should handle valid values', () => {
      check(coder, /my-regex/);
      check(coder, /^\.{3,}[\][2-5-]|(?:2)$/igm);
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, '/^\\.{3,}[\\][2-5-]|(?:2)$/ig' as any)).toThrow(WriteTypeError);
      expect(() => _writeAndGetHex(coder, 1 as any)).toThrow(WriteTypeError);
    });
  });

  describe('dateCoder', () => {
    const coder = coders.dateCoder;

    it('should handle valid values', () => {
      check(coder, new Date);
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, new Date('October 35, 1996 12:35:32'))).toThrow(WriteTypeError); // NaN
      expect(() => _writeAndGetHex(coder, 1 as any)).toThrow(WriteTypeError);
    });
  });
});

//
// ----- Helpers: -----
//

function _writeAndReturnArrayBuffer<T>(coder: any, value: T): ArrayBuffer {
  const  data = new BufferWriter(64);
  coder.write(value, data, '');
  return data.asView();
}

function _readArrayBuffer<T>(coder: any, arrayBuffer: ArrayBuffer): T {
  const state = new BufferReader(arrayBuffer);
  const r = coder.read(state);
  expect(state.hasEnded).toBe(true);
  return r;
}

/**
 * @returns hex string
 */
function _writeAndGetHex<T>(type: BinaryTypeCoder<T>, value: T): string {
  return arrayBufferToHexString(_write(type, value));
}

function _write<T>(type: BinaryTypeCoder<T>, value: T): ArrayBuffer {
  const data = new BufferWriter(64);
  type.write(value, data, '');

  return data.asView();

}

function _read<T>(buffer: ArrayBuffer, type: BinaryTypeCoder<T>): T {
  const state = new BufferReader(buffer);
  const data = type.read(state);
  expect(state.hasEnded).toBe(true);
  return data;
}

/**
 * Check encode/decode.
 */
function check<T>(type: coders.BinaryTypeCoder<T>, value: T, afterValue?: T): void {
  expect(_read(_write(type, value), type)).toEqual(afterValue ?? value);
}

function arrayBufferToHexString(arrayBuffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(arrayBuffer);
  return Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

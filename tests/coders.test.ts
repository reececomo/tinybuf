import { MutableArrayBuffer, ReadState, coders } from '../src/index';
import { BinaryTypeCoder, WriteTypeError } from '../src/core/lib/coders';

import uintValues from './data/uint.json';
import intValues from './data/int.json';
import { testRunner } from '../jest.config';

describe('coders', () => {

  describe('uintCoder', () => {
    const coder = coders.uintCoder;

    it('should handle valid values', () => {
      Object.keys(uintValues).forEach(function (rawValue) {
        const value = Number(rawValue);

        const encoded = _writeArrayBuffer(coder, value);
        const expected = uintValues[value];
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
      Object.keys(intValues).forEach(function (rawValue) {
        const value = Number(rawValue);

        const encoded = _writeArrayBuffer(coder, value);
        const expected = intValues[value];
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
        const encoded = _writeArrayBuffer(coder, value);
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
        const encoded = _writeArrayBuffer(coder, value);
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
        const encoded = _writeArrayBuffer(coder, value);
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
        const encoded = _writeArrayBuffer(coder, value);
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
        const encoded = _writeArrayBuffer(coder, value);
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
        const encoded = _writeArrayBuffer(coder, value);
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

  describe('stringCoder', () => {
    const coder = coders.stringCoder;

    it('should handle valid values', () => {
      check(coder, '');
      check(coder, 'Hello World');
      check(coder, '\u0000 Ūnĭcōde \uD83D\uDC04');
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, 1 as any)).toThrow(WriteTypeError);
    });
  });

  describe('arrayBufferCoder', () => {
    const coder = coders.arrayBufferCoder;

    it('should handle valid values', () => {
      const exampleArrayBuffer = new ArrayBuffer(6);
      const exampleDataView = new DataView(exampleArrayBuffer);
      for (const [i, value] of [3, 14, 15, 92, 65, 35].entries()) {
        exampleDataView.setUint8(i, value);
      }

      const uint8s = new Uint8Array([3, 14, 15, 92, 65, 35]);

      check(coder, exampleArrayBuffer);
      check(coder, exampleDataView.buffer, exampleArrayBuffer);
      check(coder, uint8s.buffer, exampleArrayBuffer);
    });

    it('should throw WriteTypeError for invalid values', () => {
      expect(() => _writeAndGetHex(coder, new Uint8Array([1, 2, 3]))).toThrow(WriteTypeError);
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

function _writeArrayBuffer<T>(coder: any, value: T): ArrayBuffer {
  const  data = new MutableArrayBuffer();
  coder.write(value, data, '');
  return data.toArrayBuffer();
}

function _readArrayBuffer<T>(coder: any, arrayBuffer: ArrayBuffer): T {
  const state = new ReadState(arrayBuffer);
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

function _readHex<T>(hexStr: string, type: BinaryTypeCoder<T>): T {
  return _read(hexStringToArrayBuffer(hexStr), type);
}

function _write<T>(type: BinaryTypeCoder<T>, value: T): ArrayBuffer {
  const data = new MutableArrayBuffer();
  type.write(value, data, '');
  return data.toArrayBuffer();
}

function _read<T>(arrayBuffer: ArrayBuffer, type: BinaryTypeCoder<T>): T {
  const state = new ReadState(arrayBuffer),
    r = type.read(state);
  expect(state.hasEnded).toBe(true);
  return r;
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

function hexStringToArrayBuffer(hexString: string): ArrayBuffer {
  // Remove the '0x' prefix if present
  hexString = hexString.replace(/^0x/, '');

  // Convert the hex string to bytes (Uint8Array)
  const parts = hexString.match(/.{1,2}/g);

  const bytes = parts === null ? new Uint8Array([]) : new Uint8Array(parts.map(byte => parseInt(byte, 16)));

  // Convert bytes to ArrayBuffer
  return bytes.buffer;
}
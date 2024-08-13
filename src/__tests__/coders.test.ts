import { BufferWriter } from '../core/lib/BufferWriter';
import { BufferReader } from '../core/lib/BufferReader';
import { BinaryTypeCoder } from '../core/lib/coders';
import * as coders from '../core/lib/coders';

import { uintData } from './data/uint';
import { intData } from './data/int';

describe('coders', () => {
  describe('uintCoder', () => {
    const coder = coders.uintCoder;

    it('should handle valid values', () => {
      Object.keys(uintData).forEach(function (rawValue) {
        const value = Number(rawValue);

        const encoded = write(coder, value);
        const expected = uintData[value];
        expect(hexBytes(encoded)).toEqual(expected.hex);
        expect(`${value}: ${encoded.byteLength}`).toEqual(`${value}: ${expected.bytes}`);

        const decoded: number = read(coder, encoded);
        expect(decoded).toEqual(value);
      });
    });
  });

  describe('intCoder', () => {
    const coder = coders.intCoder;

    it('should handle valid values', () => {
      Object.keys(intData).forEach(function (rawValue) {
        const value = Number(rawValue);

        const encoded = write(coder, value);
        const expected = intData[value];
        expect(hexBytes(encoded)).toEqual(expected.hex);
        expect(`${value}: ${encoded.byteLength}`).toEqual(`${value}: ${expected.bytes}`);

        const decoded: number = read(coder, encoded);
        expect(decoded).toEqual(value);
      });
    });
  });

  describe('int8Coder', () => {
    const coder = coders.int8Coder;

    it('should handle valid values', () => {
      [0, 1, 2, 100, 127, -1, -2, -100, -127].forEach((value: number): void => {
        const encoded = write(coder, value);
        expect(encoded.byteLength).toBe(1);
        const decoded: number = read(coder, encoded);
        expect(decoded).toEqual(value);
      });
    });
  });

  describe('int16Coder', () => {
    const coder = coders.int16Coder;

    it('should handle valid values', () => {
      [0, 1, -1, 128, -128, 32_767, -32_767].forEach((value: number): void => {
        const encoded = write(coder, value);
        expect(encoded.byteLength).toBe(2);
        const decoded: number = read(coder, encoded);
        expect(decoded).toEqual(value);
      });
    });
  });

  describe('int32Coder', () => {
    const coder = coders.int32Coder;

    it('should handle valid values', () => {
      [0, 1, -1, 32_767, -32_767, 32_768, -2_147_483_647, 2_147_483_647].forEach((value: number): void => {
        const encoded = write(coder, value);
        expect(encoded.byteLength).toBe(4);
        const decoded: number = read(coder, encoded);
        expect(decoded).toEqual(value);
      });
    });
  });

  describe('uint8Coder', () => {
    const coder = coders.uint8Coder;

    it('should handle valid values', () => {
      [0, 1, 2, 100, 127, 254, 255].forEach((value: number): void => {
        const encoded = write(coder, value);
        expect(encoded.byteLength).toBe(1);
        const decoded: number = read(coder, encoded);
        expect(decoded).toEqual(value);
      });
    });
  });

  describe('uint16Coder', () => {
    const coder = coders.uint16Coder;

    it('should handle valid values', () => {
      [0, 256, 65_535].forEach((value: number): void => {
        const encoded = write(coder, value);
        expect(encoded.byteLength).toBe(2);
        const decoded: number = read(coder, encoded);
        expect(decoded).toEqual(value);
      });
    });
  });

  describe('uint32Coder', () => {
    const coder = coders.uint32Coder;

    it('should handle valid values', () => {
      [0, 255, 65_536, 4_294_967_295].forEach((value: number): void => {
        const encoded = write(coder, value);
        expect(encoded.byteLength).toBe(4);
        const decoded: number = read(coder, encoded);
        expect(decoded).toEqual(value);
      });
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
  });

  describe('uscalar8Coder', () => {
    const coder = coders.uscalar8Coder;

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
      check(coder, NaN, 0);
    });
  });

  describe('signedScalarCoder', () => {
    const coder = coders.scalar8Coder;

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
      check(coder, NaN, -1);
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
  });

  describe('boolCoder', () => {
    const coder = coders.boolCoder;

    it('should handle valid values', () => {
      check(coder, true);
      check(coder, false);
    });
  });

  describe('boolsCoder', () => {
    const coder = coders.boolsCoder;

    it('should handle valid values', () => {
      check(coder, []);
      check(coder, [true, false, true]);
      check(coder, [false, true, false]);
      check(coder, [false, true, false, true, true, false, true, false, true]);
      check(coder, [
        false, true, false, false, true, true, false, true, // 01001101
        false, true, false, false, true, true, false, true, // 01001101
      ]);
      check(coder, [
        true, false, true, true, false, false, true, false, // 10110010
        true, false, true, true, false, false, true, false, // 10110010
        false, true, false, false, true, true, false, true, // 01001101
        true, false, true, // 101
      ]);
      check(coder, [
        false, false, true, true, false, false, true, false, // 00110010
        true, false, true, true, false, false, true, false, // 10110010
        false, true, false, false, true, true, false, true, // 01001101
        true, false, true, true, // 1011
      ]);
    });

    // large data
    const largeInputBools = [
      true, false, true, true, false, false, true, false, // 10110010
      true, false, true, true, false, false, true, false, // 10110010
      false, true, false, false, true, true, false, true, // 01001101
      true, false, true, true, false, false, true, true   // 10110011
    ];

    it('should trim arrays of greater than 28 booleans', () => {
      check(coder, largeInputBools, [
        true, false, true, true, false, false, true, false, // 10110010
        true, false, true, true, false, false, true, false, // 10110010
        false, true, false, false, true, true, false, true, // 01001101
        true, false, true, true, // 1011
      ]);
    });


    it('should encode no more than 4 bytes', () => {
      expect(write(coder, [true, false, true]).byteLength).toBe(1);
      expect(write(coder, largeInputBools).byteLength).toBe(4);
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
  });

  describe('regexCoder', () => {
    const coder = coders.regexCoder;

    it('should handle valid values', () => {
      check(coder, /my-regex/);
      check(coder, /^\.{3,}[\][2-5-]|(?:2)$/igm);
    });
  });

  describe('dateCoder', () => {
    const coder = coders.dateCoder;

    it('should handle valid values', () => {
      check(coder, new Date);
    });
  });
});

//
// ----- Helpers: -----
//

function check<T, R = T>(type: BinaryTypeCoder<T>, inputValue: T, expectedDecodedValue?: R): void {
  const encodedBytes = write(type, inputValue);
  const decodedValue = read(type, encodedBytes);

  expect(decodedValue).toEqual(expectedDecodedValue ?? inputValue);
}

function write<T>(coder: any, value: T): Uint8Array {
  const  data = new BufferWriter(64);
  coder.$write(value, data);
  return data.$viewBytes();
}

function read<T>(type: BinaryTypeCoder<T>, bytes: Uint8Array, ): T {
  const state = new BufferReader(bytes);
  const r = type.$read(state);
  expect(state.i).toBe(bytes.byteLength); // hasEnded
  return r;
}

function hexBytes(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

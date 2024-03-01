import {
  MutableArrayBuffer,
  ReadState,
  coders
} from '../src/index';

import uintValues from './uint.json';
import intValues from './int.json';

describe('type coders', function () {
  const coder = coders.uintCoder;

  it('should correctly convert auto uints', function () {
    Object.keys(uintValues).forEach(function (rawValue) {
      const value = Number(rawValue)

      const encoded = _writeArrayBuffer(coder, value);
      const expected = uintValues[value];
      expect(arrayBufferToHexString(encoded)).toEqual(expected.hex);
      expect(`${value}: ${encoded.byteLength}`).toEqual(`${value}: ${expected.bytes}`);

      const decoded: number = _readArrayBuffer(coder, encoded);
      expect(decoded).toEqual(value);
    });
  })

  it('should correctly convert auto ints', function () {
    const coder = coders.intCoder;

    Object.keys(intValues).forEach(function (rawValue) {
      const value = Number(rawValue)

      const encoded = _writeArrayBuffer(coder, value);
      const expected = intValues[value];
      expect(arrayBufferToHexString(encoded)).toEqual(expected.hex);
      expect(`${value}: ${encoded.byteLength}`).toEqual(`${value}: ${expected.bytes}`);

      const decoded: number = _readArrayBuffer(coder, encoded);
      expect(decoded).toEqual(value);
    });
  })

  it('should correctly convert int8', function () {
    const coder = coders.int8Coder;
    
    [0, 1, 2, 100, 127, -1, -2, -100, -127].forEach((value: number): void => {
      const encoded = _writeArrayBuffer(coder, value);
      expect(encoded.byteLength).toBe(1);
      const decoded: number = _readArrayBuffer(coder, encoded);
      expect(decoded).toEqual(value);
    });
  })

  it('should correctly convert int16', function () {
    const coder = coders.int16Coder;
    
    [0, 1, -1, 128, -128, 32_767, -32_767].forEach((value: number): void => {
      const encoded = _writeArrayBuffer(coder, value);
      expect(encoded.byteLength).toBe(2);
      const decoded: number = _readArrayBuffer(coder, encoded);
      expect(decoded).toEqual(value);
    });
  })

  it('should correctly convert int32', function () {
    const coder = coders.int32Coder;
    
    [0, 1, -1, 32_767, -32_767, 32_768, -2_147_483_647, 2_147_483_647].forEach((value: number): void => {
      const encoded = _writeArrayBuffer(coder, value);
      expect(encoded.byteLength).toBe(4);
      const decoded: number = _readArrayBuffer(coder, encoded);
      expect(decoded).toEqual(value);
    });
  })

  it('should correctly convert uint8', function () {
    const coder = coders.uint8Coder;
    
    [0, 1, 2, 100, 127, 254, 255].forEach((value: number): void => {
      const encoded = _writeArrayBuffer(coder, value);
      expect(encoded.byteLength).toBe(1);
      const decoded: number = _readArrayBuffer(coder, encoded);
      expect(decoded).toEqual(value);
    });
  })

  it('should correctly convert uint16', function () {
    const coder = coders.uint16Coder;
    
    [0, 256, 65_535].forEach((value: number): void => {
      const encoded = _writeArrayBuffer(coder, value);
      expect(encoded.byteLength).toBe(2);
      const decoded: number = _readArrayBuffer(coder, encoded);
      expect(decoded).toEqual(value);
    });
  })

  it('should correctly convert uint32', function () {
    const coder = coders.uint32Coder;
    
    [0, 255, 65_536, 4_294_967_295].forEach((value: number): void => {
      const encoded = _writeArrayBuffer(coder, value);
      expect(encoded.byteLength).toBe(4);
      const decoded: number = _readArrayBuffer(coder, encoded);
      expect(decoded).toEqual(value);
    });
  })

  it('should work correctly correctly for double precision floats', function () {
    check(coders.float64Coder, 0)
    check(coders.float64Coder, 3.14)
    check(coders.float64Coder, -Math.E)
    check(coders.float64Coder, Infinity)
    check(coders.float64Coder, -Infinity)
    check(coders.float64Coder, 1 / Infinity)
    check(coders.float64Coder, -1 / Infinity)
    check(coders.float64Coder, NaN)
  })

  it('should work correctly correctly for single precision floats', function () {
    check(coders.float32Coder, 0)
    check(coders.float32Coder, -0.5)
    check(coders.float32Coder, 0.5)
    check(coders.float32Coder, 1)
    check(coders.float32Coder, -1)
    check(coders.float32Coder, 3.1419, 3.141900062561035)
    check(coders.float32Coder, -3.1419, -3.141900062561035)
    check(coders.float32Coder, Infinity)
    check(coders.float32Coder, -Infinity)
    check(coders.float32Coder, 1 / Infinity)
    check(coders.float32Coder, -1 / Infinity)
    check(coders.float32Coder, NaN)
  })

  it('should work correctly correctly for half precision floats', function () {
    check(coders.float16Coder, 0)
    check(coders.float16Coder, -0.5)
    check(coders.float16Coder, 0.5)
    check(coders.float16Coder, 1)
    check(coders.float16Coder, -1)
    check(coders.float16Coder, 3.1419, 3.142578125)
    check(coders.float16Coder, -3.1419, -3.142578125)
    check(coders.float16Coder, Infinity)
    check(coders.float16Coder, -Infinity)
    check(coders.float16Coder, 1 / Infinity)
    check(coders.float16Coder, -1 / Infinity)
    check(coders.float16Coder, NaN)
  })

  it('should work correctly correctly for string', function () {
    check(coders.stringCoder, '')
    check(coders.stringCoder, 'Hello World')
    check(coders.stringCoder, '\u0000 Ūnĭcōde \uD83D\uDC04')
  })

  it('should work correctly correctly for ArrayBuffer', function () {
    const exampleArrayBuffer = new ArrayBuffer(6);
    const exampleDataView = new DataView(exampleArrayBuffer);
    for (const [i, value] of [3, 14, 15, 92, 65, 35].entries()) {
      exampleDataView.setUint8(i, value);
    }

    check(coders.arrayBufferCoder, exampleArrayBuffer)
    check(coders.arrayBufferCoder, exampleDataView.buffer, exampleArrayBuffer)
  })

  it('should work correctly correctly for boolean', function () {
    check(coders.booleanCoder, true)
    check(coders.booleanCoder, false)
  })

  it('should work correctly correctly for json', function () {
    check(coders.jsonCoder, true)
    check(coders.jsonCoder, 17)
    check(coders.jsonCoder, null)
    check(coders.jsonCoder, 'Hello')
    check(coders.jsonCoder, [true, 17, null, 'Hi'])
    check(coders.jsonCoder, {
      a: 2,
      b: {
        c: ['hi']
      }
    })
  })

  it('should work correctly correctly for regex', function () {
    check(coders.regexCoder, /my-regex/)
    check(coders.regexCoder, /^\.{3,}[\]\[2-5-]|(?:2)$/ig)
  })

  it('should work correctly correctly for date', function () {
    check(coders.dateCoder, new Date)
  })
})

//
// ----- Helpers: -----
//

function _writeArrayBuffer<T>(coder: any, value: T): ArrayBuffer {
  const  data = new MutableArrayBuffer();
  coder.write(value, data, '')
  return data.toArrayBuffer()
}

function _readArrayBuffer<T>(coder: any, arrayBuffer: ArrayBuffer): T {
  const state = new ReadState(arrayBuffer);
  const r = coder.read(state);
  expect(state.hasEnded()).toBe(true);
  return r;
}

/**
 * @param {Object} type
 * @param {*} value
 * @return {string} - hex string
 */
function _write(type, value) {
  const data = new MutableArrayBuffer();
  type.write(value, data, '')
  return arrayBufferToHexString(data.toArrayBuffer());
}

/**
 * @param {string} hexStr
 * @param {Object} type
 * @return {*}
 */
function _readHex(hexStr, type) {
  const arrayBuffer = hexStringToArrayBuffer(hexStr);
  const state = new ReadState(arrayBuffer),
    r = type.read(state)
  expect(state.hasEnded()).toBe(true);
  return r
}

/**
 * @param {Object} type
 * @param {*} value
 */
function check<T>(type: coders.BinaryTypeCoder<T>, value: T, afterValue?: T) {
  expect(_readHex(_write(type, value), type)).toEqual(afterValue ?? value);
}

function arrayBufferToHexString(arrayBuffer: ArrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  return Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

function hexStringToArrayBuffer(hexString) {
  // Remove the '0x' prefix if present
  hexString = hexString.replace(/^0x/, '');

  // Convert the hex string to bytes (Uint8Array)
  const bytes = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  // Convert bytes to ArrayBuffer
  return bytes.buffer;
}
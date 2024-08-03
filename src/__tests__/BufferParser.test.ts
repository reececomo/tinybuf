import { BufferFormat } from "../core/BufferFormat";
import { bufferParser } from "../core/BufferParser";
import {
  BufferDecodingError,
  FormatHeaderCollisionError,
  UnrecognizedFormatError
} from "../core/lib/errors";
import { Type } from "../core/Type";

describe('buffer parser', () => {
  const MyCoder1 = new BufferFormat({ example: Type.String });
  const MyCoder2 = new BufferFormat({ example: Type.Int });

  const MyCoderA = new BufferFormat({ example: Type.String }, 'AB');
  const MyCoderB = new BufferFormat({ example: Type.Int }, 'CD');

  it('can receive two different packets with the same keys.', () => {
    let _results1: any[] = [];
    let _results2: any[] = [];
    let _resultsA: any[] = [];
    let _resultsB: any[] = [];

    const binaryHandler = bufferParser()
      .on(MyCoder1, (data) => _results1.push(data))
      .on(MyCoder2, (data) => _results2.push(data))
      .on(MyCoderA, (data) => _resultsA.push(data))
      .on(MyCoderB, (data) => _resultsB.push(data));

    const data1 = MyCoder1.encode({
      example: 'someText',
    });
    const data2 = MyCoder2.encode({
      example: 123_123,
    });
    const dataA = MyCoderA.encode({
      example: 'dolor sit amet',
    });
    const dataB = MyCoderB.encode({
      example: 456_456,
    });

    binaryHandler.processBuffer(data1);
    binaryHandler.processBuffer(data2);
    binaryHandler.processBuffer(data1);
    binaryHandler.processBuffer(dataA);
    binaryHandler.processBuffer(dataB);

    expect(_results1).toMatchObject([
      { example: 'someText' },
      { example: 'someText' },
    ]);

    expect(_results2).toEqual([
      { example: 123_123, }
    ]);

    expect(_resultsA).toMatchObject([
      { example: 'dolor sit amet' },
    ]);

    expect(_resultsB).toEqual([
      { example: 456_456, }
    ]);

    expect(BufferFormat.peekHeader(data1)).toBe(40118);
    expect(MyCoder1.header).toBe(40118);

    expect(BufferFormat.peekHeader(data2)).toBe(48432);
    expect(MyCoder2.header).toBe(48432);

    expect(BufferFormat.peekHeaderStr(dataA)).toBe('AB');
    expect(MyCoderA.header).toBe('AB');

    expect(BufferFormat.peekHeaderStr(dataB)).toBe('CD');
    expect(MyCoderB.header).toBe('CD');

    expect(binaryHandler.availableFormats.size).toBe(4);
  });

  describe('processBuffer()', () => {
    it('throws BufferDecodingError if there are not enough peek bytes', () => {
      const binaryHandler = bufferParser();
      const uint8array = new Uint8Array([1]);

      expect(() => binaryHandler.processBuffer(uint8array.buffer)).toThrow(BufferDecodingError);
    });

    it('throws error if there is no registered format', () => {
      const binaryHandler = bufferParser();
      const uint8array = new Uint8Array([1, 2]);

      expect(() => binaryHandler.processBuffer(uint8array.buffer)).toThrow(UnrecognizedFormatError);
    });
  });

  describe('on()', () => {
    it('throws RangeError if there are not enough peek bytes', () => {
      const binaryHandler = bufferParser();
      const format = new BufferFormat({ a: [Type.String] }, null);

      expect(() => binaryHandler.on(format, () => {})).toThrow(TypeError);
    });

    it('throws error if registering the same format twice', () => {
      const binaryHandler = bufferParser()
        .on(new BufferFormat({ a: [Type.String] }), () => {});

      const identicalFormat = new BufferFormat({ a: [Type.String] });

      expect(() => binaryHandler.on(identicalFormat, () => {})).toThrow(FormatHeaderCollisionError);
    });

    it('does not error if registering the same format twice and `overwritePrevious` is set', () => {
      const binaryHandler = bufferParser()
        .on(new BufferFormat({ a: [Type.String] }), () => {});

      const identicalFormat = new BufferFormat({ a: [Type.String] });

      expect(() => binaryHandler.on(identicalFormat, () => {}, true)).not.toThrow(FormatHeaderCollisionError);
    });
  });
});

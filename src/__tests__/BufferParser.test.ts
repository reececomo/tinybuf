import { BufferFormat } from "../core/BufferFormat";
import { bufferParser } from "../core/BufferParser";
import { TinybufError } from "../core/lib/errors";
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

    // encode safely (as if it had been received across the network):

    const data1 = MyCoder1.encode({
      example: 'someText',
    }, true);

    const data2 = MyCoder2.encode({
      example: 123_123,
    }, true);

    const dataA = MyCoderA.encode({
      example: 'dolor sit amet',
    }, true);

    const dataB = MyCoderB.encode({
      example: 456_456,
    }, true);

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

    expect(BufferFormat.peekHeader(data1)).toBe(MyCoder1.header);
    expect(BufferFormat.peekHeader(data2)).toBe(MyCoder2.header);

    expect(BufferFormat.peekHeaderStr(dataA)).toBe('AB');
    expect(MyCoderA.header).toBe('AB');

    expect(BufferFormat.peekHeaderStr(dataB)).toBe('CD');
    expect(MyCoderB.header).toBe('CD');
  });

  describe('processBuffer()', () => {
    it('throws RangeError if there are not enough bytes', () => {
      const binaryHandler = bufferParser();
      const uint8array = new Uint8Array([1]);

      expect(() => binaryHandler.processBuffer(uint8array.buffer)).toThrow(TinybufError);
    });

    it('throws error if there is no registered format', () => {
      const binaryHandler = bufferParser();
      const uint8array = new Uint8Array([1, 2]);

      expect(() => binaryHandler.processBuffer(uint8array.buffer)).toThrow(TinybufError);
    });
  });

  describe('on()', () => {
    it('throws error when registering headerless format', () => {
      const binaryHandler = bufferParser();
      const format = new BufferFormat({ a: [Type.String] }, null);

      expect(() => binaryHandler.on(format, () => {})).toThrow(TinybufError);
    });

    it('throws error if registering identical format header twice, and its a different instance', () => {
      const binaryHandler = bufferParser()
        .on(new BufferFormat({ a: [Type.String] }), () => {});

      const identicalFormat = new BufferFormat({ a: [Type.String] });

      expect(() => binaryHandler.on(identicalFormat, () => {})).toThrow(TinybufError);
    });

    it('does not error if registering the same instance twice', () => {
      const formatA = new BufferFormat({ a: [Type.String] });

      const binaryHandler = bufferParser()
        .on(formatA, () => {});

      expect(() => binaryHandler.on(formatA, () => {})).not.toThrow(TinybufError);
    });

    it('allocs new memory for decoded data by default', () => {
      const formatA = new BufferFormat({ a: [Type.String] });

      let aRefs: Array<any>[] = [];

      const binaryHandler = bufferParser()
        .on(formatA, (data) => aRefs.push(data.a));

      const bytes1 = formatA.encode({ a: ["abc", "def"] }, true);
      const bytes2 = formatA.encode({ a: ["def", "ghi"] }, true);

      binaryHandler.processBuffer(bytes1);
      expect(aRefs[0]).toStrictEqual(["abc", "def"]);

      binaryHandler.processBuffer(bytes2);
      expect(aRefs[0]).toStrictEqual(["abc", "def"]); // safe usage - new obj/arrays always allocated
      expect(aRefs[1]).toStrictEqual(["def", "ghi"]);
    });

    it('recycles memory for formats created with decodeInPlace set to true ', () => {
      const formatA = new BufferFormat({ a: [Type.String] });

      let aRefs: Array<any>[] = [];

      const binaryHandler = bufferParser()
        .on(formatA, (data) => aRefs.push(data.a), { decodeInPlace: true });

      const bytes1 = formatA.encode({ a: ["abc", "def"] }, true);
      const bytes2 = formatA.encode({ a: ["def", "ghi"] }, true);

      binaryHandler.processBuffer(bytes1);
      expect(aRefs[0]).toStrictEqual(["abc", "def"]);

      binaryHandler.processBuffer(bytes2);
      expect(aRefs[0]).toStrictEqual(["def", "ghi"]); // unsafe usage - the underlying array was recycled from the previous decode.
      expect(aRefs[1]).toStrictEqual(["def", "ghi"]);
    });
  });
});

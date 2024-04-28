import {
  BinaryCoder,
  BinaryCoderIdCollisionError,
  BinaryFormatHandler,
  Type,
  UnhandledBinaryDecodeError,
  decoder
} from "../src";

describe('BinaryCoderInterpreter', () => {
  const MyCoder1 = new BinaryCoder({ example: Type.String });
  const MyCoder2 = new BinaryCoder({ example: Type.Int });

  const MyCoderA = new BinaryCoder({ example: Type.String }, 'AB');
  const MyCoderB = new BinaryCoder({ example: Type.Int }, 'CD');

  it('can receive two different packets with the same keys.', () => {
    let _results1: any[] = [];
    let _results2: any[] = [];
    let _resultsA: any[] = [];
    let _resultsB: any[] = [];

    const binaryHandler = new BinaryFormatHandler()
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

    expect(BinaryCoder.peekIntId(data1)).toBe(40118);
    expect(MyCoder1.Id).toBe(40118);

    expect(BinaryCoder.peekIntId(data2)).toBe(48432);
    expect(MyCoder2.Id).toBe(48432);

    expect(BinaryCoder.peekStrId(dataA)).toBe('AB');
    expect(MyCoderA.Id).toBe('AB');

    expect(BinaryCoder.peekStrId(dataB)).toBe('CD');
    expect(MyCoderB.Id).toBe('CD');

    expect(binaryHandler.available.size).toBe(4);
  });

  describe('processBuffer()', () => {
    it('throws RangeError if there are not enough peek bytes', () => {
      const binaryHandler = new BinaryFormatHandler();
      const uint8array = new Uint8Array([1]);

      expect(() => binaryHandler.processBuffer(uint8array.buffer)).toThrow(RangeError);
    });

    it('throws UnhandledBinaryDecodeError if there is no registered coder', () => {
      const binaryHandler = new BinaryFormatHandler();
      const uint8array = new Uint8Array([1, 2]);

      expect(() => binaryHandler.processBuffer(uint8array.buffer)).toThrow(UnhandledBinaryDecodeError);
    });
  });

  describe('on()', () => {
    it('throws RangeError if there are not enough peek bytes', () => {
      const binaryHandler = new BinaryFormatHandler();
      const format = new BinaryCoder({ a: [Type.String] }, null);

      expect(() => binaryHandler.on(format, () => {})).toThrow(TypeError);
    });

    it('throws BinaryCoderIdCollisionError if registering the same format twice', () => {
      const binaryHandler = decoder()
        .on(new BinaryCoder({ a: [Type.String] }), () => {});

      const identicalFormat = new BinaryCoder({ a: [Type.String] });

      expect(() => binaryHandler.on(identicalFormat, () => {})).toThrow(BinaryCoderIdCollisionError);
    });
  });
});

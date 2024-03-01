import { BinaryCodec, BinaryFormatHandler, Type } from "../src";

describe('BinaryCodecInterpreter', () => {
  const MyCodec1 = new BinaryCodec({ example: Type.String });
  const MyCodec2 = new BinaryCodec({ example: Type.Int });

  it('can receive two different packets with the same keys.', () => {
    let _results1: any[] = [];
    let _results2: any[] = [];
  
    const binaryHandler = new BinaryFormatHandler()
      .on(MyCodec1, (data) => _results1.push(data))
      .on(MyCodec2, (data) => _results2.push(data));

    const data1 = MyCodec1.encode({
      example: 'someText',
    });
    const data2 = MyCodec2.encode({
      example: 123_123,
    });

    binaryHandler.processBuffer(data1);
    binaryHandler.processBuffer(data2);
    binaryHandler.processBuffer(data1);

    expect(_results1).toMatchObject([
      { example: 'someText' },
      { example: 'someText' },
    ]);

    expect(_results2).toEqual([
      { example: 123_123, }
    ]);

    expect(BinaryCodec.peekId(data1)).toBe(27748);
    expect(MyCodec1.Id).toBe(27748);

    expect(BinaryCodec.peekId(data2)).toBe(6434);
    expect(MyCodec2.Id).toBe(6434);
  });
});

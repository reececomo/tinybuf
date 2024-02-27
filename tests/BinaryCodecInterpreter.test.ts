import { BinaryCodec, BinaryCodecInterpreter, Type } from "../src";

describe('BinaryCodecInterpreter', () => {
  const MyCodec1 = new BinaryCodec<any>({ example: Type.String });
  const MyCodec2 = new BinaryCodec<any>({ example: Type.Int });

  it('can receive two different packets with the same keys.', () => {
    let _results1: any[] = [];
    let _results2: any[] = [];
  
    const binary = new BinaryCodecInterpreter()
      .register(MyCodec1, (data) => _results1.push(data))
      .register(MyCodec2, (data) => _results2.push(data));

    const data1 = binary.encode({
      example: 'someText',
    });
    const data2 = binary.encode({
      example: 123_123,
    });

    binary.decode(data1);
    binary.decode(data2);
    binary.decode(data1);

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

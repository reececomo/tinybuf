import {
  BinaryCodec,
  Type,
  Optional,
} from '../src/index';

describe('BinaryCodec', function () {
  const MyBinaryCodec = new BinaryCodec({
    a: Type.Int,
    b: [Type.Int],
    c: [{
      d: Optional(Type.String)
    }],
  });

  const validData = {
    a: 22,
    b: [-3, 14, -15, 92, -65, 35],
    c: [
      {
        d: 'Hello World'
      },
      {},
      {
        d: '?'
      },
    ],
  };

  it('should correctly parse a type', function () {
    expect(MyBinaryCodec).toMatchObject({
      __proto__: BinaryCodec.prototype,
      type: Type.Object,
      fields: [
        {
          name: 'a',
          isOptional: false,
          isArray: false,
          type: {
            type: Type.Int
          }
        },
        {
          name: 'b',
          isOptional: false,
          isArray: true,
          type: {
            type: Type.Int
          }
        },
        {
          name: 'c',
          isOptional: false,
          isArray: true,
          type: {
            type: Type.Object,
            fields: [
              {
                name: 'd',
                isOptional: true,
                isArray: false,
                type: {
                  type: Type.String
                }
              }
            ]
          }
        }
      ]
    })
  })

  it('decode() emits output that is valid input for encode()', () => {
    const Example = new BinaryCodec({
      integer: Type.UInt16,
      objectArray: [{
        str: Type.String,
        uint: Type.UInt8,
        optionalObject: Optional({
          x: Type.Float,
          y: Type.Float
        }),
        boolean: Type.Boolean
      }],
      optionalArray: Optional([Type.String]),
      booleanTuple: Type.BooleanTuple,
      bitmask8: Type.Bitmask8,
    });

    const binary = Example.encode({
      integer: 123,
      objectArray: [
        {
          str: 'lol',
          uint: 100,
          optionalObject: {
            x: 1,
            y: 2.3
          },
          boolean: true
        }
      ],
      booleanTuple: [true, false, true],
      bitmask8: [false, false, true, false, false, false, false, true],
    });

    expect(binary.byteLength).toBe(23);

    const decoded = Example.decode(binary);
    const binary2 = Example.encode(decoded);

    expect(binary).toEqual(binary2);
  })

  it('should not encode a non conforming object', function () {
    expect(() => {
      (MyBinaryCodec as any).encode(12)
    }).toThrow();

    expect(() => {
      MyBinaryCodec.encode({
        a: 17,
        b: [],
        c: [{
          d: true as any // should be boolean
        }]
      })
    }).toThrow();
  })

  it('should encode a conforming object and read back the data', function () {
    const encoded = MyBinaryCodec.encode(validData);
    const decoded = MyBinaryCodec.decode(encoded);

    expect(decoded).toEqual(validData);
  })
  
  it('should encode an array', function () {
    const intArray = new BinaryCodec({ data: [Type.Int] });
    expect(intArray.decode(intArray.encode({ data: [] }))).toEqual({ data: [] })
    expect(intArray.decode(intArray.encode({ data: [3] }))).toEqual({ data: [3] })
    expect(intArray.decode(intArray.encode({ data: [3, 14, 15] }))).toEqual({ data: [3, 14, 15] })
    
    const objArray = new BinaryCodec({ data: [{
      v: Type.Int,
      f: Type.String
    }]})
    expect(objArray.decode(objArray.encode({ data: [] }))).toEqual({ data: [] })
    const data = [{
      v: 1,
      f: 'one'
    }, {
      v: 2,
      f: 'two'
    }]
    expect(objArray.decode(objArray.encode({ data }))).toEqual({ data })
  })
});


describe('BOOLEAN_ARRAY', () => {
  const MyCoder = new BinaryCodec({
    name: Type.String,
    coolBools: Type.BooleanTuple,
  });

  it('should encode less than 8', () => {
    const before = {
      name: 'my awesome example string',
      coolBools: [false, true, false, true, false],
    };

    const encoded = MyCoder.encode(before);

    const after = MyCoder.decode(encoded);
    expect(after).toStrictEqual({
      name: 'my awesome example string',
      coolBools: [false, true, false, true, false],
    });
    
    expect(before.coolBools.length).toBe(after.coolBools.length);
  });

  it('should encode any number of bools', () => {
    const before = {
      name: 'my awesome example string',
      coolBools: [
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
      ],
    };

    const encoded = MyCoder.encode(before);

    const after = MyCoder.decode(encoded);
    expect(after).toStrictEqual({
      name: 'my awesome example string',
      coolBools: [
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
      ],
    });
    
    expect(before.coolBools.length).toBe(45);
    expect(after.coolBools.length).toBe(45);
  });
});

describe('BITMASK_8', () => {
  const MyCoder = new BinaryCodec({
    name: Type.String,
    coolBools: Type.Bitmask8,
  });

  it('should encode all booleans below the minimum allowed', () => {
    const before = {
      name: 'my awesome example string',
      coolBools: [true, false, true],
    };

    const encoded = MyCoder.encode(before);

    const after = MyCoder.decode(encoded);
    expect(after).toStrictEqual({
      name: 'my awesome example string',
      coolBools: [true, false, true, false, false, false, false, false],
    });
    
    expect(after.coolBools.length).toBe(8);
  });

  it('should encode up to the maximum boolean array', () => {
    const before = {
      name: 'my awesome example string',
      coolBools: [false, false, true, false, true, false, true, false, true],
    };

    const encoded = MyCoder.encode(before);

    const after = MyCoder.decode(encoded);
    expect(after).toStrictEqual({
      name: 'my awesome example string',
      coolBools: [false, false, true, false, true, false, true, false],
    });
    
    expect(before.coolBools.length).toBe(9);
    expect(after.coolBools.length).toBe(8);
  });
});

describe('Id', () => {
  it('matches expected shapes', () => {
    const format = {
      name: Type.String,
    };
    const MyNakedCoder = new BinaryCodec(format as any, false);
    const MyClothedCoder = new BinaryCodec(format as any);
    
    expect(MyNakedCoder.Id).toBe(false);
    expect(MyClothedCoder.Id).not.toBe(false);

    const binary1 = MyNakedCoder.encode({ name: 'Example' });
    const binary2 = MyClothedCoder.encode({ name: 'Example' });

    expect(binary1.byteLength).toEqual(binary2.byteLength - 2);
  });
})

describe('matches', () => {
  it('matches expected shapes', () => {
    const MyCoder = new BinaryCodec({
      name: Type.String,
      property: [{ subProperty: Type.String }],
      other: Optional(Type.String),
    });
  
    expect(MyCoder.matches({ name: 'Mary', property: [{ subProperty: 'woo' }] })).toBeTruthy();
    expect(MyCoder.matches({ name: 'Mike', property: [{ invalid: 'woo' }] })).toBeFalsy();
  });
})

describe('BITMASK_32', () => {
  const MyCoder = new BinaryCodec({
    name: Type.String,
    coolBools: Type.Bitmask32,
    other: Optional(Type.String),
  });

  it('should encode all booleans below the minimum allowed', () => {
    const before = {
      name: 'my awesome example string',
      coolBools: [false, true, true, false, false,],
      other: 'hmm',
    };

    const encoded = MyCoder.encode(before);

    const after = MyCoder.decode(encoded);
    expect(after).toStrictEqual({
      name: 'my awesome example string',
      coolBools: [
        false, true, true, false, false, false, false, false,
        false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false,
        false, false, false, false, false, false, false, false
      ],
      other: 'hmm',
    });
    
    expect(after.coolBools.length).toBe(32);
  });

  it('should encode up to the maximum boolean array', () => {
    const before = {
      name: 'my awesome example string',
      coolBools: [
        true, false, true, false, true, false, true, false,
        true, false, true, false, true, false, true, false,
        true, false, true, false, true, false, true, false,
        true, false, true, false, true, false, true, false,
        true, true, true,
      ],
      other: 'hmm',
    };

    const encoded = MyCoder.encode(before);

    const after = MyCoder.decode(encoded);
    expect(after).toStrictEqual({
      name: 'my awesome example string',
      coolBools: [
        true, false, true, false, true, false, true, false,
        true, false, true, false, true, false, true, false,
        true, false, true, false, true, false, true, false,
        true, false, true, false, true, false, true, false,
      ],
      other: 'hmm',
    });
    
    expect(before.coolBools.length).toBe(35);
    expect(after.coolBools.length).toBe(32);
  });
});

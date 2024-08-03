import { BufferFormat, Decoded, defineFormat } from '../core/BufferFormat';
import { optional, Type } from '../core/Type';

describe('BufferFormat', () => {
  const MyBufferFormat = new BufferFormat({
    a: Type.Int,
    b: [Type.Int],
    c: [{
      d: optional(Type.String)
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

  it('should encode all types', () => {
    const MyCoder = defineFormat({
      myBuffer: Type.Buffer,
      myBoolean: Type.Boolean,
      myBools: Type.Bools,
      myUScalar: Type.UScalar,
      myScalar: Type.Scalar,
      myInt: Type.Int,
      myInt16: Type.Int16,
      myInt32: Type.Int32,
      myInt8: Type.Int8,
      myJSON: Type.JSON,
      myRegExp: Type.RegExp,
      myString: Type.String,
      myOptional: optional([Type.String]),
      myObject: {
        myUInt: Type.UInt,
        myUInt16: Type.UInt16,
        myUInt32: Type.UInt32,
        myUInt8: Type.UInt8,
        myNestedArray: [{
          myFloat16: Type.Float16,
          myFloat32: Type.Float32,
          myFloat64: Type.Float64,
        }]
      },
      myOptionalObject: optional({
        myDate: Type.Date,
        myBools16: Type.Bools16,
        myBools32: Type.Bools32,
        myBools8: Type.Bools8,
      })
    });

    const before = {
      myBuffer: new TextEncoder().encode('binary'),
      myBoolean: true,
      myBools: [false, true],
      myUScalar: 0.5,
      myScalar: -0.5,
      myInt: 1,
      myInt16: -260,
      myInt32: -32767,
      myInt8: -12,
      myJSON: {
        nestedData: 'wow'!
      },
      myRegExp: /test/gi,
      myString: 'example',
      myOptional: ['multiple', 'strings'],
      myObject: {
        myUInt: 1,
        myUInt16: 256,
        myUInt32: 65000,
        myUInt8: 1,
        myNestedArray: [
          {
            myFloat16: 1.23046875,
            myFloat32: 1.2300000190734863,
            myFloat64: 1.23,
          },
          {
            myFloat16: 1.23046875,
            myFloat32: 1.2300000190734863,
            myFloat64: 1.23,
          }
        ]
      },
      myOptionalObject: {
        myDate: new Date(),
        myBools8: [
          true, false, true, false, true, false, true, false
        ],
        myBools16: [
          true, false, true, false, true, false, true, false,
          true, false, true, false, true, false, true, false
        ],
        myBools32: [
          true, false, true, false, true, false, true, false,
          true, false, true, false, true, false, true, false,
          true, false, true, false, true, false, true, false,
          true, false, true, false, true, false, true, false
        ],
      }
    };

    const encoded = MyCoder.encode(before);
    const after = MyCoder.decode(encoded);

    expect(after).toStrictEqual(before);

    // eslint-disable-next-line max-len
    expect((MyCoder as any).format).toEqual('{buf,bool,booltuple,uscalar,scalar,int,int16,int32,int8,json,regex,str,str[]?,{uint,uint16,uint32,uint8,{float16,float32,float64}[]},{date,bitmask16,bitmask32,bitmask8}?}');
  });

  it('should correctly parse a type', () => {
    expect(MyBufferFormat).toMatchObject({
      __proto__: BufferFormat.prototype,
      type: Type.Object,
      fields: [
        {
          name: 'a',
          isOptional: false,
          isArray: false,
          coder: {
            type: Type.Int
          }
        },
        {
          name: 'b',
          isOptional: false,
          isArray: true,
          coder: {
            type: Type.Int
          }
        },
        {
          name: 'c',
          isOptional: false,
          isArray: true,
          coder: {
            type: Type.Object,
            fields: [
              {
                name: 'd',
                isOptional: true,
                isArray: false,
                coder: {
                  type: Type.String
                }
              }
            ]
          }
        }
      ]
    });
  });

  it('should encode hash code as Id when Id is not set', () => {
    const coder = new BufferFormat({ a: Type.UInt }, undefined);
    expect(coder.header).not.toBe(undefined);

    const data = coder.encode({ a: 0 });
    expect(data.byteLength).toBe(3);
  });

  it('should encode Id when set manually', () => {
    const coder = new BufferFormat({ a: Type.UInt }, 32);
    expect(coder.header).not.toBe(undefined);

    const data = coder.encode({ a: 0 });
    expect(data.byteLength).toBe(3);
  });

  it('should encode no Id when Id is false', () => {
    const coder = new BufferFormat({ a: Type.UInt }, null);
    expect(coder.header).toBe(undefined);

    const data = coder.encode({ a: 0 });
    expect(data.byteLength).toBe(1);
  });

  it('should match ids based on shape, but not keys', () => {
    const coderA = new BufferFormat({
      abc: Type.UInt,
      bef: Type.Int16,
      ghi: [Type.String],
    });
    const coderB = new BufferFormat({
      xyz: Type.UInt,
      yzx: Type.Int16,
      zyx: [Type.String],
    });
    expect(coderA.header).toBe(coderB.header);

    // Sanity check.
    expect(coderA.header).not.toBe(false);
    expect(coderA.header).not.toBe(
      new BufferFormat({
        yzx: Type.Int16,
        xyz: Type.UInt,
        zyx: [Type.String],
      }).header
    );
  });

  it('should allow string ids ', () => {
    const coderA = new BufferFormat({
      abc: Type.UInt,
      bef: Type.Int16,
      ghi: [Type.String],
    }, 'AB');

    const coderB = new BufferFormat({
      xyz: Type.UInt,
      yzx: Type.Int16,
      zyx: [Type.String],
    }, 'ab');

    // Sanity check.
    expect(coderA.header).not.toBe(coderB.header);

    // Check
    expect(coderA.header).toBe('AB');
    expect(typeof coderA.header).toBe('string');

    const data = coderA.encode({ abc: 1, bef: 2, ghi: ['lorem'] });
    expect(BufferFormat.peekHeaderStr(data)).toBe('AB');
  });

  it('should throw TypeError when passed an invalid Id', () => {
    expect(() => new BufferFormat({ data: Type.UInt }, true as any)).toThrow(TypeError);
    expect(() => new BufferFormat({ data: Type.UInt }, -1)).toThrow(TypeError);
    expect(() => new BufferFormat({ data: Type.UInt }, 65_536)).toThrow(TypeError);
    expect(() => new BufferFormat({ data: Type.UInt }, 1.01)).toThrow(TypeError);
  });

  it('should throw TypeError when an array contains non-1 value', () => {
    expect(() => new BufferFormat({ data: [] as any })).toThrow(TypeError);
    expect(() => new BufferFormat({ data: [Type.String, Type.String] as any })).toThrow(TypeError);
  });

  it('should throw TypeError when root object is optional', () => {
    expect(() => new BufferFormat(optional({ a: Type.UInt }) as any)).toThrow(TypeError);
  });

  it('should throw TypeError when root object is unknown coder type', () => {
    expect(() => new BufferFormat('bigint128' as any)).toThrow(TypeError);
  });

  it('decode() emits output that is valid input for encode()', () => {
    const Example = new BufferFormat({
      integer: Type.UInt16,
      objectArray: [{
        str: Type.String,
        uint: Type.UInt8,
        optionalObject: optional({
          x: Type.Float32,
          y: Type.Float32
        }),
        boolean: Type.Boolean
      }],
      optionalArray: optional([Type.String]),
      booleanTuple: Type.Bools,
      bools8: Type.Bools8,
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
      bools8: [false, false, true, false, false, false, false, true],
    });

    expect(binary.byteLength).toBe(23);

    const decoded = Example.decode(binary);
    const binary2 = Example.encode(decoded);

    expect(binary).toEqual(binary2);
  });

  it('should not encode a non conforming object', () => {
    expect(() => {
      (MyBufferFormat as any).encode(12);
    }).toThrow();

    expect(() => {
      MyBufferFormat.encode({
        a: 17,
        b: [],
        c: 'example' as any, // expects array
      });
    }).toThrow();
  });

  it('should encode a conforming object and read back the data', () => {
    const encoded = MyBufferFormat.encode(validData);
    const decoded = MyBufferFormat.decode(encoded);

    expect(decoded).toEqual(validData);
  });

  it('should encode an array', () => {
    const intArray = new BufferFormat({ data: [Type.Int] });
    expect(intArray.decode(intArray.encode({ data: [] }))).toEqual({ data: [] });
    expect(intArray.decode(intArray.encode({ data: [3] }))).toEqual({ data: [3] });
    expect(intArray.decode(intArray.encode({ data: [3, 14, 15] }))).toEqual({ data: [3, 14, 15] });

    const objArray = new BufferFormat({ data: [{
      v: Type.Int,
      f: Type.String
    }]});
    expect(objArray.decode(objArray.encode({ data: [] }))).toEqual({ data: [] });
    const data = [{
      v: 1,
      f: 'one'
    }, {
      v: 2,
      f: 'two'
    }];
    expect(objArray.decode(objArray.encode({ data }))).toEqual({ data });
  });
});

describe('transforms and validation', () => {
  it('should handle basic case', () => {
    const MyCoder = new BufferFormat({
      id: Type.UInt
    })
      .setTransforms({
        id: x => Math.min(x, 100)
      })
      .setValidation({
        id: x => x > 20,
      });

    const data = MyCoder.encode({
      id: 1000,
    });

    const decoded = MyCoder.decode(data);
    expect(decoded.id).toBe(100);

    expect(() => MyCoder.encode({ id: 21 })).not.toThrow();
    expect(() => MyCoder.encode({ id: 19 })).toThrow();
  });

  it('can use transforms to improve accuracy of lossy types', () => {
    let MyCoder = new BufferFormat({ ball: { rotation: Type.Float16 } });

    const input = { ball: { rotation: 3.1419 }};
    expect(MyCoder.decode(MyCoder.encode(input)).ball.rotation).toBe(3.142578125);

    MyCoder = new BufferFormat({ ball: { rotation: Type.Float16 } })
      .setTransforms({
        ball: { rotation: [ x => x * 1_000, x => x * 0.001 ] }
      });

    expect(input.ball.rotation).toBe(3.1419);
    expect(MyCoder.decode(MyCoder.encode(input)).ball.rotation).toBe(3.142);
  });

  it('should handle advanced case', () => {
    const MyCoder = new BufferFormat({
      id: Type.UInt,
      names: optional([Type.String]),
      dates: [Type.Date],
      myOptionalObject: optional({
        myDate: Type.Date,
      }),
      myObject: {
        myNestedArray: [{
          myFloat16: Type.Float16,
        }]
      }
    })
      .setTransforms({
        names: x => x.toLowerCase(),
        myObject: {
          myNestedArray: {
            myFloat16: [x => x * 2, x => x]
          }
        }
      })
      .setValidation({
        id: x => x >= 1,
        names: x => !/[0-9]/.test(x),
        myOptionalObject: {
          myDate: x => x.getFullYear() > 1994,
        }
      });

    const date = new Date();

    expect(() => MyCoder.encode({
      id: 21,
      names: ['a', 'b'],
      dates: [date],
      myOptionalObject: {
        myDate: date
      },
      myObject: {
        myNestedArray: [
          { myFloat16: 1 },
          { myFloat16: 2 },
        ]
      }
    })).not.toThrow();

    expect(() => MyCoder.encode({
      id: 21,
      names: ['a', 'b'],
      dates: [date],
      myOptionalObject: undefined, // test optional
      myObject: {
        myNestedArray: [
          { myFloat16: 1 },
          { myFloat16: 2 },
        ]
      }
    })).not.toThrow();

    expect(() => MyCoder.encode({
      id: 21,
      names: ['a', '0'],
      dates: [date],
      myOptionalObject: undefined,
      myObject: {
        myNestedArray: [
          { myFloat16: 1 },
          { myFloat16: 2 },
        ]
      }
    })).toThrow();

    const oldDate = new Date();
    oldDate.setFullYear(1885);
    expect(() => MyCoder.encode({
      id: 21,
      names: ['a', 'b'],
      dates: [date],
      myOptionalObject: {
        myDate: oldDate // old date
      },
      myObject: {
        myNestedArray: [
          { myFloat16: 1 },
          { myFloat16: 2 },
        ]
      }
    })).toThrow();

    // decode
    const preEncoded: Decoded<typeof MyCoder> = {
      id: 21,
      names: ['a', 'b'],
      dates: [date],
      myOptionalObject: {
        myDate: date
      },
      myObject: {
        myNestedArray: [
          { myFloat16: 1 },
          { myFloat16: 2 },
        ]
      }
    };

    const encoded = MyCoder.encode(preEncoded);
    const decoded = MyCoder.decode(encoded);

    // Make sure the decode transforms are applied.
    expect(preEncoded.myObject.myNestedArray[0].myFloat16).toBe(1);
    expect(decoded.myObject.myNestedArray[0].myFloat16).toBe(2);
  });
});


describe('BOOLEAN_ARRAY', () => {
  const MyCoder = new BufferFormat({
    name: Type.String,
    coolBools: Type.Bools,
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
  const MyCoder = new BufferFormat({
    name: Type.String,
    coolBools: Type.Bools8,
  });

  it('should encode all booleans below the minimum allowed', () => {
    const before = {
      name: 'my awesome example string',
      coolBools: [false, true, false, true],
    };

    const encoded = MyCoder.encode(before);

    const after = MyCoder.decode(encoded);
    expect(after).toStrictEqual({
      name: 'my awesome example string',
      coolBools: [false, true, false, true, false, false, false, false],
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
    const MyNakedCoder = new BufferFormat(format as any, null);
    const MyClothedCoder = new BufferFormat(format as any);

    expect(MyNakedCoder.header).toBe(undefined);
    expect(MyClothedCoder.header).not.toBe(undefined);

    const binary1 = MyNakedCoder.encode({ name: 'Example' });
    const binary2 = MyClothedCoder.encode({ name: 'Example' });

    expect(binary1.byteLength).toEqual(binary2.byteLength - 2);
  });
});

describe('Bools16', () => {
  const MyCoder = new BufferFormat({
    name: Type.String,
    coolBools: Type.Bools16,
  });

  it('should encode all booleans below the minimum allowed', () => {
    const before = {
      name: 'my awesome example string',
      coolBools: [false, true, true, false, false,],
    };

    const encoded = MyCoder.encode(before);

    const after = MyCoder.decode(encoded);
    expect(after).toStrictEqual({
      name: 'my awesome example string',
      coolBools: [
        false, true, true, false, false, false, false, false,
        false, false, false, false, false, false, false, false,
      ],
    });

    expect(after.coolBools.length).toBe(16);
  });
});

describe('Bools32', () => {
  const MyCoder = new BufferFormat({
    name: Type.String,
    coolBools: Type.Bools32,
    other: optional(Type.String),
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

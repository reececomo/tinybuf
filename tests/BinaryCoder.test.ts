import { strToHashCode } from '../src/core/lib/hashCode';
import { BinaryCoder, Type, Optional } from '../src/index';

describe('BinaryCoder', () => {
  const MyBinaryCoder = new BinaryCoder({
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

  it('should encode all types', () => {
    const MyCoder = new BinaryCoder({
      myBinary: Type.Binary,
      myBoolean: Type.Boolean,
      myBooleanTuple: Type.BooleanTuple,
      myUScalar: Type.UScalar,
      myScalar: Type.Scalar,
      myInt: Type.Int,
      myInt16: Type.Int16,
      myInt32: Type.Int32,
      myInt8: Type.Int8,
      myJSON: Type.JSON,
      myRegExp: Type.RegExp,
      myString: Type.String,
      myOptional: Optional([Type.String]),
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
      myOptionalObject: Optional({
        myDate: Type.Date,
        myBitmask16: Type.Bitmask16,
        myBitmask32: Type.Bitmask32,
        myBitmask8: Type.Bitmask8,
      })
    });

    const before = {
      myBinary: new TextEncoder().encode('binary').buffer,
      myBoolean: true,
      myBooleanTuple: [false, true],
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
        myBitmask8: [
          true, false, true, false, true, false, true, false
        ],
        myBitmask16: [
          true, false, true, false, true, false, true, false,
          true, false, true, false, true, false, true, false
        ],
        myBitmask32: [
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
    expect(MyCoder.format).toEqual('{binary,bool,booltuple,uscalar,scalar,int,int16,int32,int8,json,regex,str,str[]?,{uint,uint16,uint32,uint8,{float16,float32,float64}[]},{date,bitmask16,bitmask32,bitmask8}?}');
  });

  it('should correctly parse a type', () => {
    expect(MyBinaryCoder).toMatchObject({
      __proto__: BinaryCoder.prototype,
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
    const coder = new BinaryCoder({ a: Type.UInt }, undefined);
    expect(coder.Id).not.toBe(undefined);

    const data = coder.encode({ a: 0 });
    expect(data.byteLength).toBe(3);
  });

  it('should encode Id when set manually', () => {
    const coder = new BinaryCoder({ a: Type.UInt }, 32);
    expect(coder.Id).not.toBe(undefined);

    const data = coder.encode({ a: 0 });
    expect(data.byteLength).toBe(3);
  });

  it('should encode no Id when Id is false', () => {
    const coder = new BinaryCoder({ a: Type.UInt }, false);
    expect(coder.Id).toBe(undefined);

    const data = coder.encode({ a: 0 });
    expect(data.byteLength).toBe(1);
  });

  it('should match ids based on shape, but not keys', () => {
    const coderA = new BinaryCoder({
      abc: Type.UInt,
      bef: Type.Int16,
      ghi: [Type.String],
    });
    const coderB = new BinaryCoder({
      xyz: Type.UInt,
      yzx: Type.Int16,
      zyx: [Type.String],
    });
    expect(coderA.Id).toBe(coderB.Id);

    // Sanity check.
    expect(coderA.Id).not.toBe(false);
    expect(coderA.Id).not.toBe(
      new BinaryCoder({
        yzx: Type.Int16,
        xyz: Type.UInt,
        zyx: [Type.String],
      }).Id
    );
  });

  it('should allow string ids ', () => {
    const coderA = new BinaryCoder({
      abc: Type.UInt,
      bef: Type.Int16,
      ghi: [Type.String],
    }, 'AB');

    const coderB = new BinaryCoder({
      xyz: Type.UInt,
      yzx: Type.Int16,
      zyx: [Type.String],
    }, 'ab');

    // Sanity check.
    expect(coderA.Id).not.toBe(coderB.Id);

    // Check
    expect(coderA.Id).toBe('AB');
    expect(typeof coderA.Id).toBe('string');

    const data = coderA.encode({ abc: 1, bef: 2, ghi: ['lorem'] });
    expect(BinaryCoder.peekStrId(data)).toBe('AB');
  });

  it('should throw TypeError when passed an invalid Id', () => {
    expect(() => new BinaryCoder({ data: Type.UInt }, true as any)).toThrow(TypeError);
    expect(() => new BinaryCoder({ data: Type.UInt }, -1)).toThrow(TypeError);
    expect(() => new BinaryCoder({ data: Type.UInt }, 65_536)).toThrow(TypeError);
    expect(() => new BinaryCoder({ data: Type.UInt }, 1.01)).toThrow(TypeError);
  });

  it('should throw TypeError when an array contains non-1 value', () => {
    expect(() => new BinaryCoder({ data: [] as any })).toThrow(TypeError);
    expect(() => new BinaryCoder({ data: [Type.String, Type.String] as any })).toThrow(TypeError);
  });

  it('should throw TypeError when root object is optional', () => {
    expect(() => new BinaryCoder(Optional({ a: Type.UInt }) as any)).toThrow(TypeError);
  });

  it('should throw TypeError when root object is unknown coder type', () => {
    expect(() => new BinaryCoder('bigint128' as any)).toThrow(TypeError);
  });

  it('decode() emits output that is valid input for encode()', () => {
    const Example = new BinaryCoder({
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
  });

  it('should not encode a non conforming object', () => {
    expect(() => {
      (MyBinaryCoder as any).encode(12);
    }).toThrow();

    expect(() => {
      MyBinaryCoder.encode({
        a: 17,
        b: [],
        c: [{
          d: true as any // should be boolean
        }]
      });
    }).toThrow();
  });

  it('should encode a conforming object and read back the data', () => {
    const encoded = MyBinaryCoder.encode(validData);
    const decoded = MyBinaryCoder.decode(encoded);

    expect(decoded).toEqual(validData);
  });

  it('should encode an array', () => {
    const intArray = new BinaryCoder({ data: [Type.Int] });
    expect(intArray.decode(intArray.encode({ data: [] }))).toEqual({ data: [] });
    expect(intArray.decode(intArray.encode({ data: [3] }))).toEqual({ data: [3] });
    expect(intArray.decode(intArray.encode({ data: [3, 14, 15] }))).toEqual({ data: [3, 14, 15] });

    const objArray = new BinaryCoder({ data: [{
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


describe('BOOLEAN_ARRAY', () => {
  const MyCoder = new BinaryCoder({
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
  const MyCoder = new BinaryCoder({
    name: Type.String,
    coolBools: Type.Bitmask8,
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
    const MyNakedCoder = new BinaryCoder(format as any, false);
    const MyClothedCoder = new BinaryCoder(format as any);

    expect(MyNakedCoder.Id).toBe(undefined);
    expect(MyClothedCoder.Id).not.toBe(undefined);

    const binary1 = MyNakedCoder.encode({ name: 'Example' });
    const binary2 = MyClothedCoder.encode({ name: 'Example' });

    expect(binary1.byteLength).toEqual(binary2.byteLength - 2);
  });
});

describe('Bitmask16', () => {
  const MyCoder = new BinaryCoder({
    name: Type.String,
    coolBools: Type.Bitmask16,
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

describe('Bitmask32', () => {
  const MyCoder = new BinaryCoder({
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

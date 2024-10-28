import { BufferFormat, Decoded, defineFormat } from "../core/BufferFormat";
import { optional, Type } from "../core/Type";

describe("BufferFormat", () => {
  const MyBufferFormat = defineFormat({
    a: Type.Int,
    b: [Type.Int],
    c: [{
      d: optional(Type.String)
    }],
  });

  describe("default shared buffer behavior", () => {
    it("encoding recycles the same buffer", () => {
      const TestFormat = defineFormat("AB", { value: Type.String });
      const abcd = TestFormat.encode({ value: "abcd" });
      const efgh = TestFormat.encode({ value: "efgh" });

      expect(TestFormat.decode(efgh)).toEqual({ value: "efgh" });
      expect(TestFormat.decode(abcd)).not.toEqual({ value: "abcd" });
      expect(TestFormat.decode(abcd)).toEqual({ value: "efgh" });
    });

    it("safe=true encoding preserves the buffer", () => {
      const TestFormat = defineFormat("AB", { value: Type.String });
      const abcd = TestFormat.encode({ value: "abcd" }, true);
      const efgh = TestFormat.encode({ value: "efgh" });

      expect(TestFormat.decode(efgh)).toEqual({ value: "efgh" });
      expect(TestFormat.decode(abcd)).toEqual({ value: "abcd" });
    });
  });

  it("can decode into an existing deep object to preserve memory", () => {
    const input1 = MyBufferFormat.encode({
      a: 1,
      b: [1, 2, 3],
      c: [
        { d: "lorem" },
        { d: "ipsum" },
      ],
    }, true);
    const input2 = MyBufferFormat.encode({
      a: 1,
      b: [5, 6, 7],
      c: [
        { d: "dolor" },
        { d: "sit" },
      ],
    }, true);
    const input3WithShorterArrs = MyBufferFormat.encode({
      a: 2,
      b: [8, 9],
      c: [
        { d: "amet" },
      ],
    }, true);
    const input4WithLongerArrs = MyBufferFormat.encode({
      a: 2,
      b: [1, 2, 3, 4],
      c: [
        { /* no d */ },
        { d: "lorem" },
        { d: "ipsum" },
        { d: "dolor" },
      ],
    }, true);

    // Create memory
    const obj: Partial<Decoded<typeof MyBufferFormat>> = {};

    MyBufferFormat.decode(input1, obj);
    expect(obj).toStrictEqual({
      a: 1,
      b: [1, 2, 3],
      c: [
        { d: "lorem" },
        { d: "ipsum" },
      ],
    });

    const objB1 = obj.b;
    const objC1D1 = obj.c![0];
    const objC1D2 = obj.c![1];

    // sanity check, props exist
    expect(objC1D1).toStrictEqual({ d: "lorem" });

    MyBufferFormat.decode(input2, obj);
    expect(obj).toStrictEqual({
      a: 1,
      b: [5, 6, 7],
      c: [
        { d: "dolor" },
        { d: "sit" },
      ],
    });

    expect(objB1).toBe(obj.b); // same length arrays are re-used
    expect(objC1D1).toBe(obj.c![0]); // object instances are re-used

    MyBufferFormat.decode(input3WithShorterArrs, obj);
    expect(obj).toStrictEqual({
      a: 2,
      b: [8, 9],
      c: [
        { d: "amet" },
      ],
    });

    const objB2 = obj.b;
    expect(objB1).not.toBe(objB2); // shorter arrays trigger new array instance
    expect(objC1D1).toBe(obj.c![0]); // but underlying object instances ARE recycled

    MyBufferFormat.decode(input4WithLongerArrs, obj);
    expect(obj).toStrictEqual({
      a: 2,
      b: [1, 2, 3, 4],
      c: [
        { d: undefined },
        { d: "lorem" },
        { d: "ipsum" },
        { d: "dolor" },
      ],
    });

    expect(objB2).not.toBe(obj.b); // longer arrays trigger new array instance also
    expect(objC1D1).toBe(obj.c![0]); // underlying object instances ARE recycled
    expect(objC1D2).not.toBe(obj.c![1]); // ...but only when they existed in the previous instance
  });

  it("can decode a bools bitmask in-place", () => {
    const MyBoolsFormat = defineFormat({
      bools: Type.Bools,
    });

    const bytes1 = MyBoolsFormat.encode({ bools: [true, false, true]}, true);
    const decoded1 = MyBoolsFormat.decode(bytes1);
    expect(decoded1.bools).toStrictEqual([true, false, true]);

    const bytes2 = MyBoolsFormat.encode({ bools: [false, false, true]}, true);
    const decoded2 = MyBoolsFormat.decode(bytes2, decoded1);
    expect(decoded2.bools).toStrictEqual([false, false, true]);
    expect(decoded1.bools).toStrictEqual([false, false, true]); // should be over-written
  });

  it("should encode all types", () => {
    const MyCoder = defineFormat({
      myBuffer: Type.Buffer,
      myBoolean: Type.Bool,
      myBools: Type.Bools,
      myUScalar: Type.UScalar8,
      myScalar: Type.Scalar8,
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
          myBFloat16: Type.BFloat16,
          myFloat16: Type.Float16,
          myFloat32: Type.Float32,
          myFloat64: Type.Float64,
        }]
      },
      myOptionalObject: optional({
        myDate: Type.Date,
        value2: Type.Float32,
      })
    });

    const before = {
      myBuffer: new TextEncoder().encode("binary"),
      myBoolean: true,
      myBools: [false, true],
      myUScalar: 0.5,
      myScalar: -0.5,
      myInt: 1,
      myInt16: -260,
      myInt32: -32767,
      myInt8: -12,
      myJSON: {
        nestedData: "wow"!
      },
      myRegExp: /test/gi,
      myString: "example",
      myOptional: ["multiple", "strings"],
      myObject: {
        myUInt: 1,
        myUInt16: 256,
        myUInt32: 65000,
        myUInt8: 1,
        myNestedArray: [
          {
            myBFloat16: 1.2265625,
            myFloat16: 1.23046875,
            myFloat32: 1.2300000190734863,
            myFloat64: 1.23,
          },
          {
            myBFloat16: 1.2265625,
            myFloat16: 1.23046875,
            myFloat32: 1.2300000190734863,
            myFloat64: 1.23,
          }
        ]
      },
      myOptionalObject: {
        myDate: new Date(),
        value2: 10.5,
      }
    };

    const encoded = MyCoder.encode(before);
    const after = MyCoder.decode(encoded);

    expect(after).toStrictEqual(before);
    expect(after.myOptionalObject?.value2).toBeCloseTo(10.5);

    // eslint-disable-next-line max-len
    // expect((MyCoder as any)._$formatStr).toEqual('{20,14,15,13,12,5,7,8,6,21,22,19,19[]?,{1,3,4,2,{11,10,9}[]},{23,17,18,16}?}');
  });

  it("should encode hash code as header when header is not set", () => {
    const coder = defineFormat({ a: Type.UInt });
    expect(coder.header).not.toBe(undefined);

    const data = coder.encode({ a: 0 });
    expect(data.byteLength).toBe(3);
  });

  it("should encode header when set manually", () => {
    const coder = defineFormat(32, { a: Type.UInt });
    expect(coder.header).not.toBe(undefined);

    const data = coder.encode({ a: 0 });
    expect(data.byteLength).toBe(3);
  });

  it("should encode no header when header is null", () => {
    const coder = defineFormat(null, { a: Type.UInt });
    expect(coder.header).toBe(undefined);

    const data = coder.encode({ a: 0 });
    expect(data.byteLength).toBe(1);
  });

  it("should match ids based on shape, but not keys", () => {
    const coderA = defineFormat({
      abc: Type.UInt,
      bef: Type.Int16,
      ghi: [Type.String],
    });
    const coderB = defineFormat({
      xyz: Type.UInt,
      yzx: Type.Int16,
      zyx: [Type.String],
    });
    expect(coderA.header).toBe(coderB.header);

    // Sanity check.
    expect(coderA.header).not.toBe(false);
    expect(coderA.header).not.toBe(
      defineFormat({
        yzx: Type.Int16,
        xyz: Type.UInt,
        zyx: [Type.String],
      }).header
    );
  });

  it("should allow string ids ", () => {
    const coderA = defineFormat("AB", {
      abc: Type.UInt,
      bef: Type.Int16,
      ghi: [Type.String],
    });

    const coderB = defineFormat("ab", {
      xyz: Type.UInt,
      yzx: Type.Int16,
      zyx: [Type.String],
    });

    // Sanity check.
    expect(coderA.header).not.toBe(coderB.header);

    // Check
    expect(coderA.header).toBe("AB");
    expect(typeof coderA.header).toBe("string");

    const data = coderA.encode({ abc: 1, bef: 2, ghi: ["lorem"] });
    expect(BufferFormat.peekHeaderStr(data)).toBe("AB");
  });

  it("should work", () => {
    const myFormat = defineFormat("Ha", {
      $exampleA: optional(Type.String),
      $b: {
        $c: Type.UInt,
        $d: Type.UInt
      },
    });

    myFormat.encode({ $exampleA: undefined, $b: { $c: 2, $d: 1 }});
  });

  it("should throw TypeError when passed an invalid header", () => {
    expect(() => defineFormat(true as any, { data: Type.UInt })).toThrow(TypeError);
    expect(() => defineFormat(-1, { data: Type.UInt })).toThrow(TypeError);
    expect(() => defineFormat(65_536, { data: Type.UInt })).toThrow(TypeError);
    expect(() => defineFormat(1.01, { data: Type.UInt })).toThrow(TypeError);
  });

  it("should throw TypeError when an array contains non-1 value", () => {
    expect(() => defineFormat({ data: [] as any })).toThrow(TypeError);
    expect(() => defineFormat({ data: [Type.String, Type.String] as any })).toThrow(TypeError);
  });

  it("should throw TypeError when root object is optional", () => {
    expect(() => defineFormat(optional({ a: Type.UInt }) as any)).toThrow(TypeError);
  });

  it("should throw TypeError when root object is unknown coder type", () => {
    expect(() => defineFormat("bigint128" as any)).toThrow(TypeError);
  });

  it("encodeInto()", () => {
    const data = new Uint8Array(32);
    const input = {
      a: 100,
      b: [100, 200],
      c: [
        { d: undefined },
        { d: "lol" }
      ]
    };

    expect(data.toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0");
    const result = MyBufferFormat.encodeInto(input, data);
    expect(data.toString()).not.toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0");

    const reversed = MyBufferFormat.decode(result);
    expect(reversed).toStrictEqual(input);
  });

  it("decode() emits output that is valid input for encode()", () => {
    const Example = defineFormat({
      integer: Type.UInt16,
      objectArray: [{
        str: Type.String,
        uint: Type.UInt8,
        optionalObject: optional({
          x: Type.Float32,
          y: Type.Float32
        }),
        boolean: Type.Bool
      }],
      optionalArray: optional([Type.String]),
      booleanTuple: Type.Bools,
    });

    const binary = Example.encode({
      integer: 123,
      objectArray: [
        {
          str: "lol",
          uint: 100,
          optionalObject: {
            x: 1,
            y: 2.3
          },
          boolean: true
        }
      ],
      booleanTuple: [true, false, true],
    });

    expect(binary.byteLength).toBe(22);

    const decoded = Example.decode(binary);
    const binary2 = Example.encode(decoded);

    expect(binary).toEqual(binary2);
  });

  it("should not encode a non conforming object", () => {
    expect(() => {
      (MyBufferFormat as any).encode(12);
    }).toThrow();

    expect(() => {
      MyBufferFormat.encode({
        a: 17,
        b: [],
        c: "example" as any, // expects array
      });
    }).toThrow();
  });

  it("should encode a conforming object and read back the data", () => {
    const validData = {
      a: 22,
      b: [-3, 14, -15, 92, -65, 35],
      c: [
        {
          d: "Hello World"
        },
        {},
        {
          d: "?"
        },
      ],
    };

    const encoded = MyBufferFormat.encode(validData);
    const decoded = MyBufferFormat.decode(encoded);

    expect(decoded).toEqual(validData);
  });

  it("should encode an array", () => {
    const intArray = defineFormat({ data: [Type.Int] });
    expect(intArray.decode(intArray.encode({ data: [] }))).toEqual({ data: [] });
    expect(intArray.decode(intArray.encode({ data: [3] }))).toEqual({ data: [3] });
    expect(intArray.decode(intArray.encode({ data: [3, 14, 15] }))).toEqual({ data: [3, 14, 15] });

    const objArray = defineFormat({ data: [{
      v: Type.Int,
      f: Type.String
    }]});
    expect(objArray.decode(objArray.encode({ data: [] }))).toEqual({ data: [] });
    const data = [{
      v: 1,
      f: "one"
    }, {
      v: 2,
      f: "two"
    }];
    expect(objArray.decode(objArray.encode({ data }))).toEqual({ data });
  });
});

describe("transforms and validation", () => {
  it("should handle basic case", () => {
    const MyCoder = defineFormat({
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

  it("should handle advanced case", () => {
    const MyCoder = defineFormat({
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
      names: ["a", "b"],
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
      names: ["a", "b"],
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
      names: ["a", "0"],
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
      names: ["a", "b"],
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
      names: ["a", "b"],
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


describe("Bools", () => {
  const MyCoder = defineFormat({
    name: Type.String,
    coolBools: Type.Bools,
  });

  it("should encode less than 8", () => {
    const before = {
      name: "my awesome example string",
      coolBools: [false, true, false, true, false],
    };

    const encoded = MyCoder.encode(before);

    const after = MyCoder.decode(encoded);
    expect(after).toStrictEqual({
      name: "my awesome example string",
      coolBools: [false, true, false, true, false],
    });

    expect(before.coolBools.length).toBe(after.coolBools.length);
  });

  it("should encode any number of bools", () => {
    const before = {
      name: "my awesome example string",
      coolBools: [
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
      ],
    };

    const encoded = MyCoder.encode(before);

    const after = MyCoder.decode(encoded);
    expect(after).toStrictEqual({
      name: "my awesome example string",
      coolBools: [
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
        false, false, true, false, true, false, true, false, true,
      ],
    });

    expect(before.coolBools.length).toBe(27);
    expect(after.coolBools.length).toBe(27);
  });
});

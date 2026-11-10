import { defineFormat } from "../core/BufferFormat";
import { optional, Type } from "../core/Type";
import { BufferReader } from "../core/lib/BufferReader";
import { BufferWriter } from "../core/lib/BufferWriter";
import { $strToHashCode } from "../core/lib/hashCode";
import { TinybufError } from "../core/lib/errors";
import { peekHeader } from "../core/lib/peek";

type CtorName = "DataView" | "Uint8Array";

function countConstructs(names: CtorName[], fn: () => void): Record<CtorName, number> {
  const g = globalThis as any;
  const counts = { DataView: 0, Uint8Array: 0 };
  const originals = names.map(name => g[name]);

  names.forEach((name, i) => {
    g[name] = new Proxy(originals[i], {
      construct(target, args, newTarget) {
        counts[name]++;
        return Reflect.construct(target, args, newTarget === g[name] ? target : newTarget);
      },
    });
  });

  try {
    fn();
  }
  finally {
    names.forEach((name, i) => g[name] = originals[i]);
  }

  return counts;
}

describe("allocation-free hot paths", () => {
  const Format = defineFormat({
    id: Type.UInt,
    blob: Type.Buffer,
    floats: [Type.Float32],
    child: optional({
      x: Type.Int16,
      tags: [Type.UInt8],
    }),
    children: [{ v: Type.UInt16 }],
  });

  const input = {
    id: 42,
    blob: new Uint8Array([1, 2, 3, 4, 5]),
    floats: [0.5, 1.5, -2.25],
    child: { x: -7, tags: [9, 8, 7] },
    children: [{ v: 1 }, { v: 2 }],
  };

  describe("BufferWriter.$reset()", () => {
    it("reuses the DataView for any view of the same buffer, and rebuilds it for a new buffer", () => {
      const buffer = new ArrayBuffer(32);
      const writer = new BufferWriter(new Uint8Array(buffer, 4, 16));
      const dv = (writer as any)._$dataView;

      expect(dv.byteOffset).toBe(0);
      expect(dv.byteLength).toBe(32);

      writer.$writeUint8(1);
      writer.$reset(new Uint8Array(buffer, 5, 8));
      expect(writer.$byteLength).toBe(0);
      expect((writer as any)._$dataView).toBe(dv);

      writer.$reset(new Uint8Array(buffer));
      expect((writer as any)._$dataView).toBe(dv);

      writer.$reset(new Uint8Array(32));
      expect((writer as any)._$dataView).not.toBe(dv);
      expect((writer as any)._$dataView.buffer).not.toBe(buffer);
    });

    it("writes only within the target view", () => {
      const bytes = new Uint8Array(16);
      const writer = new BufferWriter(bytes.subarray(4, 8));

      writer.$writeUint16(0x0102);
      writer.$writeUint16(0x0304);
      expect(() => writer.$writeUint8(5)).toThrow(TinybufError);

      expect(Array.from(writer.$viewBytes())).toEqual([1, 2, 3, 4]);
      expect(Array.from(writer.$copyBytes())).toEqual([1, 2, 3, 4]);
      expect(writer.$viewBytes().byteOffset).toBe(4);
      expect(Array.from(bytes)).toEqual([0, 0, 0, 0, 1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it("does not resize after retargeting a resizable writer", () => {
      const writer = new BufferWriter(4);
      writer.$reset(new Uint8Array(2));

      expect(() => writer.$writeUint32(1)).toThrow(TinybufError);
    });
  });

  describe("BufferWriter.$writeBytes()", () => {
    it("copies all input kinds at the write head of an offset view", () => {
      const buffer = new Uint8Array(24).fill(0xaa);
      const writer = new BufferWriter(buffer.subarray(3, 20));

      writer.$writeUint8(0);
      writer.$writeBytes(new Uint8Array([1, 2]));
      writer.$writeBytes(new Uint8Array([9, 3, 4, 9]).subarray(1, 3));
      writer.$writeBytes(new Uint8Array([5, 6]).buffer);
      writer.$writeBytes(new DataView(new Uint8Array([9, 7, 8]).buffer, 1));
      writer.$writeBytes(new Uint16Array([0x0a09]));

      expect(Array.from(writer.$viewBytes())).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(Array.from(buffer.subarray(0, 3))).toEqual([0xaa, 0xaa, 0xaa]);
      expect(Array.from(buffer.subarray(14))).toEqual(new Array(10).fill(0xaa));
    });

    it("copies across a resize", () => {
      const writer = new BufferWriter(2);
      writer.$writeUint8(1);
      writer.$writeBytes(new Uint8Array(64).fill(7));

      expect(writer.$byteLength).toBe(65);
      expect(writer.$viewBytes()[0]).toBe(1);
      expect(writer.$viewBytes()[64]).toBe(7);
    });

    it("does not construct a view for Uint8Array input", () => {
      const writer = new BufferWriter(new Uint8Array(16));
      const bytes = new Uint8Array([1, 2, 3]);

      const counts = countConstructs(["DataView", "Uint8Array"], () => writer.$writeBytes(bytes));

      expect(counts).toEqual({ DataView: 0, Uint8Array: 0 });
      expect(Array.from(writer.$viewBytes())).toEqual([1, 2, 3]);
    });
  });

  describe("BufferReader.$reset()", () => {
    it("reuses the DataView for any view of the same buffer, and rebuilds it for a new buffer", () => {
      const buffer = new ArrayBuffer(16);
      const view = new Uint8Array(buffer, 2, 8);
      const reader = new BufferReader(view, 2);
      const dv = (reader as any)._$dataView;

      expect(dv.byteOffset).toBe(0);
      expect(dv.byteLength).toBe(16);

      reader.$readUint8();
      reader.$reset(view, 2);
      expect(reader.i).toBe(2);
      expect((reader as any)._$dataView).toBe(dv);

      reader.$reset(new Uint8Array(buffer, 3, 4));
      expect(reader.i).toBe(0);
      expect((reader as any)._$dataView).toBe(dv);

      reader.$reset(buffer);
      expect((reader as any)._$dataView).toBe(dv);

      reader.$reset(new Uint8Array(16));
      expect((reader as any)._$dataView).not.toBe(dv);
    });

    it("adopts a DataView input, and rebuilds only for views outside it", () => {
      const buffer = new ArrayBuffer(16);
      const external = new DataView(buffer, 4, 8);
      const reader = new BufferReader(new Uint8Array(4));

      reader.$reset(external);
      expect((reader as any)._$dataView).toBe(external);

      reader.$reset(new Uint8Array(buffer, 6, 4));
      expect((reader as any)._$dataView).toBe(external);

      reader.$reset(new Uint8Array(buffer, 2, 4));
      expect((reader as any)._$dataView).not.toBe(external);
      expect((reader as any)._$dataView.byteLength).toBe(16);
    });

    it("reads only within the source view", () => {
      const bytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      const reader = new BufferReader(bytes.subarray(2, 5));

      expect(reader.$peek()).toBe(3);
      expect(reader.$readUint16()).toBe(0x0304);
      expect(() => reader.$readUint16()).toThrow(RangeError);
      expect(reader.$readUint8()).toBe(5);
      expect(() => reader.$peek()).toThrow(RangeError);
      expect(() => reader.$readUint8()).toThrow(RangeError);

      reader.$reset(bytes.subarray(4, 8));
      expect(Array.from(reader.$readBytes(4))).toEqual([5, 6, 7, 8]);
      expect(() => reader.$readBytes(1)).toThrow(RangeError);
    });
  });

  describe("shared buffer slots", () => {
    const Slot = defineFormat({ id: Type.UInt16, value: Type.Float32, name: Type.String });
    const values = [0, 1, 2, 3].map(i => ({ id: i, value: i + 0.5, name: "slot" + i }));

    it("encodes into consecutive slots of one ArrayBuffer without rebuilding the DataView", () => {
      const slotSize = 16;
      const pool = new ArrayBuffer(slotSize * values.length);
      const slots = values.map((_, i) => new Uint8Array(pool, i * slotSize, slotSize));
      const lengths = [];

      lengths.push(Slot.encodeIntoLength(values[0], slots[0]));
      const dv = (Slot as any)._$intoWriter._$dataView;

      for (let i = 1; i < values.length; i++) {
        lengths.push(Slot.encodeIntoLength(values[i], slots[i]));
        expect((Slot as any)._$intoWriter._$dataView).toBe(dv);
      }

      for (let i = 0; i < values.length; i++) {
        expect(Slot.decode(slots[i].subarray(0, lengths[i]))).toEqual(values[i]);
        expect(Array.from(slots[i].subarray(lengths[i]))).toEqual(new Array(slotSize - lengths[i]).fill(0));
      }
    });

    it("decodes several subarray views of one buffer without rebuilding the DataView", () => {
      const packet = new Uint8Array(128);
      const views: Uint8Array[] = [];
      let offset = 3;

      for (const value of values) {
        const view = Slot.encodeInto(value, packet.subarray(offset));
        views.push(view);
        offset += view.byteLength;
      }

      expect(Slot.decode(views[0])).toEqual(values[0]);
      const dv = (Slot as any)._$reader._$dataView;
      expect(dv.buffer).toBe(packet.buffer);

      const counts = countConstructs(["DataView"], () => {
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 0; i < views.length; i++) {
            expect(Slot.decode(views[i])).toEqual(values[i]);
          }
        }
      });

      expect(counts.DataView).toBe(0);
      expect((Slot as any)._$reader._$dataView).toBe(dv);
    });

    it("throws when decoding a view truncated within a larger buffer", () => {
      const packet = new Uint8Array(64);
      const view = Slot.encodeInto(values[1], packet.subarray(5));

      expect(() => Slot.decode(view.subarray(0, view.byteLength - 1))).toThrow(RangeError);
    });
  });

  describe("encodeInto() / encodeIntoLength()", () => {
    it("returns the same bytes as encode()", () => {
      const expected = Array.from(Format.encode(input, true));
      const target = new Uint8Array(64);

      const view = Format.encodeInto(input, target);
      expect(view.buffer).toBe(target.buffer);
      expect(view.byteOffset).toBe(0);
      expect(Array.from(view)).toEqual(expected);

      target.fill(0);
      expect(Format.encodeIntoLength(input, target)).toBe(expected.length);
      expect(Array.from(target.subarray(0, expected.length))).toEqual(expected);
    });

    it("retargets across buffers and offset views", () => {
      const expected = Array.from(Format.encode(input, true));
      const shared = new Uint8Array(256).fill(0xaa);
      const targets = [
        new Uint8Array(64),
        shared.subarray(7, 71),
        shared.subarray(100, 164),
        new Uint8Array(64),
        shared.subarray(7, 71),
      ];

      for (const target of targets) {
        const view = Format.encodeInto(input, target);

        expect(view.buffer).toBe(target.buffer);
        expect(view.byteOffset).toBe(target.byteOffset);
        expect(Array.from(view)).toEqual(expected);
        expect(Format.decode(view)).toEqual(input);
      }

      expect(shared[6]).toBe(0xaa);
      expect(shared[7 + expected.length]).toBe(0xaa);
      expect(shared[99]).toBe(0xaa);
    });

    it("throws when the target is too small, then recovers", () => {
      const tooSmall = new Uint8Array(4);

      expect(() => Format.encodeInto(input, tooSmall)).toThrow(TinybufError);
      expect(() => Format.encodeIntoLength(input, tooSmall)).toThrow(TinybufError);

      expect(Format.decode(Format.encodeInto(input, new Uint8Array(64)))).toEqual(input);
    });

    it("encodeIntoLength() does not allocate after warm-up", () => {
      const Simple = defineFormat({
        id: Type.UInt,
        blob: Type.Buffer,
        floats: [Type.Float32],
      });
      const data = { id: 9, blob: new Uint8Array([1, 2, 3]), floats: [1, 2] };
      const target = new Uint8Array(32);
      const length = Simple.encodeIntoLength(data, target);
      const subarray = jest.spyOn(Uint8Array.prototype, "subarray");

      let result = 0;
      const counts = countConstructs(["DataView", "Uint8Array"], () => {
        result = Simple.encodeIntoLength(data, target);
      });

      expect(subarray).not.toHaveBeenCalled();
      subarray.mockRestore();

      expect(counts).toEqual({ DataView: 0, Uint8Array: 0 });
      expect(result).toBe(length);
      expect(Simple.decode(target.subarray(0, length))).toEqual(data);
    });
  });

  describe("decode() / decodeInto()", () => {
    it("decodes across buffers, views with offsets, DataViews and ArrayBuffers", () => {
      const other = { ...input, id: 7, floats: [3], children: [] };
      const shared = new Uint8Array(256);

      const a = Format.encodeInto(input, shared.subarray(5));
      const b = Format.encodeInto(other, shared.subarray(130));
      const aBuffer = a.slice().buffer;
      const bDataView = new DataView(b.buffer, b.byteOffset, b.byteLength);

      for (let i = 0; i < 2; i++) {
        expect(Format.decode(a)).toEqual(input);
        expect(Format.decode(b)).toEqual(other);
        expect(Format.decode(aBuffer)).toEqual(input);
        expect(Format.decode(bDataView)).toEqual(other);
        expect(Format.decodeInto(a, {})).toEqual(input);
      }
    });

    it("does not construct a DataView after warm-up", () => {
      const bytes = Format.encode(input, true);
      const obj = {};
      Format.decodeInto(bytes, obj);

      const counts = countConstructs(["DataView"], () => {
        Format.decodeInto(bytes, obj);
      });

      expect(counts.DataView).toBe(0);
      expect(obj).toEqual(input);
    });

    it("releases the shared reader after a decode error", () => {
      const bytes = Format.encode(input, true);
      Format.decode(bytes);
      const reader = (Format as any)._$reader;

      expect(() => Format.decode(bytes.subarray(0, 4))).toThrow();
      expect((Format as any)._$reader).toBe(reader);
      expect(Format.decode(bytes)).toEqual(input);
    });
  });

  describe("re-entrancy", () => {
    const Node = defineFormat({
      payload: Type.Buffer,
      id: Type.UInt,
    });

    const scratch = new Uint8Array(64);

    Node.setTransforms({
      payload: [
        (v: any) => ArrayBuffer.isView(v) ? v : Node.encodeInto(v, scratch),
        (b: any) => b.byteLength > 0 ? Node.decode(b) : b,
      ] as any,
    });

    it("encodes and decodes a format nested within its own transforms", () => {
      const data: any = { payload: { payload: new Uint8Array(0), id: 2 }, id: 1 };
      const target = new Uint8Array(64);

      Node.decode(Node.encodeInto(data, target));
      const writer = (Node as any)._$intoWriter;
      const reader = (Node as any)._$reader;

      const length = Node.encodeIntoLength(data, target);
      expect((Node as any)._$intoWriter).toBe(writer);

      const decoded: any = Node.decode(target.subarray(0, length));
      expect((Node as any)._$reader).toBe(reader);

      expect(decoded.id).toBe(1);
      expect(decoded.payload.id).toBe(2);
      expect(decoded.payload.payload.byteLength).toBe(0);
    });
  });

  describe("decoded array reuse", () => {
    const ArrFormat = defineFormat({
      values: [Type.UInt],
      items: [{ v: Type.UInt }],
    });

    it("keeps array identity when arrays shrink and grow", () => {
      const obj: any = {};
      ArrFormat.decodeInto(ArrFormat.encode({ values: [1, 2, 3], items: [{ v: 1 }, { v: 2 }] }, true), obj);

      const values = obj.values;
      const items = obj.items;
      const item0 = items[0];

      ArrFormat.decodeInto(ArrFormat.encode({ values: [4], items: [{ v: 3 }] }, true), obj);
      expect(obj).toEqual({ values: [4], items: [{ v: 3 }] });
      expect(obj.values).toBe(values);
      expect(obj.items).toBe(items);
      expect(obj.items[0]).toBe(item0);

      ArrFormat.decodeInto(ArrFormat.encode({ values: [5, 6, 7, 8], items: [{ v: 4 }, { v: 5 }, { v: 6 }] }, true), obj);
      expect(obj).toEqual({ values: [5, 6, 7, 8], items: [{ v: 4 }, { v: 5 }, { v: 6 }] });
      expect(obj.values).toBe(values);
      expect(obj.items).toBe(items);
      expect(obj.items[0]).toBe(item0);

      ArrFormat.decodeInto(ArrFormat.encode({ values: [], items: [] }, true), obj);
      expect(obj).toEqual({ values: [], items: [] });
      expect(obj.values).toBe(values);
    });

    it("reuses element objects dropped by a shrink when the array grows again", () => {
      const obj: any = {};
      ArrFormat.decodeInto(ArrFormat.encode({ values: [], items: [{ v: 1 }, { v: 2 }, { v: 3 }] }, true), obj);

      const [item0, item1, item2] = obj.items;

      ArrFormat.decodeInto(ArrFormat.encode({ values: [], items: [{ v: 4 }] }, true), obj);
      expect(obj.items).toEqual([{ v: 4 }]);
      expect(obj.items[0]).toBe(item0);

      ArrFormat.decodeInto(ArrFormat.encode({ values: [], items: [{ v: 5 }, { v: 6 }, { v: 7 }] }, true), obj);
      expect(obj.items).toEqual([{ v: 5 }, { v: 6 }, { v: 7 }]);
      expect(new Set(obj.items)).toEqual(new Set([item0, item1, item2]));
    });

    it("creates no more element objects than the longest arrays need", () => {
      const NestedFormat = defineFormat({
        frames: [{ seq: Type.UInt, inputs: [{ x: Type.Scalar8, y: Type.Scalar8 }] }],
      });
      const make = (n: number): { frames: { seq: number; inputs: { x: number; y: number }[] }[] } => ({
        frames: Array.from({ length: n }, (_, i) => ({ seq: i, inputs: Array.from({ length: (n + i) % 3 + 1 }, () => ({ x: 0.5, y: -0.5 })) })),
      });
      const encoded = [3, 9, 1, 12, 5, 0, 10, 7].map(n => NestedFormat.encode(make(n), true));
      const obj: any = {};
      const seen = new Set<object>();

      for (let pass = 0; pass < 20; pass++) {
        for (const bytes of encoded) {
          NestedFormat.decodeInto(bytes, obj);

          for (const frame of obj.frames) {
            seen.add(frame);
            seen.add(frame.inputs);
            for (const input of frame.inputs) seen.add(input);
          }
        }
      }

      const maxFrames = 12;
      const maxInputs = 3;
      expect(seen.size).toBeLessThanOrEqual(maxFrames * (2 + maxInputs));
    });
  });

  describe("peekHeader()", () => {
    const Headed = defineFormat("Hi", { a: Type.UInt });
    const bytes = Headed.encode({ a: 1 }, true);
    const header = $strToHashCode("Hi");

    it("reads the header from every input kind", () => {
      const shared = new Uint8Array(16);
      shared.set(bytes, 3);
      const aligned = new Uint8Array(16);
      aligned.set(bytes, 4);

      expect(peekHeader(bytes)).toBe(header);
      expect(peekHeader(shared.subarray(3))).toBe(header);
      expect(peekHeader(new DataView(shared.buffer, 3))).toBe(header);
      expect(peekHeader(new Uint16Array(aligned.buffer, 4, 1))).toBe(header);
      expect(peekHeader(bytes.slice().buffer)).toBe(header);
      expect(peekHeader(new Uint8Array([0xff, 0xfe]))).toBe(0xfffe);
    });

    it("throws RangeError when fewer than 2 bytes are available", () => {
      const view = new Uint8Array([1, 2, 3]).subarray(0, 1);

      expect(() => peekHeader(view)).toThrow(RangeError);
      expect(() => peekHeader(new Uint8Array(0))).toThrow(RangeError);
      expect(() => peekHeader(new ArrayBuffer(1))).toThrow(RangeError);
      expect(() => peekHeader(new DataView(new ArrayBuffer(4), 3))).toThrow(RangeError);
    });

    it("does not allocate for Uint8Array or DataView input", () => {
      const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      let a = 0;
      let b = 0;

      const counts = countConstructs(["DataView", "Uint8Array"], () => {
        a = peekHeader(bytes);
        b = peekHeader(dv);
      });

      expect(counts).toEqual({ DataView: 0, Uint8Array: 0 });
      expect(a).toBe(header);
      expect(b).toBe(header);
    });
  });
});

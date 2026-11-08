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
    it("reuses the DataView for the same target, and rebuilds it when the target changes", () => {
      const buffer = new ArrayBuffer(32);
      const a = new Uint8Array(buffer, 4, 16);
      const writer = new BufferWriter(a);
      const dv = (writer as any)._$dataView;

      writer.$writeUint8(1);
      writer.$reset(a);
      expect(writer.$byteLength).toBe(0);
      expect((writer as any)._$dataView).toBe(dv);

      writer.$reset(new Uint8Array(buffer, 4, 16));
      expect((writer as any)._$dataView).toBe(dv);

      writer.$reset(new Uint8Array(buffer, 5, 16));
      expect((writer as any)._$dataView).not.toBe(dv);
      expect((writer as any)._$dataView.byteOffset).toBe(5);

      const dv2 = (writer as any)._$dataView;
      writer.$reset(new Uint8Array(buffer, 5, 8));
      expect((writer as any)._$dataView).not.toBe(dv2);
      expect((writer as any)._$dataView.byteLength).toBe(8);

      writer.$reset(new Uint8Array(32));
      expect((writer as any)._$dataView.buffer).not.toBe(buffer);
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
    it("reuses the DataView for the same source, and rebuilds it when the source changes", () => {
      const buffer = new ArrayBuffer(16);
      const view = new Uint8Array(buffer, 2, 8);
      const reader = new BufferReader(view, 2);
      const dv = (reader as any)._$dataView;

      reader.$readUint8();
      reader.$reset(view, 2);
      expect(reader.i).toBe(2);
      expect((reader as any)._$dataView).toBe(dv);

      reader.$reset(new Uint8Array(buffer, 2, 8));
      expect(reader.i).toBe(0);
      expect((reader as any)._$dataView).toBe(dv);

      reader.$reset(new Uint8Array(buffer, 3, 8));
      expect((reader as any)._$dataView).not.toBe(dv);
      expect((reader as any)._$dataView.byteOffset).toBe(3);

      reader.$reset(buffer);
      const dvBuffer = (reader as any)._$dataView;
      expect(dvBuffer.byteOffset).toBe(0);
      expect(dvBuffer.byteLength).toBe(16);

      reader.$reset(buffer);
      expect((reader as any)._$dataView).toBe(dvBuffer);

      const external = new DataView(buffer, 1, 4);
      reader.$reset(external);
      expect((reader as any)._$dataView).toBe(external);
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

      expect(() => Format.decode(bytes.subarray(0, 4))).toThrow();
      expect((Format as any)._$readerBusy).toBe(false);
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

      const length = Node.encodeIntoLength(data, target);
      expect((Node as any)._$intoWriterBusy).toBe(false);

      const decoded: any = Node.decode(target.subarray(0, length));
      expect((Node as any)._$readerBusy).toBe(false);

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

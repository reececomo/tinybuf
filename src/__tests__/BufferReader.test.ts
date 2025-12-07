import { BufferReader } from "../core/lib/BufferReader";

describe("ReadState", () => {
  describe("$readBytes(...)", () => {
    it("should throw RangeError when attempting to read beyond the buffer", () => {
      const buffer = new Uint8Array([1, 2, 3]).buffer;
      const data = new BufferReader(buffer);
      expect(() => data.$readBytes(4)).toThrow(RangeError);
    });

    test("regression case: BufferReader throw on a view", () => {
      const original = new Uint8Array([10, 11, 12, 13, 14, 15]);

      const viewBytes = new Uint8Array(original.buffer, 2, 4);
      const bufferReader = new BufferReader(viewBytes);

      expect(() => bufferReader.$readBytes(4)).not.toThrow(RangeError);
      expect(() => bufferReader.$readBytes(6)).toThrow(RangeError);
    });
  });
});

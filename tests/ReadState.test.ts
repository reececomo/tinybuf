import { ReadState } from "../src";

describe('ReadState', () => {
  describe('readBuffer(...)', () => {
    it('should throw RangeError when attempting to read beyond the buffer', () => {
      const buffer = new Uint8Array([1, 2, 3]).buffer;
      const data = new ReadState(buffer);

      expect(() => data.readBuffer(4)).toThrow(RangeError);
    });
  });
});

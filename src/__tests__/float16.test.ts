import { fround16 } from "../core/lib/float16";

describe('fround16', () => {
  it('should quantize numbers to the nearest float16 representation', () => {
    expect(fround16(3.1419)).toBe(3.142578125);
  });
});

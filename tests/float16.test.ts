import { fround16 } from "../src";

describe('fround16', () => {
  it('should quantize numbers to the nearest float16', () => {
    expect(fround16(3.1419)).toBe(3.142578125);
  });
});

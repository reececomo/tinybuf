import { scalround, uscalround } from "../core/lib/scalar";

describe('scalround', () => {
  it('should quantize numbers to the nearest 8-bit scalar', () => {
    expect(scalround(-0.555)).toBe(-0.56);
    expect(scalround(0.555)).toBe(0.56);
  });
});

describe('uscalround', () => {
  it('should quantize numbers to the nearest 8-bit unsigned scalar', () => {
    expect(uscalround(0.555)).toBe(0.56);
  });
});

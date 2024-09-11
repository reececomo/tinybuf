import { scalround, uscalround } from "../core/lib/scalar";

describe('scalround', () => {
  it('should quantize numbers to the nearest 8-bit scalar for positive values', () => {
    expect(scalround(0.0)).toBeCloseTo(0);

    expect(scalround(0.01)).toBeCloseTo(0.01);

    expect(scalround(0.549)).toBeCloseTo(0.55);
    expect(scalround(0.551)).toBeCloseTo(0.55);

    expect(scalround(0.555)).toBeCloseTo(0.56);
    expect(scalround(0.56)).toBeCloseTo(0.56);

    expect(scalround(0.57)).toBeCloseTo(0.57);
  });

  it('should quantize numbers to the nearest 8-bit scalar for negative values', () => {
    expect(scalround(-0.0)).toBeCloseTo(0);

    expect(scalround(-0.01)).toBeCloseTo(-0.01);
    expect(scalround(-0.02)).toBeCloseTo(-0.02);

    expect(scalround(-0.549)).toBeCloseTo(-0.55);
    expect(scalround(-0.551)).toBeCloseTo(-0.55);

    expect(scalround(-0.555)).toBeCloseTo(-0.56);
    expect(scalround(-0.56)).toBeCloseTo(-0.56);

    expect(scalround(-0.57)).toBeCloseTo(-0.57);
  });
});

describe('uscalround', () => {
  it('should quantize numbers to the nearest 8-bit unsigned scalar', () => {
    expect(uscalround(0.0)).toBeCloseTo(0);

    expect(uscalround(0.01)).toBeCloseTo(0.01);

    expect(uscalround(0.549)).toBeCloseTo(0.55);
    expect(uscalround(0.551)).toBeCloseTo(0.55);

    expect(uscalround(0.555)).toBeCloseTo(0.56);
    expect(uscalround(0.56)).toBeCloseTo(0.56);

    expect(uscalround(0.57)).toBeCloseTo(0.57);
  });
});

import { uScalarRound, scalarRound } from "../src";

describe('uScalarRound', () => {
  it('should quantize numbers to the nearest 8-bit unsigned scalar', () => {
    expect(uScalarRound(0.555)).toBe(0.56);
  });
});

describe('scalarRound', () => {
  it('should quantize numbers to the nearest 8-bit signed scalar', () => {
    expect(scalarRound(-0.555)).toBe(-0.56);
  });
});

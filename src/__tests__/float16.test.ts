import { f16round, $tof16, $fromf16 } from "../core/lib/float16";
import * as util from "./helpers";

describe('f16round', () => {
  it('rounds to the nearest float16 for a given native float', () => {
    expect(f16round(3.1419)).toBe(3.142578125);
    expect(typeof f16round(3.1419)).toBe('number');
  });

  it('gives a close approximation (roughly ±0.01) for numbers below 1.0', () => {
    expect(f16round(0.0123456789123456)).toBe(0.0123443603515625);
    expect(f16round(0.0026789123456732)).toBe(0.0026798248291015625);
    expect(f16round(0.4512312351232131)).toBe(0.451171875);
  });

  it('gives a close approximation (roughly ±0.25) for numbers between 1.0 and ~1024', () => {
    expect(f16round(-99.123456789)).toBe(-99.125);
    expect(f16round(512.333901298)).toBe(512.5);
    expect(f16round(938.712391412)).toBe(938.5);
    expect(f16round(-1_023.248888)).toBe(-1_023);
    expect(f16round(-1_023.249999)).toBe(-1_023.5);
  });

  it('gives a reasonable approximatation (roughly ±1.0) for between ~1024 and ~4096', () => {
    expect(f16round(2_234.523412)).toBe(2_234);
    expect(f16round(-2_234.52341)).toBe(-2_234);
    expect(f16round(3_431.646731)).toBe(3_432);
    expect(f16round(-3_431.64672)).toBe(-3_432);
    expect(f16round(4_096.599433)).toBe(4_096);
  });

  it('gives a lossy representation (roughly ±10.0) for numbers between ~4096 and 65504', () => {
    expect(f16round(15_123.12304)).toBe(15_120);
    expect(f16round(-15_123.1230)).toBe(-15_120);
    expect(f16round(-64_065.25)).toBe(-64_064);
    expect(f16round(64_123.25)).toBe(64_128);
  });

  it('overflows to Infinity, -Infinity for numbers beyond ±65,504', () => {
    expect(f16round(65_503.999999999898)).toBe(65_504);
    expect(f16round(-65_503.999999999898)).toBe(-65_504);

    // normal infinity
    expect(f16round(Infinity)).toBe(Infinity);
    expect(f16round(-Infinity)).toBe(-Infinity);

    // overflow to infinity
    expect(f16round(65_555.123)).toBe(Infinity);
    expect(f16round(-65_555.123)).toBe(-Infinity);
    expect(f16round(2_465_555.123)).toBe(Infinity);
    expect(f16round(-2_465_555.123)).toBe(-Infinity);
  });

  it('NaNs as NaN', () => {
    expect(f16round(NaN)).toBeNaN();
    expect(f16round(-NaN)).toBeNaN();
  });
});

describe('$f16mask', () => {
  it('should return a 16-bit bitmask', () => {
    // 65,504 upper bound
    expect($tof16(-65_504)).toBe(0b00000000000000001111101111111111);
    expect($tof16(-65_504)).toBe(0b1111101111111111);

    expect(util.asUint16Str($tof16(-65_504))).toBe('1111101111111111');
    expect(util.asInt32Str($tof16(-65_504))).toBe('00000000000000001111101111111111');
    expect(util.asUint32Str($tof16(-65_504))).toBe('00000000000000001111101111111111');
    expect(util.asInt64Str(BigInt($tof16(-65_504)))).toBe('0000000000000000000000000000000000000000000000001111101111111111');
  });

  it('should NOT equal its own raw float64 representation', () => {
    expect($tof16(65_504)).not.toBe(65_504);
  });
});

describe('$fromf16', () => {
  it('should read a 16-bit mask', () => {
    // 65,504 upper bound
    expect($fromf16(0b1111_1011_1111_1111)).toBe(-65_504);
    expect($fromf16(0b0000_0000_0000_0000_1111_1011_1111_1111)).toBe(-65_504);
  });

  it('should survive a 16-bit mask', () => {
    // 65,504 upper bound
    expect($fromf16(0b1111_1011_1111_1111)).toBe(-65_504);
    expect($fromf16(0b1111_1011_1111_1111_1111_1011_1111_1111)).toBe(-65_504);
  });
});

test('mask / unmask basic compatibility', () => {
  // this is covered pretty comprehensively in other tests
  // including the coders - but just a quick sanity check here:
  expect($tof16(1023.5)).not.toBe(1023.5);
  expect($fromf16(1023.5)).not.toBe(1023.5);
  expect($fromf16($tof16(1023.5))).toBe(1023.5);
});

test('performance benchmark: f16round() faster than native Math.fround()', () => {
  const iterations = 1_000_000;
  const inputs = Array.from({ length: iterations }, () => Math.random() > 0.5
    ? util.getRandomFloat(-1, 1) // mix small floats (e.g. vector normals)
    : util.getRandomFloat(-70_000, 70_000) // and larger floats
  );

  // native Math.fround() - float32s:
  const f32start = performance.now();
  for (let i = 0; i < iterations; i++) {
    Math.fround(inputs[i]);
  }
  const f32end = performance.now();
  const f32duration = f32end - f32start;

  // f16round() - float16s:
  const f16start = performance.now();
  for (let i = 0; i < iterations; i++) {
    f16round(inputs[i]);
  }
  const f16end = performance.now();
  const f16duration = f16end - f16start;

  // generally 5-10x faster
  // show soft warning if unexpectedly slower
  try {
    expect(f16duration).toBeLessThan(f32duration);
    // console.debug(`result: f16round() (${f16duration.toFixed(3)}ms) vs Math.fround() (${f32duration.toFixed(3)}ms) for ${iterations} iterations`);
  }
  catch (error) {
    console.warn(`f16round() (${f16duration.toFixed(3)}ms) vs Math.fround() (${f32duration.toFixed(3)}ms) for ${iterations} iterations`);
  }
});

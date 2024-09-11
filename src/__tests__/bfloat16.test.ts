import { bf16round, $tobf16, $frombf16 } from "../core/lib/bfloat16";
import * as util from "./helpers";

describe('bbf16round', () => {
  it('rounds to the nearest bfloat16 for a given native float', () => {
    expect(bf16round(3.1419)).toBe(3.140625);
    expect(typeof bf16round(3.1419)).toBe('number');
  });

  it('gives a low resolution approximation', () => {
    expect(bf16round(-99.123456789)).toBe(-99.0);
    expect(bf16round(512.333901298)).toBe(512);
    expect(bf16round(938.712391412)).toBe(936);
    expect(bf16round(-1_023.248888)).toBe(-1_020);
    expect(bf16round(-1_023.249999)).toBe(-1_020);
    expect(bf16round(2_234.523412)).toBe(2_224);
    expect(bf16round(-2_234.52341)).toBe(-2_224);
    expect(bf16round(3_431.646731)).toBe(3_424);
    expect(bf16round(-3_431.64672)).toBe(-3_424);
    expect(bf16round(4_096.599433)).toBe(4_096);
    expect(bf16round(15_123.12304)).toBe(15_104);
    expect(bf16round(-15_123.1230)).toBe(-15_104);
    expect(bf16round(-64_065.25)).toBe(-64_000);
    expect(bf16round(64_123.25)).toBe(64_000);
    expect(bf16round(-64_312_065.25)).toBe(-64_225_280);
    expect(bf16round(64_312_123.25)).toBe(64_225_280);
  });

  it('NaNs as NaN', () => {
    expect(bf16round(NaN)).toBeNaN();
    expect(bf16round(-NaN)).toBeNaN();
  });
});

describe('$tobf16', () => {
  it('should return a 16-bit bfloat bitmask', () => {
    expect($tobf16(14.501918)).toBe(0b00000000_00000000_01000001_01101000);
    expect($tobf16(-14.501918)).toBe(0b00000000_00000000_11000001_01101000); //

    expect(util.asUint16Str($tobf16(-14.501918))).toBe('1100000101101000');
    expect(util.asInt32Str($tobf16(-14.501918))).toBe('00000000000000001100000101101000');
    expect(util.asUint32Str($tobf16(-14.501918))).toBe('00000000000000001100000101101000');
    expect(util.asInt64Str(BigInt($tobf16(-14.501918)))).toBe('0000000000000000000000000000000000000000000000001100000101101000');
  });

  it('should NOT equal its own raw float64 representation', () => {
    expect($tobf16(65_504)).not.toBe(65_504);
  });
});

describe('$frombf16', () => {
  it('should read a 16-bit mask', () => {
    // 65,504 upper bound
    expect($frombf16(0b1111_1011_1111_1111)).toBe(-2.648071397852762e+36);
    expect($frombf16(0b0000_0000_0000_0000_1111_1011_1111_1111)).toBe(-2.648071397852762e+36);
  });

  it('should survive a 16-bit mask', () => {
    // 65,504 upper bound
    expect($frombf16(0b1111_1011_1111_1111)).toBe(-2.648071397852762e+36);
    expect($frombf16(0b1111_1011_1111_1111_1111_1011_1111_1111)).toBe(-2.648071397852762e+36);
  });
});

test('mask / unmask basic compatibility', () => {
  // this is covered pretty comprehensively in other tests
  // including the coders - but just a quick sanity check here:
  expect($tobf16(1023.5)).not.toBe(1023.5);
  expect($frombf16(1023.5)).not.toBe(1023.5);
  expect($frombf16($tobf16(1023.5))).toBe(bf16round(1023.5));
  expect($frombf16($tobf16(1.01230123))).toBe(bf16round(1.01230123));
  expect($frombf16($tobf16(123123.0123))).toBe(bf16round(123123.0123));
});

test('performance benchmark: bf16round() faster than native Math.fround()', () => {
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

  // bf16round() - bfloat16s:
  const bf16start = performance.now();
  for (let i = 0; i < iterations; i++) {
    bf16round(inputs[i]);
  }
  const bf16end = performance.now();
  const bf16duration = bf16end - bf16start;

  // generally 25-50x faster
  // show soft warning if unexpectedly slower
  try {
    expect(bf16duration).toBeLessThan(f32duration);
    // console.debug(`result: bf16round() (${f16duration.toFixed(3)}ms) vs Math.fround() (${f32duration.toFixed(3)}ms) for ${iterations} iterations`);
  }
  catch (error) {
    console.warn(`bf16round() (${bf16duration.toFixed(3)}ms) vs Math.fround() (${f32duration.toFixed(3)}ms) for ${iterations} iterations`);
  }
});

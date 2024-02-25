import { MutableArrayBuffer } from "../src";

describe('MutableArrayBuffer', () => {
  it('should dynamically resize the underlying array buffer', () => {
    // Outputs a string with 120 bytes
    const input = "🌍".repeat(48);

    const mutableBuffer = new MutableArrayBuffer(32);
    
    expect(mutableBuffer.currentAllocatedBytes).toBe(32);

    const textBuffer = new TextEncoder().encode(input).buffer;
    mutableBuffer.appendBuffer(textBuffer);

    expect(mutableBuffer.currentAllocatedBytes).toBeGreaterThan(32);

    const text = new TextDecoder('utf-8').decode(mutableBuffer.toArrayBuffer());
    expect(text).toBe(input);
  })
});

import { BufferWriter } from "../core/lib/BufferWriter";

describe('BufferWriter', () => {
  it('should dynamically resize the underlying array buffer', () => {
    // Outputs a string with 120 bytes
    const input = "🌍".repeat(48);

    const mutableBuffer = new BufferWriter(32);

    expect(mutableBuffer.allocatedBytes).toBe(32);

    const textBuffer = new TextEncoder().encode(input);
    mutableBuffer.writeBuffer(textBuffer);

    expect(mutableBuffer.allocatedBytes).toBeGreaterThan(32);

    const text = new TextDecoder('utf-8').decode(mutableBuffer.asCopy());
    expect(text).toBe(input);
  });
});

import { BufferWriter } from "../core/lib/BufferWriter";
import { $utf8encode } from "../core/lib/utf8";

describe('BufferWriter', () => {
  it('sanity check: should dynamically resize underlying array buffer', () => {
    // Outputs a string with 120 bytes
    const input = "🌍".repeat(48);

    const writer = new BufferWriter(32);

    // cheeky check of the underlying implementation
    expect((writer as any)._$dataView.byteOffset).toBe(0);
    expect((writer as any)._$dataView.byteLength).toBe(32);

    const textBuffer = $utf8encode(input);
    writer.$writeBytes(textBuffer);

    expect((writer as any)._$dataView.byteOffset).toBe(0);
    expect((writer as any)._$dataView.byteLength).toBeGreaterThan(32);

    const text = new TextDecoder('utf-8').decode(writer.$copyBytes());
    expect(text).toBe(input);
  });
});

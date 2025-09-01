import { BufferWriter } from "../core/lib/BufferWriter";
import { $utf8encode } from "../core/lib/utf8";

describe("BufferWriter", () => {
  it("sanity check: should dynamically resize underlying array buffer", () => {
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

    const text = new TextDecoder("utf-8").decode(writer.$copyBytes());
    expect(text).toBe(input);
  });

  it("should resize until the limit", () => {
    const writer = new BufferWriter(256);

    // cheeky check of the underlying implementation
    expect((writer as any)._$dataView.byteOffset).toBe(0);
    expect((writer as any)._$dataView.byteLength).toBe(256);

    const textA = "a".repeat(1200);
    const textBufferA = $utf8encode(textA);
    writer.$writeBytes(textBufferA);

    expect((writer as any)._$dataView.byteOffset).toBe(0);
    expect((writer as any)._$dataView.byteLength).toBe(1280);

    const textB = "b".repeat(100);
    const textBufferB = $utf8encode(textB);
    writer.$writeBytes(textBufferB);

    // caps resize to encodingBufferMaxSize
    expect((writer as any)._$dataView.byteOffset).toBe(0);
    expect((writer as any)._$dataView.byteLength).toBe(1500);

    const text = new TextDecoder("utf-8").decode(writer.$copyBytes());
    expect(text).toBe(textA + textB);
  });
});

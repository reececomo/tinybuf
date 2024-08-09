/** Default maximum transmission unit in networking */
const MTU = 1500;

/** Set Tinybuf global config */
export const setTinybufConfig = (c: Partial<TinybufConfig>): void => {
  cfg = { ...cfg, ...c };
};

export type TinybufConfig = {
  /**
   * (default: false)
   * By default `BufferFormat.encode(…)` optimizes performance and memory by
   * encoding data to a shared buffer, and returning a `Uint8Array` pointer
   * to the encoded bytes.
   *
   * Subsequent calls to `encode(…)` are destructive, so this would be
   * unsuitable for asyncronous usage (e.g. Promises, Web Workers).
   *
   * Set `safe` to true to copy bytes to a new buffer and return that.
   */
  safe: boolean,

  /**
   * (default: true)
   * By default, format encoders share a global encoding buffer for performance
   * and memory management reasons.
   *
   * When set to false, each format will be allocated its own resizable
   * encoding buffer.
   *
   * Enable to maximise performance and memory re-use, just be cautious of
   * possible race conditions.
   */
  useGlobalEncodingBuffer: boolean,

  /**
   * (default: 1500)
   * The maximum bytes to allocate to an encoding buffer. If using the global
   * encoding buffer, this is the size it is initialized to.
   */
  encodingBufferMaxSize: number,

  /**
   * (default: 256)
   * Initial bytes to allocate to individual format encoding buffers, if used.
   */
  encodingBufferInitialSize: number,

  /**
   * (default: 256)
   * Additional bytes when resizing individual format encoding buffers, if used.
   */
  encodingBufferIncrement: number,
};

/** @internal */
export let cfg: TinybufConfig = {
  safe: false,
  useGlobalEncodingBuffer: true,
  encodingBufferMaxSize: MTU,
  encodingBufferInitialSize: 256,
  encodingBufferIncrement: 256,
};

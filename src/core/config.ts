/** Default maximum transmission unit in networking */
const MTU = 1500;

/** Set Tinybuf global config */
export const setTinybufConfig = (newSettings: Partial<typeof cfg>): void => {
  cfg = {
    ...cfg,
    ...newSettings
  };
};

export let cfg = {
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
  safe: false,

  /**
   * (default: 1500)
   * The maximum bytes to allocate to an encoding buffer. If using the global
   * encoding buffer, this is the size it is initialized to.
   */
  encodingBufferMaxSize: MTU,

  /**
   * (default: 256)
   * Initial bytes to allocate to individual format encoding buffers, if used.
   */
  encodingBufferInitialSize: 256,

  /**
   * (default: 256)
   * Additional bytes when resizing individual format encoding buffers, if used.
   */
  encodingBufferIncrement: 256,

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
  useGlobalEncodingBuffer: true,
};

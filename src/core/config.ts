/** Default maximum transmission unit in networking */
const MTU = 1500;

/** Set Tinybuf global config */
export const setTinybufConfig = (c: Partial<TinybufConfig>): void => {
  cfg = { ...cfg, ...c };
};

export type TinybufConfig = {
  /**
   * (default: false)
   *
   * This sets the default value for `preserveBytes` on
   * `encode(data, preserveBytes?)`.
   *
   * By default, `encode()` returns its encoded bytes as a `Uint8Array`
   * view of the bytes in the shared encoding buffer.
   *
   * This is suitable for synchronous use (e.g. high-performance applications)
   * as it avoids slow and expensive memory allocation and fragmentation on
   * each call to `encode()`.
   *
   * However, susbsequent calls are destructive to the underlying bytes, so
   * for asynchronous uses (e.g. Promises, Workers, long-lived storage), set
   * `preserveBytes` to `true`.
   */
  safe: boolean,

  /**
   * (default: true)
   * By default, format encoders share a global encoding buffer for performance
   * and memory management reasons.
   *
   * When set to false, each format is allocated an individual encoding buffer.
   *
   * Enable to maximise performance and memory re-use, just be cautious of
   * possible race conditions.
   */
  useGlobalEncodingBuffer: boolean,

  /**
   * (default: 1500)
   * The maximum bytes that can be allocated to an encoding buffer.
   *
   * Default is 1500 bytes, the standard "Maximum Transmission Unit".
   */
  encodingBufferMaxSize: number,

  /**
   * (default: 256)
   * Initial bytes to allocate for an encoding buffer.
   */
  encodingBufferInitialSize: number,

  /**
   * (default: 256)
   * Additional bytes to allocated when dynamically increasing the size of an encoding buffer.
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

/** Default maximum transmission unit in networking */
const MTU = 1500;

export const setTinybufConfig = (newSettings: Partial<typeof SETTINGS>): void => {
  SETTINGS = { ...SETTINGS, ...newSettings };
};

export let SETTINGS = {
  /**
   * (default: false) When enabled, shares one write buffer (default: each format manages its own buffer).
   * Use to maximise performance and memory re-use, just be cautious of possible race conditions.
   *
   * Note: The global buffer is initialized to `SETTINGS.encodingBufferMaxSize`
   */
  useGlobalEncodingBuffer: false,

  /** (default: 1500) When automatically increasing buffer length, this is the most bytes to allocate */
  encodingBufferMaxSize: MTU,

  /** (default: 256) How many bytes to allocate to a new write buffer */
  encodingBufferInitialSize: 256,

  /** (default: 256) When automatically increasing buffer length, this is the amount of new bytes to allocate */
  encodingBufferIncrement: 256,

  /** (default: false) Emits debug console logs (e.g. for memory allocation) */
  debug: false,
};

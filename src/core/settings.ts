/** Default maximum transmission unit in networking */
const MTU = 1500;

export const SETTINGS = {
  /** Use a single shared buffer for encoding (dangerous if you maintain long-lived references to encoded data) */
  useSharedWriteBuffer: true,

  /** How many bytes to allocate to a new write buffer */
  writeBufferDefaultSize: MTU / 4,

  /** When automatically increasing buffer length, this is the amount of bytes to allocate */
  writeBufferIncrement: MTU / 2,

  /** When automatically increasing buffer length, this is the amount of bytes to allocate */
  writeBufferMaxSize: MTU,
};
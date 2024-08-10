const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8');

export const $utf8encode = (x?: string): Uint8Array => encoder.encode(x);
export const $utf8decode = (y: Uint8Array): string => decoder.decode(y);

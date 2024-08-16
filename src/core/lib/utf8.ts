export const $utf8encode = (function () {
  const encoder = new TextEncoder();
  return (x?: string): Uint8Array => encoder.encode(x);
})();

export const $utf8decode = (function () {
  const decoder = new TextDecoder('utf-8');

  return (y: Uint8Array): string => decoder.decode(y);
})();

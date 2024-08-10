export const mask = (x: boolean[], pad = 0b1): number => {
  return x.slice(0, 30).reduce((n, b: any) => (n << 1) | b, pad);
};

export const unmask = (x: number, len = 31 - Math.clz32(x)): boolean[] => {
  return Array.from({ length: len}, (_, i) => 1 === (x >> (len-1-i) & 1));
};

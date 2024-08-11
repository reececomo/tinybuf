export const mask = (x: boolean[], pad = 0b1): number => {
  return x.slice(0, 30).reduce((n, b: any) => (n << 1) | b, pad);
};

export const unmask = (x: number, len = 31 - Math.clz32(x)): boolean[] => {
  const result = new Array<boolean>(len);
  for (let i = 0; i < len; i++) result[i] = !!(x & (1 << (len - 1 - i)));
  return result;
};

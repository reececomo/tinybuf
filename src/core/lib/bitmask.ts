export const mask = (x: boolean[]): number => {
  if (x.length > 30) x = x.slice(0, 30);
  return x.reduce((n, b: any) => (n << 1) | b, 1 /* pad */);
};

export const unmask = (x: number, len = 31 - Math.clz32(x) /* pad bit + 1 */): boolean[] => {
  const result = new Array<boolean>(len);
  for (let i = 0; i < len; i++) result[i] = !!(x & (1 << (len - 1 - i)));
  return result;
};

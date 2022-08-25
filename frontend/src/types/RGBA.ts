export interface RGBA {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

export const fromInt32 = (integer: number): RGBA => {
  return {
    red: (integer >> 0) & 0xff,
    green: (integer >>> 8) & 0xff,
    blue: (integer >>> 16) & 0xff,
    alpha: (integer >>> 24) & 0xff,
  };
};

export interface LoginFormRequestData {
  username: string;
  password: string;
}

export type RegisterFormRequestData = LoginFormRequestData;

export interface PlaceRegisterResponseBody {
  username: string;
  token: string;
}

export type PlaceLoginResponseBody = PlaceRegisterResponseBody;

export interface Point {
  x: number;
  y: number;
}

export interface PlaceTileRequest {
  point: Point;
  color: PlaceColorName;
}

// todo: colornames to fullcolors html colors
export const colors = [
  "WHITE", // default color
  "BLACK",
  "BLUE",
  "CYAN",
  "PURPLE",
  "RED",
  "ORANGE",
  "YELLOW",
  "GREEN",
  "PINK",
] as const;

export const htmlColors: PlaceColorScheme = {
  // WHITE: 0xf8fafcff,
  WHITE: 0xfffcfaf8,
  // BLACK: 0x171717ff,
  BLACK: 0xff171717,
  // BLUE: 0x1e3a8aff,
  BLUE: 0xff8a3a1e,
  // CYAN: 0x06b6d4ff,
  CYAN: 0xffd4b506,
  // PURPLE: 0x4f46e5ff,
  PURPLE: 0xffe5464f,
  // RED: 0x7f1d1dff,
  RED: 0xff1d1d7f,
  // ORANGE: 0xf97316ff,
  ORANGE: 0xff1631f9,
  // YELLOW: 0xfacc15ff,
  YELLOW: 0xff15ccfa,
  // GREEN: 0x16a34aff,
  GREEN: 0xff4aa316,
  // PINK: 0xec4899ff,
  PINK: 0xff9948ec,
} as const;

export type PlaceColorName = typeof colors[number];
export type PlaceColorBitmap = number;
export type PlaceRawBoard = ArrayBuffer;
export type PlaceColorScheme = {
  [key in PlaceColorName]: number;
};
export interface PlaceTimestamp {
  timestamp: number;
}

export const nameToBits: Record<PlaceColorName, PlaceColorBitmap> =
  colors.reduce(
    (accum, curr: PlaceColorName, index: PlaceColorBitmap) => ({
      ...accum,
      [curr]: index,
    }),
    {} as Record<PlaceColorName, PlaceColorBitmap>
  );

export const bitsToName: Record<PlaceColorBitmap, PlaceColorName> =
  colors.reduce((accum, curr, index) => ({ ...accum, [index]: curr }), {});

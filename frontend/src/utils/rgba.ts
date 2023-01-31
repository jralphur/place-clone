import { fromInt32 } from "../types/RGBA";

const getBackgroundColorCSS = (color: number): string => {
  const { red, green, blue, alpha } = fromInt32(color);
  return `rgba(${red},${green},${blue},${alpha})`;
};

export { getBackgroundColorCSS };

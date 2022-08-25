
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


export type ColorName = typeof colors[number];
export type ColorBitmap = number;

const nameToBits: Record<ColorName, ColorBitmap> = colors.reduce((accum, curr: ColorName, index: ColorBitmap) => ({...accum, [curr]: index}), {} as Record<ColorName, ColorBitmap>);
const bitsToName: Record<ColorBitmap, ColorName> = colors.reduce((accum, curr, index) => ({...accum, [index]: curr}), {});

export default {
	colors,
	nameToBits,
	bitsToName,
};
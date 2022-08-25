import { ColorBitmap } from "../config/colorConfig";
import MemboardAPI from "./MemboardAPI";

interface TestMemboardAPI extends MemboardAPI {
	clearBoard: () => Promise<void>
	getPixel: (x: number, y: number) => Promise<ColorBitmap>
}

export default TestMemboardAPI;
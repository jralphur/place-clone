import { ColorName } from "../config/colorConfig";
import Point from "./Point";

export interface PixelSetRequest {
	point: Point
	color: ColorName
};
import Point from "../interfaces/Point";
import UserCredentialsRequest from "../interfaces/UserCredentials";
import { PixelSetRequest } from "../interfaces/PixelSetRequest";
import colorConfig, { ColorName } from "../config/colorConfig";

const isPoint = (body: unknown): body is Point => {
	if (typeof body === "object" && body !== null && "x" in body && "y" in body) {
		const b = body as typeof body & { x: unknown, y: unknown };
		return typeof b.x === "number" && typeof b.y === "number";
	}

	return false;
};

const isUserCredentials = (body: unknown): body is UserCredentialsRequest => {
	if (typeof body === "object" && body !== null && "username" in body && "password" in body) {
		const b = body as Partial<Record<keyof UserCredentialsRequest, unknown>>;
		return typeof b.username === "string" && typeof b.password === "string";
	}

	return false;
};

const isColorName = (body: unknown): body is ColorName => {
	return typeof body === "string" && colorConfig.colors.includes(body as ColorName);
};

const isPixelSetRequest = (body: unknown): body is PixelSetRequest => {
	if (typeof body === "object" && body !== null && "point" in body && "color" in body) {
		const b = body as typeof body & { point: unknown, color: unknown };
		return isPoint(b.point) && isColorName(b.color);
	}

	return false;
};

export {
	isPoint,
	isPixelSetRequest,
	isUserCredentials,
	isColorName
};
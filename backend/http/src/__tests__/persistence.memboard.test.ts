import jest from "@jest/globals";
import colorConfig from "../config/colorConfig";
import TestMemboardAPI from "../interfaces/TestMemboardAPI";
import redis from "../persistence/memboard/redis";

const api = redis as TestMemboardAPI;
let size: number;

jest.beforeAll(async () => {
	await redis.init();
	size = redis.getBoardSize();
});

const randomInt = (max: number) => {
	return Math.floor(Math.random() * max);
};

jest.describe("setBoard tests", () => {
	jest.test("set and get", async () => {
		for (let i = 0; i < 10; i++) {
			const [x, y, color] = [randomInt(size - 1), randomInt(size - 1), randomInt(colorConfig.colors.length)];
			await api.setBoard(x, y, color);
			const g = await api.getPixel(x, y);

			jest.expect(g).toBe(color);
		}
	});

	jest.test.each([
		[-1, 0, 1],
		[0, -1, 1],
		[size, 0, 1],
		[0, size, 1],
		[0, 0, 16]
	])("should fail: %d, %d, %d ", async (x: number, y: number, color: number) => {
		await jest.expect(api.setBoard(x, y, color)).rejects.toThrowError();
	});
});

jest.describe("getFullBoard tests", () => {
	jest.test("string or null response", async () => {
		const b = await redis.getFullBoard();
		jest.expect(typeof b).toBe("string" || "null");
	});
});

jest.afterAll(async () => {
	await redis.shutdown();
});
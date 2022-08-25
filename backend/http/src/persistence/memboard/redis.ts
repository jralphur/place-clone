import { RedisClientType } from "@redis/client";
import { createClient } from "redis";
import boardConfig from "../../config/boardConfig";
import colorConfig, { ColorBitmap } from "../../config/colorConfig";
import MemboardAPI from "../../interfaces/MemboardAPI";
import PlaceBoardBitwidthExceeded from "../../interfaces/PlaceBoardBitwidthExceeded";
import PlaceBoardOutOfBoundsError from "../../interfaces/PlaceBoardOutOfBoundsError";
import TestMemboardAPI from "../../interfaces/TestMemboardAPI";
import waitPort from "wait-port";

let client: RedisClientType;
let size = 0;

const createExport = () => {
	const wrapTest = (m: MemboardAPI): TestMemboardAPI => {
		return { ...m, clearBoard, getPixel };
	};

	const def: MemboardAPI = {
		init,
		shutdown,
		getBoardSize,
		getFullBoard,
		setBoard,
	};

	if (process.env.NODE_ENV === "test") {
		return wrapTest(def);
	}

	return def;
};

const boardOffset = (x: number, y: number): number => {
	return x + size * y;
};

const init = async () => {
	let db = 0;

	if (process.env?.NODE_ENV === "test") {
		db = 1;
	}

	client = createClient({
		socket: {
			host: "redis",
			port: 6379
		},
		username: "place-user",
		password: "8u@Zktj7%T0d",
		database: db
	});

	client.on("error", (err: Error) => console.error("init: redis client err", err));

	await client.connect();
	const s = await client.get("boardsize");
	if (s === null) {
		await client.set("boardsize", boardConfig.boardSize);
		size = boardConfig.boardSize;
	} else {
		const n = parseInt(s);
		if (isNaN(n)) {
			throw Error("boardsize key is not number");
		} else {
			size = n;
		}
	}

	const b = await getFullBoard();
	if (b === null) {
		await setBoard(size - 1, size - 1, colorConfig.nameToBits["WHITE"]);
	}

};

const shutdown = async () => {
	await client.quit();
};

const getFullBoard = async (): Promise<string | null> => {
	const board = await client.get("board");
	return board;
};

const getBoardSize = (): number => {
	return size;
};

const setBoard = async (x: number, y: number, color: number) => {
	const o = boardOffset(x, y);

	if (x < 0 || y < 0) {
		throw new PlaceBoardOutOfBoundsError("arguments are less than 0");
	}

	if (color >= colorConfig.colors.length) {
		throw new PlaceBoardBitwidthExceeded("color is greater than permitted");
	}

	await client.bitField("board", [
		{
			operation: "SET",
			encoding: "u4",
			offset: `#${o}`,
			value: color,
		},
	]);
};

// may not need this
const getPixel = async (x: number, y: number): Promise<ColorBitmap> => {
	const resp = await client.bitField("board", [
		{
			operation: "GET",
			encoding: "u4",
			offset: `#${boardOffset(x, y)}`,
		}
	]);

	if (resp.length === 0 || resp.length > 1) {
		throw new Error("getPixel: bitfield was set incorrectly");
	}

	const number = resp[0];
	
	if (number === null) {
		throw new Error("getPixel: number was set incorrectly");
	}

	if (!colorConfig.bitsToName[number]) {
		throw new Error("getPixel: unexpected number " + number);
	}

	return number;
};

const clearBoard = async () => {
	await client.del("board");
};

export default createExport();
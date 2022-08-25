import express from "express";
import colorConfig from "../config/colorConfig";
import redis from "../persistence/memboard/redis";
import { isPixelSetRequest } from "../util/express";
import jwt from "jsonwebtoken";
import perms from "../persistence/perms";
import memboard from "../persistence/memboard";
import { CassandraUserSchema } from "../interfaces/CassandraUserSchema";
import PlaceTimestampTooWarm from "../interfaces/PlaceTimestampTooWarmError";
import PlaceBadAuthorizationError from "../interfaces/PlaceBadAuthorizationError";
import PlaceUnrecognizedRequestBodyError from "../interfaces/PlaceUnrecognizedRequestBodyError";
import boardConfig from "../config/boardConfig";
import PlaceBoardOutOfBoundsError from "../interfaces/PlaceBoardOutOfBoundsError";
import socket from "../socket";
import cors from "cors";

const Place = express.Router();

const getTokenFrom = (request: express.Request): string | null => {
	const authorization = request.get("authorization");
	if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
		return authorization.substring(7);
	}

	return null;
};

Place.use(cors());

Place.get("/", (req, res, next) => {
	redis.getFullBoard().then(b => res.send(b)).catch(err => next(err));
});

Place.get("/colors", (_req, res) => {
	return res.status(200).json({colors: colorConfig.nameToBits});
});

Place.get("/timestamp", (req, res) => {
	const token = getTokenFrom(req);
	if (!token) {
		throw new PlaceBadAuthorizationError("no authoriation header");
	}
	const decoded = jwt.verify(token, process.env.SECRET as string);
	const d = decoded as CassandraUserSchema;

	if (!d.userid) {
		throw new PlaceBadAuthorizationError("authorization token is not valid");
	}

	perms.getTimestampFromId(d.userid)
		.then(timestamp => {
			if (!timestamp) {
				return res.send(200).json({timestamp: 0});
			}

			return res.send(200).json({timestamp: timestamp.stamp.getSeconds()})
		});
})
// check from if we can place another tile by checking timestime from cassandra
	// if we can't, respond with an error

	// if we can:
	//	log the current user with the timestamp for cooldown validation
	//	log the current users color, user, timestamp and location for place history purposes
	//	modify the redis bitfield

	// notify all other connected clients

Place.post("/", (req, res, next) => {
	const body = req.body as unknown;
	const token = getTokenFrom(req);
	if (!token) {
		throw new PlaceBadAuthorizationError("no authoriation header");
	}

	if (!isPixelSetRequest(body)) {
		throw new PlaceUnrecognizedRequestBodyError("unrecognized request body");
	}

	const { color, point } = body;
	const decoded = jwt.verify(token, process.env.SECRET as string);
	const d = decoded as CassandraUserSchema;

	if (!d.userid) {
		throw new PlaceBadAuthorizationError("authorization token is not valid");
	}

	const { x, y } = point;
	const size = memboard.getBoardSize();

	if (x < 0 || x >= size || y < 0 || y >= size) {
		throw new PlaceBoardOutOfBoundsError(`point (${x}, ${y}) is out of bounds`);
	}

	perms.getTimestampFromId(d.userid)
		.then(user => {
			if (user === null) {
				return user;
			}
			const { stamp } = user;
			const now = Date.now();
			const passed = now - stamp.getTime();
			if (passed > boardConfig.placeCooldownMs) { // TODO: don't use hardcoded value
				return user;
			}

			throw new PlaceTimestampTooWarm("Too early to place a new pixel.");
		})
		.then(() => Promise.all([
			perms.createTimestamp(d.userid),
			perms.createPlaceMeta(d.userid, point, colorConfig.nameToBits[color]),
			memboard.setBoard(x, y, colorConfig.nameToBits[color])
		]))
		.then(() => socket.emit("place", {point, color}))
		.then(() => res.status(200).send())
		.catch(e => next(e)); // Todo: fix
});

export default Place;
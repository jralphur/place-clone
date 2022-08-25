import * as express from "express";
import PlaceBadAuthorizationError from "../interfaces/PlaceBadAuthorizationError";
import PlaceBoardOutOfBoundsError from "../interfaces/PlaceBoardOutOfBoundsError";
import PlaceMemboardArgumentError from "../interfaces/PlaceMemboardArgumentError";
import PlaceRegisterUsernameTakenError from "../interfaces/PlaceRegisterUsernameTakenError";
import PlaceTimestampTooWarm from "../interfaces/PlaceTimestampTooWarmError";
import PlaceUnrecognizedRequestBodyError from "../interfaces/PlaceUnrecognizedRequestBodyError";
import PlaceNoUserFoundError from "../interfaces/PlaceUsernameNotFoundError";

const backendError = (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	const createError = (status: number) => {
		return res.status(status).json({error: err.message});
	};

	if (err instanceof PlaceBadAuthorizationError) {
		return createError(401);
	}

	if (err instanceof PlaceBoardOutOfBoundsError) {
		return createError(400);
	}

	if (err instanceof PlaceMemboardArgumentError) {
		return createError(500);
	}

	if (err instanceof PlaceRegisterUsernameTakenError) {
		return createError(400);
	}

	if (err instanceof PlaceTimestampTooWarm) {
		return createError(400);
	}

	if (err instanceof PlaceUnrecognizedRequestBodyError) {
		return createError(400);
	}

	if (err instanceof PlaceNoUserFoundError) {
		return createError(401);
	}
	
	console.warn("unhandled error:", err.name);
	return createError(500);
};

export default backendError;
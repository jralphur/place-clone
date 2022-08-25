class PlaceUnrecognizedRequestBodyError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = "PlaceUnrecognizedRequestBodyError";
	}
}

export default PlaceUnrecognizedRequestBodyError;
class PlacePasswordIncorrectError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = "PlacePasswordIncorrectError";
	}
}

export default PlacePasswordIncorrectError;
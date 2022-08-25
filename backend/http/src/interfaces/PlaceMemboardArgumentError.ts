class PlaceMemboardArgumentError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = "PlaceMemboardArgumentError";
	}
}

export default PlaceMemboardArgumentError;
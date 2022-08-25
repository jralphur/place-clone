class PlaceBoardOutOfBoundsError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = "PlaceErrorOutOfBoundsError";
	}
}

export default PlaceBoardOutOfBoundsError;
class PlaceBadAuthorizationError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = "PlaceNoAuthorizationError";
	}
}

export default PlaceBadAuthorizationError;
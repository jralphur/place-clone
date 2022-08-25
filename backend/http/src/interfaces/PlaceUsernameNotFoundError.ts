class PlaceNoUserFoundError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = "PlaceNoUserFound";
	}
}

export default PlaceNoUserFoundError;
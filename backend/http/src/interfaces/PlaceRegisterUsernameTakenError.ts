class PlaceRegisterUsernameTakenError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = "PlaceRegisterUsernameTakenError";
	}
}

export default PlaceRegisterUsernameTakenError;
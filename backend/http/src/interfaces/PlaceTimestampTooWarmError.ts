class PlaceTimestampTooWarm extends Error {
	constructor(message?: string) {
		super(message);
		this.name = "PlaceTimestampTooWarm";
	}
}

export default PlaceTimestampTooWarm;
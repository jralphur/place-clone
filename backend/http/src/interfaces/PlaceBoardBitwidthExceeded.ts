class PlaceBoardBitwidthExceeded extends Error {
	constructor(message?: string) {
		super(message);
		this.name = "PlaceBoardBitwidthExceeded";
	}
}

export default PlaceBoardBitwidthExceeded;
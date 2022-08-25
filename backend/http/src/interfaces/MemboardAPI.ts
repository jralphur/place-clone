interface MemboardAPI {
	init: () => Promise<void>
	shutdown: () => Promise<void>
	getFullBoard: () => Promise<string | null>
	getBoardSize: () => number
	setBoard: (x: number, y: number, color: number) => Promise<void>
}

export default MemboardAPI;
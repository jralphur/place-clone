import { ColorBitmap } from "../config/colorConfig";
import { CassandraTimestampSchema } from "./CassandraPlacement";
import { CassandraUserSchema } from "./CassandraUserSchema";
import Point from "./Point";

interface MetadataAPI {
	init: () => Promise<void>
	shutdown: () => Promise<void>
	getUserByName: (username: string) => Promise<CassandraUserSchema | null>
	getUserById: (uuid: string) => Promise<CassandraUserSchema | null>
	getTimestampFromId: (uuid: string) => Promise<CassandraTimestampSchema | null>
	createUser: (username: string, passwordHash: string) => Promise<void>
	createTimestamp: (uuid: string) => Promise<void>
	createPlaceMeta: (uuid: string, point: Point, color: ColorBitmap) => Promise<void>
}

export default MetadataAPI;
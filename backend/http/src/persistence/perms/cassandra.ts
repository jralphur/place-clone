import cassandra from "cassandra-driver";
import { ColorBitmap } from "../../config/colorConfig";
import Point from "../../interfaces/Point";
import { CassandraTimestampSchema } from "../../interfaces/CassandraPlacement";
import { CassandraUserSchema } from "../../interfaces/CassandraUserSchema";
import cassandra_schema from "./cassandra_schema";
import TestMetadataAPI from "../../interfaces/TestMetadataAPI";
import MetadataAPI from "../../interfaces/MetadataAPI";
import waitPort from "wait-port";

const { Uuid, Tuple } = cassandra.types;

let client: cassandra.Client;

const getExport = () => {
	const wrap = (a: MetadataAPI): TestMetadataAPI => {
		return { ...a, clearTables };
	};

	const def: MetadataAPI = {  
		init,
		shutdown,
		getUserByName,
		getUserById,
		createUser,
		createTimestamp,
		getTimestampFromId,
		createPlaceMeta
	};

	if (process.env.NODE_ENV === "test") {
		return wrap(def);
	}

	return def;
};
// Todo: type handling of query params
const init = async () => {
	client = new cassandra.Client({
		contactPoints: ["cassandra"], // todo: change this
		localDataCenter: "datacenter1",
	});

	const open = waitPort({host: "cassandra", port: 9042 });
	console.log("port open");
	if (!open) {
		console.log("wait failed");
		throw Error("wait failed");
	}
	// todo: may not need this
	await client.connect();
	await client.execute(cassandra_schema.keystore);
	await Promise.all([
		client.execute(cassandra_schema.pixel_meta),
		client.execute(cassandra_schema.placement_cooldown),
		client.execute(cassandra_schema.users_by_name),
		client.execute(cassandra_schema.passwordIndex),
		client.execute(cassandra_schema.useridIndex),
	]);
};

const shutdown = async () => {
	await client.shutdown();
};

const getUserByName = async (username: string): Promise<CassandraUserSchema | null> => {
	const query = await client.execute(cassandra_schema.getUserByName, [ username ], { prepare: true });
	const row = query.first();
	if (row) {
		return {
			username: row["username"] as string,
			passwordHash: row["passwordhash"] as string,
			userid: (row["userid"] as typeof Uuid).toString()
		};
	}

	return null;
};

const getUserById = async (uuid: string): Promise<CassandraUserSchema | null> => {
	const query = await client.execute(cassandra_schema.getUserById, [ uuid ], { prepare: true });
	const row = query.first();
	if (row) {
		return {
			username: row["username"] as string,
			passwordHash: row["passwordhash"] as string,
			userid: (row["userid"] as typeof Uuid).toString()
		};
	}

	return null;
};

const getTimestampFromId = async (uuid: string): Promise<CassandraTimestampSchema | null>  => {
	const u = cassandra.types.Uuid.fromString(uuid);
	const query = await client.execute(cassandra_schema.getLastPlacedTimestamp, [ u ], { prepare: true });
	const row = query.first();
	if (row) {
		return {
			userid: (row["userid"] as typeof Uuid).toString(),
			stamp: new Date(row["stamp"] as Date), // todo: maybe fix me
		};
	}
	return null;
};

const createUser = async (username: string, passwordHash: string) => {
	const u = Uuid.random();
	await Promise.all([
		client.execute(cassandra_schema.createUserByName, [ username, passwordHash, u ], { prepare: true }),
		client.execute(cassandra_schema.createUserByUuid, [ username, passwordHash, u ], { prepare: true })
	]);	
};

const createTimestamp = async (uuid: string) => {
	await client.execute(cassandra_schema.createPlaceTimestamp, [ Uuid.fromString(uuid), new Date(), ], { prepare: true });
};

//log the current users color, user, timestamp and location for place history purposes
const createPlaceMeta = async (uuid: string, point: Point, color: ColorBitmap) => {
	await client.execute(cassandra_schema.createPlaceMetadata, [ new Tuple(point.x, point.y), color, Uuid.fromString(uuid), new Date()]);
};

const clearTables = async () => {
	const tables = ["pixel_meta", "placements", "users"]
		       .map(m => "place_test." + m)
		       .map(t => client.execute(`TRUNCATE ${t}`, [], { prepare: true }));

	await Promise.all(tables);
};

export default getExport();
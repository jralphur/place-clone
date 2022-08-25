const keyspace_name = () => {
	if (process.env.NODE_ENV === "test") {
		return "place_test";
	}

	return "place";
};


const keyspace = keyspace_name();

const keystore = `CREATE KEYSPACE IF NOT EXISTS ${keyspace} WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : '1' };`;

const pixel_meta = `CREATE TABLE IF NOT EXISTS ${keyspace}.pixel_meta (
	position tuple<int, int> PRIMARY KEY,
	color smallint,
	userid uuid,
	username text,
	stamp timestamp
)`;

const placement_cooldown = `CREATE TABLE IF NOT EXISTS ${keyspace}.placements (
	userid uuid PRIMARY KEY,
	stamp timestamp
)`;

const users_by_name = `CREATE TABLE IF NOT EXISTS ${keyspace}.users_by_name (
	username text PRIMARY KEY,
	passwordHash text,
	userid uuid
)`;

const passwordIndex = `CREATE INDEX IF NOT EXISTS on ${keyspace}.users_by_name (passwordHash)`;
const useridIndex = `CREATE INDEX IF NOT EXISTS on ${keyspace}.users_by_name (userid)`;

// todo: check is this is sql injection safe
const createUserByName = `INSERT INTO ${keyspace}.users_by_name (username, passwordHash, userid) VALUES (?, ?, ?)`;
const createUserByUuid = `INSERT INTO ${keyspace}.users_by_name (username, passwordHash, userid) VALUES (?, ?, ?)`;
const createPlaceTimestamp = `INSERT INTO ${keyspace}.placements (userid, stamp) VALUES (?, ?)`;
const createPlaceMetadata = `INSERT INTO ${keyspace}.pixel_meta (position, color, userid, username, stamp) VALUES (?, ?, ?, ?, ?)`;
const getUserById   = `SELECT username, passwordHash, userid FROM ${keyspace}.users_by_name WHERE userid = ?`;
const getUserByName = `SELECT username, passwordHash, userid FROM ${keyspace}.users_by_name WHERE username = ?`;
const getLastPlacedTimestamp = `SELECT userid, stamp FROM ${keyspace}.placements WHERE userid = ?`;
const checkUserAuth = `SELECT username, passwordHash, userid FROM ${keyspace}.users_by_names WHERE passwordHash = ?`;

export default {
	keystore,
	pixel_meta,
	placement_cooldown,
	users_by_name,
	passwordIndex,
	useridIndex,

	createUserByName,
	createUserByUuid,
	createPlaceTimestamp,
	createPlaceMetadata,
	getUserById,
	getUserByName,
	getLastPlacedTimestamp,
	checkUserAuth,
};
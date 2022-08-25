import jest from "@jest/globals";
import { CassandraTimestampSchema } from "../interfaces/CassandraPlacement";
import { CassandraUserSchema } from "../interfaces/CassandraUserSchema";
import TestMetadataAPI from "../interfaces/TestMetadataAPI";
import perms from "../persistence/perms";

const api = perms as TestMetadataAPI;

jest.beforeAll(async () => {
	await api.init();
});

jest.afterEach(async () => {
	await api.clearTables();
});

jest.describe("user creation", () => {
	jest.test.each([
		["username", "password"],
		["abc", "123"],
	])("strs %s, %s ok", (u: string, p: string) => {
		expect(async () => { await api.createUser(u, p); }).not.toThrow();
	});

	jest.test("get test", async () => {
		const check = (p: CassandraUserSchema | null) => {
			expect(p).not.toBeNull();
			p = p as CassandraUserSchema;
			expect(p.username).toEqual("username");
			expect(p.passwordHash).toBe("password");
		};

		expect(async () => { await api.createUser("username", "password"); }).not.toThrow();
		let p = await api.getUserByName("username");
		check(p);
		p = p as CassandraUserSchema;
		p = await api.getUserById(p.userid);
		check(p);
	});
});

jest.describe("timestamp creation", () => {
	let u: string;
	beforeAll(async () => {
		await api.createUser("username", "password");
		const p = await api.getUserByName("username") as CassandraUserSchema;

		u = p.userid;
	});

	jest.test("create and get", async () => {
		expect(async () => { await api.createTimestamp(u); }).not.toThrow();

		let b = await api.getTimestampFromId(u);
		jest.expect(b).not.toBeNull();
		b = b as CassandraTimestampSchema;
		jest.expect(b.userid).toBe(u);
	});

});

jest.describe("place meta creation", () => {
});

jest.afterAll(async () => {
	await api.clearTables();
	await api.shutdown();
});
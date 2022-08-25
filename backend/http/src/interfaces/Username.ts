import { CassandraUserSchema } from "./CassandraUserSchema";

export type UserNoPassword = Omit<CassandraUserSchema, "passwordHash">;
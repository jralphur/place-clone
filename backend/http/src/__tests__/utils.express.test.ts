import { isColorName, isPixelSetRequest, isPoint, isUserCredentials } from "../util/express";
import jest from "@jest/globals";

jest.describe("isPoint tests", () => {
	jest.test.each([
		{x: 1, y: 1},
		{x: 0.2, y: 0.5},
		{x: -1, y: -4},
		{x: 4, y: 3, z: 3},
	])("valid point: %j", (p) => {
		jest.expect(isPoint(p)).toBe(true);
	});

	jest.test.each([
		{y: 2},
		{z: 1},
		{x: 1, z: 2},
		{},
		{a: 1, b: 2},
		{x: "Hello", y: "World" },
		{"Point": {x: 1, y: 2}},
	])("invalid point: %j", (p) => {
		jest.expect(isPoint(p)).toBe(false);
	});
});

jest.describe("isUserCredentials tests", () => {
	jest.test.each([
		{ username: "username", password: "password" },
		{ username: "", password: "" },
		{ username: "", password: "", other: "other" },
	])("valid usercredentials: %j", (u) => {
		jest.expect(isUserCredentials(u)).toBe(true);
	});

	jest.test.each([
		{ username: 2, password: 0 },
		{ username: "no password" },
		{ password: "no username" },
		{},
		{ "creds": {username: "username", password: "password" }}
	])("invalid usercredentials: %d", (u) => {
		jest.expect(isUserCredentials(u)).toBe(false);
	});
});

jest.describe("isColorTests", () => {
	jest.test.each([
		"WHITE",
		"white".toUpperCase(),
		"BLUE",
		"GREEN"
	])("valid colornames: %s", (c) => {
		jest.expect(isColorName(c)).toBe(true);
	});

	jest.test.each([
		"purp",
		"purple",
		"",
		0,
		{"color": "PURPLE"},
	])("invalid colorname: %s", (c) => {
		jest.expect(isColorName(c)).toBe(false);
	});
});

jest.describe("isPixelSetRequest", () => {
	jest.test.each([
		{point: {x: 3, y: 3}, color: "WHITE" },
		{point: {x: 0.2, y: 0.2}, color: "WHITE"},
		{point: {x: 1, y: 1}, color: "blue".toUpperCase()},
		{point: {x: 2, y: 3}, color: "ORANGE", extra: "extra"},
	])("valid requests: %s", (psr) => {
		jest.expect(isPixelSetRequest(psr)).toBe(true);
	});

	jest.test.each([
		{ color: {x: 3, y: 3}, point: "WHITE" },
		{ point: {}, color: "WHITE" },
		{ point: {x: 2, y: 2}, color: "o" },
		{},
		{ point: {x: 3}, color: "WHITE" },
		{ point: {x: 4, z: 4}, color: "BLUE" },
		{ point: {x: 3, y: 3}, color: {}},
	])("invalid requests: %s", (psr) => {
		jest.expect(isPixelSetRequest(psr)).toBe(false);
	});
});



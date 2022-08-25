import bcrypt from "bcrypt";
import express from "express";
import UserCredentialsRequest from "../interfaces/UserCredentials";
import perms from "../persistence/perms";
import { isUserCredentials } from "../util/express";
import jwt from "jsonwebtoken";
import { UserNoPassword } from "../interfaces/Username";
import PlaceNoUserFoundError from "../interfaces/PlaceUsernameNotFoundError";
import PlacePasswordIncorrectError from "../interfaces/PlacePasswordIncorrectError";
import PlaceRegisterUsernameTakenError from "../interfaces/PlaceRegisterUsernameTakenError";
import PlaceUnrecognizedRequestBodyError from "../interfaces/PlaceUnrecognizedRequestBodyError";
import PlaceBadAuthorizationError from "../interfaces/PlaceBadAuthorizationError";
import cors from "cors";

const User = express.Router();


User.use(cors());
// register 
User.post('/register', (req, res, next) => {
	if (req.body && isUserCredentials(req.body as unknown)) {
		const { username, password } = req.body as UserCredentialsRequest;

		perms.getUserByName(username).then(user => {
			if (user !== null) {
				throw new PlaceRegisterUsernameTakenError(username + " is already taken."); // TODO: improve this
			}
			return user;
		}).then(() => bcrypt.hash(password, 10))
			.then((passwordHash) => perms.createUser(username, passwordHash))
			.then(() => res.status(200).send())
			.catch(err => err ? next(err) : res.json(400).json({ err: "bad username "})); // todo: imrpove this
	}
	else {
		throw new PlaceBadAuthorizationError("no username/password.");
	}
});

// login auth
User.post('/login', (req, res, next) => {
	if (!req.body || !isUserCredentials(req.body as unknown)) {
		throw new PlaceUnrecognizedRequestBodyError("unrecognized body");
	}

	const { username, password } = req.body as UserCredentialsRequest;
	let toSign: UserNoPassword;

	perms.getUserByName(username)
		.then(user => {
			if (user === null) {
				throw new PlaceNoUserFoundError("No user: " + username); 
			}
			toSign = { username: user.username, userid: user.userid };
			return user;
		})
		.then(user => bcrypt.compare(password, user.passwordHash))
		.then(comp => {
			if (!comp) {
				throw new PlacePasswordIncorrectError("Password provided is incorrect.");
			}
			return comp;
		})
		.then(() => jwt.sign(toSign, process.env["SECRET"] as string, { expiresIn: 60 * 60 }))
		.then(token => res.status(200).json({token, username}))
		.catch(e => next(e));
});

export default User;
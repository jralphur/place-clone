import express from "express";
import backendError from "./middleware/backendError";
import consoleLogger from "./middleware/consoleLog";
import Place from "./router/place";
import User from "./router/users";
import cors from "cors";

const app = express();

app.use(cors());
// router
app.use("/api/board", Place);
app.use("/api/auth", User);

// logging middleware
app.use("/", consoleLogger);

// error middleware
app.use("/", backendError);
app.use((_req, res, _next) => {
	res.status(404);
	res.json({error: "404"});
});

app.get("/", (req, res) => {
	res.send(200);
});

export default app;
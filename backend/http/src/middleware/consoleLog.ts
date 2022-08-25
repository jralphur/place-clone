import * as express from "express";

const consoleLogger = (req: express.Request, _res: express.Response, next: express.NextFunction) => {
	console.log(req.body);
	next();
};

export default consoleLogger;
import perms from "./src/persistence/perms";
import memboard from "./src/persistence/memboard";
import dotenv from "dotenv";
import server from "./src/server";

dotenv.config();

const shutdown = () => {
	Promise.all([memboard.shutdown(), perms.shutdown()]).then(() => process.exit(0)).catch(() => {});
};

Promise.all([perms.init(), memboard.init()])
	.then(() => server.listen(process.env.PORT, () => console.log("listening on ", process.env.PORT)))
	.catch(e => {
		console.log("critical error");
		console.error(e); process.exit(1);
	});

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
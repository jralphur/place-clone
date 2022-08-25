import { Server } from "socket.io";
import server from "./server";

const io = new Server(server);

io.on("connection", (_socket) => {
	console.log("connected to websocket");
});

export default io;
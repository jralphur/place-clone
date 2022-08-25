import { io } from "socket.io-client";

const client = io("/");

client.on("connect", () => {
  console.log("socket.io connected");
});

export default client;

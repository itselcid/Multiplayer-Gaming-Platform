import Fastify from "fastify";
import { automationBot } from "./automation/tournamentBot";

const server = Fastify({ logger: true });

server.get("/", async () => ({
	status: "Fastify running with TypeScript"
}));

server.get("/addUsername", async () => ({
	status: "Fastify running with TypeScript"
}));

server.get("/deleteUsername", async () => ({
	status: "Fastify running with TypeScript"
}));

const start = async () => {
	try {
		await server.listen({ port: 3003 });
		console.log("Backend running on http://localhost:3003");
		automationBot();
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

start();
import Fastify from "fastify";
import { automationBot } from "./automation/tournamentBot";

const server = Fastify({ logger: true });

server.get("/", async () => ({
  status: "Fastify running with TypeScript"
}));

const start = async () => {
  try {
    await server.listen({ port: 3000 });
    console.log("Backend running on http://localhost:3000");

    automationBot(); // start automation bot
	console.log('started');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
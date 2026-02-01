import { automationBot } from "./automation/tournamentBot";

const start = async () => {
	try {
		console.log("Blockchain backend running");
		automationBot();
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

start();
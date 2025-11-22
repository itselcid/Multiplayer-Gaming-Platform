import { network } from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import TournamentFactoryArtifact from "../artifacts/contracts/TournamentFactory.sol/TournamentFactory.json";
import { parseEther } from "viem";


async function deploy(contractName: string) {
	const { viem } = await network.connect();
	
	const	contract = await viem.deployContract(contractName);
	
	console.log(contract.address, 'is deployed');


	const deployedAddress = contract.address;

	const frontendData = {
	address: deployedAddress,
	abi: TournamentFactoryArtifact.abi,
	};

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	const	path_of_file = path.resolve(__dirname, "../../frontend/src/web3/contracts/" + contractName + "/" + contractName + ".json");
	const	path_of_dir = path.resolve(__dirname, "../../frontend/src/web3/contracts/" + contractName);
	try {
		fs.writeFileSync(
		path_of_file,
		JSON.stringify(frontendData, null, 2)
		);
	} catch {
		console.log('failed');
		fs.mkdirSync(path_of_dir, { recursive: true });
		fs.writeFileSync(
		path_of_file,
		JSON.stringify(frontendData, null, 2)
		);
	}


	// add one tournament pending
	const	entry_fee_string1 = '0.5';
	const	timestamp1 = BigInt(Math.floor(new Date("2025-12-15T14:00:00Z").getTime() / 1000));
	const	tx1 = await contract.write.createTournament(["triz tournowa (pend)", parseEther(entry_fee_string1), 8, timestamp1, 0]);
	
	// // wait for confirmation
	const client = await viem.getPublicClient();
	await client.waitForTransactionReceipt({hash: tx1, confirmations: 1});

	// add one tournament
	const	entry_fee_string2 = '0.75';
	const	timestamp2 = BigInt(Math.floor(new Date("2025-11-20T14:00:00Z").getTime() / 1000));
	const	tx2 = await contract.write.createTournament(["triz tournowa (ongoing)", parseEther(entry_fee_string2), 4, timestamp2, 1]);
	
	// wait for confirmation
	await client.waitForTransactionReceipt({hash: tx2, confirmations: 1});

	// add one tournament
	const	entry_fee_string3 = '1';
	const	timestamp3 = BigInt(Math.floor(new Date("2025-11-19T14:00:00Z").getTime() / 1000));
	const	tx3 = await contract.write.createTournament(["triz tournowa (finished)", parseEther(entry_fee_string3), 16, timestamp3, 2]);
	
	// wait for confirmation
	await client.waitForTransactionReceipt({hash: tx3, confirmations: 1});

	// add one tournament
	const	entry_fee_string4 = '2';
	const	timestamp4 = BigInt(Math.floor(new Date("2025-11-15T14:00:00Z").getTime() / 1000));
	const	tx4 = await contract.write.createTournament(["triz tournowa (expired)", parseEther(entry_fee_string4), 32, timestamp4, 0]);
	
	// wait for confirmation
	await client.waitForTransactionReceipt({hash: tx4, confirmations: 1});
}

async function main() {
	await deploy('TournamentFactory');

	
	// try{
	// 	const	before = await contract.read.tournaments([0n]);
	// 	console.log('tournmanents before: ', before);
	// } catch {
	// 	console.log('before is not possible');
	// }
	
	// const	tx = await contract.write.createTournament([1, 5n, 8, 123456789n, 0]);
	
	// // wait for confirmation
	// const client = await viem.getPublicClient();
	// await client.waitForTransactionReceipt({hash: tx, confirmations: 1});
	
	// const	after = await contract.read.tournaments([0n]);
	// console.log('tournmanents after: ', after);
}

main().catch(console.error);

// const { viem } = await network.connect({
//   network: "hardhatOp",
//   chainType: "op",
// });

// console.log("Sending transaction using the OP chain type");

// const publicClient = await viem.getPublicClient();
// const [senderClient] = await viem.getWalletClients();

// console.log("Sending 1 wei from", senderClient.account.address, "to itself");

// const l1Gas = await publicClient.estimateL1Gas({
//   account: senderClient.account.address,
//   to: senderClient.account.address,
//   value: 1n,
// });

// console.log("Estimated L1 gas:", l1Gas);

// console.log("Sending L2 transaction");
// const tx = await senderClient.sendTransaction({
//   to: senderClient.account.address,
//   value: 1n,
// });

// await publicClient.waitForTransactionReceipt({ hash: tx });

// console.log("Transaction sent successfully");

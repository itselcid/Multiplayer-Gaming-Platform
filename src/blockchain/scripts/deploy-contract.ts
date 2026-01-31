import { network } from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Abi } from "viem";
// import { parseEther } from "viem";

const	export_contract = (
	contractName: string, 
	export_path: string, 
	data: {
		address: `0x${string}`;
		abi: Abi;
	}
) => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	const	path_of_file = path.resolve(__dirname, export_path + contractName + "/" + contractName + ".json");
	const	path_of_dir = path.resolve(__dirname, export_path + contractName);
	try {
		fs.writeFileSync(
		path_of_file,
		JSON.stringify(data, null, 2)
		);
	} catch {
		console.log('failed');
		fs.mkdirSync(path_of_dir, { recursive: true });
		fs.writeFileSync(
		path_of_file,
		JSON.stringify(data, null, 2)
		);
	}
}

async function deploy(contractName: string, args?: string[]) : Promise<string> {
	const { viem } = await network.connect();
	
	let contract;
	if (args)
		contract = await viem.deployContract(contractName, args);
	else
		contract = await viem.deployContract(contractName);
	
	console.log('contract', contractName, 'is deployed at address',  contract.address);


	const deployedAddress = contract.address;

	const data = {
	address: deployedAddress,
	abi: contract.abi,
	};

	export_contract(contractName, '../../frontend/src/web3/contracts/', data);
	export_contract(contractName, '../../backend/blockchain-service/contract/', data);

	// if (contractName === 'TournamentFactory') {

	// 	// add one tournament pending
	// 	const	entry_fee_string1 = '0.5';
	// 	const	timestamp1 = BigInt(Math.floor(new Date("2025-12-15T14:00:00Z").getTime() / 1000));
	// 	const	tx1 = await contract.write.createTournament(["triz tournowa (pend)", parseEther(entry_fee_string1), 8, timestamp1, 0]);
		
	// 	// wait for confirmation
	// 	const client = await viem.getPublicClient();
	// 	await client.waitForTransactionReceipt({hash: tx1, confirmations: 1});
	return (contract.address);
}

async function main() {
	// const TRIZcoinAddress = await deploy('TRIZcoin');
	// await deploy('TournamentFactory', [TRIZcoinAddress]);
	await deploy('TournamentFactory', ['0xcb8b6623c058a114e816d87cc9114563c02f61a0']);

	
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

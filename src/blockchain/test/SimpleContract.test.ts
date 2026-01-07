import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe ("SimpleContract", async () => {
	const	{viem} = await	network.connect();
	const	deployContract = async () => {

		// get accounts
		const [owner, ...otherAccounts] = await viem.getWalletClients();

		// deploy contract
		const	contract = await viem.deployContract('SimpleContract');

		// get public client
		const	publicClient = await viem.getPublicClient();

		return ({
			contract,
			owner,
			otherAccounts,
			publicClient
		});
	}

	describe("deploy contract", () => {
		it("should start with value 0", async () => {
			const	{contract} = await deployContract();
			const	value = await contract.read.get();
			console.log();

			assert.equal(value, 0n);
		})
	})
})

// describe("Counter", async function () {
//   const { viem } = await network.connect();
//   const publicClient = await viem.getPublicClient();

//   it("Should emit the Increment event when calling the inc() function", async function () {
//     const counter = await viem.deployContract("Counter");

//     await viem.assertions.emitWithArgs(
//       counter.write.inc(),
//       counter,
//       "Increment",
//       [1n],
//     );
//   });

//   it("The sum of the Increment events should match the current value", async function () {
//     const counter = await viem.deployContract("Counter");
//     const deploymentBlockNumber = await publicClient.getBlockNumber();

//     // run a series of increments
//     for (let i = 1n; i <= 10n; i++) {
//       await counter.write.incBy([i]);
//     }

//     const events = await publicClient.getContractEvents({
//       address: counter.address,
//       abi: counter.abi,
//       eventName: "Increment",
//       fromBlock: deploymentBlockNumber,
//       strict: true,
//     });

//     // check that the aggregated events match the current value
//     let total = 0n;
//     for (const event of events) {
//       total += event.args.by;
//     }

//     assert.equal(total, await counter.read.x());
//   });
// });

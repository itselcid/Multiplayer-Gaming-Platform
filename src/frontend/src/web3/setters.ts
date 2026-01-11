/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   setters.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/19 02:15:08 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/01 23:23:01 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Metamask_error } from "../components/Metamask_error";
import { publicClient, TournamentFactoryAbi, TournamentFactoryAddress, walletClientMetamask, TRIZcoinAbi, TRIZcoinAddress } from "./contracts/contracts";
import { getBalance, type Tournament } from "./getters";

export const	approveAllowence = async (amount: bigint) => {
	if (!walletClientMetamask)
		return;

	const	accounts = await walletClientMetamask.getAddresses();
	const	account = accounts[0];

	const { request } = await publicClient.simulateContract({
		address: TRIZcoinAddress,
		abi: TRIZcoinAbi,
		functionName: "approve",
		args: [TournamentFactoryAddress, amount], // or MAX_UINT256 for infinite
		account: account			
	});

	const tx = await walletClientMetamask.writeContract(request);

	// wait for confirmation
	await publicClient.waitForTransactionReceipt({
		hash: tx
	});
}

export const create_tournament = async (title: string, entryFee: bigint, participants: bigint, startTime: bigint, username:string) : Promise<void> => {
	if (!walletClientMetamask)
		return;

	const	accounts = await walletClientMetamask.getAddresses();
	const	account = accounts[0];
	
	if ((await getBalance(account)) < entryFee){
		const	root = document.getElementById('app');
		if (root) {
			const	metamask_error = new Metamask_error(
				"Not Enough TRIZcoins",
				"Oops! You don’t have enough TRIZcoins to join. Get some more and come back stronger!",
				false
			);
			metamask_error.mount(root);
		}
		return;
	}
	
	const { request } = await publicClient.simulateContract({
		address: TournamentFactoryAddress,
		abi: TournamentFactoryAbi,
		functionName: 'createTournament',
		args: [title, entryFee, participants, startTime, username],
		account: account			
	});

	const tx = await walletClientMetamask.writeContract(request);

	// wait for confirmation
	await publicClient.waitForTransactionReceipt({
		hash: tx
	});
}

export const join_tournament = async (_tournament: Tournament, _username: string) : Promise<void> => {
	if (!walletClientMetamask)
		return;
	
	const	accounts = await walletClientMetamask.getAddresses();
	const	account = accounts[0];
	if ((await getBalance(account)) < _tournament.entryFee){
		console.log('not enough funds');
		return;
	}
	// const	allowance = await getAllowance(account);
	// if (allowance < _tournament.entryFee) {
	// 	console.log('not enough allowence');
	// 	const { request } = await publicClient.simulateContract({
	// 		address: TRIZcoinAddress,
	// 		abi: TRIZcoinAbi,
	// 		functionName: "approve",
	// 		args: [TournamentFactoryAddress, _tournament.entryFee], // or MAX_UINT256 for infinite
	// 		account: account			
	// 	});

	// 	const tx = await walletClientMetamask.writeContract(request);

	// 	// wait for confirmation
	// 	await publicClient.waitForTransactionReceipt({
	// 		hash: tx
	// 	});
	// }
	const { request } = await publicClient.simulateContract({
		address: TournamentFactoryAddress,
		abi: TournamentFactoryAbi,
		functionName: 'joinTournament',
		args: [_tournament.id, _username],
		account: account			
	});

	const tx = await walletClientMetamask.writeContract(request);

	// wait for confirmation
	await publicClient.waitForTransactionReceipt({
		hash: tx
	});
}

export const claim_refunds = async (_id:bigint, _index:bigint) => {
	if (!walletClientMetamask)
		return;
	const	accounts = await walletClientMetamask.getAddresses();
	const	account = accounts[0];
	const { request } = await publicClient.simulateContract({
		address: TournamentFactoryAddress,
		abi: TournamentFactoryAbi,
		functionName: 'claimRefunds',
		args: [_id, _index],
		account: account			
	});

	const tx = await walletClientMetamask.writeContract(request);

	// wait for confirmation
	await publicClient.waitForTransactionReceipt({
		hash: tx
	});
}

export const claim_prize = async (_id:bigint, _index:bigint) => {
	if (!walletClientMetamask)
		return;
	const	accounts = await walletClientMetamask.getAddresses();
	const	account = accounts[0];
	const { request } = await publicClient.simulateContract({
		address: TournamentFactoryAddress,
		abi: TournamentFactoryAbi,
		functionName: 'claimPrize',
		args: [_id, _index],
		account: account			
	});

	const tx = await walletClientMetamask.writeContract(request);

	// wait for confirmation
	await publicClient.waitForTransactionReceipt({
		hash: tx
	});
}

// sign transaction without metamask
// const { request } = await publicClient.simulateContract({
// 	  account: signingAccount,
// 	address: TournamentFactoryAddress,
// 	abi: TournamentFactoryAbi,
// 	functionName: 'createTournament',
// 	args: [title, entryFee, participants, startTime, 0]
// });

// await walletClient.writeContract(request);


// to be deleted
export const tobedeleted_submit_match_score = async (_id: bigint, _round: bigint, _index: bigint, _score_1: bigint, _score_2: bigint) => {
	if (!walletClientMetamask)
		return;
	const	accounts = await walletClientMetamask.getAddresses();
	const	account = accounts[0];
	const { request } = await publicClient.simulateContract({
		address: TournamentFactoryAddress,
		abi: TournamentFactoryAbi,
		functionName: 'submitMatchScore',
		args: [_id, _round, _index, _score_1, _score_2],
		account: account			
	});

	const tx = await walletClientMetamask.writeContract(request);

	// wait for confirmation
	await publicClient.waitForTransactionReceipt({
		hash: tx
	});
}
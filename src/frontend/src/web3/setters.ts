/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   setters.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/19 02:15:08 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/02 22:01:45 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { publicClient, TournamentFactoryAbi, TournamentFactoryAddress, walletClientMetamask, TRIZcoinAbi, TRIZcoinAddress } from "./contracts/contracts";
import { getAllowance, getBalance, type Tournament } from "./getters";

export const create_tournament = async (title: string, entryFee: bigint, participants: bigint, startTime: bigint, username:string) : Promise<void> => {
	if (!walletClientMetamask)
		return;
	const	accounts = await walletClientMetamask.getAddresses();
	const	account = accounts[0];
	if ((await getBalance(account)) < entryFee){
		console.log('not enough funds');
		return;
	}
	const	allowance = await getAllowance(account);
	// const	balance = await getBalance('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
	if (allowance < entryFee) {
		console.log('not enough allowence');
		const { request } = await publicClient.simulateContract({
			address: TRIZcoinAddress,
			abi: TRIZcoinAbi,
			functionName: "approve",
			args: [TournamentFactoryAddress, entryFee], // or MAX_UINT256 for infinite
			account: account			
		});

		const tx = await walletClientMetamask.writeContract(request);

		// wait for confirmation
		await publicClient.waitForTransactionReceipt({
			hash: tx
		});
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
	const	allowance = await getAllowance(account);
	if (allowance < _tournament.entryFee) {
		console.log('not enough allowence');
		const { request } = await publicClient.simulateContract({
			address: TRIZcoinAddress,
			abi: TRIZcoinAbi,
			functionName: "approve",
			args: [TournamentFactoryAddress, _tournament.entryFee], // or MAX_UINT256 for infinite
			account: account			
		});

		const tx = await walletClientMetamask.writeContract(request);

		// wait for confirmation
		await publicClient.waitForTransactionReceipt({
			hash: tx
		});
	}
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

export const take_refund = async (_id:bigint, _index:bigint) => {
	if (!walletClientMetamask)
		return;
	const	accounts = await walletClientMetamask.getAddresses();
	const	account = accounts[0];
	const { request } = await publicClient.simulateContract({
		address: TournamentFactoryAddress,
		abi: TournamentFactoryAbi,
		functionName: 'takeRefunds',
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
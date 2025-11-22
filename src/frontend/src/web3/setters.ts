/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   setters.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/19 02:15:08 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/19 03:33:59 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { publicClient, signingAccount, TournamentFactoryAbi, TournamentFactoryAddress, walletClient } from "./contracts/TournamentFactory/TournamentFactory";

export const create_tournament = async (title: string, entryFee: bigint, participants: bigint, startTime: bigint) : Promise<void> => {
	console.log(title);
	const { request } = await publicClient.simulateContract({
  		account: signingAccount,
		address: TournamentFactoryAddress,
		abi: TournamentFactoryAbi,
		functionName: 'createTournament',
		args: [title, entryFee, participants, startTime, 0]
	});
	
	await walletClient.writeContract(request)
}
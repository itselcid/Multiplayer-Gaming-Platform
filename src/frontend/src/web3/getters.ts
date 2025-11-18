/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   getters.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/17 20:42:15 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/18 03:13:30 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// import { localhost, avalancheFuji } from 'viem/chains';
import { TournamentFactoryAbi, TournamentFactoryAddress, publicClient } from "./contracts/TournamentFactory/TournamentFactory";

export interface Tournament {
  id: bigint;
  title: string;
  entryFee: bigint;
  participants: bigint;
  startTime: bigint;
  status: number; 
}

export const	getTournaments = async () : Promise<Tournament[]> => {
	const	tournaments = await publicClient.readContract(
		{
			address: TournamentFactoryAddress,
			abi: TournamentFactoryAbi,
			functionName: 'getTournaments'
		}
	) as Tournament[];
	// console.log(tournaments);
	return (tournaments);
}
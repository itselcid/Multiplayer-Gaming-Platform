/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   getters.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/17 20:42:15 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/26 01:47:16 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// import { localhost, avalancheFuji } from 'viem/chains';
import { encodePacked, keccak256 } from "viem";
import { Tournament_card } from "../components/Tournament_card";
import { addTouranamentState, finishedMatchesState, tournament_tab, updateTournamentState } from "../core/appStore";
import { cachedTournaments } from "../main";
import { get_tournament_status } from "../tools/tournament_tools";
import { TournamentFactoryAbi, TournamentFactoryAddress, publicClient, TRIZcoinAbi, TRIZcoinAddress } from "./contracts/contracts";

export interface Tournament {
	id: bigint;
	title: string;
	entryFee: bigint;
	participants: bigint;
	maxParticipants: bigint;
	currentRound: bigint;
	startTime: bigint;
	status: number;
}

export interface Player {
    addr: string;
    claimed: boolean;
    username: string;
}

export interface Match {
	player1: Player;
	player1Score: bigint;
    player2: Player;
	player2Score: bigint;
    status: number;
}

// export const	getTournaments = async () : Promise<Tournament[]> => {
// 	const	tournaments = await publicClient.readContract(
// 		{
// 			address: TournamentFactoryAddress,
// 			abi: TournamentFactoryAbi,
// 			functionName: 'getTournaments'
// 		}
// 	) as Tournament[];
// 	// console.log(tournaments);
// 	return (tournaments);
// }

export const	getTournamentLength = async () : Promise<bigint> => {
	const	length = await publicClient.readContract(
		{
			address: TournamentFactoryAddress,
			abi: TournamentFactoryAbi,
			functionName: 'getTournamentLength'
		}
	) as bigint;
	return (length);
}


export const	getTournament = async (_id: bigint) : Promise<Tournament> => {
	const	tournament = await publicClient.readContract(
		{
			address: TournamentFactoryAddress,
			abi: TournamentFactoryAbi,
			functionName: 'getTournament',
			args: [_id]
		}
	) as Tournament;
	return (tournament);
}

let	loading_batch = false;
export const	get_tournament_batch = async (batch_size: number): Promise<void> => {
	if (loading_batch)
		return;
	loading_batch = true;
	let	index = 0n;
	if (cachedTournaments.length) {
		// tournaments already retrieved
		index = cachedTournaments[cachedTournaments.length -1].id -1n;
	} else {
		// fresh start
		index = await getTournamentLength() -1n;
	}
	const	container = document.getElementById('tournaments-container');
	for (let retrieved = 0; retrieved < batch_size && index !== -1n ; index--) {
		// console.log('retrieving tournament id: ', index);
		const	tournament = await getTournament(index);
		// console.log('tournament id', index, 'retrieved');
		cachedTournaments.push(tournament);
		if (container) {
			if (
				tournament_tab.get() === 'all' ||
				tournament_tab.get() === get_tournament_status(tournament)
			) {
				const	card = new Tournament_card(tournament);
				card.mount(container);
				retrieved++;
			};
		}
	}
	loading_batch = false;
}

export const	getPlayer = async (id: bigint, currentRound:bigint, order: bigint): Promise<Player> => {
	const	player = await publicClient.readContract(
		{
			address: TournamentFactoryAddress,
			abi: TournamentFactoryAbi,
			functionName: 'getPlayer',
			args: [id, currentRound, order]
		}
	) as Player;
	return (player);
}

export const	getMatch = async (_id:bigint, _round:bigint, _matchId:bigint) => {
	const	match = await publicClient.readContract(
		{
			address: TournamentFactoryAddress,
			abi: TournamentFactoryAbi,
			functionName: 'getMatch',
			args: [_id, _round, _matchId]
		}
	) as Match;
	return (match);
}

export const	getMatchKey = (_id:bigint, _round:bigint, _matchId:bigint) : `0x${string}` => {
	return keccak256(
		encodePacked(
			["uint256", "uint256", "uint256"],
			[_id, _round, _matchId]
		)
	);
}

export const	getMatchWithKey = async (_key:`0x${string}`) => {
	const	match = await publicClient.readContract(
		{
			address: TournamentFactoryAddress,
			abi: TournamentFactoryAbi,
			functionName: 'getMatchWithKey',
			args: [_key]
		}
	) as Match;
	return (match);
}

// events
export const watchTournamentCreation = () => {
	publicClient.watchContractEvent(
		{
			address: TournamentFactoryAddress,
			abi: TournamentFactoryAbi,
			eventName: 'TournamentCreated',
			onLogs: (logs) => {
				logs.forEach((log) => {
					// fix type problem
					const typedLog = log as typeof log & {
						args: {
						_id: bigint;
						}
					};
					addTouranamentState.set(typedLog.args._id);
				})
			}
		}
	)
}

export const	watchTournamentStatus = () => {
	publicClient.watchContractEvent(
		{
			address: TournamentFactoryAddress,
			abi: TournamentFactoryAbi,
			eventName: 'SetStatus',
			onLogs: (logs) => {
				logs.forEach(async (log) => {
					// fix type problem
					const typedLog = log as typeof log & {
						args: {
						_id: bigint;
						}
					};
					updateTournamentState.set(typedLog.args._id);
				})
			}
		}
	)
}

export const	watchFinishedMatches = () => {
	publicClient.watchContractEvent(
		{
			address: TournamentFactoryAddress,
			abi: TournamentFactoryAbi,
			eventName: 'MatchFinished',
			onLogs: (logs) => {
				logs.forEach(async (log) => {
					// fix type problem
					const typedLog = log as typeof log & {
						args: {
						_id: bigint;
						_round: bigint;
						_matchId: bigint;
						}
					};
					// call back function
					finishedMatchesState.set(typedLog.args._id);
				})
			}
		}
	)
}

export const	watchCreatedRounds = () => {
	publicClient.watchContractEvent(
		{
			address: TournamentFactoryAddress,
			abi: TournamentFactoryAbi,
			eventName: 'RoundsCreated',
			onLogs: (logs) => {
				logs.forEach(async (log) => {
					// fix type problem
					const typedLog = log as typeof log & {
						args: {
						_id: bigint;
						}
					};
					// call back function
					finishedMatchesState.set(typedLog.args._id);
				})
			}
		}
	)
}

// erc20 functions
export const	getAllowance = async (address: string) : Promise<bigint> => {
	const	allowance: bigint = await publicClient.readContract(
		{
			address: TRIZcoinAddress,
			abi: TRIZcoinAbi,
			functionName: 'allowance',
			args: [address, TournamentFactoryAddress]
		}
	) as bigint;
	return (allowance);
}

export const	getBalance = async (address: string) : Promise<bigint> => {
	const	balance: bigint = await publicClient.readContract(
		{
			address: TRIZcoinAddress,
			abi: TRIZcoinAbi,
			functionName: 'balanceOf',
			args: [address]
		}
	) as bigint;
	return (balance);
}

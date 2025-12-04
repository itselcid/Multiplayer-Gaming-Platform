/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   getters.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/17 20:42:15 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/02 02:30:55 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// import { localhost, avalancheFuji } from 'viem/chains';
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

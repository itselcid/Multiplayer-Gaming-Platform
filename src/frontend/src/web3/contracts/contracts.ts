/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   contracts.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/25 10:59:44 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/25 10:59:47 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createPublicClient, createWalletClient, custom, getAddress, webSocket, type Address } from 'viem';
import TournamentFactoryData from './TournamentFactory/TournamentFactory.json';
import { avalancheFuji } from 'viem/chains';
import TRIZcoinData from './TRIZcoin/TRIZcoin.json';


// const FUJI_PRIVATE_KEY = process.env.FUJI_PRIVATE_KEY;
const VITE_FUJI_RPC_URL = import.meta.env.VITE_FUJI_RPC_URL;
// const VITE_FUJI_RPC_URL = process.env.VITE_FUJI_RPC_URL;

export const	publicClient = createPublicClient(
	{
		chain: avalancheFuji,
		transport: webSocket(VITE_FUJI_RPC_URL)
	}
)

// export const	TournamentFactoryAddress = TournamentFactoryData.address as string as `0x${string}`;;
export const TournamentFactoryAddress: Address = getAddress(TournamentFactoryData.address);
export const	TournamentFactoryAbi = TournamentFactoryData.abi;

// sign using script
export const walletClient = createWalletClient({
  chain: avalancheFuji,
  transport: webSocket(VITE_FUJI_RPC_URL)
})
 
// sign with metamask
export const walletClientMetamask =
	typeof(window) !== 'undefined' && window.ethereum ?
	createWalletClient({
		chain: avalancheFuji,
		transport: custom(window.ethereum)
	}): null;


// token
export const TRIZcoinAddress: Address = getAddress(TRIZcoinData.address);
export const	TRIZcoinAbi = TRIZcoinData.abi;

// contract data types
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
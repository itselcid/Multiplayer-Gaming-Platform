import { createPublicClient, createWalletClient, getAddress, http, webSocket, type Address } from 'viem';
import TournamentFactoryData from './TournamentFactory/TournamentFactory.json';
import { avalancheFuji } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from "dotenv";
import TRIZcoinData from './TRIZcoin/TRIZcoin.json';

dotenv.config();
const FUJI_PRIVATE_KEY = process.env.FUJI_PRIVATE_KEY;
const FUJI_RPC_URL = process.env.FUJI_RPC_URL;

export const	publicClient = createPublicClient(
	{
		chain: avalancheFuji,
		transport: webSocket(FUJI_RPC_URL)
	}
)

// export const	TournamentFactoryAddress = TournamentFactoryData.address as string as `0x${string}`;;
export const TournamentFactoryAddress: Address = getAddress(TournamentFactoryData.address);
export const	TournamentFactoryAbi = TournamentFactoryData.abi;

// sign using script
export const walletClient = createWalletClient({
  chain: avalancheFuji,
  transport: webSocket(FUJI_RPC_URL)
})
 
// Local Account
export const signingAccount = privateKeyToAccount(FUJI_PRIVATE_KEY as `0x${string}`)


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

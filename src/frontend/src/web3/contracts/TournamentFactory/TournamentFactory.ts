import { createPublicClient, getAddress, http, type Address } from 'viem';
import TournamentFactoryData from './TournamentFactory.json';
import { localhost } from 'viem/chains';

export const	publicClient = createPublicClient(
	{
		chain: localhost,
		transport: http('http://127.0.0.1:8545')
	}
)

// export const	TournamentFactoryAddress = TournamentFactoryData.address as string as `0x${string}`;;
export const TournamentFactoryAddress: Address = getAddress(TournamentFactoryData.address);
export const	TournamentFactoryAbi = TournamentFactoryData.abi;
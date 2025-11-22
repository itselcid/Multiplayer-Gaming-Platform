import { createPublicClient, createWalletClient, custom, getAddress, http, type Address } from 'viem';
import TournamentFactoryData from './TournamentFactory.json';
import { hardhat } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
const private_key = import.meta.env.VITE_LOCALHOST_PRIVATE_KEY;

export const	publicClient = createPublicClient(
	{
		chain: hardhat,
		transport: http('http://127.0.0.1:8545')
	}
)

// export const	TournamentFactoryAddress = TournamentFactoryData.address as string as `0x${string}`;;
export const TournamentFactoryAddress: Address = getAddress(TournamentFactoryData.address);
export const	TournamentFactoryAbi = TournamentFactoryData.abi;


export const walletClient = createWalletClient({
  chain: hardhat,
  transport: http('http://127.0.0.1:8545')
})
 
// Local Account
export const signingAccount = privateKeyToAccount(private_key as `0x${string}`)
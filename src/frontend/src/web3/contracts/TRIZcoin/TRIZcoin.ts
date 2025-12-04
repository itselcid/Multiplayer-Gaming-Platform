import { createPublicClient, createWalletClient, custom, getAddress, http, type Address } from 'viem';
import TRIZcoinData from './TRIZcoin.json';
import { hardhat } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
const private_key = import.meta.env.VITE_LOCALHOST_PRIVATE_KEY;

export const	publicClient = createPublicClient(
	{
		chain: hardhat,
		transport: http('http://127.0.0.1:8545')
	}
)

// export const	TRIZcoinAddress = TRIZcoinData.address as string as `0x${string}`;;
export const TRIZcoinAddress: Address = getAddress(TRIZcoinData.address);
export const	TRIZcoinAbi = TRIZcoinData.abi;


export const walletClient = createWalletClient({
  chain: hardhat,
  transport: http('http://127.0.0.1:8545')
})
 
// Local Account
export const signingAccount = privateKeyToAccount(private_key as `0x${string}`)
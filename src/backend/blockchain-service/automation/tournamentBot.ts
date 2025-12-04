import { publicClient, signingAccount, Tournament, TournamentFactoryAbi, TournamentFactoryAddress, walletClient } from "../contract/contracts";

const	get_shuffled_array = (len: number) : bigint[] => {
	const numbers = Array.from({ length: len }, (_, i) => BigInt(i));
	const shuffled = [...numbers]; // Create a copy to avoid mutating the original
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
  }
  
  return (shuffled);
}

const	waitForTxSafe = async (hash: `0x${string}`, retries = 20, delayMs = 3000) => {
	for (let i = 0; i < retries; i++) {
        try {
            const receipt = await publicClient.waitForTransactionReceipt({hash});
            return receipt; // success
        }
        catch (err: any) {
            if (err.name === "WaitForTransactionReceiptTimeoutError") {
                console.log(`⏳ Waiting for network... attempt ${i + 1}/${retries}`);
                await new Promise(r => setTimeout(r, delayMs));
                continue;  // retry
            }
			console.error("Unkonwn error found: ", err);
            return (null);
        }
    }
    console.error("❌ Transaction still not confirmed after retries");
	return (null);
}

const	transact = async(_functionName: string, _args: unknown[]) => {
	const nonce = await publicClient.getTransactionCount({
        address: signingAccount.address,
        blockTag: 'pending'
    });

	const	{ request } = await publicClient.simulateContract({
		address: TournamentFactoryAddress,
		abi: TournamentFactoryAbi,
		functionName: _functionName,
		args: _args.length ? _args: undefined,
		account: signingAccount,
		nonce: nonce
	}) ;
	let tx: `0x${string}`;
	try {
		tx = await walletClient.writeContract(request);
	} catch(err) {
		console.error("❌ Failed to broadcast tx:", err);
        return ;
	}
	console.log("📨 Sent tx:", tx);
	console.log("⏳ Waiting for confirmation...");
	// wait for confirmation
	const receipt = await waitForTxSafe(tx);
	if (receipt)
		console.log("✅ Transaction confirmed");
	else
		console.error("❌ ransaction Failed");
}

const	getTournamentLength = async (): Promise<bigint> => {
	const	length: bigint = await publicClient.readContract({
		address: TournamentFactoryAddress,
		abi: TournamentFactoryAbi,
		functionName: 'getTournamentLength'
	}) as bigint;
	return (length);
}

const	getTournament = async (_id: bigint): Promise<Tournament> => {
	const	tournament: Tournament = await publicClient.readContract({
		address: TournamentFactoryAddress,
		abi: TournamentFactoryAbi,
		functionName: 'getTournament',
		args: [_id]
	}) as Tournament;
	return (tournament);
}

async function checkAndStart() {
	// console.log('called');
	
	try {
		// console.log('shuffled array:', get_shuffled_array(8));
		const length = await getTournamentLength();
		// TODO: (improvement) skip old tournaments that way you only scan the ones that might need to be changed
		//        for example set a start id that represents the most recent tournament deadline and start the loop from
		//        there instead of 0n
		for (let i:bigint = 0n; i < length; i++) {
			const	tournament: Tournament = await getTournament(i);
			const currentTime = Math.floor(new Date().getTime() / 1000);
			if (tournament.startTime < BigInt(currentTime) && tournament.status === 0) {
				console.log('condition matched')
				if (tournament.participants === tournament.maxParticipants) {
					const	order = get_shuffled_array(Number(tournament.maxParticipants));
					await transact('startTournament', [tournament.id, order]);
				}
				else
					await transact('setTournamentStatus', [3, i]);
			}
		}
		
	} catch (e) {
		console.error("Automation error:", e);
	}
	// setTimeout(checkAndStart, 5000);
}

export const	automationBot = () => {
	console.log("🟢 Automation bot started");
	// checkAndStart();
	publicClient.watchBlocks({
		onBlock: async () => {
			await checkAndStart();
		}
	})
}

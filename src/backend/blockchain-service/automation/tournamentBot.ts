import { Match, publicClient, signingAccount, Tournament, TournamentFactoryAbi, TournamentFactoryAddress, walletClient } from "../contract/contracts";
import { MatchMsg, rabbitmq } from "../rabbitmq";
import { keccak256, encodePacked } from 'viem';



export function getMatchKey(
  tournamentId: bigint,
  round: bigint,
  matchNumber: bigint
): `0x${string}` {
  return keccak256(
    encodePacked(
      ['uint256', 'uint256', 'uint256'],
      [tournamentId, round, matchNumber]
    )
  )
}


let processing = false;
let	pendingTournaments: Tournament[] = [];
let timer: NodeJS.Timeout | null = null;
const rabbit = new rabbitmq();

const	print_tournament_queue = () => {
	console.log('----- current queue -----');
	for (let i: number = 0; i < pendingTournaments.length; i++) {
		console.log(`i: ${i} => ${pendingTournaments[i]}`);
	}
}

const	print_tournament_queue = () => {
	console.log('----- current queue -----');
	for (let i: number = 0; i < pendingTournaments.length; i++) {
		console.log(`i: ${i} => ${pendingTournaments[i]}`);
	}
}

const	get_shuffled_array = (len: number) : bigint[] => {
	const shuffled = Array.from({ length: len }, (_, i) => BigInt(i));
  
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

const	transact = async(_functionName: string, _args: unknown[]) : Promise<void> => {
	if (processing) {
		setTimeout(async() => {await transact(_functionName, _args)}, 1000);
		return ;
	}
	processing = true;
	const	{ request } = await publicClient.simulateContract({
			address: TournamentFactoryAddress,
			abi: TournamentFactoryAbi,
			functionName: _functionName,
			args: _args.length ? _args: undefined,
			account: signingAccount
	}) ;
	let tx: `0x${string}`;
	try {
		tx = await walletClient.writeContract(request);
	} catch(err) {
		console.error("❌ Failed to broadcast tx:", err);
		processing = false;
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
	processing = false;
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

async function updateTournaments() {
	try {
		const	id: bigint = pendingTournaments[pendingTournaments.length -1].id;
		const	tournament: Tournament = await getTournament(id);
		// console.log(tournament.id);
		if (tournament.participants === tournament.maxParticipants) {
			console.log('deadline and max players reached. creating matches and starting the tournament...');
			const	order = get_shuffled_array(Number(tournament.maxParticipants));
			await transact('startTournament', [tournament.id, order]);
			console.log('tournament started')
		}
		else {
			console.log('tournament not fulfilled');
			await transact('setTournamentStatus', [3, tournament.id]);
			console.log('tournament expired');
		}
		deletePendingTournament();
	} catch (e) {
		console.error("Automation error:", e);
	}
}

const	addPendingTournament = (tournament: Tournament) => {
	pendingTournaments.push(tournament);
	pendingTournaments.sort((a, b) => Number(b.startTime - a.startTime));
	let	delay:number = Number(pendingTournaments[pendingTournaments.length -1].startTime * 1000n) - new Date().getTime();
	if (delay < 0)
		delay = 0;
	if (timer) {
		clearTimeout(timer);
	}
	timer = setTimeout(updateTournaments, delay);
}

const	deletePendingTournament = () => {
	pendingTournaments.pop();
	if (pendingTournaments.length) {
		let	delay:number = Number(pendingTournaments[pendingTournaments.length -1].startTime * 1000n) - new Date().getTime();
		if (delay < 0)
			delay = 0;
		if (timer) {
		clearTimeout(timer);
		}
		timer = setTimeout(updateTournaments, delay);
	}
}

const	checkFinishedRounds = async (tournament: Tournament): Promise<boolean> => {
	let finished: boolean = true;
	const	currentRound = tournament.currentRound;
	for (let matchId = 0n; matchId < currentRound; matchId++) {
		const	match = await getMatch(tournament.id, currentRound, matchId);
		if (match.status === 0) {
			finished = false;
			break;
		}
	}
	return (finished);
}

const watchFinishedMatches = () => {
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
					// console.log('obj:', typedLog, '_id: ', typedLog.args._id, '_round', typedLog.args._round, '_matchId', typedLog.args._matchId);
					const	tournament = await getTournament(typedLog.args._id);
					if (await checkFinishedRounds(tournament)) {
						// create next round or set tournament as finished in case current round is 1
						if (tournament.currentRound === 1n) {
							console.log('tournament finished, changing its status');
							await transact('setTournamentStatus', [2, tournament.id]);
						} else {
							// create new round with the winners from the first round
							// the winners are saved in (tournament id, current round(new round), index (0 to max players))
							const	order = get_shuffled_array(Number(tournament.currentRound)); // current round because its not changed yet so current round is also the remaining players in the tournament
							await transact('createNextRound', [tournament.id, order]);
						}
					}
				})
			}
		}
	)
}

const watchTournamentCreated = () => {
	publicClient.watchContractEvent(
		{
			address: TournamentFactoryAddress,
			abi: TournamentFactoryAbi,
			eventName: 'TournamentCreated',
			onLogs: (logs) => {
				logs.forEach(async (log) => {
					// fix type problem
					const typedLog = log as typeof log & {
						args: {
						_id: bigint;
						}
					};
					const	tournament = await getTournament(typedLog.args._id);
					addPendingTournament(tournament);
				})
			}
		}
	)
}

const watchMatchCreated = () => {
	publicClient.watchContractEvent(
		{
			address: TournamentFactoryAddress,
			abi: TournamentFactoryAbi,
			eventName: 'MatchCreated',
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
					const match = await getMatch(typedLog.args._id, typedLog.args._round,typedLog.args._matchId);
					const matchmsg : MatchMsg = {id: getMatchKey(typedLog.args._id, typedLog.args._round,typedLog.args._matchId), 
						player1:match.player1, player2:match.player2, player1Score:0, player2Score:0
					};
					rabbit.publishMatch(matchmsg);
					console.log(typedLog.args);
				})
			}
		}
	)
}

const initPendingTournaments = async () => {
	try {
		const length = await getTournamentLength();
		for (let i:bigint = 0n; i < length; i++) {
			const	tournament: Tournament = await getTournament(i);
			if (tournament.status === 0) {
				addPendingTournament(tournament);
				// console.log(`tournament: ${tournament.id} is added to pending`);
			}
		}
		
	} catch (e) {
		console.error("Automation error:", e);
	}
}

// export const	automationBot = async () => {
export const	automationBot = async () => {
	console.log("🟢 Automation bot started");
	rabbit.start();
	await initPendingTournaments();
	watchTournamentCreated();
	watchFinishedMatches();
	watchMatchCreated();

	// print_tournament_queue();
}

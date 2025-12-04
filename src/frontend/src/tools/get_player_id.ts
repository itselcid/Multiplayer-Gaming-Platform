import { getPlayer, type Tournament } from "../web3/getters";
import { lowerCaseAddress } from "../web3/tools";

export const get_player_id = async (_tournament: Tournament, account:string) : Promise<bigint> => {
	let i = 0n;
	for (;i < _tournament.maxParticipants; i++) {
		const	player = await getPlayer(_tournament.id, _tournament.currentRound, i);
		if (lowerCaseAddress(player.addr) === lowerCaseAddress(account)) {
			console.log('address found: ', account, player.addr);
			break;
		}
	}
	return (i);
}
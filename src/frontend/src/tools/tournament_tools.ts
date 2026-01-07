/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   tournament_tools.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/19 12:29:34 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/24 23:03:07 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { cachedTournaments } from "../main";
import type { Match, Tournament } from "../web3/getters";

export const get_tournament_status = (tournament: Tournament) : string => {
	if (tournament.status === 0) {
		return ('pending');
	} else if (tournament.status === 1) {
		return ('ongoing');
	} else if (tournament.status === 2) {
		return ('finished');
	} else if (tournament.status === 3) {
		return ('expired')
	}
	return ('error');
}

export const get_match_status = (match: Match) : string => {
	if (match.status === 0) {
		return ('pending');
	} else if (match.status === 1) {
		return ('ongoing');
	} else if (match.status === 2) {
		return ('finished');
	}
	return ('error');
}

export const	tournament_id_to_index = (id: bigint) : number => {
	let index = 0;
	for (; index < cachedTournaments.length; index++) {
		if (cachedTournaments[index].id === id)
			return (index);
	}
	return (-1);
}

export const	get_round_name = (round: bigint) : string => {
	switch(round) {
		case 1n:
			return ('Finals');
		case 2n:
			return ('Semi Finals');
		case 4n:
			return ('Quarter Finals');
		default:
			return ('Round of ' + String(round));
	}
}

export const formatNumber = (num: string, maxLength = 10): string => {
	const n = Number(num);

	if (num.length > maxLength) {
		return n.toExponential(2);
	}

	return num;
}

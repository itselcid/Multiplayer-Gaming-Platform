/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   get_tournament_status.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/19 12:29:34 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/27 16:35:27 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Tournament } from "../web3/getters";

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
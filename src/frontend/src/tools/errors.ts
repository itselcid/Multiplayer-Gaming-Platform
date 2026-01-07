/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   errors.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/15 12:52:09 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/23 00:48:55 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export const getRevertReason = (err: any): string => {
	// console.error(err);
	const	err_msg: string = (
		err?.cause?.reason ||
		err?.cause?.shortMessage ||
		err?.shortMessage ||
		"Unknown error"
	);
	return (err_msg.split('(')[0]);
}
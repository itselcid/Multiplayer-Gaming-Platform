/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   errors.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/15 12:52:09 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/27 17:00:03 by kez-zoub         ###   ########.fr       */
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

export const throwCustomError = (message: string): void => {
	const error: any = new Error(message);
	error.shortMessage = message;
	throw error;
}

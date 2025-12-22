/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   errors.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/15 12:52:09 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/15 12:52:30 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export const getRevertReason = (err: any): string => {
	return (
		err?.cause?.reason ||
		err?.cause?.shortMessage ||
		err?.shortMessage ||
		"Unknown error"
	);
}
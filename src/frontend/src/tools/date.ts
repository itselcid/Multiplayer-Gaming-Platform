/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   date.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/17 20:42:01 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/19 02:37:48 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export const	bigint_to_date = (bigintDate: bigint) : string => {
	const date = new Date(Number(bigintDate) * 1000);

	const formatted = date.toISOString().replace("T", " ").replace(":00.000Z", " UTC");
	return (formatted);
}

export const	date_to_bigint = (date: string) : bigint => {
	const timestamp = Math.floor(new Date(date).getTime() / 1000);
	return (BigInt(timestamp));
}
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   tools.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/05 00:34:36 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/05 22:44:41 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export function shortenEthAddress(
  address: string | null | undefined,
  startChars = 4,
  endChars = 4
): string {
  if (!address || typeof address !== 'string') return '';

  const addr = address.trim();

  const isValid = /^0x[a-fA-F0-9]{40}$/.test(addr);
  if (!isValid) {
    return 'invalid addr';
  }

  const up = addr.toUpperCase(); // -> "0X22C3...99F9"
  const bodyStart = up.slice(2, 2 + startChars); // after "0X"
  const bodyEnd = up.slice(-endChars);

  return `0x${bodyStart}...${bodyEnd}`;
}

export const	lowerCaseAddress = (address: string | null) : string | null => {
	if (address)
		return (address.toLowerCase());
	return (null);
}

export const nullAddress: string = '0x0000000000000000000000000000000000000000';
